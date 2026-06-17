import '@testing-library/jest-dom/vitest';

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vite-plus/test';

import { server } from './mocks/server';

/** jsdom omits these; hooks and components rely on them. */
window.scrollTo = vi.fn();

globalThis.ResizeObserver = class ResizeObserver {
  disconnect(): void {
    /* jsdom stub */
  }
  observe(): void {
    /* jsdom stub */
  }
  unobserve(): void {
    /* jsdom stub */
  }
};

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});
// Tests simulate an authenticated session; token-gated queries (useMe, etc.)
// need a token present, matching the app's real logged-in state.
beforeEach(() => {
  sessionStorage.setItem('goodjob:accessToken', 'test-access-token');
});
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
});
afterAll(() => {
  server.close();
});
