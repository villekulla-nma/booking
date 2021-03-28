export const redirect = (destination: string): void => {
  window.location.href = destination;
};

export const reload = (): void => {
  window.location.reload();
};
