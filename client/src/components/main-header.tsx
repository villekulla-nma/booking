import type { FC } from 'react';
import { Stack } from '@fluentui/react';
import { Link } from 'react-router-dom';
import { mergeStyles } from '@fluentui/merge-styles';
import { Icon, NeutralColors, Link as A } from '@fluentui/react';

import { useResourceList } from '../hooks/use-resource-list';
import { LogoutButton } from './logout-button';
import { MainNav } from './main-nav';
import { MQ_IS_DESKTOP } from '../constants';

interface Props {
  onHomeClick?: () => void;
}

const header = mergeStyles({
  marginBottom: '16px',
  borderBottom: `1px solid ${NeutralColors.gray90}`,
  [`@media${MQ_IS_DESKTOP}`]: {
    marginBottom: '32px',
  },
});

const home = mergeStyles({
  userSelect: 'none',
});

const icon = mergeStyles({
  margin: '4px 4px 0 0',
  fontSize: '24px',
});

export const MainHeader: FC<Props> = ({ onHomeClick }) => {
  const resources = useResourceList();
  const homeLinkAs = typeof onHomeClick === 'function' ? undefined : Link;
  const homeLinkTo = typeof onHomeClick === 'function' ? undefined : '/';
  const homeLinkOnClick =
    typeof onHomeClick === 'function' ? onHomeClick : undefined;

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
          <A
            as={homeLinkAs}
            to={homeLinkTo}
            onClick={homeLinkOnClick}
            className={home}
          >
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
