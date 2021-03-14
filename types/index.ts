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
  first_name: string;
  last_name: string;
  password?: string;
  fullName: string;
  groupId: string;
}

export interface EventAttributes {
  id: string;
  start: string;
  end: string;
  description: string;
  all_day: boolean;
  resourceId: string;
  userId: string;
}

export type LoginResult = 'ok' | 'unverified' | 'invalid' | 'error';
