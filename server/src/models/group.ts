import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';

export interface GroupAttributes {
  id: string;
  name: string;
}

interface GroupCreationAttributes extends Optional<GroupAttributes, 'id'> {}

export interface GroupInstance
  extends Model<GroupAttributes, GroupCreationAttributes>,
    GroupAttributes {}

type Schema = ModelAttributes<GroupInstance, GroupAttributes>;

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
};

const isGroupData = (r: any): r is GroupAttributes =>
  typeof r.id === 'string' && typeof r.name === 'string';

export const scaffoldGroups = async (
  Group: ModelCtor<GroupInstance>,
  data: unknown
): Promise<void> => {
  if (Array.isArray(data)) {
    await Group.bulkCreate(
      data.filter((r) => isGroupData(r)).map(({ id, name }) => ({ id, name }))
    );
  }
};

export const createGroupInstance = (db: Sequelize): ModelCtor<GroupInstance> =>
  db.define<GroupInstance>('Group', schema, {
    timestamps: false,
    createdAt: false,
  });
