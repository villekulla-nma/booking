import { sleep } from './sleep';

export const waitFor = async (
  predicate: () => boolean,
  maxTimeInMilliseconds: number
): Promise<void> => {
  const delay = 20;

  for (let i = 0; i * delay <= maxTimeInMilliseconds; i += 1) {
    if (!predicate()) {
      await sleep(delay);
    }
  }
};
