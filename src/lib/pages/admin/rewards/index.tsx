import {
  Button,
  Drawer,
  Field,
  Flex,
  Heading,
  Input,
  Portal,
  Table,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { AdminRewardsPageSkeleton } from '@/lib/components/layout/PageSkeleton';
import { toaster } from '@/lib/components/ui/toaster';
import { queryKeys } from '@/lib/services/queryKeys';
import { rewardsService } from '@/lib/services/rewards';
import type { CreateRewardPayload, Reward } from '@/lib/types';
import { getErrorMessage } from '@/lib/types/api';
import {
  MAX_REWARD_QUANTITY,
  validateQuantityTotal,
} from '@/lib/utils/validate/validate-quantity-total';

export default function AdminRewardsPage() {
  const queryClient = useQueryClient();
  const rewardsQuery = useQuery({
    queryKey: queryKeys.rewards.admin(),
    queryFn: () => rewardsService.getRewardsAdmin(),
  });
  const rewards = rewardsQuery.data ?? [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateRewardPayload>({
    name: '',
    description: '',
    pointsCost: 100,
    imageUrl: '',
    quantityTotal: 100,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    quantityTotal?: string;
  }>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reward | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editQtyError, setEditQtyError] = useState<string | undefined>();

  const create = useMutation({
    mutationFn: () => rewardsService.createReward(form),
    onSuccess: (newReward) => {
      queryClient.setQueryData<Array<Reward>>(
        queryKeys.rewards.admin(),
        (old) => (old ? [...old, newReward] : [newReward])
      );
      toaster.create({
        type: 'success',
        title: 'Reward created',
        duration: 3000,
      });
      setDrawerOpen(false);
      setFieldErrors({});
      setForm({
        name: '',
        description: '',
        pointsCost: 100,
        imageUrl: '',
        quantityTotal: 100,
      });
    },
    onError: (e) => {
      toaster.create({
        type: 'error',
        title: 'Failed',
        description: getErrorMessage(e),
        duration: 5000,
      });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      rewardsService.patchReward(id, { isActive }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Array<Reward>>(
        queryKeys.rewards.admin(),
        (old) =>
          Array.isArray(old)
            ? old.map((r) => (r.id === updated.id ? updated : r))
            : old
      );
    },
    onError: (e) => {
      toaster.create({
        type: 'error',
        title: 'Update failed',
        description: getErrorMessage(e),
        duration: 5000,
      });
    },
  });

  const patchQuantity = useMutation({
    mutationFn: ({
      id,
      quantityTotal,
    }: {
      id: string;
      quantityTotal: number;
    }) => rewardsService.patchReward(id, { quantityTotal }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Array<Reward>>(
        queryKeys.rewards.admin(),
        (old) =>
          Array.isArray(old)
            ? old.map((r) => (r.id === updated.id ? updated : r))
            : old
      );
      toaster.create({
        type: 'success',
        title: 'Quantity updated',
        duration: 3000,
      });
      setEditOpen(false);
      setEditTarget(null);
      setEditQtyError(undefined);
    },
    onError: (e) => {
      toaster.create({
        type: 'error',
        title: 'Update failed',
        description: getErrorMessage(e),
        duration: 5000,
      });
    },
  });

  const submitCreate = () => {
    const qErr = validateQuantityTotal(form.quantityTotal);
    if (qErr) {
      setFieldErrors({ quantityTotal: qErr });
      return;
    }
    setFieldErrors({});
    create.mutate();
  };

  const openEditQuantity = (r: Reward) => {
    setEditTarget(r);
    setEditQuantity(r.quantityTotal);
    setEditQtyError(undefined);
    setEditOpen(true);
  };

  const submitEditQuantity = () => {
    if (!editTarget) {
      return;
    }
    if (!Number.isFinite(editQuantity) || editQuantity < 1) {
      setEditQtyError('Quantity must be at least 1');
      return;
    }
    if (editQuantity < editTarget.claimed) {
      setEditQtyError(
        `Cannot be less than already claimed (${editTarget.claimed})`
      );
      return;
    }
    if (editQuantity > MAX_REWARD_QUANTITY) {
      setEditQtyError('Quantity cannot exceed 10,000,000');
      return;
    }
    setEditQtyError(undefined);
    patchQuantity.mutate({
      id: editTarget.id,
      quantityTotal: editQuantity,
    });
  };

  if (rewardsQuery.isLoading) {
    return <AdminRewardsPageSkeleton />;
  }

  const canSave =
    Boolean(form.name) &&
    Number.isFinite(form.quantityTotal) &&
    form.quantityTotal >= 1 &&
    form.quantityTotal <= MAX_REWARD_QUANTITY;

  return (
    <VStack align="stretch" gap={6}>
      <Flex align="center" justify="space-between">
        <Heading size="lg">Manage rewards</Heading>
        <Button onClick={() => setDrawerOpen(true)}>Add reward</Button>
      </Flex>
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Points</Table.ColumnHeader>
            <Table.ColumnHeader>Stock</Table.ColumnHeader>
            <Table.ColumnHeader>Quantity</Table.ColumnHeader>
            <Table.ColumnHeader>Active</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rewards.map((r) => (
            <Table.Row key={r.id}>
              <Table.Cell>{r.name}</Table.Cell>
              <Table.Cell>{r.pointsCost}</Table.Cell>
              <Table.Cell>
                {r.remaining} / {r.total}
              </Table.Cell>
              <Table.Cell>
                <Button
                  onClick={() => openEditQuantity(r)}
                  size="xs"
                  variant="ghost"
                >
                  Edit
                </Button>
              </Table.Cell>
              <Table.Cell>
                <Button
                  disabled={toggle.isPending}
                  loading={toggle.isPending}
                  onClick={() =>
                    toggle.mutate({ id: r.id, isActive: !r.isActive })
                  }
                  size="xs"
                  variant={r.isActive ? 'solid' : 'outline'}
                >
                  {r.isActive ? 'Active' : 'Inactive'}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Drawer.Root
        onOpenChange={(e) => setDrawerOpen(e.open)}
        open={drawerOpen}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Add reward</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <VStack align="stretch" gap={3}>
                  <Field.Root>
                    <Field.Label>Name</Field.Label>
                    <Input
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      value={form.name}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Description</Field.Label>
                    <Textarea
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      value={form.description}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Points cost</Field.Label>
                    <Input
                      min={1}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pointsCost: Number(e.target.value),
                        }))
                      }
                      type="number"
                      value={form.pointsCost}
                    />
                  </Field.Root>
                  <Field.Root invalid={Boolean(fieldErrors.quantityTotal)}>
                    <Field.Label>
                      Total quantity
                      <Text
                        as="span"
                        color="fg.muted"
                        fontWeight="normal"
                        marginLeft={1}
                      >
                        (max redemptions)
                      </Text>
                    </Field.Label>
                    <Input
                      max={MAX_REWARD_QUANTITY}
                      min={1}
                      onChange={(e) => {
                        setFieldErrors({});
                        setForm((f) => ({
                          ...f,
                          quantityTotal: Number(e.target.value),
                        }));
                      }}
                      type="number"
                      value={form.quantityTotal}
                    />
                    <Field.HelperText>
                      How many times this reward can be redeemed total
                    </Field.HelperText>
                    <Field.ErrorText>
                      {fieldErrors.quantityTotal}
                    </Field.ErrorText>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Image URL</Field.Label>
                    <Input
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                      }
                      value={form.imageUrl}
                    />
                  </Field.Root>
                </VStack>
              </Drawer.Body>
              <Drawer.Footer>
                <Button onClick={() => setDrawerOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button
                  disabled={!canSave || create.isPending}
                  loading={create.isPending}
                  onClick={submitCreate}
                >
                  Save
                </Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <Drawer.Root
        onOpenChange={(e) => {
          setEditOpen(e.open);
          if (!e.open) {
            setEditTarget(null);
            setEditQtyError(undefined);
          }
        }}
        open={editOpen}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Edit total quantity</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                {editTarget && (
                  <VStack align="stretch" gap={3}>
                    <Text color="fg.muted" fontSize="sm">
                      {editTarget.name} — {editTarget.claimed} already claimed
                    </Text>
                    <Field.Root invalid={Boolean(editQtyError)}>
                      <Field.Label>Total quantity</Field.Label>
                      <Input
                        max={MAX_REWARD_QUANTITY}
                        min={1}
                        onChange={(e) => {
                          setEditQtyError(undefined);
                          setEditQuantity(Number(e.target.value));
                        }}
                        type="number"
                        value={editQuantity}
                      />
                      <Field.ErrorText>{editQtyError}</Field.ErrorText>
                    </Field.Root>
                  </VStack>
                )}
              </Drawer.Body>
              <Drawer.Footer>
                <Button onClick={() => setEditOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button
                  disabled={!editTarget || patchQuantity.isPending}
                  loading={patchQuantity.isPending}
                  onClick={submitEditQuantity}
                >
                  Save
                </Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </VStack>
  );
}
