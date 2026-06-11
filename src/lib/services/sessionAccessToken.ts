const STORAGE_KEY = 'goodjob:accessToken';

function stripBearerPrefix(value: string): string {
  const t = value.trim();
  if (t.toLowerCase().startsWith('bearer ')) {
    return t.slice(7).trim();
  }
  return t;
}

export function getSessionAccessToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSessionAccessToken(token: string | null): void {
  try {
    if (token === null || token === '') {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, stripBearerPrefix(token));
  } catch {
    /* quota / private mode */
  }
}

/** Parse `#access_token=` / `accessToken` from a hash string (with or without `#`). */
export function extractAccessTokenFromHash(hash: string): string | null {
  if (!hash || hash === '#') {
    return null;
  }
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment) {
    return null;
  }
  const params = new URLSearchParams(fragment);
  const raw = params.get('access_token') ?? params.get('accessToken');
  if (!raw) {
    return null;
  }
  return stripBearerPrefix(raw);
}

/**
 * OAuth: redirect `.../path#access_token=<jwt>`. Persist token, strip hash.
 * Must run before `createRouter` (see `main.tsx`).
 */
export function consumeAccessTokenFromUrlHash(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const token = extractAccessTokenFromHash(window.location.hash);
  if (!token) {
    return;
  }
  setSessionAccessToken(token);
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}`);
}
