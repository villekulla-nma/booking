import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';

export const migrate = (sequelize: Sequelize): void => {
  sequelize.getQueryInterface().addColumn('Units', 'color', {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#3788d8',
  });
};
