export const getToday = (): string => {
  const date = new Date();
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  );

  return utc.toISOString();
};

export const getFauxUTCDate = (d: Date | string = new Date()): Date => {
  d = typeof d === 'string' ? new Date(d) : d;

  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    )
  );
};

/** Compensate the two-hour offset of the faux UTC dates... */
export const format = (d: string | Date, format?: 'date' | 'time') => {
  d = typeof d === 'string' ? new Date(d) : d;
  const [date, time] = d.toISOString().split(/[T.]/);
  const [year, month, day] = date.split('-');
  const niceDate = [day, month, year].join('.');
  const niceTime = time.split(':').slice(0, 2).join(':') + ' Uhr';

  switch (format) {
    case 'date':
      return niceDate;
    case 'time':
      return niceTime;
    default:
      return `${niceDate}, ${niceTime}`;
  }
};

export const isToday = (d: Date) => {
  const today = getFauxUTCDate();

  return format(d, 'date') === format(today, 'date');
};
