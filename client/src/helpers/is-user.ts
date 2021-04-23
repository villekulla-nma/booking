import type { UserResponse } from '@booking/types';

export const isUser = (user: UserResponse | null): user is UserResponse => {
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
