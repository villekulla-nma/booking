import { useEffect, useState } from 'react';

import type { UserEvent } from '../api';
import { getUserEvents } from '../api';

export const useUserEvents = (limit?: number): UserEvent[] | undefined => {
  const [events, setEvents] = useState<UserEvent[] | undefined>();

  useEffect(() => {
    getUserEvents(limit).then((events) => setEvents(events));
  }, [limit]);

  return events;
};
