import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { useKudoForm } from '../useKudoForm';

describe('useKudoForm', () => {
  it('validateAll returns false when form is invalid', () => {
    const { result } = renderHook(() => useKudoForm(200));
    let valid = true;
    act(() => {
      valid = result.current.validateAll();
    });
    expect(valid).toBe(false);
    expect(result.current.errors.receiver).toBeDefined();
  });

  it('validateAll returns true when all fields valid', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.setField('receiverId', 'u-2');
      result.current.setField('coreValue', 'teamwork');
      result.current.setField('message', 'Nice work team!');
      result.current.setField('points', 25);
    });
    let valid = false;
    act(() => {
      valid = result.current.validateAll();
    });
    expect(valid).toBe(true);
  });

  it('applyRecipientSelection clears receiver error when user picked', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.applyRecipientSelection({ id: 'r1', name: 'Pat' });
    });
    expect(result.current.values.receiverId).toBe('r1');
    expect(result.current.errors.receiver).toBeUndefined();
  });

  it('reset restores initial values', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.setField('message', 'hello world!');
      result.current.reset();
    });
    expect(result.current.values.message).toBe('');
    expect(result.current.values.points).toBe(20);
  });

  it('clearError clears a field error', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.validateAll();
    });
    expect(result.current.errors.message).toBeDefined();
    act(() => {
      result.current.clearError('message');
    });
    expect(result.current.errors.message).toBeUndefined();
  });

  it('handleBlur marks touched and sets field error', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.handleBlur('message');
    });
    expect(result.current.touched.message).toBe(true);
    expect(result.current.errors.message).toBeDefined();
  });

  it('handleFieldChange re-validates when field was touched', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.handleBlur('points');
    });
    act(() => {
      result.current.handleFieldChange('points', 5);
    });
    expect(result.current.errors.points).toBeDefined();
  });

  it('handleFieldChange does not set errors when field not touched', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.handleFieldChange('message', 'still short');
    });
    expect(result.current.errors.message).toBeUndefined();
  });

  it('handleFieldChange supports explicit stateKey for receiver', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.handleBlur('receiver');
    });
    act(() => {
      result.current.handleFieldChange('receiver', 'user-9', 'receiverId');
    });
    expect(result.current.values.receiverId).toBe('user-9');
    expect(result.current.errors.receiver).toBeUndefined();
  });

  it('applyRecipientSelection with empty id sets receiver error when touched', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.handleBlur('receiver');
      result.current.applyRecipientSelection({ id: '', name: 'None' });
    });
    expect(result.current.errors.receiver).toBeDefined();
  });

  it('applyRecipientSelection with empty id skips error when receiver not touched', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.applyRecipientSelection({ id: '', name: 'None' });
    });
    expect(result.current.errors.receiver).toBeUndefined();
  });

  it('applyRecipientSelection with empty id validates after validateAll', () => {
    const { result } = renderHook(() => useKudoForm(200));
    act(() => {
      result.current.validateAll();
    });
    act(() => {
      result.current.applyRecipientSelection({ id: '', name: 'None' });
    });
    expect(result.current.errors.receiver).toBeDefined();
  });
});
