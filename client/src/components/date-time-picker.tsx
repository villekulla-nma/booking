import type { FC } from 'react';
import { useRef, useState } from 'react';
import { Dropdown, Stack, memoizeFunction } from '@fluentui/react';
import type {
  IDropdownOption,
  ISelectableOption,
  IStackTokens,
} from '@fluentui/react';
import { format, eachHourOfInterval } from 'date-fns';

import { getDateTimeToday } from '../helpers/date';
import { DatePicker } from './date-picker';

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

const getDateStringFromValue = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

const getTimeStringFromValue = (date: Date): string => format(date, 'HH:mm');

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
        minDate={today.current}
        label={label}
        value={value}
        onSelectDate={handleDateChange}
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
