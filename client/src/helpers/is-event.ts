/* eslint @typescript-eslint/no-explicit-any: off, @typescript-eslint/explicit-module-boundary-types: off */

import type { EventResult } from '@booking/types';

export const isEvent = (event: any): event is EventResult => {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.id === 'string' &&
    typeof event.start === 'string' &&
    typeof event.end === 'string' &&
    typeof event.description === 'string' &&
    typeof event.allDay === 'boolean' &&
    typeof event.createdAt === 'string'
  );
};
