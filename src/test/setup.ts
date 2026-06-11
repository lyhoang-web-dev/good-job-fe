import '@testing-library/jest-dom/vitest';

import { afterAll, afterEach, beforeAll, vi } from 'vite-plus/test';

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
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
