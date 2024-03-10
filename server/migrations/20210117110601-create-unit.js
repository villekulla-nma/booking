/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const { getSchema } = require('../models/unit');

/**
 * @typedef {import('sequelize').QueryInterface} QueryInterface
 * @typedef {import('sequelize')} Sequelize
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Units', getSchema(Sequelize));
  },

  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} _Sequelize
   */
  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('Units');
  },
};
