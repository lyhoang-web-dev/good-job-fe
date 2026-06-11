import { HttpResponse, http } from 'msw';

import {
  mockBudget,
  mockKudo,
  mockKudoMedia,
  mockKudosFeed,
  mockNotification,
  mockRedemption,
  mockReward,
  mockRewardsPaginated,
  mockUser,
} from './fixtures';

/** Must match `API_BASE_URL` default in `src/lib/services/api.ts` for tests. */
const BASE = 'http://localhost:4000/api';

export const handlers = [
  http.get(`${BASE}/auth/me`, () => HttpResponse.json({ data: mockUser })),
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    return HttpResponse.json({
      data: { ...mockUser, email: body.email ?? mockUser.email },
    });
  }),
  http.post(
    `${BASE}/auth/logout`,
    () => new HttpResponse(null, { status: 204 })
  ),
  http.get(`${BASE}/users/me`, () => HttpResponse.json({ data: mockUser })),
  http.get(`${BASE}/users/me/giving-budget`, () =>
    HttpResponse.json({ data: mockBudget })
  ),
  http.get(`${BASE}/users`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('search') ?? '').toLowerCase();
    const pool = [mockUser, mockKudo.receiver];
    const data = q
      ? pool.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      : pool;
    return HttpResponse.json({ data });
  }),
  http.get(`${BASE}/users/:userId/kudos`, () =>
    HttpResponse.json({ data: [mockKudo] })
  ),
  http.get(`${BASE}/kudos`, () => HttpResponse.json({ data: mockKudosFeed })),
  http.post(`${BASE}/kudos`, () =>
    HttpResponse.json({ data: mockKudo }, { status: 201 })
  ),
  http.post(`${BASE}/kudos/:kudoId/reactions`, () =>
    HttpResponse.json({ data: {} }, { status: 201 })
  ),
  http.delete(
    `${BASE}/kudos/:kudoId/reactions/:emoji`,
    () => new HttpResponse(null, { status: 204 })
  ),
  http.post(`${BASE}/kudos/:kudoId/media`, () =>
    HttpResponse.json({ data: mockKudoMedia }, { status: 201 })
  ),
  http.get(`${BASE}/kudos/:kudoId/comments`, () =>
    HttpResponse.json({ data: [] })
  ),
  http.post(`${BASE}/kudos/:kudoId/comments`, async ({ request }) => {
    const body = (await request.json()) as { content?: string };
    return HttpResponse.json(
      {
        data: {
          id: 'comment-new',
          content: body.content ?? '',
          createdAt: '2025-04-10T12:00:00Z',
          user: mockUser,
        },
      },
      { status: 201 }
    );
  }),
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json({ data: [mockNotification] })
  ),
  http.patch(
    `${BASE}/notifications/:id/read`,
    () => new HttpResponse(null, { status: 204 })
  ),
  http.patch(
    `${BASE}/notifications/read-all`,
    () => new HttpResponse(null, { status: 204 })
  ),
  http.get(`${BASE}/rewards`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('all') === 'true') {
      return HttpResponse.json({ data: [mockReward] });
    }
    return HttpResponse.json({ data: mockRewardsPaginated });
  }),
  http.post(`${BASE}/rewards/redeem`, () =>
    HttpResponse.json({ data: mockRedemption }, { status: 201 })
  ),
  http.get(`${BASE}/rewards/redemptions`, () =>
    HttpResponse.json({ data: [mockRedemption] })
  ),
  http.post(`${BASE}/rewards`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { ...mockReward, ...body, id: 'reward-new' } },
      { status: 201 }
    );
  }),
  http.patch(`${BASE}/rewards/:id`, () =>
    HttpResponse.json({ data: mockReward })
  ),
];
