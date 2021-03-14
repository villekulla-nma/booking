import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
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
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.first_name} ${this.last_name}`;
    },
    set(_) {
      throw new Error('Do not try to set the `fullName` value!');
    },
  },
};

const isUserData = (r: any): r is UserAttributes =>
  typeof r.id === 'string' &&
  typeof r.first_name === 'string' &&
  typeof r.last_name === 'string' &&
  typeof r.groupId === 'string';

export const scaffoldUsers = async (
  User: ModelCtor<UserInstance>,
  data: unknown
): Promise<void> => {
  if (Array.isArray(data)) {
    await User.bulkCreate(
      data
        .filter((r) => isUserData(r))
        .map(({ id, first_name, last_name, groupId }) => ({
          id,
          first_name,
          last_name,
          groupId,
        }))
    );
  }
};

export const createUserInstance = (db: Sequelize): ModelCtor<UserInstance> =>
  db.define<UserInstance>('User', schema, {
    timestamps: false,
    createdAt: false,
  });
