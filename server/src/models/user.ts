import { DataTypes, Op } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
  Transaction,
} from 'sequelize';
import type { UserAttributes } from '@booking/types';

export type UserCreationAttributes = Optional<
  Optional<UserAttributes, 'id'>,
  'fullName'
>;

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

type Schema = ModelAttributes<UserInstance, UserAttributes>;

const roles = ['user', 'admin'];

const schema: Schema = {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM(...roles),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  passwordReset: {
    type: DataTypes.STRING,
    unique: true,
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set() {
      throw new Error('Do not try to set the `fullName` value!');
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUserCreationData = (r: any): r is UserCreationAttributes =>
  Array.isArray((typeof r.id).match(/^(string|undefined)$/)) &&
  roles.includes(r.role) &&
  typeof r.email === 'string' &&
  typeof r.firstName === 'string' &&
  typeof r.lastName === 'string' &&
  Array.isArray((typeof r.password).match(/^(string|undefined)$/)) &&
  Array.isArray((typeof r.passwordReset).match(/^(string|undefined)$/)) &&
  typeof r.groupId === 'string';

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

export const createUserInstance = (
  sequelize: Sequelize
): ModelCtor<UserInstance> =>
  sequelize.define<UserInstance>('User', schema, {
    timestamps: false,
    createdAt: false,
  });
