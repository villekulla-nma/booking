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

export const verifySession = async (): Promise<User | undefined> => {
  const response = await fetch('/api/verify-session', { method: 'POST' });

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
  resourceId: string,
  userId: string
): Promise<void> => {
  fetch(`/api/resources/${resourceId}/events`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ userId, start, end, description, allDay }),
  });
};
