import { useState, useRef } from 'react';
import type { FC, RefObject, SyntheticEvent } from 'react';
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
import { Link, useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import type { ViewTypeOption, ViewTypeParam } from '../types';
import { DEFAULT_VIEW_OPTION } from '../constants';
import { createEvent } from '../api';

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
  const [description, setDescription] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const eventSource = useRef<EventSourceInput>();
  const search = new URLSearchParams({
    view: params.view,
    now: params.now,
  }).toString();

  eventSource.current = {
    url: `/api/resources/${params.resourceId}/events`,
    timeZoneParam: timeZone,
  };

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
  const handleClick = (args: EventClickArg) =>
    history.push(
      `/resources/${params.resourceId}/events/${args.event.id}?${search}`
    );
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
  const handleUnselect = () => {
    setDateSelection(undefined);
    setDescription('');
  };
  const handleDecriptionChange = (event: SyntheticEvent<HTMLTextAreaElement>) =>
    setDescription(event.currentTarget.value);
  const handleFormSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dateSelection) {
      return;
    }

    const { start, end, allDay } = dateSelection;
    const form = event.currentTarget;

    createEvent(start, end, description.trim(), allDay, params.resourceId).then(
      (status) => {
        switch (status) {
          case 'ok':
            setDescription('');
            form.reset();
            break;
          case 'overlapping':
            setFeedback(
              'Die Buchung überschneidet sich mit einer existierenden Buchung.'
            );
            break;
          case 'invalid':
            setFeedback('Eine oder mehrere Angaben sind ungültig.');
            break;
          case 'error':
            setFeedback(
              'Beim speichern der Buchung ist ein Fehler aufgetreten.'
            );
            break;
          default:
            ((_: never) => undefined)(status);
        }
      }
    );
  };
  const handleFormReset = () => {
    if (calendar.current) {
      calendar.current.getApi().unselect();
    }
    setFeedback('');
  };

  return (
    <>
      <Link to="/">Startseite</Link>
      <hr />
      <FullCalendar
        ref={calendar as RefObject<FullCalendar>}
        locale={locale}
        timeZone={timeZone}
        plugins={plugins}
        customButtons={customButtons}
        headerToolbar={headerToolbar}
        eventSources={[eventSource.current]}
        initialView={currentViewType}
        selectable={currentViewType !== 'dayGridMonth'}
        eventClick={handleClick}
        select={handleSelect}
        unselect={handleUnselect}
        unselectAuto={false}
        initialDate={nowProp}
      />
      {dateSelection && (
        <form
          method="post"
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
        >
          {feedback === '' || <p>{feedback}</p>}
          <dl>
            <dt>Start</dt>
            <dd>{dateSelection.start}</dd>
            <dt>End</dt>
            <dd>{dateSelection.end}</dd>
          </dl>
          <label htmlFor="description">Beschreibung</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onInput={handleDecriptionChange}
          />
          <button type="reset">Abbrechen</button>
          <button>Speichern</button>
        </form>
      )}
    </>
  );
};
