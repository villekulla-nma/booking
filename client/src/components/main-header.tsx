import type { FC } from 'react';
import { Stack } from '@fluentui/react';
import { NavLink, Link } from 'react-router-dom';
import { mergeStyles } from '@fluentui/merge-styles';
import { Icon, NeutralColors } from '@fluentui/react';
import { SharedColors } from '@fluentui/theme';

import { useResourceList } from '../hooks/use-resource-list';
import { LogoutButton } from './logout-button';

const header = mergeStyles({
  marginBottom: '32px',
  borderBottom: `1px solid ${NeutralColors.gray90}`,
});

const linkStyles = {
  color: SharedColors.cyanBlue10,
};

const iconHighlighted = {
  color: NeutralColors.gray160,
};

const icon = mergeStyles({
  ...linkStyles,
  marginLeft: '4px',
  fontSize: '20px',
  ':hover': iconHighlighted,
  ':focus': iconHighlighted,
});

const linkHighlighted = {
  backgroundColor: NeutralColors.gray20,
};

const link = mergeStyles({
  ...linkStyles,
  padding: '8px 16px',
  textDecoration: 'none',
  userSelect: 'none',
  ':hover': linkHighlighted,
  ':focus': linkHighlighted,
});

const linkActive = mergeStyles(linkHighlighted);

export const MainHeader: FC = () => {
  const resourceList = useResourceList();

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
        tokens={{ childrenGap: '0 32px' }}
      >
        <Stack.Item>
          <Link to="/">
            <Icon iconName="Home" className={icon} />
          </Link>
        </Stack.Item>
        {resourceList.map(({ id, name }) => (
          <Stack.Item key={id}>
            <NavLink
              className={link}
              activeClassName={linkActive}
              to={`/resources/${id}`}
            >
              {name}
            </NavLink>
          </Stack.Item>
        ))}
      </Stack>
      <Stack horizontal={true} horizontalAlign="end">
        <LogoutButton />
      </Stack>
    </Stack>
  );
};
