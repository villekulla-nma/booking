import { Op } from 'sequelize';
import type { Model, ModelCtor, Optional, Transaction } from 'sequelize';
import type { UnitAttributes } from '@booking/types';

type UnitCreationAttributes = Optional<UnitAttributes, 'id'>;

export interface UnitInstance
  extends Model<UnitAttributes, UnitCreationAttributes>,
    UnitAttributes {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUnitData = (r: any): r is UnitAttributes =>
  typeof r.id === 'string' &&
  typeof r.name === 'string' &&
  typeof r.color === 'string';

export const scaffoldUnits = async (
  Unit: ModelCtor<UnitInstance>,
  data: unknown,
  transaction: Transaction
): Promise<void> => {
  if (Array.isArray(data)) {
    await Promise.all(
      data
        .filter((r) => isUnitData(r))
        .map((unit) =>
          Unit.findOrCreate({
            where: {
              id: { [Op.eq]: unit.id },
            },
            defaults: unit,
            transaction,
          })
        )
    );
  }
};
