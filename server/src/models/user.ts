import { Op } from 'sequelize';
import type { Model, ModelCtor, Optional, Transaction } from 'sequelize';
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

const roles = ['user', 'admin'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUserCreationData = (r: any): r is UserCreationAttributes =>
  Array.isArray((typeof r.id).match(/^(string|undefined)$/)) &&
  roles.includes(r.role) &&
  typeof r.email === 'string' &&
  typeof r.firstName === 'string' &&
  typeof r.lastName === 'string' &&
  Array.isArray((typeof r.password).match(/^(string|undefined)$/)) &&
  Array.isArray((typeof r.passwordReset).match(/^(string|undefined)$/)) &&
  typeof r.unitId === 'string';

export const scaffoldUsers = async (
  User: ModelCtor<UserInstance>,
  data: unknown,
  transaction: Transaction
): Promise<void> => {
  if (Array.isArray(data)) {
    await Promise.all(
      data
        .filter((r) => isUserCreationData(r))
        .map(async (user) =>
          User.findOrCreate({
            where: {
              id: { [Op.eq]: user.id },
            },
            defaults: user,
            transaction,
          })
        )
    );
  }
};
