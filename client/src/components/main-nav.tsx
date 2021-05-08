import type { FC } from 'react';
import { useState, memo } from 'react';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import {
  Stack,
  NeutralColors,
  Link as A,
  IconButton,
  Panel,
  Nav,
} from '@fluentui/react';
import type { IIconProps, IButtonStyles, INavLink } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import classNames from 'classnames';

import { useMediaQuery } from '../hooks/use-media-query';
import { MQ_IS_DESKTOP } from '../constants';
import type { ResourceAttributes } from '@booking/types';

interface Props {
  resources: ResourceAttributes[];
}

interface ResourceId {
  resourceId: string;
}

const link = mergeStyles({
  padding: '6px 14px',
  userSelect: 'none',
});

const linkActive = mergeStyles({
  backgroundColor: NeutralColors.gray20,
});

const navButtonStyles: IButtonStyles = {
  icon: {
    fontSize: '24px',
  },
};

const nav = mergeStyles({
  marginTop: '32px',
});

const iconProps: IIconProps = { iconName: 'GlobalNavButton' };

const MobileNav: FC<Props & ResourceId> = memo(({ resources, resourceId }) => {
  const history = useHistory();
  const [open, setOpen] = useState<boolean>(false);

  if (resources.length === 0) {
    return null;
  }

  const openPanel = () => setOpen(true);
  const closePanel = () => setOpen(false);
  const links = resources.map(
    ({ id, name }): INavLink => {
      const handleClick: INavLink['onClick'] = (event, item) => {
        event?.preventDefault();
        history.push(item?.url || '');
      };

      return {
        onClick: handleClick,
        url: `/resources/${id}`,
        key: id,
        name,
      };
    }
  );

  return (
    <>
      <Stack.Item>
        <IconButton
          iconProps={iconProps}
          styles={navButtonStyles}
          title="Menü einblenden"
          onClick={openPanel}
        />
      </Stack.Item>
      <Panel isLightDismiss={true} isOpen={open} onDismiss={closePanel}>
        <Nav groups={[{ links }]} className={nav} selectedKey={resourceId} />
      </Panel>
    </>
  );
});

export const MainNav: FC<Props> = memo(({ resources }) => {
  const isDesktop = useMediaQuery(MQ_IS_DESKTOP);
  const match = useRouteMatch<ResourceId>({
    path: '/resources/:resourceId',
  });

  return isDesktop ? (
    <>
      {resources.map(({ id, name }) => {
        const cssClass = classNames(link, {
          [linkActive]: match?.params.resourceId === id,
        });

        return (
          <Stack.Item key={id}>
            <A as={Link} className={cssClass} to={`/resources/${id}`}>
              {name}
            </A>
          </Stack.Item>
        );
      })}
    </>
  ) : (
    <MobileNav
      resources={resources}
      resourceId={match?.params.resourceId || ''}
    />
  );
});
