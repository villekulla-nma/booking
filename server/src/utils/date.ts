export const getToday = (): string => {
  const date = new Date();
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  );

  return utc.toISOString();
};

export const getNow = (): string => {
  const date = new Date();
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
