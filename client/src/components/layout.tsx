import type { FC } from 'react';
import { Stack } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { MainHeader } from './main-header';

const styles = mergeStyles({
  minHeight: '100vh',
  maxWidth: '760px',
  margin: '0 auto',
});

export const Layout: FC = ({ children }) => (
  <Stack as="main" className={styles}>
    <MainHeader />
    {children}
  </Stack>
);
