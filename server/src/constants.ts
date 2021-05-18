export const LOGOUT_COOKIE =
  'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true';

export enum STATUS {
  OK = 'ok',
  INVALID = 'invalid',
  ERROR = 'error',
  UNVERIFIED = 'unverified',
  OVERLAPPING = 'overlapping',
}
