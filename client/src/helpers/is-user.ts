/* eslint @typescript-eslint/no-explicit-any: off, @typescript-eslint/explicit-module-boundary-types: off */

import type { UserResponse } from '@booking/types';

import { ROLE } from '../constants';

const roles = Object.values(ROLE) as string[];

export const isUser = (user: any): user is UserResponse => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    roles.includes(String(user.role)) &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.fullName === 'string' &&
    typeof user.email === 'string' &&
    typeof user.unitId === 'string'
  );
};
