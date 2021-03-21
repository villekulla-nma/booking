import { createContext } from 'react';
import type { UserResponse } from '@villekulla-reservations/types';

export const UserContext = Object.assign(
  createContext<Partial<UserResponse>>({}),
  {
    displayName: 'UserContext',
  }
);
