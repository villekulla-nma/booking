import type { Model, Optional } from 'sequelize';
import type { ResourceAttributes } from '@booking/types';

type ResourceCreationAttributes = Optional<ResourceAttributes, 'id'>;

export interface ResourceInstance
  extends Model<ResourceAttributes, ResourceCreationAttributes>,
    ResourceAttributes {}
