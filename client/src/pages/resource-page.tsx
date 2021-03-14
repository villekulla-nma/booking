import { useState, useRef } from 'react';
import type { FC, RefObject, SyntheticEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
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

import { createEvent } from '../api';

interface SelectionRange {
  start: string;
  end: string;
  allDay: boolean;
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ResourcePage: FC = () => {
  const history = useHistory();
  const params = useParams<{ resourceId: string }>();
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
  const handleClick = (args: EventClickArg) => {
    // TODO: pass on month/week/day to make the back-link useful
    history.push(`/resources/${params.resourceId}/events/${args.event.id}`);
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

    const form = event.currentTarget;
    const { start, end, allDay } = dateSelection;

    createEvent(
      start,
      end,
      description,
      allDay,
      params.resourceId,
      // TODO: use real user ID
      'urCGzt46j'
    ).then(() => form.reset());
  };
  const handleFormReset = () => {
    if (calendar.current) {
      calendar.current.getApi().unselect();
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
        initialView="dayGridMonth"
        selectable={true}
        eventClick={handleClick}
        select={handleSelect}
        unselect={handleUnselect}
        unselectAuto={false}
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
