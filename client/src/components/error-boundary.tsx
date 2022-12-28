import type { FC, PropsWithChildren } from 'react';
import { ErrorBoundary as ErrorBoundaryComp } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { Text, Link as A, Stack } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { Layout } from './layout';

const tokens: IStackTokens = {
  childrenGap: '16px',
};

const mailTo = (errorMessage?: string, errorStack?: string): string => {
  const { innerWidth: width, innerHeight: height } = window;
  const subject = encodeURIComponent('Fehler im Buchungstool');
  const hint =
    '-- Nicht löschen!! -----------------------------------------------------------------';
  const body = [
    '=> Beschreibe, welche Aktionen zum Fehler geführt haben. Je ausführlicher, desto besser! <=',
    '',
    '',
    `⌄⌄⌄${hint}⌄⌄⌄`,
    errorMessage ? `\n${errorMessage}` : null,
    errorStack ? `\n${errorStack}` : null,
    '',
    `=> Fensterbreite: ${width}px`,
    `=> Fensterhöhe: ${height}px`,
    `=> Maschine: ${navigator.userAgent}`,
    '',
    `^^^${hint}^^^`,
  ]
    .filter((x: string | null): x is string => typeof x === 'string')
    .map((s) => encodeURIComponent(s))
    .join('%0A');

  return `mailto:?subject=${subject}&body=${body}`;
};

const Fallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const history = useHistory();
  const resetErrorAndNavigateToStartPage = () => {
    resetErrorBoundary();
    history.replace('/');
  };

  return (
    <Layout onHomeClick={resetErrorAndNavigateToStartPage}>
      <Stack tokens={tokens}>
        <Text as="h1" variant="xLargePlus">
          Da ist wohl etwas schief gelaufen &hellip;
        </Text>
        <Text variant="large">
          Wenn das öfter auftritt,{' '}
          <A href={mailTo(error?.message, error?.stack)}>
            wende dich bitte an den Webmaster
          </A>
          .
        </Text>
        <Text variant="large">
          <A onClick={resetErrorAndNavigateToStartPage}>Zur Startseite</A>
        </Text>
      </Stack>
    </Layout>
  );
};

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundaryComp FallbackComponent={Fallback}>
      {children}
    </ErrorBoundaryComp>
  );
};
