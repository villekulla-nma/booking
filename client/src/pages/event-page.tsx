import type { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, formatDuration, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

import { useEventDetail } from '../hooks/use-event-detail';

interface Params {
  resourceId: string;
  eventId: string;
}

export const EventPage: FC = () => {
  const { eventId, resourceId } = useParams<Params>();
  const event = useEventDetail(eventId);

  if (!event) {
    return <b>Loading event...</b>;
  }

  // TODO: fix timezone offset...
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const from = format(start, 'd. LLLL yyyy, H:mm', { locale: de });
  const to = format(end, 'd. LLLL yyyy, H:mm', { locale: de });
  const duration = event.all_day
    ? null
    : formatDuration(
        {
          hours: end.getHours() - start.getHours(),
          minutes: end.getMinutes() - start.getMinutes(),
        },
        { format: ['hours', 'minutes'], locale: de }
      );
  const headingSuffix = duration
    ? `gebucht für ${duration}`
    : 'komplett gebucht';

  return (
    <>
      <Link to={`/resources/${resourceId}`}>zurück</Link>
      <h1>
        {event.resource.name} {headingSuffix}
      </h1>
      <dl>
        <dt>Beginn</dt>
        <dd>{from} Uhr</dd>
        <dt>Ende</dt>
        <dd>{to} Uhr</dd>
        {event.description && (
          <>
            <dt>Zweck</dt>
            <dd>{event.description}</dd>
          </>
        )}
      </dl>
      <hr />
      <em>Gebucht von {event.user.fullName}</em>
    </>
  );
};
