import type { FC } from 'react';
import { Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import { mergeStyles } from '@fluentui/merge-styles';
import { Icon, NeutralColors, Link as A } from '@fluentui/react';

import { useResourceList } from '../hooks/use-resource-list';
import { LogoutButton } from './logout-button';
import { MainNav } from './main-nav';

const header = mergeStyles({
  marginBottom: '32px',
  borderBottom: `1px solid ${NeutralColors.gray90}`,
});

const icon = mergeStyles({
  margin: '4px 4px 0 0',
  fontSize: '24px',
});

export const MainHeader: FC = () => {
  const resources = useResourceList();

  return (
    <Stack
      horizontal={true}
      verticalAlign="center"
      horizontalAlign="space-between"
      tokens={{ padding: '16px 0' }}
      className={header}
    >
      <Stack
        horizontal={true}
        horizontalAlign="start"
        verticalAlign="center"
        tokens={{ childrenGap: '0 32px' }}
      >
        <Stack.Item>
          <A as={Link} to="/">
            <Icon iconName="Home" className={icon} />
          </A>
        </Stack.Item>
        <MainNav resources={resources} />
      </Stack>
      <Stack horizontal={true} horizontalAlign="end">
        <LogoutButton />
      </Stack>
    </Stack>
  );
};
