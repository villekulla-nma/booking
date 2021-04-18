import { useState, useEffect } from 'react';

import { getEventById } from '../api';
import type { EventByIdData } from '../api';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

export const useEventDetail = (eventId: string): EventByIdData | undefined => {
  const redirect = useRedirectUnauthenticatedUser();
  const [event, setEvent] = useState<EventByIdData>();

  useEffect(() => {
    getEventById(eventId).then(setEvent, (error) => redirect(error));
  }, [eventId, redirect]);

  return event;
};
