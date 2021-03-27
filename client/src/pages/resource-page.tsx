import { useState, useRef } from 'react';
import type { FC, RefObject } from 'react';
import FullCalendar from '@fullcalendar/react';
import type {
  DateSelectArg,
  EventSourceInput,
  EventClickArg,
  ToolbarInput,
  CustomButtonInput,
} from '@fullcalendar/react';
import locale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ActionButton } from '@fluentui/react';
import type { IIconProps } from '@fluentui/react';

import { Layout } from '../components/layout';
import type { ViewTypeOption, ViewTypeParam } from '../types';
import { DEFAULT_VIEW_OPTION } from '../constants';

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
  const history = useHistory();
  const params = useParams<Params>();
  const currentViewType = getViewTypeOption(params.view);
  const nowProp = getNowFromString(params.now);
  const calendar = useRef<FullCalendar>();
  const [dateSelection, setDateSelection] = useState<SelectionRange>();
  const eventSource: EventSourceInput = {
    url: `/api/resources/${params.resourceId}/events`,
  };
  const search = new URLSearchParams({
    view: params.view,
    now: params.now,
  });
  const actionButtonIcon: IIconProps = { iconName: 'Add' };

  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  const replaceView = (view: ViewTypeParam): void =>
    history.replace(`/resources/${params.resourceId}/${view}/${params.now}`);
  const replaceNow = (now: string): void =>
    history.replace(`/resources/${params.resourceId}/${params.view}/${now}`);
  const customButtons: Record<string, CustomButtonInput> = {
    customPrev: {
      icon: 'chevron-left',
      click: () => {
        if (calendar.current) {
          const api = calendar.current.getApi();
          api.prev();

          const date = new Date(api.getDate());
          const lastWeek = format(date, 'yyyy-MM-dd');

          replaceNow(lastWeek);
        }
      },
    },
    customNext: {
      icon: 'chevron-right',
      click: () => {
        if (calendar.current) {
          const api = calendar.current.getApi();
          api.next();

          const date = new Date(api.getDate());
          const nextWeek = format(date, 'yyyy-MM-dd');

          replaceNow(nextWeek);
        }
      },
    },
    customToday: {
      text: 'Heute',
      click: () => {
        const now = format(new Date(), 'yyyy-MM-dd');

        if (calendar.current) {
          calendar.current.getApi().today();
        }

        replaceNow(now);
      },
    },
    customMonth: {
      text: 'Monat',
      click: () => {
        if (calendar.current) {
          calendar.current.getApi().changeView('dayGridMonth');
        }
        replaceView('month');
      },
    },
    customWeek: {
      text: 'Woche',
      click: () => {
        if (calendar.current) {
          calendar.current.getApi().changeView('timeGridWeek');
        }
        replaceView('week');
      },
    },
    customDay: {
      text: 'Tag',
      click: () => {
        if (calendar.current) {
          calendar.current.getApi().changeView('timeGridDay');
        }
        replaceView('day');
      },
    },
  };
  const headerToolbar: ToolbarInput = {
    left: 'customPrev,customNext customToday',
    center: 'title',
    right: 'customMonth,customWeek,customDay',
  };
  const handleClick = (args: EventClickArg) => {
    const searchParams = new URLSearchParams(search);

    searchParams.append('resourceId', params.resourceId);
    history.push(`/events/${args.event.id}?${searchParams}`);
  };
  const handleSelect = (args: DateSelectArg) => {
    const start = args.start.toISOString();
    const endDateTime = args.end;

    if (args.allDay) {
      endDateTime.setTime(endDateTime.getTime() - 1000);
    }

    const end = endDateTime.toISOString();

    setDateSelection({
      allDay: args.allDay,
      start,
      end,
    });
  };
  const handleUnselect = () => setDateSelection(undefined);
  const handleReservation = (): void => {
    history.push(
      `/resources/${params.resourceId}/create?${search}`,
      dateSelection
    );
  };

  return (
    <Layout>
      <FullCalendar
        ref={calendar as RefObject<FullCalendar>}
        locale={locale}
        timeZone={timeZone}
        plugins={plugins}
        customButtons={customButtons}
        headerToolbar={headerToolbar}
        eventSources={[eventSource]}
        initialView={currentViewType}
        selectable={currentViewType !== 'dayGridMonth'}
        eventClick={handleClick}
        select={handleSelect}
        unselect={handleUnselect}
        unselectAuto={false}
        initialDate={nowProp}
      />
      <ActionButton
        onClick={handleReservation}
        iconProps={actionButtonIcon}
        disabled={typeof dateSelection === 'undefined'}
      >
        Reservieren
      </ActionButton>
    </Layout>
  );
};
