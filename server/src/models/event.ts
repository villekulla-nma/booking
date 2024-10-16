import type { Model, Optional } from 'sequelize';
import type { EventAttributes } from '@booking/types';
import type { ResourceInstance } from './resource';
import type { UserInstance } from './user';

type EventCreationAttributes = Optional<EventAttributes, 'id'>;

export interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes {
  resource?: ResourceInstance;
  user?: UserInstance;
}
