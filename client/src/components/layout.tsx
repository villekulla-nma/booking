import type { FC } from 'react';
import { Stack, NeutralColors, Text, Link } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { MainHeader } from './main-header';

interface Props {
  onHomeClick?: () => void;
}

const styles = mergeStyles({
  minHeight: '100vh',
  maxWidth: '860px',
  margin: '0 16px',
  '@media (min-width: 892px)': {
    margin: '0 auto',
  },
});

const footerTokens: IStackTokens = {
  childrenGap: '8px',
  padding: '16px 0',
};

const footer = mergeStyles({
  marginTop: '32px',
  borderTop: `1px solid ${NeutralColors.gray90}`,
  fontSize: '14px',
});

export const Layout: FC<Props> = ({ children, onHomeClick }) => (
  <Stack className={styles}>
    <MainHeader onHomeClick={onHomeClick} />
    <Stack as="main" grow={1}>
      {children}
    </Stack>
    <Stack.Item>
      <Stack
        as="footer"
        horizontal={true}
        tokens={footerTokens}
        className={footer}
      >
        <Text variant="medium">{new Date().getFullYear()}</Text>
        <Text variant="medium">&middot;</Text>
        <Text variant="medium">Emanuel Kluge</Text>
        <Text variant="medium">&middot;</Text>
        <Text variant="medium">
          <Link
            href="https://github.com/herschel666/villekulla-reservations"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </Link>
        </Text>
      </Stack>
    </Stack.Item>
  </Stack>
);
