import { useState, useEffect } from 'react';

import { getEventById } from '../api';
import type { EventByIdData } from '../api';

export const useEventDetail = (eventId: string): EventByIdData | undefined => {
  const [event, setEvent] = useState<EventByIdData>();

  useEffect(() => {
    getEventById(eventId).then(setEvent);
  }, [eventId]);

  return event;
};
