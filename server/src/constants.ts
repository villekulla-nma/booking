export const LOGOUT_COOKIE =
  'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true';

// Thanks for not being helpful, ESLint...
/* eslint-disable quotes */
export const CSP_DIRECTIVES = [
  `default-src 'none'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `style-src-attr 'self'`,
  `img-src 'self'`,
  `font-src 'self' data: https://spoprod-a.akamaihd.net`,
  `connect-src 'self' ws://localhost:8080`,
  `prefetch-src 'self'`,
  `child-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'none'`,
  `block-all-mixed-content`,
  `sandbox allow-forms allow-modals allow-same-origin allow-scripts`,
  `base-uri 'self'`,
  `manifest-src 'self'`,
];
/* eslint-enable quotes */

export enum STATUS {
  OK = 'ok',
  INVALID = 'invalid',
  ERROR = 'error',
  UNVERIFIED = 'unverified',
  OVERLAPPING = 'overlapping',
}
