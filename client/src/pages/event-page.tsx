import type { FC } from 'react';
import { Link, useParams, useHistory, useLocation } from 'react-router-dom';
import {
  Icon,
  Link as A,
  Stack,
  Text,
  Separator,
  CommandBarButton,
  NeutralColors,
} from '@fluentui/react';
import type { IStackTokens, IButtonStyles } from '@fluentui/react';
import { mergeStyleSets, mergeStyles } from '@fluentui/merge-styles';
import { SharedColors } from '@fluentui/theme';
import { memoizeFunction } from '@fluentui/utilities';
import { formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';

import { deleteEvent } from '../api';
import { useEventDetail } from '../hooks/use-event-detail';
import { useUserContext } from '../hooks/use-user-context';
import { Layout } from '../components/layout';
import { DateRange } from '../components/date-range';
import { inquireConfirmation } from '../helpers/inquire-confirmation';
import { useMediaQuery } from '../hooks/use-media-query';
import { MQ_IS_MEDIUM } from '../constants';

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

const description = mergeStyles({
  padding: '8px',
  background: NeutralColors.gray20,
  whiteSpace: 'break-spaces',
  wordBreak: 'break-word',
});

const username = mergeStyles({
  marginBottom: '32px',
  [`@media${MQ_IS_MEDIUM}`]: {
    marginBottom: 'inherit',
  },
});

const getDeleteButtonStyles = memoizeFunction(
  (isMedium: boolean): IButtonStyles => ({
    root: {
      display: isMedium ? undefined : 'flex',
      paddingLeft: isMedium ? undefined : '0',
    },
  })
);

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
  const user = useUserContext();
  const isMedium = useMediaQuery(MQ_IS_MEDIUM);

  if (!user || !event) {
    return (
      <Layout>
        <Text as="strong" variant="medium">
          Lade Event…
        </Text>
      </Layout>
    );
  }

  const calendarParams = getCalendarParamsFromSearch(location.search);
  const backLinkUrl = calendarParams ? `/resources/${calendarParams}` : '/';
  const start = new Date(event.start);
  const end = new Date(event.end);
  const duration = formatDistance(end, start, { locale: de });
  const footerHorizontalAlign = isMedium ? 'space-between' : 'start';
  const headingSize = isMedium ? 'xxLarge' : 'xLarge';
  const handleDelete = () => {
    if (inquireConfirmation('Soll der Eintrag wirklich geköscht werden?')) {
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
        <Text variant={headingSize} className={heading}>
          {event.resource.name} gebucht für {duration}
        </Text>
        <DateRange
          start={start.toISOString()}
          end={end.toISOString()}
          allDay={event.allDay}
        />
        {event.description && (
          <Text variant="medium" className={description}>
            {event.description}
          </Text>
        )}
        <Separator />
        <Stack horizontal={isMedium} horizontalAlign={footerHorizontalAlign}>
          <Text as="em" variant="medium" className={username}>
            Gebucht von {event.user.firstName}
          </Text>
          {user.id === event.user.id && (
            <CommandBarButton
              onClick={handleDelete}
              iconProps={{ iconName: 'RemoveEvent' }}
              text="Eintrag löschen"
              styles={getDeleteButtonStyles(isMedium)}
            />
          )}
        </Stack>
      </Stack>
    </Layout>
  );
};
