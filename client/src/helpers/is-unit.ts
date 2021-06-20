/* eslint @typescript-eslint/no-explicit-any: off, @typescript-eslint/explicit-module-boundary-types: off */

import type { UnitAttributes } from '@booking/types';

export const isUnit = (unit: any): unit is UnitAttributes => {
  return (
    typeof unit === 'object' &&
    unit !== null &&
    typeof unit.id === 'string' &&
    typeof unit.name === 'string' &&
    typeof unit.color === 'string'
  );
};
