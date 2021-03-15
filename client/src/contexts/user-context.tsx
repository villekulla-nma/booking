import { createContext } from 'react';
import type { User } from '@villekulla-reservations/types';

export const UserContext = Object.assign(createContext<Partial<User>>({}), {
  displayName: 'UserContext',
});
