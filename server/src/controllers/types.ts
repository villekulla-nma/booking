import type {
  GroupAttributes,
  ResourceAttributes,
  UserAttributes,
  UserResponse,
} from '@booking/types';

export type UserResult = UserResponse & Pick<UserAttributes, 'password'>;

export type ResourceResult = Pick<ResourceAttributes, 'id' | 'name'>;

export type GroupResult = Pick<GroupAttributes, 'id' | 'name'>;
