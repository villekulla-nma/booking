import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { useResourceList } from '../hooks/use-resource-list';
import { useUserEvents } from '../hooks/use-user-events';

export const StartPage: FC = () => {
  const resourceList = useResourceList();
  const upcomingEvents = useUserEvents(3);

  return (
    <>
      {resourceList.length > 0 && (
        <ul>
          {resourceList.map(({ id, name }) => (
            <li key={id}>
              <Link to={`/resources/${id}`}>{name}</Link>
            </li>
          ))}
        </ul>
      )}
      <hr />
      {(() => {
        switch (true) {
          case typeof upcomingEvents === 'undefined':
            return <p>Lade Buchungen&hellip;</p>;
          case upcomingEvents?.length === 0:
            return <p>Es stehen keine Buchungen an.</p>;
          default:
            return upcomingEvents?.map(
              ({ id, start, end, description, resource }) => (
                <dl key={id}>
                  <dt>Ressource</dt>
                  <dd>{resource}</dd>
                  <dt>Start</dt>
                  <dd>{start}</dd>
                  <dt>Ende</dt>
                  <dd>{end}</dd>
                  <dt>Beschreibung</dt>
                  <dd>{description || '—'}</dd>
                </dl>
              )
            );
        }
      })()}
    </>
  );
};
