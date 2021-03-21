import type { FC, SyntheticEvent } from 'react';
import { useState } from 'react';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { addMinutes } from 'date-fns';

import { Layout } from '../components/layout';
import { createRoundedDateString } from '../helpers/date';
import { createEvent } from '../api';

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
  const [feedback, setFeedback] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { start, end, allDay } = getStateValues(location.state);
  const params = useParams<Params>();
  const search = new URLSearchParams(location.search);

  const handleDecriptionChange = (
    event: SyntheticEvent<HTMLTextAreaElement>
  ): void => {
    setDescription(event.currentTarget.value);
  };
  const handleReset = (): void => {
    history.push(getBackUrl(params.resourceId, search));
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    createEvent(start, end, description.trim(), allDay, params.resourceId).then(
      (status) => {
        switch (status) {
          case 'ok':
            setDescription('');
            form.reset();
            history.push(getBackUrl(params.resourceId, search));
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

  return (
    <Layout>
      <form method="post" onReset={handleReset} onSubmit={handleSubmit}>
        {feedback === '' || <p>{feedback}</p>}
        <dl>
          {/* TODO: add datepicker inputs */}
          <dt>Start</dt>
          <dd>{start}</dd>
          <dt>End</dt>
          <dd>{end}</dd>
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
    </Layout>
  );
};
