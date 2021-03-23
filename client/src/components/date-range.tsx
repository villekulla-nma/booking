import type { FC } from 'react';
import { Stack, Text, NeutralColors } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { denormalizeCalendarDate } from '../helpers/date';

interface Props {
  start: string;
  end: string;
  allDay?: boolean;
}

const FORMAT_DATE = 'd. MMMM y';

const allDayHint = mergeStyles({
  marginLeft: '8px',
  color: NeutralColors.gray130,
});

const listItemTokens: IStackTokens = {
  padding: '4px 0',
};

const definitionTerm = mergeStyles({
  flex: '0 1 15%',
  color: NeutralColors.gray140,
});

const formatDate = (date: string) =>
  format(denormalizeCalendarDate(date), FORMAT_DATE, { locale: de });

const formatDateTime = (date: string) =>
  format(denormalizeCalendarDate(date), `H:mm, ${FORMAT_DATE}`, {
    locale: de,
  });

export const DateRange: FC<Props> = ({ start, end, allDay }) => {
  if (allDay) {
    return (
      <Text variant="medium">
        {formatDate(start)}
        <em className={allDayHint}>(ganztägig)</em>
      </Text>
    );
  }

  return (
    <dl>
      <Stack horizontal={true} tokens={listItemTokens}>
        <Text variant="medium" as="dt" className={definitionTerm}>
          Beginn
        </Text>
        <Text variant="medium" as="dd">
          {formatDateTime(start)}
        </Text>
      </Stack>
      <Stack horizontal={true} tokens={listItemTokens}>
        <Text variant="medium" as="dt" className={definitionTerm}>
          Ende
        </Text>
        <Text variant="medium" as="dd">
          {formatDateTime(end)}
        </Text>
      </Stack>
    </dl>
  );
};
