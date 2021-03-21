import type {
  EventAttributes,
  GroupAttributes,
  ResourceAttributes,
  UserAttributes,
} from '@villekulla-reservations/types';

export type UserResult = Pick<
  UserAttributes,
  'id' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'password'
>;

export type ResourceResult = Pick<ResourceAttributes, 'id' | 'name'>;

export type GroupResult = Pick<GroupAttributes, 'id' | 'name'>;

export type EventResult = Pick<
  EventAttributes,
  'id' | 'start' | 'end' | 'description' | 'allDay'
>;
