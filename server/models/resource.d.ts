import type {
  DataTypes,
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { ResourceAttributes } from '@booking/types';

type ResourceCreationAttributes = Optional<ResourceAttributes, 'id'>;

interface ResourceInstance
  extends Model<ResourceAttributes, ResourceCreationAttributes>,
    ResourceAttributes {}

const getSchema: (DataTypes: DataTypes) => ModelAttributes;

const createResource: (
  sequelize: Sequelize,
  DataTypes: DataTypes
) => ModelCtor<ResourceInstance>;

export { getSchema, createResource };
