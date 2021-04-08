import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Prompt, useLocation, useParams, useHistory } from 'react-router-dom';
import { addMinutes } from 'date-fns';
import { TextField, MessageBarType } from '@fluentui/react';

import { Layout } from '../components/layout';
import {
  createRoundedDateString,
  denormalizeCalendarDate,
} from '../helpers/date';
import { createEvent } from '../api';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { DateTimePicker } from '../components/date-time-picker';

interface Params {
  resourceId: string;
}

interface LocationState {
  start?: string;
  end?: string;
  allDay?: boolean;
}

const getStateValues = (state: LocationState = {}): Required<LocationState> => {
  const start = state.start || createRoundedDateString();
  const end = state.end || addMinutes(new Date(start), 30).toISOString();
  const allDay = state.allDay ?? false;

  return { start, end, allDay };
};

const getBackUrl = (resourceId: string, search: URLSearchParams): string => {
  const viewParam = search.get('view') ? `/${search.get('view')}` : '';
  const nowParam = search.get('now') ? `/${search.get('now')}` : '';

  return `/resources/${resourceId}${viewParam}${nowParam}`;
};

export const ReservationPage: FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { start: startString, end: endString, allDay } = getStateValues(
    location.state
  );
  const [start, setStart] = useState<string>(startString);
  const [end, setEnd] = useState<string>(endString);
  const params = useParams<Params>();
  const search = new URLSearchParams(location.search);

  const handleStartChange = (dateTime: string): void => setStart(dateTime);
  const handleEndChange = (dateTime: string): void => setEnd(dateTime);
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

    createEvent(start, end, description.trim(), allDay, params.resourceId).then(
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
          default:
            ((_: never) => undefined)(status);
        }
      }
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
          value={denormalizeCalendarDate(start)}
          hideTime={allDay}
          onChange={handleStartChange}
          id="start"
        />
        <DateTimePicker
          label="Ende"
          value={denormalizeCalendarDate(end)}
          hideTime={allDay}
          onChange={handleEndChange}
          id="end"
        />
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
