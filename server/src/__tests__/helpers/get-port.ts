import { basename } from 'path';

export const getPort = (filename: string): string => {
  const { PORT } = process.env;
  const port = Number(PORT);

  if (Number.isNaN(PORT)) {
    throw new Error('PORT not defined');
  }

  const baseFilename = basename(filename);
  const [countString] = baseFilename.split('-');
  const count = Number(countString);

  if (Number.isNaN(count)) {
    throw new Error(
      `Could not extract test file count from filename ${baseFilename}`
    );
  }

  return String(port + count * 10);
};
