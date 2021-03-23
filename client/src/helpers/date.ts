import { roundToNearestMinutes } from 'date-fns';

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
