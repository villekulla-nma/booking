import type { Scope } from 'nock';

import { sleep } from './sleep';

export const scopeIsDone = async (
  scope: Scope,
  timeout = 200
): Promise<boolean> => {
  const increment = 50;
  let count = 0;

  do {
    await sleep(increment);

    if (scope.isDone()) {
      return true;
    }

    count += increment;
  } while (timeout >= count);

  return false;
};
