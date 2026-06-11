import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import { mockUser } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

import { usersService } from '../users';

const BASE = 'http://localhost:4000/api';

describe('usersService', () => {
  it('getGivingBudget returns budget from API envelope', async () => {
    const budget = await usersService.getGivingBudget();
    expect(budget.remaining).toBe(150);
    expect(budget.totalBudget).toBe(200);
    expect(budget.usedPoints).toBe(50);
  });

  it('getUsers forwards search query', async () => {
    server.use(
      http.get(`${BASE}/users`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('search')).toBe('alice');
        return HttpResponse.json({ data: [mockUser] });
      })
    );
    const users = await usersService.getUsers('alice');
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe('user-1');
  });

  it('getUser fetches by id', async () => {
    server.use(
      http.get(`${BASE}/users/user-1`, () =>
        HttpResponse.json({ data: mockUser })
      )
    );
    const user = await usersService.getUser('user-1');
    expect(user.id).toBe('user-1');
  });
});
