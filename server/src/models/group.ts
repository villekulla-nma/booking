import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { GroupAttributes } from '@villekulla-reservations/types';

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

export const createGroupInstance = (
  sequelize: Sequelize
): ModelCtor<GroupInstance> =>
  sequelize.define<GroupInstance>('Group', schema, {
    timestamps: false,
    createdAt: false,
  });
