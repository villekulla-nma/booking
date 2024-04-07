/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check

const bcrypt = require('bcryptjs');
const { strict: assert } = require('assert');

require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const password = await bcrypt.hash('test', process.env.SALT);
    const newAmount = await queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 'FkVxwkxgD',
          firstName: 'Lorem',
          lastName: 'Ipsum (AAA)',
          email: 'lorem@ipsum.de',
          role: 'user',
          unitId: '1N6CuTL2p',
          password,
        },
        {
          id: 'EVBhnfqtq',
          firstName: 'Foo',
          lastName: 'Bar (BBB)',
          email: 'foo@bar.de',
          role: 'user',
          unitId: '1YnF1qag7',
          password,
        },
      ],
      {}
    );

    assert.ok(
      Number(newAmount) > 2,
      `Expected to have more than 2 users, but only having ${newAmount}`
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Users', { role: 'user' }, {});
  },
};
