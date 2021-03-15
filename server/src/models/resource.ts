import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { ResourceAttributes } from '@villekulla-reservations/types';

interface ResourceCreationAttributes
  extends Optional<ResourceAttributes, 'id'> {}

export interface ResourceInstance
  extends Model<ResourceAttributes, ResourceCreationAttributes>,
    ResourceAttributes {}

type Schema = ModelAttributes<ResourceInstance, ResourceAttributes>;

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

const isResourceData = (r: any): r is ResourceAttributes =>
  typeof r.id === 'string' && typeof r.name === 'string';

export const scaffoldResources = async (
  Resource: ModelCtor<ResourceInstance>,
  data: unknown
): Promise<void> => {
  if (Array.isArray(data)) {
    await Resource.bulkCreate(
      data
        .filter((r) => isResourceData(r))
        .map(({ id, name }) => ({ id, name }))
    );
  }
};

export const createResourceInstance = (
  sequelize: Sequelize
): ModelCtor<ResourceInstance> =>
  sequelize.define<ResourceInstance>('Resource', schema, {
    timestamps: false,
    createdAt: false,
  });
