import type { CoreValue } from '@/lib/types';

export function cvLabel(cv: CoreValue): string {
  return cv === 'customer_focus' ? 'Customer focus' : cv.replaceAll('_', ' ');
}
