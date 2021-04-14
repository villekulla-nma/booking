import type { FC } from 'react';
import { DatePicker as FluentUiDatePicker, DayOfWeek } from '@fluentui/react';
import type { IDatePickerStrings, IDateFormatting } from '@fluentui/react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { FORMAT_DATE } from '../helpers/date';

interface Props {
  label: string;
  minDate: Date;
  value: Date;
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
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ],
  shortDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],

  goToToday: 'Heute',
  prevMonthAriaLabel: 'vorheriger Monat',
  nextMonthAriaLabel: 'nächster Monat',
  prevYearAriaLabel: 'Vorheriges Jahr',
  nextYearAriaLabel: 'Nächstes Jahr',
  closeButtonAriaLabel: 'Schließen',
  monthPickerHeaderAriaLabel: '{0}, wählen um das Jahr zu ändern',
  yearPickerHeaderAriaLabel: '{0}, wählen um den Monat zu ändern',
};

const dateTimeFormatter: IDateFormatting = {
  formatMonthDayYear: (date) =>
    format(date, FORMAT_DATE, {
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
  date ? format(date, `eeeeee, ${FORMAT_DATE}`, { locale: de }) : '';

export const DatePicker: FC<Props> = ({
  label,
  minDate,
  value,
  onSelectDate,
}) => {
  return (
    <FluentUiDatePicker
      firstDayOfWeek={DayOfWeek.Monday}
      strings={datePickerStrings}
      minDate={minDate}
      label={label}
      placeholder="Wähle ein Datum aus…"
      value={value}
      onSelectDate={onSelectDate}
      dateTimeFormatter={dateTimeFormatter}
      formatDate={formatDate}
    />
  );
};
