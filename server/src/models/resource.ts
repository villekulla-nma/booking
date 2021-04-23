import { DataTypes, Op } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
  Transaction,
} from 'sequelize';
import type { ResourceAttributes } from '@booking/types';

type ResourceCreationAttributes = Optional<ResourceAttributes, 'id'>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isResourceData = (r: any): r is ResourceAttributes =>
  typeof r.id === 'string' && typeof r.name === 'string';

export const scaffoldResources = async (
  Resource: ModelCtor<ResourceInstance>,
  data: unknown,
  transaction: Transaction
): Promise<void> => {
  if (Array.isArray(data)) {
    await Promise.all(
      data
        .filter((r) => isResourceData(r))
        .map((resource) =>
          Resource.findOrCreate({
            where: {
              id: { [Op.eq]: resource.id },
            },
            defaults: resource,
            transaction,
          })
        )
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
