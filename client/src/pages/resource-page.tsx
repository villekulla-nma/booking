import { useState, useRef } from 'react';
import type { FC, RefObject } from 'react';
import FullCalendar from '@fullcalendar/react';
import type {
  DateSelectArg,
  EventInput,
  EventClickArg,
} from '@fullcalendar/react';
import locale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useHistory } from 'react-router-dom';

interface SelectionRange {
  start: string;
  end: string;
}

export const ResourcePage: FC = () => {
  const history = useHistory();
  const calendar = useRef<FullCalendar>();
  const [dateSelection, setDateSelection] = useState<SelectionRange>();

  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  };
  const day = new Date().toISOString().split('T').shift();
  const event: EventInput = {
    id: '1',
    title: 'Termin',
    start: `${day}T12:00:00`,
    end: `${day}T14:00:00`,
  };
  const handleClick = (args: EventClickArg) => {
    console.log('Clicked...', args);
    history.push(`/events/${args.event.id}`);
  };
  const handleSelect = (args: DateSelectArg) => {
    const { start, end } = args;

    if (args.allDay) {
      end.setTime(end.getTime() - 1000);
    }

    setDateSelection({
      start: start.toLocaleString(),
      end: end.toLocaleString(),
    });
  };
  const handleUnselect = () => setDateSelection(undefined);
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
        timeZone="local"
        plugins={plugins}
        headerToolbar={headerToolbar}
        initialEvents={[event]}
        initialView="dayGridMonth"
        selectable={true}
        eventClick={handleClick}
        select={handleSelect}
        unselect={handleUnselect}
        unselectAuto={false}
      />
      {dateSelection && (
        <form method="post" onReset={handleFormReset}>
          <dl>
            <dt>Start</dt>
            <dd>{dateSelection.start}</dd>
            <dt>End</dt>
            <dd>{dateSelection.end}</dd>
          </dl>
          <label htmlFor="description">Beschreibung</label>
          <textarea name="description" id="description" />
          <button type="reset">Abbrechen</button>
          <button>Speichern</button>
        </form>
      )}
    </>
  );
};
