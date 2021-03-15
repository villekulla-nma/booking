import type { User } from '@villekulla-reservations/types';

export const isUser = (user: Partial<User>): user is User => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.email === 'string'
  );
};
