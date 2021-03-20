import { useState, useRef } from 'react';
import type { FC, RefObject, SyntheticEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import type {
  DateSelectArg,
  DatesSetArg,
  EventSourceInput,
  EventClickArg,
} from '@fullcalendar/react';
import locale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useHistory, useParams, useLocation } from 'react-router-dom';

import { createEvent } from '../api';

interface SelectionRange {
  start: string;
  end: string;
  allDay: boolean;
}

type ViewTypeOption = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
type ViewTypeParam = 'day' | 'week' | 'month';

const DEFAULT_VIEW_TYPE: ViewTypeOption = 'timeGridWeek';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getViewTypeOption = (view: string | null): ViewTypeOption => {
  switch (view) {
    case 'day':
      return 'timeGridDay';
    case 'month':
      return 'dayGridMonth';
    case 'week':
    default:
      return DEFAULT_VIEW_TYPE;
  }
};

const getViewTypeParam = (view: string): ViewTypeParam | never => {
  switch (view) {
    case 'timeGridDay':
      return 'day';
    case 'dayGridMonth':
      return 'month';
    case 'timeGridWeek':
      return 'week';
    default:
      throw new Error(`Unknown view type option "${view}".`);
  }
};

const pad = (n: number): string => {
  const s = String(n);
  return s.length === 2 ? s : `0${n}`;
};

const getNowFromDate = (d: Date): string => {
  const now = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return now;
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params = useParams<{ resourceId: string }>();
  const currentViewType = getViewTypeOption(searchParams.get('view'));
  const nowProp = getNowFromString(searchParams.get('now'));
  const calendar = useRef<FullCalendar>();
  const [dateSelection, setDateSelection] = useState<SelectionRange>();
  const [description, setDescription] = useState<string>('');
  const eventSource = useRef<EventSourceInput>();

  eventSource.current = {
    url: `/api/resources/${params.resourceId}/events`,
    timeZoneParam: timeZone,
  };

  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  };
  const handleClick = (args: EventClickArg) =>
    history.push(
      `/resources/${params.resourceId}/events/${args.event.id}${location.search}`
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

    createEvent(
      start,
      end,
      description.trim(),
      allDay,
      params.resourceId
    ).then(() => setDescription(''));
  };
  const handleFormReset = () => {
    if (calendar.current) {
      calendar.current.getApi().unselect();
    }
  };
  const updateUrlSearchParam = (event: DatesSetArg) => {
    if (calendar.current) {
      const { currentDate: date } = calendar.current.getApi().getCurrentData();
      const view = getViewTypeParam(event.view.type);
      const now = getNowFromDate(date);

      history.replace(`${location.pathname}?view=${view}&now=${now}`);
    }
  };

  return (
    <>
      <FullCalendar
        ref={calendar as RefObject<FullCalendar>}
        locale={locale}
        timeZone={timeZone}
        plugins={plugins}
        headerToolbar={headerToolbar}
        eventSources={[eventSource.current]}
        initialView={currentViewType}
        selectable={currentViewType !== 'dayGridMonth'}
        eventClick={handleClick}
        select={handleSelect}
        unselect={handleUnselect}
        unselectAuto={false}
        datesSet={updateUrlSearchParam}
        now={nowProp}
      />
      {dateSelection && (
        <form
          method="post"
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
        >
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
            onInput={handleDecriptionChange}
          />
          <button type="reset">Abbrechen</button>
          <button>Speichern</button>
        </form>
      )}
    </>
  );
};
