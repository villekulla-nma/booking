import type { FC } from 'react';
import { memo } from 'react';
import { Stack, Text, NeutralColors } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import classNames from 'classnames';

import {
  denormalizeCalendarDate,
  FORMAT_DATE_TIME,
  FORMAT_DATE,
} from '../helpers/date';

interface Props {
  start: string;
  end: string;
  allDay?: boolean;
}

const allDayHint = mergeStyles({
  marginLeft: '8px',
  color: NeutralColors.gray130,
});

const listItemTokens: IStackTokens = {
  padding: '4px 0',
};

const dateDisplay = mergeStyles({
  margin: '16px 0',
});

const definitionTerm = mergeStyles({
  maxWidth: '120px',
  flex: '0 1 20%',
  color: NeutralColors.gray180,
});

const firstDefinitionTerm = mergeStyles({
  paddingBottom: '8px',
  borderBottom: `1px solid ${NeutralColors.gray50}`,
});

const definitionValue = mergeStyles({
  paddingLeft: '8px',
  color: NeutralColors.gray130,
});

const formatDate = (date: string) =>
  format(denormalizeCalendarDate(date), FORMAT_DATE, { locale: de });

const formatDateTime = (date: string) =>
  format(denormalizeCalendarDate(date), FORMAT_DATE_TIME, {
    locale: de,
  });

export const DateRange: FC<Props> = memo(({ start, end }) => {
  const difference = differenceInDays(new Date(end), new Date(start));
  const formatFn = difference === 0 ? formatDateTime : formatDate;

  if (difference === 1) {
    return (
      <Text variant="medium" className={dateDisplay}>
        {formatFn(start)}
        <em className={allDayHint}>(ganztägig)</em>
      </Text>
    );
  }

  return (
    <dl className={dateDisplay}>
      <Stack horizontal={true} tokens={listItemTokens}>
        <Text
          variant="medium"
          as="dt"
          className={classNames(definitionTerm, firstDefinitionTerm)}
        >
          Beginn
        </Text>
        <Text variant="medium" as="dd" className={definitionValue}>
          {formatFn(start)}
        </Text>
      </Stack>
      <Stack horizontal={true} tokens={listItemTokens}>
        <Text variant="medium" as="dt" className={definitionTerm}>
          Ende
        </Text>
        <Text variant="medium" as="dd" className={definitionValue}>
          {formatFn(end)}
        </Text>
      </Stack>
    </dl>
  );
});
