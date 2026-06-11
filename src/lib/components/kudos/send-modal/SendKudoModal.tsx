import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Field,
  Flex,
  Portal,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useCallback } from 'react';

import { MediaUploadSection } from '@/lib/components/media';
import { toaster } from '@/lib/components/ui/toaster';
import { useGivingBudget } from '@/lib/hooks/useGivingBudget';
import { useKudoForm } from '@/lib/hooks/useKudoForm';
import { useMe } from '@/lib/hooks/useMe';
import { useMediaUpload } from '@/lib/hooks/useMediaUpload';
import { kudosService } from '@/lib/services/kudos';
import type { CoreValue, SendKudoPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/types/api';
import {
  adjustGivingBudgetAfterSend,
  applySendKudoSuccessToCache,
} from '@/lib/utils/cache/query-cache';
import { cvLabel } from '@/lib/utils/format/core-value';
import type { KudoFormErrors } from '@/lib/validations/kudo.validation';

import { RecipientSearch } from './RecipientSearch';

const CORE_VALUES: Array<CoreValue> = [
  'teamwork',
  'ownership',
  'innovation',
  'integrity',
  'customer_focus',
];

function FieldBlock({
  label,
  invalid,
  err,
  children,
}: {
  label: ReactNode;
  invalid: boolean;
  err?: string;
  children: ReactNode;
}) {
  return (
    <Field.Root invalid={invalid}>
      <Field.Label>{label}</Field.Label>
      {children}
      {err && <Field.ErrorText>{err}</Field.ErrorText>}
    </Field.Root>
  );
}

export type SendKudoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SendKudoModal({ isOpen, onClose }: SendKudoModalProps) {
  const queryClient = useQueryClient();
  const media = useMediaUpload();
  const { data: me } = useMe();
  const {
    remaining,
    used,
    total,
    isLoading: budgetLoading,
  } = useGivingBudget();
  const form = useKudoForm(remaining);
  const { values, errors, touched } = form;

  const pointsPct = ((values.points - 10) / 40) * 100;
  const sliderStyle = { '--pct': `${pointsPct}%` } as CSSProperties;

  const errMsg = (k: keyof KudoFormErrors) =>
    touched[k] ? errors[k] : undefined;
  const fieldInvalid = (k: keyof KudoFormErrors) => Boolean(errMsg(k));

  let budgetTone: 'green' | 'yellow' | 'red' = 'green';
  if (remaining < values.points) {
    budgetTone = 'red';
  } else if (remaining < total * 0.2) {
    budgetTone = 'yellow';
  }

  const resetAll = useCallback(() => {
    form.reset();
    media.cleanup();
  }, [form.reset, media.cleanup]);

  const mutation = useMutation({
    mutationFn: async (payload: SendKudoPayload) => {
      const kudo = await kudosService.sendKudo(payload);
      if (media.files.length > 0) {
        await media.uploadAll(kudo.id);
      }
      return { kudo };
    },
    onSuccess: ({ kudo }, variables) => {
      applySendKudoSuccessToCache(queryClient, kudo);
      adjustGivingBudgetAfterSend(queryClient, variables.points);
      toaster.create({
        type: 'success',
        title: 'Kudo sent!',
        description: 'Your recognition has been shared.',
        duration: 3000,
      });
      resetAll();
      onClose();
    },
    onError: (error) => {
      toaster.create({
        type: 'error',
        title: 'Failed to send kudo',
        description: getErrorMessage(error),
        duration: 5000,
      });
    },
  });

  const close = useCallback(() => {
    if (mutation.isPending) {
      return;
    }
    resetAll();
    onClose();
  }, [mutation.isPending, onClose, resetAll]);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!(form.validateAll() && values.coreValue)) {
        return;
      }
      mutation.mutate({
        receiverId: values.receiverId,
        points: values.points,
        message: values.message.trim(),
        coreValue: values.coreValue,
      });
    },
    [form, values, mutation]
  );

  return (
    <Drawer.Root
      onOpenChange={(e) => !e.open && close()}
      open={isOpen}
      placement="end"
      size="lg"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="surface.elevated">
            <Drawer.Header borderBottomWidth="0" paddingBottom={2}>
              <Drawer.Title>
                <Text
                  fontFamily="heading"
                  fontSize="xl"
                  fontStyle="italic"
                  fontWeight="semibold"
                >
                  Give a Kudo
                </Text>
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <form noValidate onSubmit={submit} style={{ display: 'contents' }}>
              <Drawer.Body>
                <VStack align="stretch" gap={5}>
                  <FieldBlock
                    err={errMsg('receiver')}
                    invalid={fieldInvalid('receiver')}
                    label="To"
                  >
                    <RecipientSearch
                      excludeId={me?.id}
                      isEnabled={isOpen}
                      onBlur={() => form.handleBlur('receiver')}
                      onSelect={(u) => form.applyRecipientSelection(u)}
                      selectedId={values.receiverId}
                    />
                  </FieldBlock>

                  <FieldBlock
                    err={errMsg('points')}
                    invalid={fieldInvalid('points')}
                    label="Points"
                  >
                    <Flex align="center" gap={4}>
                      <Text
                        fontFamily="mono"
                        fontSize="lg"
                        fontWeight="semibold"
                      >
                        {values.points}
                      </Text>
                      <Box flex={1}>
                        <input
                          className="gj-points-slider"
                          max={50}
                          min={10}
                          onBlur={() => form.handleBlur('points')}
                          onChange={(e) =>
                            form.handleFieldChange(
                              'points',
                              Number(e.target.value),
                              'points'
                            )
                          }
                          style={sliderStyle}
                          type="range"
                          value={values.points}
                        />
                      </Box>
                    </Flex>
                    <Flex
                      color="fg.muted"
                      fontSize="xs"
                      justify="space-between"
                    >
                      <Text>10</Text>
                      <Text>50</Text>
                    </Flex>
                  </FieldBlock>

                  <FieldBlock
                    err={errMsg('coreValue')}
                    invalid={fieldInvalid('coreValue')}
                    label="Core value"
                  >
                    <Flex flexWrap="wrap" gap={2}>
                      {CORE_VALUES.map((cv) => (
                        <button
                          className="gj-cv-toggle"
                          data-selected={
                            values.coreValue === cv ? 'true' : 'false'
                          }
                          key={cv}
                          onClick={() => {
                            form.setField('coreValue', cv);
                            form.clearError('coreValue');
                          }}
                          type="button"
                        >
                          {cvLabel(cv)}
                        </button>
                      ))}
                    </Flex>
                  </FieldBlock>

                  <FieldBlock
                    err={errMsg('message')}
                    invalid={fieldInvalid('message')}
                    label="Message"
                  >
                    <Textarea
                      borderRadius="12px"
                      maxLength={500}
                      onBlur={() => form.handleBlur('message')}
                      onChange={(e) =>
                        form.handleFieldChange(
                          'message',
                          e.target.value,
                          'message'
                        )
                      }
                      placeholder="What did they do amazingly?"
                      rows={4}
                      value={values.message}
                    />
                    <Text color="fg.muted" fontSize="xs">
                      {values.message.length} / 500 characters
                    </Text>
                  </FieldBlock>

                  <Field.Root invalid={Boolean(media.firstError)}>
                    <Field.Label fontWeight="medium">
                      Attach media{' '}
                      <Text as="span" color="fg.muted" fontWeight="normal">
                        (optional)
                      </Text>
                    </Field.Label>
                    <MediaUploadSection
                      disabled={mutation.isPending}
                      uploadHook={media}
                    />
                    {media.firstError && (
                      <Field.ErrorText>{media.firstError}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Box
                    borderRadius="md"
                    borderWidth="1px"
                    colorPalette={budgetTone}
                    padding={3}
                  >
                    <Text fontSize="sm">
                      {used} / {total} points used — {remaining} remaining
                    </Text>
                  </Box>
                </VStack>
              </Drawer.Body>

              <Drawer.Footer gap={3}>
                <Button
                  borderRadius="full"
                  onClick={close}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  _hover={{ bg: 'brand.inkHover' }}
                  bg="brand.ink"
                  borderRadius="full"
                  color="white"
                  disabled={
                    mutation.isPending ||
                    budgetLoading ||
                    media.hasErrors ||
                    media.isValidating
                  }
                  fontWeight="semibold"
                  loading={mutation.isPending}
                  loadingText={media.isUploading ? 'Uploading…' : 'Sending…'}
                  type="submit"
                >
                  Send Kudo →
                </Button>
              </Drawer.Footer>
            </form>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
