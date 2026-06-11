import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Provider } from '@/lib/components/ui/provider';
import AdminRewardsPage from '@/lib/pages/admin/rewards';
import { mockReward, mockRewardsPaginated } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

const toasterCreate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/components/ui/toaster', () => ({
  toaster: { create: toasterCreate },
}));

const BASE = 'http://localhost:4000/api';

function renderAdminRewards() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const view = render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AdminRewardsPage />
      </QueryClientProvider>
    </Provider>
  );
  return { ...view, queryClient };
}

describe('AdminRewardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton then reward table', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(`${BASE}/rewards`, async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('all') === 'true') {
          await gate;
          return HttpResponse.json({ data: [mockReward] });
        }
        return HttpResponse.json({ data: mockRewardsPaginated });
      })
    );
    const { container } = renderAdminRewards();
    await waitFor(() => {
      expect(
        container.querySelectorAll('[class*="skeleton"]').length
      ).toBeGreaterThan(0);
    });
    release();
    expect(
      await screen.findByRole('heading', { name: 'Manage rewards' })
    ).toBeTruthy();
    expect(await screen.findByText(mockReward.name)).toBeTruthy();
  });

  it('lists rewards from admin API', async () => {
    renderAdminRewards();
    expect(
      await screen.findByRole('heading', { name: 'Manage rewards' })
    ).toBeTruthy();
    expect(screen.getByText(mockReward.name)).toBeTruthy();
    expect(screen.getByText(String(mockReward.pointsCost))).toBeTruthy();
  });

  it('creates a reward from the add drawer', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getByRole('button', { name: 'Add reward' }));
    const addDrawer = await screen.findByRole('dialog', { name: 'Add reward' });
    await user.type(
      within(addDrawer).getByRole('textbox', { name: /^name$/i }),
      'Sticker Pack'
    );
    await user.click(within(addDrawer).getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', title: 'Reward created' })
      );
    });
    expect(await screen.findByText('Sticker Pack')).toBeTruthy();
  });

  it('disables create save when total quantity is below 1', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getByRole('button', { name: 'Add reward' }));
    const addDrawer = await screen.findByRole('dialog', { name: 'Add reward' });
    await user.type(
      within(addDrawer).getByRole('textbox', { name: /^name$/i }),
      'Bad Qty'
    );
    const qtyInput = within(addDrawer).getByRole('spinbutton', {
      name: /total quantity/i,
    });
    await user.clear(qtyInput);
    await user.type(qtyInput, '0');
    const saveBtn = within(addDrawer).getByRole('button', { name: 'Save' });
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
    expect(toasterCreate).not.toHaveBeenCalled();
  });

  it('toggles reward active state via patch response', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${BASE}/rewards/:id`, async ({ request }) => {
        const body = (await request.json()) as { isActive?: boolean };
        return HttpResponse.json({
          data: { ...mockReward, ...body },
        });
      })
    );
    renderAdminRewards();
    const activeBtn = await screen.findByRole('button', { name: 'Active' });
    await user.click(activeBtn);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Inactive' })).toBeTruthy();
    });
  });

  it('updates total quantity from edit drawer', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${BASE}/rewards/:id`, async ({ request }) => {
        const body = (await request.json()) as { quantityTotal?: number };
        return HttpResponse.json({
          data: { ...mockReward, ...body },
        });
      })
    );
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    const qtyInput = within(editDrawer).getByRole('spinbutton', {
      name: /total quantity/i,
    });
    await user.clear(qtyInput);
    await user.type(qtyInput, '250');
    await user.click(within(editDrawer).getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', title: 'Quantity updated' })
      );
    });
  });

  it('blocks edit quantity below claimed amount', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    const qtyInput = within(editDrawer).getByRole('spinbutton', {
      name: /total quantity/i,
    });
    await user.clear(qtyInput);
    await user.type(qtyInput, '5');
    await user.click(within(editDrawer).getByRole('button', { name: 'Save' }));
    expect(
      await within(editDrawer).findByText(
        /Cannot be less than already claimed \(10\)/i
      )
    ).toBeTruthy();
  });

  it('shows create error toast when POST fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${BASE}/rewards`, () =>
        HttpResponse.json({ message: 'Duplicate slug' }, { status: 400 })
      )
    );
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getByRole('button', { name: 'Add reward' }));
    const addDrawer = await screen.findByRole('dialog', { name: 'Add reward' });
    await user.type(
      within(addDrawer).getByRole('textbox', { name: /^name$/i }),
      'Fail Create'
    );
    await user.click(within(addDrawer).getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Failed',
          description: 'Duplicate slug',
        })
      );
    });
  });

  it('shows toggle error toast when PATCH fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${BASE}/rewards/:id`, () =>
        HttpResponse.json({ message: 'Denied' }, { status: 403 })
      )
    );
    renderAdminRewards();
    const activeBtn = await screen.findByRole('button', { name: 'Active' });
    await user.click(activeBtn);
    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Update failed',
          description: 'Denied',
        })
      );
    });
  });

  it('shows quantity patch error when edit save fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`${BASE}/rewards/:id`, () =>
        HttpResponse.json({ message: 'Conflict' }, { status: 409 })
      )
    );
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    await user.click(within(editDrawer).getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(toasterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Update failed',
          description: 'Conflict',
        })
      );
    });
  });

  it('closes add drawer on Cancel', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getByRole('button', { name: 'Add reward' }));
    const addDrawer = await screen.findByRole('dialog', { name: 'Add reward' });
    await user.click(within(addDrawer).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Add reward' })).toBeNull();
    });
  });

  it('closes edit drawer on Cancel', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    await user.click(
      within(editDrawer).getByRole('button', { name: 'Cancel' })
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Edit total quantity' })
      ).toBeNull();
    });
  });

  it('updates description, points, and image URL in create form', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getByRole('button', { name: 'Add reward' }));
    const addDrawer = await screen.findByRole('dialog', { name: 'Add reward' });
    await user.type(
      within(addDrawer).getByRole('textbox', { name: /^description$/i }),
      'Soft enamel'
    );
    const points = within(addDrawer).getByRole('spinbutton', {
      name: /points cost/i,
    });
    await user.clear(points);
    await user.type(points, '250');
    const imageUrlInput = within(addDrawer).getByRole('textbox', {
      name: /^image url$/i,
    });
    await user.type(imageUrlInput, 'https://cdn.example.com/pin.png');
    expect((points as HTMLInputElement).value).toBe('250');
    expect((imageUrlInput as HTMLInputElement).value).toBe(
      'https://cdn.example.com/pin.png'
    );
  });

  it('blocks edit save when quantity is below 1', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    const qtyInput = within(editDrawer).getByRole('spinbutton', {
      name: /total quantity/i,
    });
    await user.clear(qtyInput);
    await user.type(qtyInput, '0');
    await user.click(within(editDrawer).getByRole('button', { name: 'Save' }));
    expect(
      await within(editDrawer).findByText(/Quantity must be at least 1/i)
    ).toBeTruthy();
  });

  it('blocks edit save when quantity exceeds maximum', async () => {
    const user = userEvent.setup();
    renderAdminRewards();
    await screen.findByText(mockReward.name);
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editDrawer = await screen.findByRole('dialog', {
      name: 'Edit total quantity',
    });
    const qtyInput = within(editDrawer).getByRole('spinbutton', {
      name: /total quantity/i,
    });
    await user.clear(qtyInput);
    await user.type(qtyInput, '10000001');
    await user.click(within(editDrawer).getByRole('button', { name: 'Save' }));
    expect(
      await within(editDrawer).findByText(/Quantity cannot exceed 10,000,000/i)
    ).toBeTruthy();
  });

  it('activates an inactive reward from the table', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE}/rewards`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('all') === 'true') {
          return HttpResponse.json({
            data: [
              mockReward,
              {
                ...mockReward,
                id: 'reward-off',
                name: 'Retired Pin',
                isActive: false,
              },
            ],
          });
        }
        return HttpResponse.json({ data: mockRewardsPaginated });
      }),
      http.patch(`${BASE}/rewards/:id`, async ({ params, request }) => {
        const body = (await request.json()) as { isActive?: boolean };
        const id = params.id as string;
        const base =
          id === 'reward-off'
            ? {
                ...mockReward,
                id: 'reward-off',
                name: 'Retired Pin',
                isActive: false,
              }
            : mockReward;
        return HttpResponse.json({ data: { ...base, ...body } });
      })
    );
    renderAdminRewards();
    await screen.findByText('Retired Pin');
    const inactiveBtn = screen.getByRole('button', { name: 'Inactive' });
    await user.click(inactiveBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Active' })).toHaveLength(2);
    });
  });
});
