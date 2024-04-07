// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { strict: assert } = require('assert');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const newAmount = await queryInterface.bulkInsert(
      'Resources',
      [
        {
          id: '5tp7ohVZm',
          name: 'Parkplatz',
        },
        {
          id: 'BC32Xt1MC',
          name: 'Gemeinschaftsraum',
        },
      ],
      {}
    );

    assert.equal(
      newAmount,
      2,
      `Expected to have 2 resources, but having ${newAmount}`
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Resources', null, {});
  },
};
