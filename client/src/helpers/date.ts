import {
  roundToNearestMinutes,
  format,
  parseISO,
  parse,
  isBefore,
  addDays,
  subDays,
} from 'date-fns';

export const FORMAT_DATE = 'yyyy-MM-dd';

export const FORMAT_DATE_NICE = 'd. MMMM y';

export const FORMAT_DATE_TIME = `H:mm, ${FORMAT_DATE_NICE}`;

export const FORMAT_DATE_TIME_ALT = `${FORMAT_DATE_NICE}, H:mm`;

export const denormalizeCalendarDate = (date: string): Date => {
  return parseISO(date.replace(/\.000z$/i, ''));
};

export const normalizeCalendarDate = (dateTime: Date): string => {
  const date = format(dateTime, FORMAT_DATE);
  const time = format(dateTime, 'HH:mm:ss');

  return `${date}T${time}.000Z`;
};

export const createRoundedDateString = (): string => {
  const date = roundToNearestMinutes(new Date(), { nearestTo: 30 });

  return normalizeCalendarDate(date);
};

export const getDateTimeToday = (): Date => {
  const [date] = new Date().toISOString().split('T');

  return parseISO(`${date}T00:00:00`);
};

export const ensureMinimumDateIntervalFromStart = (
  startString: string,
  endString: string,
  interval = 1
): string => {
  const today = new Date();
  const start = parse(startString, FORMAT_DATE, today);
  const end = parse(endString, FORMAT_DATE, today);

  if (isBefore(start, end)) {
    return endString;
  }

  let increasedEndDate = addDays(start, interval);

  if (isBefore(increasedEndDate, today)) {
    increasedEndDate = today;
  }

  return format(increasedEndDate, FORMAT_DATE);
};

export const ensureMinimumDateIntervalFromEnd = (
  startString: string,
  endString: string,
  interval = 1
): string => {
  const today = new Date();
  const start = parse(startString, FORMAT_DATE, today);
  const end = parse(endString, FORMAT_DATE, today);

  if (isBefore(start, end)) {
    return startString;
  }

  let decreasedStartDate = subDays(end, interval);

  if (isBefore(decreasedStartDate, today)) {
    decreasedStartDate = today;
  }

  return format(decreasedStartDate, FORMAT_DATE);
};
