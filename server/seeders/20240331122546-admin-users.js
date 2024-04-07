/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check

const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * @typedef {import('../models/user').UserCreationAttributes} UserCreationAttributes;
 * @typedef {keyof UserCreationAttributes} Attributes;
 */

/** @type {Attributes[]} */
const attributes = [
  'id',
  'firstName',
  'lastName',
  'email',
  'password',
  'role',
  'unitId',
];

/**
 *
 * @param {string[]} param0
 * @returns {string}
 */
const keyPartsToCamelCase = ([first, ...rest]) =>
  [
    first.toLowerCase(),
    ...rest.map((s) => `${s.slice(0, 1)}${s.slice(1).toLocaleLowerCase()}`),
  ].join('');

/** @returns UserCreationAttributes[] */
const getAdminListFromEnv = () => {
  const rawEntries = Object.entries(process.env).filter(
    /** @param {[string, string]} param0 */
    ([k]) => k.startsWith('VILLEKULLA_ADMIN_')
  );
  const entries = rawEntries
    .map(
      /**
       * @param {[string, string]} param0
       * @returns {[number, string, string] | null}
       */
      ([k, value]) => {
        const [indexString, ...keyParts] = k
          .replace('VILLEKULLA_ADMIN_', '')
          .split('_');
        const index = parseInt(indexString, 10);

        if (Number.isNaN(index)) {
          return null;
        }

        return [index, keyPartsToCamelCase(keyParts), value];
      }
    )
    .filter(Boolean);

  return entries
    .reduce((acc, [index, key, value]) => {
      if (!acc[index]) {
        acc[index] = {};
      }

      acc[index][key] = value;

      return acc;
    }, [])
    .map(
      /** @param {Record<string, string>} item */
      (item) => {
        item.role = 'admin';

        return item;
      }
    )
    .filter(
      /**
       * @param {Record<string, string>} item
       * @returns {item is UserCreationAttributes}
       */
      (item) => {
        return Object.entries(item).reduce((result, [k, v]) => {
          if (result === false) {
            return false;
          }

          if (!attributes.includes(/** @type {Attributes} */ (k))) {
            return false;
          }

          return k === 'password' || v.length > 0;
        }, true);
      }
    );
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const admins = await Promise.all(
      getAdminListFromEnv().map(async (user) => {
        user.password = await bcrypt.hash(user.password, process.env.SALT);

        return user;
      })
    );

    await queryInterface.bulkInsert('Users', admins, {});
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Users', { role: 'admin' }, {});
  },
};
