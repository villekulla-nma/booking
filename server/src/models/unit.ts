import { DataTypes, Op } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
  Transaction,
} from 'sequelize';
import type { UnitAttributes } from '@booking/types';

import { DEFAULT_UNIT_COLOR, RE_COLOR } from '../constants';

type UnitCreationAttributes = Optional<UnitAttributes, 'id'>;

export interface UnitInstance
  extends Model<UnitAttributes, UnitCreationAttributes>,
    UnitAttributes {}

type Schema = ModelAttributes<UnitInstance, UnitAttributes>;

const schema: Schema = {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: DEFAULT_UNIT_COLOR,
    validate: {
      is: RE_COLOR,
    },
  },
};

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

export const createUnitInstance = (
  sequelize: Sequelize
): ModelCtor<UnitInstance> =>
  sequelize.define<UnitInstance>('Unit', schema, {
    timestamps: false,
    createdAt: false,
  });
