import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { EventAttributes } from '@villekulla-reservations/types';
import type { ResourceInstance } from './resource';
import type { UserInstance } from './user';

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

export interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes {
  resource?: ResourceInstance;
  user?: UserInstance;
}

type Schema = ModelAttributes<EventInstance, EventAttributes>;

// TODO: consider using a Range instead of start/end
//       (https://sequelize.org/master/manual/other-data-types.html#ranges--postgresql-only-)
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
};

const isEventData = (r: any): r is EventAttributes =>
  typeof r.id === 'string' &&
  typeof r.start === 'string' &&
  typeof r.end === 'string' &&
  typeof r.description === 'string' &&
  typeof r.allDay === 'boolean' &&
  typeof r.resourceId === 'string' &&
  typeof r.userId === 'string';

export const scaffoldEvents = async (
  Event: ModelCtor<EventInstance>,
  data: unknown
): Promise<void> => {
  if (Array.isArray(data)) {
    await Event.bulkCreate(
      data
        .filter((r) => isEventData(r))
        .map(({ id, start, end, description, allDay, resourceId, userId }) => ({
          id,
          start,
          end,
          description,
          allDay,
          resourceId,
          userId,
        }))
    );
  }
};

export const createEventInstance = (
  sequelize: Sequelize
): ModelCtor<EventInstance> => sequelize.define<EventInstance>('Event', schema);
