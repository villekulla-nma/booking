import type { FC } from 'react';
import FullCalendar from '@fullcalendar/react';
import type { EventInput, EventClickArg } from '@fullcalendar/react';
import locale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useHistory } from 'react-router-dom';

export const ResourcePage: FC = () => {
  const history = useHistory();
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

  return (
    <FullCalendar
      locale={locale}
      plugins={plugins}
      headerToolbar={headerToolbar}
      initialEvents={[event]}
      initialView="dayGridMonth"
      selectable={true}
      eventClick={handleClick}
    />
  );
};
