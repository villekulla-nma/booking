// @ts-check

/**
 * @typedef {import('sequelize').ModelAttributes} ModelAttributes
 * @typedef {import('sequelize').DataTypes} DataTypes
 * @typedef {import('sequelize').ModelAttributeColumnOptions} ModelAttributeColumnOptions
 * @typedef {import('sequelize').Sequelize} Sequelize
 */

/**
 * @param {DataTypes} DataTypes
 * @returns {ModelAttributes}
 */
const getSchema = (DataTypes) => ({
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
exports.getSchema = getSchema;

/**
 * @param {DataTypes} DataTypes
 * @returns {ModelAttributeColumnOptions}
 */
// Added by migration "../migrations/20240218110603-add-column-color.js"...
const getColumnColor = (DataTypes) => ({
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: '#3788d8',
  validate: {
    is: /^#[a-f0-9]{6}$/i,
  },
});
exports.getColumnColor = getColumnColor;

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
exports.createUnit = (sequelize, DataTypes) =>
  sequelize.define(
    'Unit',
    { ...getSchema(DataTypes), ...{ color: getColumnColor(DataTypes) } },
    {
      timestamps: false,
      createdAt: false,
    }
  );
