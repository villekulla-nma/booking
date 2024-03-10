import type {
  DataTypes,
  ModelAttributeColumnOptions,
  Model,
  ModelCtor,
  Optional,
  Sequelize,
  ModelAttributes,
} from 'sequelize';
import type { UnitAttributes } from '@booking/types';

type UnitCreationAttributes = Optional<UnitAttributes, 'id'>;

interface UnitInstance
  extends Model<UnitAttributes, UnitCreationAttributes>,
    UnitAttributes {}

const getSchema: (DataTypes: DataTypes) => ModelAttributes;
const getColumnColor: (DataTypes: DataTypes) => ModelAttributeColumnOptions;

declare const createUnit: (
  sequelize: Sequelize,
  DataTypes: DataTypes
) => ModelCtor<UnitInstance>;

export { getSchema, getColumnColor, createUnit };
