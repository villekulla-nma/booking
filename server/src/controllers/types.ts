import type {
  UnitAttributes,
  ResourceAttributes,
  UserAttributes,
  UserResponse,
} from '@booking/types';

export type UserResult = UserResponse &
  Pick<UserAttributes, 'password' | 'passwordReset'>;

export type ResourceResult = Pick<ResourceAttributes, 'id' | 'name'>;

export type UnitResult = Pick<UnitAttributes, 'id' | 'name'>;
