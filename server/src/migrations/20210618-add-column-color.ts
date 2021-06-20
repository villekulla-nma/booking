import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';

import { DEFAULT_UNIT_COLOR, RE_COLOR } from '../constants';

export const migrate = async (sequelize: Sequelize): Promise<void> => {
  const table = 'Units';
  const column = 'color';
  const [columns] = await sequelize.query(`PRAGMA table_info(${table})`);

  // In tests, with a pristine DB, this column will always already exist.
  // The prouction DB however will need this alteration.
  if (columns.find(({ name }) => name === column) === undefined) {
    await sequelize.getQueryInterface().addColumn(table, column, {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DEFAULT_UNIT_COLOR,
      validate: {
        is: RE_COLOR,
      },
    });
  }
};
