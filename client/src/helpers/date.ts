import { roundToNearestMinutes } from 'date-fns';

export const FORMAT_DATE = 'd. MMMM y';

export const FORMAT_DATE_TIME = `H:mm, ${FORMAT_DATE}`;

export const FORMAT_DATE_TIME_ALT = `${FORMAT_DATE}, H:mm`;

export const createRoundedDateString = (): string => {
  const date = roundToNearestMinutes(new Date(), { nearestTo: 30 });
  const utc = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );

  return utc.toISOString();
};

export const denormalizeCalendarDate = (date: string): Date => {
  return new Date(date.replace(/\.000z$/i, ''));
};

export const getDateTimeToday = (): Date => {
  const d = new Date();

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
