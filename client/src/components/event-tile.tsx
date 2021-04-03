import type { FC } from 'react';
import type { IStackTokens } from '@fluentui/react';
import { Stack, Text, NeutralColors } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { SharedColors, FluentTheme } from '@fluentui/theme';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';

import type { UserEvent } from '../api';
import { DateRange } from './date-range';

interface Props {
  className?: string;
}

const wrap = mergeStyles({
  padding: '12px',
  marginBottom: '16px',
  backgroundColor: FluentTheme.palette.themeLighterAlt,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: NeutralColors.gray20,
  },
});

const wrapTokens: IStackTokens = {
  childrenGap: '8px',
};

const link = mergeStyles({
  color: SharedColors.cyanBlue20,
  textDecoration: 'none',
});

const descriptionText = mergeStyles({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const EventTile: FC<UserEvent & Props> = ({
  id,
  resource,
  start,
  end,
  allDay,
  description,
  className,
}) => {
  const history = useHistory();
  const eventUrl = `/events/${id}`;
  const handleClick = () => history.push(eventUrl);

  return (
    <Stack
      tokens={wrapTokens}
      className={classNames(wrap, className)}
      onClick={handleClick}
    >
      <Text variant="large">
        <Link to={eventUrl} className={link}>
          {resource}
        </Link>
      </Text>
      <DateRange start={start} end={end} allDay={allDay} />
      <Text variant="medium" className={descriptionText}>
        {description || '—'}
      </Text>
    </Stack>
  );
};
