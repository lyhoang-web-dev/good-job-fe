import { useCallback, useRef, useState } from 'react';

import type { CoreValue, RecipientSelection } from '@/lib/types';
import {
  isFormValid,
  type KudoFormErrors,
  type KudoFormValues,
  validateKudoField,
  validateKudoForm,
} from '@/lib/validations/kudo.validation';

type TouchedFields = Partial<Record<keyof KudoFormErrors, boolean>>;

const INITIAL_VALUES: KudoFormValues = {
  receiverId: '',
  points: 20,
  coreValue: '',
  message: '',
};

export function useKudoForm(remaining: number) {
  const [values, setValues] = useState<KudoFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<KudoFormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const touchedRef = useRef(touched);
  const valuesRef = useRef(values);
  const remainingRef = useRef(remaining);
  touchedRef.current = touched;
  valuesRef.current = values;
  remainingRef.current = remaining;

  const validateField = useCallback(
    (
      field: keyof KudoFormErrors,
      overrideValues?: Partial<KudoFormValues>
    ): string | undefined => {
      const v = { ...values, ...overrideValues };
      return validateKudoField(field, v, remaining);
    },
    [values, remaining]
  );

  const handleBlur = useCallback((field: keyof KudoFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateKudoField(
      field,
      valuesRef.current,
      remainingRef.current
    );
    setErrors((prev) => ({ ...prev, [field]: err }));
  }, []);

  const handleFieldChange = useCallback(
    (
      field: keyof KudoFormErrors,
      value: string | number | CoreValue,
      stateKey?: keyof KudoFormValues
    ) => {
      const key = stateKey ?? (field === 'receiver' ? 'receiverId' : field);
      const newValues = { ...values, [key]: value } as KudoFormValues;
      setValues(newValues);

      if (touched[field]) {
        const err = validateField(field, newValues);
        setErrors((prev) => ({ ...prev, [field]: err }));
      }
    },
    [values, touched, validateField]
  );

  const validateAll = useCallback((): boolean => {
    setTouched({
      receiver: true,
      points: true,
      coreValue: true,
      message: true,
    });
    const newErrors = validateKudoForm(values, remaining);
    setErrors(newErrors);
    return isFormValid(newErrors);
  }, [values, remaining]);

  const setField = useCallback(
    (key: keyof KudoFormValues, value: string | number | CoreValue) => {
      setValues((prev) => ({ ...prev, [key]: value }) as KudoFormValues);
    },
    []
  );

  const applyRecipientSelection = useCallback((user: RecipientSelection) => {
    setValues((prev) => ({ ...prev, receiverId: user.id }));
    if (user.id) {
      setTouched((prev) => ({ ...prev, receiver: true }));
      setErrors((prev) => ({ ...prev, receiver: undefined }));
      return;
    }
    if (touchedRef.current.receiver) {
      setErrors((prev) => ({
        ...prev,
        receiver: validateKudoField(
          'receiver',
          { ...valuesRef.current, receiverId: '' },
          remainingRef.current
        ),
      }));
    }
  }, []);

  const clearError = useCallback((field: keyof KudoFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
  }, []);

  return {
    values,
    errors,
    touched,
    handleBlur,
    handleFieldChange,
    validateAll,
    setField,
    applyRecipientSelection,
    clearError,
    reset,
  };
}
