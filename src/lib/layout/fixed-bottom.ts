/**
 * Fixed footer + safe area: main scroll padding and Give Kudo FAB `bottom`.
 * Tune together if `Footer` padding changes.
 */
export const MAIN_SCROLL_PADDING_BOTTOM =
  'calc(6.5rem + env(safe-area-inset-bottom, 0px))';

export const GIVE_KUDO_FAB_BOTTOM =
  'calc(5rem + env(safe-area-inset-bottom, 0px))';
