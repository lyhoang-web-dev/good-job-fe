import type { CoreValue } from '@/lib/types';

export interface KudoFormValues {
  coreValue: CoreValue | '';
  message: string;
  points: number;
  receiverId: string;
}

export interface KudoFormErrors {
  coreValue?: string;
  message?: string;
  points?: string;
  receiver?: string;
}

export function validateReceiver(receiverId: string): string | undefined {
  if (!receiverId) {
    return 'Please select a recipient';
  }
  return undefined;
}

export function validatePoints(
  points: number,
  remaining: number
): string | undefined {
  if (points < 10 || points > 50) {
    return 'Points must be between 10 and 50';
  }
  if (points > remaining) {
    return `Not enough budget — only ${String(remaining)} pts remaining`;
  }
  return undefined;
}

export function validateCoreValue(
  coreValue: CoreValue | ''
): string | undefined {
  if (!coreValue) {
    return 'Please select a core value';
  }
  return undefined;
}

export function validateMessage(message: string): string | undefined {
  if (message.trim().length < 10) {
    return 'Message must be at least 10 characters';
  }
  return undefined;
}

export function validateKudoField(
  field: keyof KudoFormErrors,
  values: KudoFormValues,
  remaining: number
): string | undefined {
  switch (field) {
    case 'receiver':
      return validateReceiver(values.receiverId);
    case 'points':
      return validatePoints(values.points, remaining);
    case 'coreValue':
      return validateCoreValue(values.coreValue);
    case 'message':
      return validateMessage(values.message);
    default:
      return undefined;
  }
}

export function validateKudoForm(
  values: KudoFormValues,
  remaining: number
): KudoFormErrors {
  return {
    receiver: validateKudoField('receiver', values, remaining),
    points: validateKudoField('points', values, remaining),
    coreValue: validateKudoField('coreValue', values, remaining),
    message: validateKudoField('message', values, remaining),
  };
}

export function isFormValid(errors: KudoFormErrors): boolean {
  return !Object.values(errors).some(Boolean);
}
