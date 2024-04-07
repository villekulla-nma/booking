// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { strict: assert } = require('assert');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const newAmount = await queryInterface.bulkInsert(
      'Units',
      [
        {
          id: '1N6CuTL2p',
          name: 'AAA',
          color: '#fe8e7d',
        },
        {
          id: '1YnF1qag7',
          name: 'BBB',
          color: '#d701f5',
        },
      ],
      {}
    );

    assert.equal(
      newAmount,
      2,
      `Expected to have 2 units, but having ${newAmount}`
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Units', null, {});
  },
};
