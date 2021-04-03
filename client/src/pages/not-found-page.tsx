import type { FC } from 'react';
import { Text, Link as A } from '@fluentui/react';
import { Redirect, useLocation, Link } from 'react-router-dom';

import { Layout } from '../components/layout';

export const NotFoundPage: FC = () => {
  const location = useLocation();

  if (location.pathname.endsWith('/')) {
    return (
      <Redirect
        from={location.pathname}
        to={location.pathname.replace(/\/+$/, '')}
      />
    );
  }

  return (
    <Layout>
      <Text as="h1" variant="xLargePlus">
        Hier gibt es leider nichts.
      </Text>
      <Text variant="large">
        <A as={Link} to="/">
          Zur Startseite
        </A>
      </Text>
    </Layout>
  );
};
