import { useState, useRef } from 'react';
import type { FC, RefObject } from 'react';
import FullCalendar, { BASE_OPTION_DEFAULTS } from '@fullcalendar/react';
import type {
  DateSelectArg,
  EventSourceInput,
  EventClickArg,
} from '@fullcalendar/react';
import locale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ActionButton,
  DefaultButton,
  CommandBar,
  Icon,
  Stack,
  FontWeights,
  Text,
} from '@fluentui/react';
import type {
  IButtonStyles,
  IIconProps,
  IStackTokens,
  ICommandBarItemProps,
} from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { Layout } from '../components/layout';
import type { ViewTypeOption, ViewTypeParam } from '../types';
import { DEFAULT_VIEW_OPTION, MQ_IS_DESKTOP, MQ_IS_MEDIUM } from '../constants';
import { useMediaQuery } from '../hooks/use-media-query';
import { UnauthenticatedError } from '../api';
import { useRedirectUnauthenticatedUser } from '../hooks/use-redirect-unauthenticated-user';
import { useResourceList } from '../hooks/use-resource-list';

interface Params {
  resourceId: string;
  view: string;
  now: string;
}

interface SelectionRange {
  start: string;
  end: string;
  allDay: boolean;
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const wrapTokens: IStackTokens = {
  childrenGap: '16px',
};

const toolbarTokens: IStackTokens = {
  childrenGap: '8px',
};

const toolbar = mergeStyles({
  [`@media ${MQ_IS_DESKTOP}`]: {
    marginBottom: '32px',
  },
});

const caption = mergeStyles({
  margin: 0,
  textAlign: 'center',
});

// Increase specifity to overrule Fullcalendar styles
const calendarClassName = mergeStyles({
  ':global(.fc.fc table)': {
    fontSize: '.8em',
    [`@media ${MQ_IS_MEDIUM}`]: {
      fontSize: '.9em',
    },
    [`@media ${MQ_IS_DESKTOP}`]: {
      fontSize: '1em',
    },
  },
  ':global(.fc .fc-toolbar-title.fc-toolbar-title)': {
    fontSize: '1em',
    [`@media ${MQ_IS_MEDIUM}`]: {
      fontSize: '1.25em',
    },
    [`@media ${MQ_IS_DESKTOP}`]: {
      fontSize: '1.75em',
    },
  },
});

const actionButton = mergeStyles({
  marginBottom: '32px',
  fontSize: '16px',
  [`@media ${MQ_IS_DESKTOP}`]: {
    fontSize: '18px',
  },
});

const viewSelectionButton = {
  label: {
    fontWeight: FontWeights.regular,
  },
};

const commandBar = {
  root: { paddingRight: 0, paddingLeft: 0 },
};

const getViewTypeOption = (view: string | null): ViewTypeOption => {
  switch (view) {
    case 'day':
      return 'timeGridDay';
    case 'month':
      return 'dayGridMonth';
    case 'week':
    default:
      return DEFAULT_VIEW_OPTION;
  }
};

const getNowFromString = (now: string | null): string | undefined => {
  switch (true) {
    case now === null:
    case now?.match(/^\d{4}-\d{2}-\d{2}$/) === null:
      return undefined;
    default:
      return `${now}T00:00:00`;
  }
};

export const ResourcePage: FC = () => {
  const redirect = useRedirectUnauthenticatedUser();
  const resources = useResourceList();
  const history = useHistory();
  const params = useParams<Params>();
  const currentViewType = getViewTypeOption(params.view);
  const nowProp = getNowFromString(params.now);
  const calendar = useRef<FullCalendar>();
  const [dateSelection, setDateSelection] = useState<SelectionRange>();
  const isDesktop = useMediaQuery(MQ_IS_DESKTOP);
  const eventSource: EventSourceInput = {
    url: `/api/resources/${params.resourceId}/events`,
    failure: (error) => {
      if (error?.xhr.status === 401) {
        redirect(new UnauthenticatedError());
      }
    },
  };
  const search = new URLSearchParams({
    view: params.view,
    now: params.now,
  });
  const actionButtonIcon: IIconProps = { iconName: 'Add' };
  const calendarAspectRatio = isDesktop
    ? BASE_OPTION_DEFAULTS.aspectRatio
    : 0.95;
  const { name: resourceName = 'Unbekannt' } =
    resources.find(({ id }) => params.resourceId === id) || {};
  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  const headerToolbar = { left: '', center: 'title', right: '' };
  const replaceView = (view: ViewTypeParam): void =>
    history.replace(`/resources/${params.resourceId}/${view}/${params.now}`);
  const replaceNow = (now: string): void =>
    history.replace(`/resources/${params.resourceId}/${params.view}/${now}`);
  const handlePrev = () => {
    if (calendar.current) {
      const api = calendar.current.getApi();
      api.prev();
      const date = new Date(api.getDate());
      const lastWeek = format(date, 'yyyy-MM-dd');

      replaceNow(lastWeek);
    }
  };
  const handleNext = () => {
    if (calendar.current) {
      const api = calendar.current.getApi();
      api.next();
      const date = new Date(api.getDate());
      const nextWeek = format(date, 'yyyy-MM-dd');

      replaceNow(nextWeek);
    }
  };
  const handleToday = () => {
    const now = format(new Date(), 'yyyy-MM-dd');

    if (calendar.current) {
      calendar.current.getApi().today();
    }
    replaceNow(now);
  };
  const handleViewMonth = () => {
    if (calendar.current) {
      calendar.current.getApi().changeView('dayGridMonth');
    }
    replaceView('month');
  };
  const handleViewWeek = () => {
    if (calendar.current) {
      calendar.current.getApi().changeView('timeGridWeek');
    }
    replaceView('week');
  };
  const handleViewDay = () => {
    if (calendar.current) {
      calendar.current.getApi().changeView('timeGridDay');
    }
    replaceView('day');
  };
  const handleClick = (args: EventClickArg) => {
    const searchParams = new URLSearchParams(search);

    searchParams.append('resourceId', params.resourceId);
    history.push(`/events/${args.event.id}?${searchParams}`);
  };
  const handleSelect = (args: DateSelectArg): void =>
    setDateSelection({
      allDay: args.allDay,
      start: args.start.toISOString(),
      end: args.end.toISOString(),
    });
  const handleUnselect = () => setDateSelection(undefined);
  const handleReservation = (): void => {
    history.push(
      `/resources/${params.resourceId}/create?${search}`,
      dateSelection
    );
  };
  const buttonStyles: IButtonStyles = { root: { marginLeft: '32px' } };
  const navigationMenuItems: ICommandBarItemProps[] = [
    {
      key: 'create',
      onClick: handleReservation,
      iconProps: { iconName: 'Add' },
      iconOnly: true,
    },
    {
      key: 'prev',
      onClick: handlePrev,
      iconProps: { iconName: 'chevronLeft' },
      iconOnly: true,
    },
    {
      key: 'next',
      onClick: handleNext,
      iconProps: { iconName: 'chevronright' },
      iconOnly: true,
    },
    { key: 'today', text: 'Heute', onClick: handleToday, buttonStyles },
    {
      key: 'view',
      text: 'Ansicht',
      subMenuProps: {
        items: [
          {
            key: 'month',
            text: 'Monat',
            disabled: currentViewType === 'dayGridMonth',
            onClick: handleViewMonth,
          },
          {
            key: 'week',
            text: 'Woche',
            disabled: currentViewType === 'timeGridWeek',
            onClick: handleViewWeek,
          },
          {
            key: 'day',
            text: 'Tag',
            disabled: currentViewType === 'timeGridDay',
            onClick: handleViewDay,
          },
        ],
        styles: {
          subComponentStyles: {
            menuItem: { item: { padding: '8px' } },
          },
        },
      },
      buttonStyles,
    },
  ];

  return (
    <Layout>
      <Stack tokens={wrapTokens}>
        {isDesktop || (
          <Text
            variant="large"
            className={caption}
            as="h1"
            data-testid="caption"
          >
            {resourceName}
          </Text>
        )}
        <Stack horizontal={true} horizontalAlign="space-between">
          {isDesktop ? (
            <>
              <Stack
                horizontal={true}
                tokens={toolbarTokens}
                className={toolbar}
              >
                <DefaultButton aria-label="customPrev" onClick={handlePrev}>
                  <Icon iconName="chevronLeft" />
                </DefaultButton>
                <DefaultButton aria-label="customNext" onClick={handleNext}>
                  <Icon iconName="chevronRight" />
                </DefaultButton>
                <DefaultButton
                  styles={viewSelectionButton}
                  onClick={handleToday}
                >
                  Heute
                </DefaultButton>
              </Stack>
              <Stack
                horizontal={true}
                tokens={toolbarTokens}
                className={toolbar}
              >
                <DefaultButton
                  styles={viewSelectionButton}
                  onClick={handleViewMonth}
                  primary={currentViewType === 'dayGridMonth'}
                >
                  Monat
                </DefaultButton>
                <DefaultButton
                  styles={viewSelectionButton}
                  onClick={handleViewWeek}
                  primary={currentViewType === 'timeGridWeek'}
                >
                  Woche
                </DefaultButton>
                <DefaultButton
                  styles={viewSelectionButton}
                  onClick={handleViewDay}
                  primary={currentViewType === 'timeGridDay'}
                >
                  Tag
                </DefaultButton>
              </Stack>
            </>
          ) : (
            <CommandBar
              items={navigationMenuItems}
              ariaLabel="Kalendaransicht wählen"
              styles={commandBar}
              className="CommandBar"
            />
          )}
        </Stack>
        <FullCalendar
          ref={calendar as RefObject<FullCalendar>}
          viewClassNames={calendarClassName}
          locale={locale}
          timeZone={timeZone}
          plugins={plugins}
          headerToolbar={headerToolbar}
          eventSources={[eventSource]}
          initialView={currentViewType}
          selectable={currentViewType !== 'dayGridMonth'}
          eventClick={handleClick}
          select={handleSelect}
          unselect={handleUnselect}
          unselectAuto={false}
          initialDate={nowProp}
          aspectRatio={calendarAspectRatio}
        />
        {isDesktop && (
          <Stack.Item>
            <ActionButton
              onClick={handleReservation}
              iconProps={actionButtonIcon}
              className={actionButton}
            >
              Reservieren
            </ActionButton>
          </Stack.Item>
        )}
      </Stack>
    </Layout>
  );
};
