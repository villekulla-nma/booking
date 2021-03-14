import type { ResourceAttributes } from '@villekulla-reservations/types';

export const getResources = async (): Promise<ResourceAttributes[]> => {
  const response = await fetch('/api/resources');
  const resources = await response.json();

  return resources;
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
    body: JSON.stringify({ user: userId, start, end, description, allDay }),
  });
};
