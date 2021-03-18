export const env = (name: string, silent = false): string => {
  const variable = process.env[name];

  if (!variable && !silent) {
    throw new Error(`Env var "${name}" is not set.`);
  }

  return variable;
};
