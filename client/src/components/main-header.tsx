import type { FC } from 'react';
import { Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import { mergeStyles } from '@fluentui/merge-styles';
import { Icon, NeutralColors } from '@fluentui/react';

import { useResourceList } from '../hooks/use-resource-list';
import { LogoutButton } from './logout-button';

const headerStyles = mergeStyles({
  marginBottom: '32px',
  borderBottom: `1px solid ${NeutralColors.gray90}`,
});

const iconStyles = mergeStyles({
  marginLeft: '4px',
  fontSize: '20px',
});

export const MainHeader: FC = () => {
  const resourceList = useResourceList();

  return (
    <Stack
      horizontal={true}
      verticalAlign="center"
      horizontalAlign="space-between"
      tokens={{ padding: '16px 0' }}
      className={headerStyles}
    >
      <Stack
        horizontal={true}
        horizontalAlign="start"
        tokens={{ childrenGap: '0 32px' }}
      >
        <Stack.Item>
          <Link to="/">
            <Icon iconName="Home" className={iconStyles} />
          </Link>
        </Stack.Item>
        {resourceList.map(({ id, name }) => (
          <Stack.Item key={id}>
            <Link to={`/resources/${id}`}>{name}</Link>
          </Stack.Item>
        ))}
      </Stack>
      <Stack horizontal={true} horizontalAlign="end">
        <LogoutButton />
      </Stack>
    </Stack>
  );
};
