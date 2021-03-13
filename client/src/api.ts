import type { ResourceAttributes } from '@villekulla-reservations/types';

export const getResources = async (): Promise<ResourceAttributes[]> => {
  const response = await fetch('/api/resources');
  const resources = await response.json();

  return resources;
};
