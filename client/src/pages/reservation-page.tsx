import type { FC, FormEvent } from 'react';
import { useState, useRef } from 'react';
import { Prompt, useLocation, useParams, useHistory } from 'react-router-dom';
import { addMinutes, format } from 'date-fns';
import { TextField, MessageBarType, Checkbox } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { Layout } from '../components/layout';
import {
  getDateTimeToday,
  createRoundedDateString,
  normalizeCalendarDate,
  denormalizeCalendarDate,
} from '../helpers/date';
import { createEvent } from '../api';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { DateTimePicker } from '../components/date-time-picker';
import { useRedirectUnauthenticatedUser } from '../hooks/use-redirect-unauthenticated-user';

interface Params {
  resourceId: string;
}

interface LocationState {
  start?: string;
  end?: string;
  allDay?: boolean;
}

interface DateTime {
  date: string;
  time: string;
}

interface InitalValues {
  start: DateTime;
  end: DateTime;
  allDay: boolean;
}

const checkbox = mergeStyles({
  margin: '16px 0 8px 0',
});

const getStateValues = (state: LocationState = {}): InitalValues => {
  const start = denormalizeCalendarDate(
    state.start || createRoundedDateString()
  );
  const startDateTime = {
    date: format(start, 'yyyy-MM-dd'),
    time: format(start, 'HH:mm'),
  };
  const end = denormalizeCalendarDate(
    state.end || normalizeCalendarDate(addMinutes(start, 30))
  );
  const endDateTime = {
    date: format(end, 'yyyy-MM-dd'),
    time: format(end, 'HH:mm'),
  };
  const allDay = state.allDay ?? false;

  return { start: startDateTime, end: endDateTime, allDay };
};

const getBackUrl = (resourceId: string, search: URLSearchParams): string => {
  const viewParam = search.get('view') ? `/${search.get('view')}` : '';
  const nowParam = search.get('now') ? `/${search.get('now')}` : '';

  return `/resources/${resourceId}${viewParam}${nowParam}`;
};

// TODO: update end-date on change of start-date to always be after start-date
export const ReservationPage: FC = () => {
  const redirect = useRedirectUnauthenticatedUser();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {
    start: initialStart,
    end: initialEnd,
    allDay: initialAllDay,
  } = getStateValues(location.state);
  const [start, setStart] = useState<DateTime>(initialStart);
  const [end, setEnd] = useState<DateTime>(initialEnd);
  const [allDay, setAllDay] = useState<boolean>(initialAllDay);
  const today = useRef<Date>(getDateTimeToday());
  const params = useParams<Params>();
  const search = new URLSearchParams(location.search);

  const handleStartDateTimeChange = (date: string, time: string): void =>
    setStart({ date, time });
  const handleEndDateTimeChange = (date: string, time: string): void =>
    setEnd({ date, time });
  const handleAllDayChange = (_: unknown, checked: boolean | undefined): void =>
    setAllDay(typeof checked === 'boolean' ? checked : !allDay);
  const handleDecriptionChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setDescription(event.currentTarget.value);
  };
  const handleReset = (): void => {
    history.push(getBackUrl(params.resourceId, search));
  };
  const handleSubmit = () => {
    setSubmitted(true);

    const startTime = allDay ? '00:00' : start.time;
    const endTime = allDay ? '00:00' : end.time;

    createEvent(
      `${start.date}T${startTime}:00.000Z`,
      `${end.date}T${endTime}:00.000Z`,
      description.trim(),
      allDay,
      params.resourceId
    ).then(
      (status) => {
        switch (status) {
          case 'ok':
            history.push(getBackUrl(params.resourceId, search));
            break;
          case 'overlapping':
            setFeedback(
              'Die Buchung überschneidet sich mit einer existierenden Buchung.'
            );
            setSubmitted(false);
            break;
          case 'invalid':
            setFeedback('Eine oder mehrere Angaben sind ungültig.');
            setSubmitted(false);
            break;
          case 'error':
            setFeedback(
              'Beim speichern der Buchung ist ein Fehler aufgetreten.'
            );
            setSubmitted(false);
            break;
          case 'unverified':
            throw new Error('Unexpected response status "unverified".');
          default:
            ((_: never) => undefined)(status);
        }
      },
      (error) =>
        redirect(error, () =>
          alert('Das Event konnte leider nicht erstellt werden.')
        )
    );
  };

  return (
    <Layout>
      <Prompt
        when={description.trim() !== '' && submitted === false}
        message="Buchungsvorgang wirklich abbrechen"
      />
      <Form
        onReset={handleReset}
        onSubmit={handleSubmit}
        label="Reservieren"
        buttonLabel="Speichern"
      >
        {feedback === '' || (
          <Feedback type={MessageBarType.error}>{feedback}</Feedback>
        )}
        <DateTimePicker
          label="Beginn"
          value={start}
          minDate={today.current}
          hideTime={allDay}
          onChange={handleStartDateTimeChange}
          id="start"
        />
        <DateTimePicker
          label="Ende"
          value={end}
          minDate={today.current}
          hideTime={allDay}
          onChange={handleEndDateTimeChange}
          id="end"
        />
        <div>
          <Checkbox
            label="ganztägig"
            className={checkbox}
            onChange={handleAllDayChange}
          />
        </div>
        <TextField
          as="textarea"
          label="Beschreibung"
          name="description"
          id="description"
          value={description}
          onChange={handleDecriptionChange}
          multiline={true}
          autoAdjustHeight={true}
          autoFocus={true}
        />
      </Form>
    </Layout>
  );
};
