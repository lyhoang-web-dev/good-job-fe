import { describe, expect, it } from 'vite-plus/test';

import {
  extractAccessTokenFromHash,
  getSessionAccessToken,
  setSessionAccessToken,
} from '@/lib/services/sessionAccessToken';

describe('sessionAccessToken', () => {
  it('extracts access_token from hash fragment', () => {
    expect(extractAccessTokenFromHash('#access_token=abc.def')).toBe('abc.def');
  });

  it('extracts accessToken camelCase', () => {
    expect(extractAccessTokenFromHash('#accessToken=jwt')).toBe('jwt');
  });

  it('strips Bearer prefix', () => {
    expect(extractAccessTokenFromHash('#access_token=Bearer%20x.y')).toBe(
      'x.y'
    );
  });

  it('stores and reads token from sessionStorage', () => {
    setSessionAccessToken('token-one');
    expect(getSessionAccessToken()).toBe('token-one');
    setSessionAccessToken(null);
    expect(getSessionAccessToken()).toBeNull();
  });
});
