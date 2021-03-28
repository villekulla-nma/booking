export const inquireConfirmation = (message?: string): boolean => {
  return window.confirm(message);
};
