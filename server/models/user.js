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
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  passwordReset: {
    type: DataTypes.STRING,
    unique: true,
  },
  unitId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      // @ts-expect-error Generic base model doesn't know these properties
      const { firstName, lastName } = this;
      return `${firstName} ${lastName}`;
    },
    set() {
      throw new Error('Do not try to set the `fullName` value!');
    },
  },
});
exports.getSchema = getSchema;

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
exports.createUser = (sequelize, DataTypes) =>
  sequelize.define('User', getSchema(DataTypes), {
    timestamps: false,
    createdAt: false,
  });
