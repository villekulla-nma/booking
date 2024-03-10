import type { Model, Optional } from 'sequelize';
import type { UnitAttributes } from '@booking/types';

type UnitCreationAttributes = Optional<UnitAttributes, 'id'>;

export interface UnitInstance
  extends Model<UnitAttributes, UnitCreationAttributes>,
    UnitAttributes {}
