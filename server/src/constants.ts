export const LOGOUT_COOKIE =
  'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true';

export const RE_COLOR = /^#[a-f0-9]{6}$/i;

export const DEFAULT_UNIT_COLOR = '#3788d8';

export enum STATUS {
  OK = 'ok',
  INVALID = 'invalid',
  ERROR = 'error',
  UNVERIFIED = 'unverified',
  OVERLAPPING = 'overlapping',
}
