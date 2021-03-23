import type { FC } from 'react';
import type { IStackTokens } from '@fluentui/react';
import { Stack, Text, NeutralColors } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { SharedColors, FluentTheme } from '@fluentui/theme';
import { Link, useHistory } from 'react-router-dom';
// TODO: use @fluentui/merge-styles#mergeCss instead
import classNames from 'classnames';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { UserEvent } from '../api';

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

const listItemTokens: IStackTokens = {
  padding: '4px 0',
};

const definitionTerm = mergeStyles({
  flex: '0 1 15%',
  color: NeutralColors.gray140,
});

const descriptionText = mergeStyles({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const formatDate = (date: string) =>
  format(new Date(date), 'd. MMMM y, H:mm', { locale: de });

export const EventTile: FC<UserEvent & Props> = ({
  id,
  resource,
  start,
  end,
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
      <dl>
        <Stack horizontal={true} tokens={listItemTokens}>
          <dt className={definitionTerm}>Start</dt>
          <dd>{formatDate(start)}</dd>
        </Stack>
        <Stack horizontal={true} tokens={listItemTokens}>
          <dt className={definitionTerm}>Ende</dt>
          <dd>{formatDate(end)}</dd>
        </Stack>
      </dl>
      <Text variant="medium" className={descriptionText}>
        {description || '—'}
      </Text>
    </Stack>
  );
};
