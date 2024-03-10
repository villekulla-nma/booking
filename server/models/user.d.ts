import type {
  DataTypes,
  Model,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { UserAttributes } from '@booking/types';

import type { UnitInstance } from './user';

type UserCreationAttributes = Optional<
  Optional<UserAttributes, 'id'>,
  'fullName'
>;

interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  unit?: UnitInstance;
}

const getSchema: (DataTypes: DataTypes) => ModelAttributes;

declare const createUser: (
  sequelize: Sequelize,
  DataTypes: DataTypes
) => ModelCtor<UserInstance>;

export { getSchema, createUser };
