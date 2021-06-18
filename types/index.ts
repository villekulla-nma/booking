export interface UnitAttributes {
  id: string;
  name: string;
  color?: string | null;
}

export interface ResourceAttributes {
  id: string;
  name: string;
}

export type UserRole = 'user' | 'admin';

export interface UserAttributes {
  id: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  password?: string | null;
  passwordReset?: string | null;
  fullName: string;
  unitId: string;
}

export interface EventAttributes {
  id: string;
  start: string;
  end: string;
  description: string;
  allDay: boolean;
  resourceId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string | null;
}

export type EventResult = Pick<
  EventAttributes,
  'id' | 'start' | 'end' | 'description' | 'allDay' | 'createdAt'
>;

export type LoginResult = 'ok' | 'unverified' | 'invalid' | 'error';

export type UserResponse = Pick<
  UserAttributes,
  'id' | 'role' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'unitId'
> &
  Partial<Pick<UserAttributes, 'passwordReset'>>;
