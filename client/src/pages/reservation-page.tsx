import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { addMinutes, format, differenceInDays, addDays } from 'date-fns';
import {
  TextField,
  MessageBarType,
  Checkbox,
  Dropdown,
  Stack,
} from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { Layout } from '../components/layout';
import {
  FORMAT_DATE,
  createRoundedDateString,
  normalizeCalendarDate,
  denormalizeCalendarDate,
  getDateStringFromValue,
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

const MAX_INTERVAL_IN_DAYS = 7;

const durationDropdownValues: Array<IDropdownOption> = Array.from(
  { length: MAX_INTERVAL_IN_DAYS },
  (_, i) => ({
    key: i + 1,
    text: `${i + 1} ${i === 0 ? 'Tag' : 'Tage'}`,
  })
);

const checkbox = mergeStyles({
  margin: '16px 0 8px 0',
});

const dropdownStyles = mergeStyles({
  minWidth: '100px',
});

const getDurationInDays = (start: string, end: string): number => {
  const startDate = denormalizeCalendarDate(start);
  const endDate = denormalizeCalendarDate(end);
  const difference = differenceInDays(endDate, startDate);

  return difference;
};

const getStateValues = (state: LocationState = {}): InitalValues => {
  const start = denormalizeCalendarDate(
    state.start || createRoundedDateString()
  );
  const startDateTime = {
    date: format(start, FORMAT_DATE),
    time: format(start, 'HH:mm'),
  };
  const end = denormalizeCalendarDate(
    state.end || normalizeCalendarDate(addMinutes(start, 30))
  );
  const endDateTime = {
    date: format(end, FORMAT_DATE),
    time: format(end, 'HH:mm'),
  };
  const allDay = state.allDay ?? false;

  if (
    getDurationInDays(startDateTime.date, endDateTime.date) >
    MAX_INTERVAL_IN_DAYS
  ) {
    endDateTime.date = format(
      addDays(start, MAX_INTERVAL_IN_DAYS),
      FORMAT_DATE
    );
  }

  return { start: startDateTime, end: endDateTime, allDay };
};

const getBackUrl = (resourceId: string, search: URLSearchParams): string => {
  const viewParam = search.get('view') ? `/${search.get('view')}` : '';
  const nowParam = search.get('now') ? `/${search.get('now')}` : '';

  return `/resources/${resourceId}${viewParam}${nowParam}`;
};

const dateTimeToISOString = (d: DateTime, allDay: boolean): string => {
  const time = allDay ? '00:00' : d.time;

  return `${d.date}T${time}:00.000Z`;
};

export const ReservationPage: FC = () => {
  const redirect = useRedirectUnauthenticatedUser();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const navigate = useNavigate();
  // TODO: use generic parameter as soon as this is possible again
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const {
    start: initialStart,
    end: initialEnd,
    allDay: initialAllDay,
  } = getStateValues(location.state);
  const [start, setStart] = useState<DateTime>(initialStart);
  const [end, setEnd] = useState<DateTime>(initialEnd);
  const [duration, setDuration] = useState<number>(() =>
    getDurationInDays(start.date, end.date)
  );
  const [allDay, setAllDay] = useState<boolean>(initialAllDay);
  // TODO: use generic parameter as soon as this is possible again
  const params = useParams() as Params;
  const search = new URLSearchParams(location.search);

  const handleStartDateTimeChange = (date: string, time: string): void =>
    setStart({ date, time });
  const handleEndDateTimeChange = (date: string, time: string): void =>
    setEnd({ date, time });
  const handleDurationChange = (_: unknown, option?: IDropdownOption) => {
    const newDuration = Number(option?.key) ?? 0;
    const endDate = addDays(new Date(start.date), newDuration);

    setDuration(newDuration);
    setEnd({
      date: getDateStringFromValue(endDate),
      time: end.time,
    });
  };
  const handleAllDayChange = (_: unknown, checked: boolean | undefined): void =>
    setAllDay(typeof checked === 'boolean' ? checked : !allDay);
  const handleDecriptionChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setDescription(event.currentTarget.value);
  };
  const handleReset = (): void => {
    navigate(getBackUrl(params.resourceId, search));
  };
  const handleSubmit = () => {
    setSubmitted(true);

    createEvent(
      dateTimeToISOString(start, allDay),
      dateTimeToISOString(end, allDay),
      description.trim(),
      allDay,
      params.resourceId
    ).then(
      (status) => {
        switch (status) {
          case 'ok':
            navigate(getBackUrl(params.resourceId, search));
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
      {/* TODO: bring back as soon as React-Router has a Prompt again */}
      {/* <Prompt
        when={description.trim() !== '' && submitted === false}
        message="Buchungsvorgang wirklich abbrechen"
      /> */}
      <Form
        onReset={handleReset}
        onSubmit={handleSubmit}
        label="Reservieren"
        loading={submitted}
        buttonLabel="Speichern"
      >
        {feedback === '' || (
          <Feedback type={MessageBarType.error}>{feedback}</Feedback>
        )}
        <DateTimePicker
          label="Beginn"
          value={start}
          hideTime={allDay}
          onChange={handleStartDateTimeChange}
          required={true}
          disabled={submitted}
          id="start"
        />
        {allDay === false && (
          <DateTimePicker
            label="Ende"
            value={end}
            onChange={handleEndDateTimeChange}
            disabled={submitted}
            id="end"
          />
        )}
        {allDay === true && (
          <Stack horizontal={true} verticalAlign="end" data-testid="duration">
            <Dropdown
              label="Dauer"
              selectedKey={duration}
              options={durationDropdownValues}
              onChange={handleDurationChange}
              disabled={submitted}
              className={dropdownStyles}
              id="duration"
            />
          </Stack>
        )}
        <div>
          <Checkbox
            label="ganztägig"
            className={checkbox}
            onChange={handleAllDayChange}
            checked={allDay}
            disabled={submitted}
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
          disabled={submitted}
        />
      </Form>
    </Layout>
  );
};
