import type {
  DataTypes,
  Model,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { EventAttributes } from '@booking/types';
import type { ResourceInstance } from './resource';
import type { UserInstance } from './user';

type EventCreationAttributes = Optional<EventAttributes, 'id'>;

interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes {
  resource?: ResourceInstance;
  user?: UserInstance;
}

const getSchema: (DataTypes: DataTypes) => ModelAttributes;

const createEvent: (
  sequelize: Sequelize,
  DataTypes: DataTypes
) => ModelCtor<EventInstance>;

export { getSchema, createEvent };
