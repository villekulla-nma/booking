import type { Model, Optional } from 'sequelize';
import type { UserAttributes } from '@booking/types';

import type { UnitInstance } from './unit';

export type UserCreationAttributes = Optional<
  Optional<UserAttributes, 'id'>,
  'fullName'
>;

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  unit?: UnitInstance;
}
