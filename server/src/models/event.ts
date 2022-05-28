import { DataTypes, Op } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
  Transaction,
} from 'sequelize';
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

type Schema = ModelAttributes<EventInstance, EventAttributes>;

const schema: Schema = {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    unique: true,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allDay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEvent(o: any): o is EventAttributes {
  try {
    return (
      typeof o === 'object' &&
      o !== null &&
      typeof o.id === 'string' &&
      o.id.length &&
      typeof o.start === 'string' &&
      Number.isNaN(new Date(o.start).valueOf()) === false &&
      typeof o.end === 'string' &&
      Number.isNaN(new Date(o.end).valueOf()) === false &&
      typeof o.allDay === 'boolean' &&
      typeof o.resourceId === 'string' &&
      o.resourceId.length &&
      typeof o.userId === 'string' &&
      o.userId.length
    );
  } catch {
    return false;
  }
}

export const scaffoldEvents = async (
  Event: ModelCtor<EventInstance>,
  data: unknown,
  transaction: Transaction
): Promise<void> => {
  if (Array.isArray(data)) {
    await Promise.all(
      data
        .filter((e) => isEvent(e))
        .map((event) =>
          Event.findOrCreate({
            where: {
              id: { [Op.eq]: event.id },
            },
            defaults: event,
            transaction,
          })
        )
    );
  }
};

export const createEventInstance = (
  sequelize: Sequelize
): ModelCtor<EventInstance> => sequelize.define<EventInstance>('Event', schema);
