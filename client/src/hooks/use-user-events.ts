import { useEffect, useState } from 'react';

import type { UserEvent } from '../api';
import { getUserEvents } from '../api';
import { useUser } from './use-user';

export const useUserEvents = (limit?: number): UserEvent[] | undefined => {
  const user = useUser();
  const [events, setEvents] = useState<UserEvent[] | undefined>();

  useEffect(() => {
    if (user) {
      getUserEvents(limit).then((events) => setEvents(events));
    }
  }, [limit, user]);

  return events;
};
