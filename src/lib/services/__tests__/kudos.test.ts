import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vite-plus/test';

import type { Comment } from '@/lib/types';
import { mockKudo, mockKudosFeed, mockUser } from '@/test/mocks/fixtures';
import { server } from '@/test/mocks/server';

import { kudosService } from '../kudos';

const BASE = 'http://localhost:4000/api';

describe('kudosService.getKudos', () => {
  it('sends cursor and limit query params', async () => {
    let requestUrl = '';
    server.use(
      http.get(`${BASE}/kudos`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ data: mockKudosFeed });
      })
    );
    await kudosService.getKudos('cursor-abc');
    const url = new URL(requestUrl);
    expect(url.searchParams.get('cursor')).toBe('cursor-abc');
    expect(url.searchParams.get('limit')).toBe('20');
  });
});

describe('kudosService.getKudosForUser', () => {
  it('requests profile kudos with direction', async () => {
    let requestUrl = '';
    server.use(
      http.get(`${BASE}/users/:userId/kudos`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ data: [mockKudo] });
      })
    );
    const rows = await kudosService.getKudosForUser('user-2', 'received');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(mockKudo.id);
    expect(new URL(requestUrl).searchParams.get('direction')).toBe('received');
  });
});

describe('kudosService.sendKudo', () => {
  it('posts payload and returns kudo', async () => {
    const kudo = await kudosService.sendKudo({
      receiverId: 'user-2',
      points: 25,
      message: 'Thanks!',
      coreValue: 'teamwork',
    });
    expect(kudo.id).toBe(mockKudo.id);
  });
});

describe('kudosService reactions', () => {
  it('reactToKudo posts emoji', async () => {
    let body: unknown;
    server.use(
      http.post(`${BASE}/kudos/:kudoId/reactions`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: {} }, { status: 201 });
      })
    );
    await kudosService.reactToKudo('kudo-1', '👍');
    expect(body).toEqual({ emoji: '👍' });
  });

  it('unreactKudo deletes encoded emoji path', async () => {
    let path = '';
    server.use(
      http.delete(`${BASE}/kudos/:kudoId/reactions/:emoji`, ({ request }) => {
        path = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 204 });
      })
    );
    await kudosService.unreactKudo('kudo-1', '👍');
    expect(path).toContain(encodeURIComponent('👍'));
  });
});

describe('kudosService comments', () => {
  it('getComments returns list', async () => {
    const list: Array<Comment> = [
      {
        id: 'c1',
        content: 'Agreed',
        createdAt: '2025-04-10T11:00:00Z',
        user: mockUser,
      },
    ];
    server.use(
      http.get(`${BASE}/kudos/:kudoId/comments`, () =>
        HttpResponse.json({ data: list })
      )
    );
    const rows = await kudosService.getComments('kudo-1');
    expect(rows).toEqual(list);
  });

  it('addComment posts content', async () => {
    let posted: unknown;
    server.use(
      http.post(`${BASE}/kudos/:kudoId/comments`, async ({ request }) => {
        posted = await request.json();
        const body = posted as { content: string };
        return HttpResponse.json(
          {
            data: {
              id: 'c-new',
              content: body.content,
              createdAt: '2025-04-10T12:00:00Z',
              user: mockUser,
            },
          },
          { status: 201 }
        );
      })
    );
    const created = await kudosService.addComment('kudo-1', 'Hi');
    expect(posted).toEqual({ content: 'Hi' });
    expect(created.content).toBe('Hi');
    expect(created.id).toBe('c-new');
  });
});
