import type { FC } from 'react';
import { useRef, useState } from 'react';
import {
  DatePicker,
  DayOfWeek,
  Dropdown,
  Stack,
  memoizeFunction,
} from '@fluentui/react';
import type {
  IDatePickerStrings,
  IDateFormatting,
  IDropdownOption,
  ISelectableOption,
  IStackTokens,
} from '@fluentui/react';
import { format, eachHourOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

import { getDateTimeToday, FORMAT_DATE } from '../helpers/date';

interface Props {
  label: string;
  value: Date;
  hideTime?: boolean;
  id?: string;
  onChange: (dateTime: string) => void;
}

const tokens: IStackTokens = {
  childrenGap: '16px',
};

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

const getHoursOfDay = memoizeFunction((start: Date): Date[] => {
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 1
  );
  end.setTime(end.getTime() - 1000);

  return eachHourOfInterval({ start, end });
});

const getTimePickerOptions = memoizeFunction(
  (hoursOfDay: Date[], selectedValue: string): ISelectableOption[] =>
    hoursOfDay
      .map((d) => {
        const time = format(d, 'HH:mm');

        return {
          text: `${time} Uhr`,
          key: time,
          id: time,
          selected: time === selectedValue,
        };
      })
      .reduce(
        (
          options: [ISelectableOption, ISelectableOption][],
          option: ISelectableOption,
          index: number
        ) => {
          const between = option.id?.replace(':00', ':30') || '';
          const betweenOption: ISelectableOption = {
            text: `${between} Uhr`,
            key: between,
            id: between,
            selected: between === selectedValue,
          };

          options[index] = [option, betweenOption];
          return options;
        },
        []
      )
      .flat()
);

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

const getDateStringFromValue = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

const getTimeStringFromValue = (date: Date): string => format(date, 'HH:mm');

const formatDate = (date?: Date): string =>
  date ? format(date, `eeeeee, ${FORMAT_DATE}`, { locale: de }) : '';

export const DateTimePicker: FC<Props> = ({
  label,
  value,
  hideTime,
  id,
  onChange,
}) => {
  const [date, setDate] = useState<string>(getDateStringFromValue(value));
  const [time, setTime] = useState<string>(getTimeStringFromValue(value));
  const today = useRef<Date>(getDateTimeToday());
  const handleDateChange = (d: Date | null | undefined): void => {
    const newDate = d instanceof Date ? getDateStringFromValue(d) : date;
    setDate(newDate);
    onChange(`${newDate}T${time}:00.000Z`);
  };
  const handleTimeChange = (_: unknown, option?: IDropdownOption): void => {
    const newTime = option?.id || time;
    setTime(newTime);
    onChange(`${date}T${newTime}:00.000Z`);
  };

  return (
    <Stack
      horizontal={true}
      verticalAlign="end"
      tokens={tokens}
      data-testid={id}
    >
      <DatePicker
        firstDayOfWeek={DayOfWeek.Monday}
        strings={datePickerStrings}
        minDate={today.current}
        label={label}
        placeholder="Wähle ein Datum aus…"
        value={value}
        onSelectDate={handleDateChange}
        dateTimeFormatter={dateTimeFormatter}
        formatDate={formatDate}
      />
      {Boolean(hideTime) === false && (
        <Dropdown
          placeholder="Wähle eine Uhrzeit aus…"
          ariaLabel={`${label} (Uhrzeit)`}
          options={getTimePickerOptions(getHoursOfDay(today.current), time)}
          onChange={handleTimeChange}
        />
      )}
    </Stack>
  );
};
