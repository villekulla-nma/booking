import { DataTypes, Op } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
  Transaction,
} from 'sequelize';
import type { UserAttributes } from '@villekulla-reservations/types';

interface UserCreationAttributes
  extends Optional<Optional<UserAttributes, 'id'>, 'fullName'> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

type Schema = ModelAttributes<UserInstance, UserAttributes>;

const schema: Schema = {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    unique: true,
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
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(_) {
      throw new Error('Do not try to set the `fullName` value!');
    },
  },
};

const isUserCreationData = (r: any): r is UserCreationAttributes =>
  Array.isArray((typeof r.id).match(/^(string|undefined)$/)) &&
  typeof r.email === 'string' &&
  typeof r.firstName === 'string' &&
  typeof r.lastName === 'string' &&
  Array.isArray((typeof r.password).match(/^(string|undefined)$/)) &&
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
