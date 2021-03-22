import type { FC } from 'react';
import { Stack, Text } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { Layout } from '../components/layout';
import { useUserEvents } from '../hooks/use-user-events';
import { EventTile } from '../components/event-tile';

const heading = mergeStyles({
  marginBottom: '32px',
});

const text = mergeStyles({
  fontStyle: 'italic',
});

const tile = mergeStyles({
  width: 'calc(50% - 32px)',
});

export const StartPage: FC = () => {
  const upcomingEvents = useUserEvents(10);

  return (
    <Layout>
      <Text variant="xLarge" className={heading}>
        Anstehende Buchungen
      </Text>
      {(() => {
        switch (true) {
          case typeof upcomingEvents === 'undefined':
            return (
              <Text variant="medium" className={text}>
                Lade Buchungen&hellip;
              </Text>
            );
          case upcomingEvents?.length === 0:
            return (
              <Text variant="medium" className={text}>
                Es stehen keine Buchungen an.
              </Text>
            );
          default:
            return (
              <Stack horizontal={true} wrap={true} gap={32}>
                {upcomingEvents?.map((event) => (
                  <EventTile className={tile} key={event.id} {...event} />
                ))}
              </Stack>
            );
        }
      })()}
    </Layout>
  );
};
