import type { FC } from 'react';
import { Link, useParams, useHistory, useLocation } from 'react-router-dom';
import {
  Icon,
  Link as A,
  Stack,
  Text,
  Separator,
  CommandBarButton,
} from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyleSets, mergeStyles } from '@fluentui/merge-styles';
import { SharedColors } from '@fluentui/theme';
import { formatDuration } from 'date-fns';
import { de } from 'date-fns/locale';

import { deleteEvent } from '../api';
import { useEventDetail } from '../hooks/use-event-detail';
import { useUser } from '../hooks/use-user';
import { Layout } from '../components/layout';
import { DateRange } from '../components/date-range';

interface Params {
  eventId: string;
}

const backLinkInteraction = {
  textDecoration: 'none',
};

const backLink = mergeStyleSets({
  root: {
    marginBottom: '32px',
    userSelect: 'none',
    ':hover': backLinkInteraction,
    ':focus': backLinkInteraction,
  },
  text: {
    color: SharedColors.cyanBlue20,
  },
});

const backLinkTokens: IStackTokens = {
  childrenGap: '12px',
};

const contentTokens: IStackTokens = {
  childrenGap: '16px',
};

const heading = mergeStyles({
  marginBottom: '24px',
});

const getCalendarParamsFromSearch = (search: string): string | undefined => {
  const query = new URLSearchParams(search);
  const resourceId = query.get('resourceId');
  const view = query.get('view');
  const now = query.get('now');

  return resourceId && view && now
    ? [resourceId, view, now].join('/')
    : undefined;
};

export const EventPage: FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { eventId } = useParams<Params>();
  const event = useEventDetail(eventId);
  const user = useUser();

  if (!user || !event) {
    return <b>Loading event...</b>;
  }

  const calendarParams = getCalendarParamsFromSearch(location.search);
  const backLinkUrl = calendarParams ? `/resources/${calendarParams}` : '/';
  const start = new Date(event.start);
  const end = new Date(event.end);
  const duration = event.allDay
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
  const handleDelete = () => {
    if (window.confirm('Soll der Eintrag wirklich geköscht werden?')) {
      deleteEvent(eventId).then(
        () => history.push(backLinkUrl),
        () => alert('Der Eintrag konnte nicht gelöscht werden.')
      );
    }
  };

  return (
    <Layout>
      <A as={Link} to={backLinkUrl} className={backLink.root}>
        <Stack horizontal={true} verticalAlign="center" tokens={backLinkTokens}>
          <Icon iconName="chevronLeft" />
          <Text as="span" variant="medium" className={backLink.text}>
            zurück
          </Text>
        </Stack>
      </A>
      <Stack tokens={contentTokens}>
        <Text variant="xxLarge" className={heading}>
          {event.resource.name} {headingSuffix}
        </Text>
        <DateRange
          start={start.toISOString()}
          end={end.toISOString()}
          allDay={event.allDay}
        />
        <Text variant="medium">{event.description}</Text>
        <Separator />
        <Stack horizontal={true} horizontalAlign="space-between">
          <Text as="em" variant="medium">
            Gebucht von {event.user.fullName}
          </Text>
          {user.id === event.user.id && (
            <CommandBarButton
              onClick={handleDelete}
              iconProps={{ iconName: 'RemoveEvent' }}
              text="Eintrag löschen"
            />
          )}
        </Stack>
      </Stack>
    </Layout>
  );
};
