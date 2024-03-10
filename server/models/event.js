// @ts-check

/**
 * @typedef {import('sequelize').ModelAttributes} ModelAttributes
 * @typedef {import('sequelize').DataTypes} DataTypes
 * @typedef {import('sequelize').Sequelize} Sequelize
 */

const getSchema = (DataTypes) => ({
  id: {
    allowNull: false,
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
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});
exports.getSchema = getSchema;

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
exports.createEvent = (sequelize, DataTypes) =>
  sequelize.define('Event', getSchema(DataTypes));
