// @ts-check

/**
 * @typedef {import('sequelize').ModelAttributes} ModelAttributes
 * @typedef {import('sequelize').DataTypes} DataTypes
 * @typedef {import('sequelize').Sequelize} Sequelize
 */

/**
 * @param {DataTypes} DataTypes
 * @returns {ModelAttributes}
 */
const getSchema = (DataTypes) => ({
  id: {
    allowNull: false,
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
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
exports.createResource = (sequelize, DataTypes) =>
  sequelize.define('Resource', getSchema(DataTypes), {
    timestamps: false,
    createdAt: false,
  });
