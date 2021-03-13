import { DataTypes } from 'sequelize';
import type {
  Model,
  ModelAttributes,
  ModelCtor,
  Optional,
  Sequelize,
} from 'sequelize';
import type { EventAttributes } from '@villekulla-reservations/types';

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

export interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes {}

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
  all_day: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

const isEventData = (r: any): r is EventAttributes =>
  typeof r.id === 'string' &&
  typeof r.start === 'string' &&
  typeof r.end === 'string' &&
  typeof r.description === 'string' &&
  typeof r.all_day === 'boolean' &&
  typeof r.resource === 'string' &&
  typeof r.user === 'string';

export const scaffoldEvents = async (
  Event: ModelCtor<EventInstance>,
  data: unknown
): Promise<void> => {
  if (Array.isArray(data)) {
    await Event.bulkCreate(
      data
        .filter((r) => isEventData(r))
        .map(({ id, start, end, description, all_day, resource, user }) => ({
          id,
          start,
          end,
          description,
          all_day,
          resource,
          user,
        }))
    );
  }
};

export const createEventInstance = (db: Sequelize): ModelCtor<EventInstance> =>
  db.define<EventInstance>('Event', schema);
