import type { FC } from 'react';
import { memo } from 'react';
import { Dropdown, Stack, memoizeFunction } from '@fluentui/react';
import type {
  IDropdownOption,
  ISelectableOption,
  IStackTokens,
} from '@fluentui/react';
import { format, parse, eachHourOfInterval } from 'date-fns';

import { FORMAT_DATE } from '../helpers/date';
import { DatePicker } from './date-picker';

interface Props {
  label: string;
  value: { date: string; time: string };
  minDate: Date;
  hideTime?: boolean;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (date: string, time: string) => void;
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
  format(date, FORMAT_DATE);

export const DateTimePicker: FC<Props> = memo(
  ({ label, value, minDate, hideTime, id, disabled, onChange }) => {
    const handleDateChange = (d: Date | null | undefined): void => {
      const newDate =
        d instanceof Date ? getDateStringFromValue(d) : value.date;
      onChange(newDate, value.time);
    };
    const handleTimeChange = (_: unknown, option?: IDropdownOption): void => {
      const newTime = option?.id || value.time;
      onChange(value.date, newTime);
    };

    return (
      <Stack
        horizontal={true}
        verticalAlign="end"
        tokens={tokens}
        data-testid={id}
      >
        <DatePicker
          minDate={minDate}
          label={label}
          value={parse(value.date, FORMAT_DATE, new Date())}
          onSelectDate={handleDateChange}
          required={true}
          disabled={disabled}
        />
        {Boolean(hideTime) === false && (
          <Dropdown
            placeholder="Wähle eine Uhrzeit aus…"
            ariaLabel={`${label} (Uhrzeit)`}
            options={getTimePickerOptions(getHoursOfDay(minDate), value.time)}
            onChange={handleTimeChange}
            required={true}
            disabled={disabled}
          />
        )}
      </Stack>
    );
  }
);
