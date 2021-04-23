import { createContext } from 'react';
import type { UserResponse } from '@booking/types';

export const UserContext = Object.assign(
  createContext<UserResponse | null>(null),
  {
    displayName: 'UserContext',
  }
);
