import type {
  UserAttributes,
  ResourceAttributes,
  EventAttributes,
} from '@villekulla-reservations/types';

export type EventByIdData = EventAttributes & {
  user: UserAttributes;
  resource: ResourceAttributes;
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
