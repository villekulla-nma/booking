import type { UserResponse } from '@villekulla-reservations/types';

export const isUser = (user: Partial<UserResponse>): user is UserResponse => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    ['user', 'admin'].includes(String(user.role)) &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.email === 'string'
  );
};
