import type {
  UserAttributes,
  ResourceAttributes,
  EventAttributes,
  EventResult,
  LoginResult,
  UserResponse,
  UserRole,
  GroupAttributes,
} from '@booking/types';

import { isUser } from './helpers/is-user';
import { isGroup } from './helpers/is-group';
import { isEvent } from './helpers/is-event';

export type EventByIdData = EventAttributes & {
  user: UserAttributes;
  resource: ResourceAttributes;
};

export type UserEvent = EventResult & {
  resource: string;
};

export type ResponseStatus =
  | 'ok'
  | 'overlapping'
  | 'unverified'
  | 'invalid'
  | 'error';

export class UnauthenticatedError extends Error {
  public constructor() {
    super('user not authenticated');
  }

  public get name(): string {
    return 'UnauthenticatedError';
  }
}

const assertResponseStatus = (
  status: ResponseStatus,
  route: string
): void | never => {
  if (!/^(ok|overlapping|unverified|invalid|error)$/.test(status)) {
    throw new Error(`Invalid response from ${route}`);
  }
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const { status } = await response.json();

  assertResponseStatus(status, '/api/login');

  return status as LoginResult;
};

export const logout = async (): Promise<void> => {
  await fetch('/api/logout', { method: 'POST' });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await fetch('/api/password-reset', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    /* nothing to do here */
  }
};

export const updatePassword = async (
  token: string,
  password: string,
  confirm: string
): Promise<ResponseStatus> => {
  const response = await fetch(`/api/password-reset/${token}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password, password_confirm: confirm }),
  });

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { status } = await response.json();

  assertResponseStatus(status, '/api/password-reset/:token');

  return status;
};

export const getUser = async (): Promise<UserResponse | undefined> => {
  const response = await fetch('/api/user');

  if (response.status !== 200) {
    return undefined;
  }

  const { payload: user } = await response.json();

  return isUser(user) ? user : undefined;
};

export const getAllUsers = async (): Promise<UserResponse[]> => {
  const response = await fetch('/api/users');

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: users } = await response.json();

  return users.filter((user: unknown): user is UserResponse => isUser(user));
};

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  role: UserRole,
  groupId: string
): Promise<ResponseStatus> => {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email, role, groupId }),
  });

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { status } = await response.json();

  assertResponseStatus(status, '/api/user');

  return status;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const response = await fetch('/api/user', {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: userId }),
  });

  return response.status === 200;
};

export const getAllGroups = async (): Promise<GroupAttributes[]> => {
  const response = await fetch('/api/groups');

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: groups } = await response.json();

  return groups.filter((group: unknown): group is GroupAttributes =>
    isGroup(group)
  );
};

export const createGroup = async (name: string): Promise<ResponseStatus> => {
  const response = await fetch('/api/groups', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { status } = await response.json();

  assertResponseStatus(status, '/api/groups');

  return status;
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  const response = await fetch('/api/groups', {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: groupId }),
  });

  return response.status === 200;
};

export const getResources = async (): Promise<ResourceAttributes[]> => {
  const response = await fetch('/api/resources');

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: resources } = await response.json();

  return resources;
};

export const getEventsByResourceId = async ({
  resourceId,
  start,
  end,
  timeZone,
}: {
  resourceId: string;
  start: string;
  end: string;
  timeZone: string;
}): Promise<EventResult[]> => {
  const query = new URLSearchParams({ start, end, timeZone }).toString();
  const response = await fetch(`/api/resources/${resourceId}/events?${query}`);

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: events } = await response.json();

  return Array.isArray(events)
    ? events.filter((event: unknown): event is EventResult => isEvent(event))
    : [];
};

export const getEventById = async (eventId: string): Promise<EventByIdData> => {
  const response = await fetch(`/api/events/${eventId}`);

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: event } = await response.json();

  return event;
};

export const getUserEvents = async (limit?: number): Promise<UserEvent[]> => {
  const query = limit
    ? new URLSearchParams({ limit: String(limit) }).toString()
    : '';
  const glue = query ? '?' : '';
  const response = await fetch(`/api/user/events${glue}${query}`);

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { payload: events = [] } = await response.json();

  return events;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }
};

export const createEvent = async (
  start: string,
  end: string,
  description: string,
  allDay: boolean,
  resourceId: string
): Promise<ResponseStatus> => {
  const response = await fetch(`/api/resources/${resourceId}/events`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ start, end, description, allDay }),
  });

  if (response.status === 401) {
    throw new UnauthenticatedError();
  }

  const { status } = await response.json();

  assertResponseStatus(status, '/api/resources/:resourceId/events');

  return status;
};
