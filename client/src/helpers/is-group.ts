/* eslint @typescript-eslint/no-explicit-any: off, @typescript-eslint/explicit-module-boundary-types: off */

import type { GroupAttributes } from '@booking/types';

export const isGroup = (group: any): group is GroupAttributes => {
  return (
    typeof group === 'object' &&
    group !== null &&
    typeof group.id === 'string' &&
    typeof group.name === 'string'
  );
};
