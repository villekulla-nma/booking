import type { Sequelize } from 'sequelize';
import { migrate as migration20210618 } from './20210618-add-column-color';

export const applyMigrations = (sequelize: Sequelize): void => {
  [migration20210618].forEach((fn) => fn(sequelize));
};
