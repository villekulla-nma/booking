import { useEffect, useState } from 'react';

import type { UserEvent } from '../api';
import { getUserEvents } from '../api';
import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

export const useUserEvents = (limit?: number): UserEvent[] | undefined => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [events, setEvents] = useState<UserEvent[] | undefined>();

  useEffect(() => {
    if (user) {
      getUserEvents(limit).then(
        (events) => setEvents(events),
        (error) => redirect(error)
      );
    }
  }, [limit, user, redirect]);

  return events;
};
