import type {
  UserAttributes,
  ResourceAttributes,
  EventAttributes,
  LoginResult,
  User,
} from '@villekulla-reservations/types';

import { isUser } from './helpers/is-user';

export type EventByIdData = EventAttributes & {
  user: UserAttributes;
  resource: ResourceAttributes;
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

  if (!/^(ok|unverified|invalid|error)$/.test(status)) {
    throw new Error('Invalid response from /api/login');
  }

  return status as LoginResult;
};

export const logout = async (): Promise<void> => {
  await fetch('/api/logout', { method: 'POST' });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await fetch('/api/password-reset', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
};

export type UpdatePasswordResponse = 'ok' | 'invalid' | 'error';

export const updatePassword = async (
  token: string,
  password: string,
  confirm: string
): Promise<UpdatePasswordResponse> => {
  const response = await fetch(`/api/password-reset/${token}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password, password_confirm: confirm }),
  });
  const { status } = await response.json();

  if (!/^(ok|invalid|error)$/.test(status)) {
    throw new Error('Invalid response from /api/password-reset/:token');
  }

  return status;
};

export const getUser = async (): Promise<User | undefined> => {
  const response = await fetch('/api/user');

  if (response.status !== 200) {
    return undefined;
  }

  const { user } = await response.json();

  return isUser(user) ? user : undefined;
};

export const getResources = async (): Promise<ResourceAttributes[]> => {
  const response = await fetch('/api/resources');
  const resources = await response.json();

  return resources;
};

export const getEventById = async (eventId: string): Promise<EventByIdData> => {
  const response = await fetch(`/api/events/${eventId}`);
  const event = await response.json();

  return event;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
};

export const createEvent = async (
  start: string,
  end: string,
  description: string,
  allDay: boolean,
  resourceId: string
): Promise<void> => {
  fetch(`/api/resources/${resourceId}/events`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ start, end, description, allDay }),
  });
};
