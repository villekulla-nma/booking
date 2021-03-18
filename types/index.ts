export interface GroupAttributes {
  id: string;
  name: string;
}

export interface ResourceAttributes {
  id: string;
  name: string;
}

export interface UserAttributes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  passwordReset?: string;
  fullName: string;
  groupId: string;
}

export interface EventAttributes {
  id: string;
  start: string;
  end: string;
  description: string;
  allDay: boolean;
  resourceId: string;
  userId: string;
}

export type LoginResult = 'ok' | 'unverified' | 'invalid' | 'error';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
