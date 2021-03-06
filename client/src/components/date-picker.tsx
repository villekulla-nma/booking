import type { FC } from 'react';
import { memo } from 'react';
import { DatePicker as FluentUiDatePicker, DayOfWeek } from '@fluentui/react';
import type {
  IDatePickerStrings,
  IDatePickerStyles,
  IDateFormatting,
} from '@fluentui/react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { FORMAT_DATE_NICE } from '../helpers/date';

interface Props {
  label: string;
  value: Date;
  required?: boolean;
  disabled?: boolean;
  onSelectDate: (date: Date | null | undefined) => void;
}

const datePickerStrings: IDatePickerStrings = {
  months: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  shortMonths: [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ],

  days: [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ],
  shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],

  goToToday: 'Heute',
  prevMonthAriaLabel: 'vorheriger Monat',
  nextMonthAriaLabel: 'nächster Monat',
  prevYearAriaLabel: 'Vorheriges Jahr',
  nextYearAriaLabel: 'Nächstes Jahr',
  closeButtonAriaLabel: 'Schließen',
  monthPickerHeaderAriaLabel: '{0}, wählen um das Jahr zu ändern',
  yearPickerHeaderAriaLabel: '{0}, wählen um den Monat zu ändern',
};

const styles: Pick<IDatePickerStyles, 'statusMessage' | 'readOnlyTextField'> = {
  statusMessage: {
    '&:empty': {
      display: 'none',
    },
  },
  readOnlyTextField: {
    // Boost specificity...
    '&[class]': {
      paddingRight: '32px',
    },
  },
};

const dateTimeFormatter: IDateFormatting = {
  formatMonthDayYear: (date) =>
    format(date, FORMAT_DATE_NICE, {
      locale: de,
    }),
  formatMonthYear: (date) =>
    format(date, 'MMMM y', {
      locale: de,
    }),
  formatYear: (date) => format(date, 'y', { locale: de }),
  formatMonth: (date) => format(date, 'MMMM', { locale: de }),
  formatDay: (date) => format(date, 'd'),
};

const formatDate = (date?: Date): string =>
  date ? format(date, `eeeeee, ${FORMAT_DATE_NICE}`, { locale: de }) : '';

export const DatePicker: FC<Props> = memo(
  ({ label, value, disabled, onSelectDate }) => {
    return (
      <FluentUiDatePicker
        firstDayOfWeek={DayOfWeek.Monday}
        strings={datePickerStrings}
        label={label}
        placeholder="Wähle ein Datum aus…"
        value={value}
        onSelectDate={onSelectDate}
        dateTimeFormatter={dateTimeFormatter}
        formatDate={formatDate}
        isRequired={true}
        styles={styles}
        disabled={disabled}
      />
    );
  }
);
