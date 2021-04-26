import type {
  GroupAttributes,
  ResourceAttributes,
  UserAttributes,
} from '@booking/types';

export type UserResult = Pick<
  UserAttributes,
  'id' | 'role' | 'firstName' | 'lastName' | 'fullName' | 'email'
>;

export type ResourceResult = Pick<ResourceAttributes, 'id' | 'name'>;

export type GroupResult = Pick<GroupAttributes, 'id' | 'name'>;
