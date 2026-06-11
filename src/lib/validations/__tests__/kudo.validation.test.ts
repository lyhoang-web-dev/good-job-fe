import { describe, expect, it } from 'vite-plus/test';

import {
  isFormValid,
  validateCoreValue,
  validateKudoField,
  validateKudoForm,
  validateMessage,
  validatePoints,
  validateReceiver,
} from '../kudo.validation';

const RE_POINTS_RANGE = /between 10 and 50/;
const RE_POINTS_BUDGET = /budget/;
const RE_MESSAGE_LENGTH = /10 characters/;

describe('validateReceiver', () => {
  it('returns error when empty', () => {
    expect(validateReceiver('')).toBe('Please select a recipient');
  });

  it('returns undefined when valid', () => {
    expect(validateReceiver('user-123')).toBeUndefined();
  });
});

describe('validateCoreValue', () => {
  it('returns error when empty', () => {
    expect(validateCoreValue('')).toBe('Please select a core value');
  });

  it('returns undefined for a valid value', () => {
    expect(validateCoreValue('teamwork')).toBeUndefined();
  });
});

describe('validatePoints', () => {
  it('returns error when below 10', () => {
    expect(validatePoints(9, 200)).toMatch(RE_POINTS_RANGE);
  });

  it('returns error when above 50', () => {
    expect(validatePoints(51, 200)).toMatch(RE_POINTS_RANGE);
  });

  it('returns error when exceeds remaining budget', () => {
    expect(validatePoints(30, 20)).toMatch(RE_POINTS_BUDGET);
  });

  it('returns undefined at exactly 10', () => {
    expect(validatePoints(10, 200)).toBeUndefined();
  });

  it('returns undefined at exactly 50', () => {
    expect(validatePoints(50, 200)).toBeUndefined();
  });

  it('returns undefined when points equal remaining', () => {
    expect(validatePoints(20, 20)).toBeUndefined();
  });

  it.each([
    [9, 200],
    [51, 200],
    [0, 200],
    [-1, 200],
  ])('rejects %i points', (points, remaining) => {
    expect(validatePoints(points, remaining)).toBeDefined();
  });

  it.each([10, 25, 50])('accepts %i points', (points) => {
    expect(validatePoints(points, 200)).toBeUndefined();
  });
});

describe('validateMessage', () => {
  it('returns error when too short', () => {
    expect(validateMessage('short')).toMatch(RE_MESSAGE_LENGTH);
  });

  it('returns error when empty', () => {
    expect(validateMessage('')).toBeDefined();
  });

  it('returns error for 9 chars exactly', () => {
    expect(validateMessage('123456789')).toBeDefined();
  });

  it('returns undefined for exactly 10 chars', () => {
    expect(validateMessage('1234567890')).toBeUndefined();
  });

  it('returns error for whitespace-padded short message', () => {
    expect(validateMessage('   hi   ')).toBeDefined();
  });
});

describe('validateKudoForm', () => {
  const valid = {
    receiverId: 'user-2',
    points: 30,
    coreValue: 'teamwork' as const,
    message: 'Great work on this!',
  };

  it('returns no errors for valid form', () => {
    const errors = validateKudoForm(valid, 200);
    expect(isFormValid(errors)).toBe(true);
  });

  it('returns all errors for empty form', () => {
    const errors = validateKudoForm(
      { receiverId: '', points: 30, coreValue: '', message: '' },
      200
    );
    expect(errors.receiver).toBeDefined();
    expect(errors.coreValue).toBeDefined();
    expect(errors.message).toBeDefined();
  });

  it('isFormValid returns false when any error exists', () => {
    expect(isFormValid({ receiver: 'error' })).toBe(false);
  });

  it('isFormValid returns true when all undefined', () => {
    expect(isFormValid({})).toBe(true);
  });
});

describe('validateKudoField', () => {
  const values = {
    receiverId: 'u1',
    points: 20,
    coreValue: 'teamwork' as const,
    message: '1234567890',
  };

  it('returns undefined for an unexpected field key', () => {
    expect(validateKudoField('typo' as never, values, 100)).toBeUndefined();
  });
});
