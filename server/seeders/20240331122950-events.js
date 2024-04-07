// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { strict: assert } = require('assert');

/** @typedef {Record<'start' | 'end', Date>} Interval */

/** @returns {Date} */
const todayUTC = () => {
  const date = new Date();

  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  );
};

// TODO: put init utils package
/** @returns {Interval} */
const getIntervalOne = () => {
  const start = todayUTC();
  const end = todayUTC();

  start.setDate(start.getDate() + 1);
  start.setHours(12);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);

  end.setDate(end.getDate() + 3);
  end.setHours(10);
  end.setMinutes(0);
  end.setSeconds(0);
  end.setMilliseconds(0);

  return { start, end };
};

/** @returns {Interval} */
const getIntervalTwo = () => {
  const start = todayUTC();
  const end = todayUTC();

  start.setDate(start.getDate() + 2);
  start.setHours(11);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);

  end.setDate(end.getDate() + 4);
  end.setHours(13);
  end.setMinutes(0);
  end.setSeconds(0);
  end.setMilliseconds(0);

  return { start, end };
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const newAmount = await queryInterface.bulkInsert(
      'Events',
      [
        {
          ...getIntervalOne(),
          id: 'urCGzt46j',
          description: 'Yolo',
          allDay: false,
          resourceId: '5tp7ohVZm',
          userId: 'FkVxwkxgD',
          createdAt: todayUTC(),
        },
        {
          ...getIntervalTwo(),
          id: 'vLsVuqJe9',
          description: 'Swag',
          allDay: false,
          resourceId: 'BC32Xt1MC',
          userId: 'EVBhnfqtq',
          createdAt: todayUTC(),
        },
      ],
      {}
    );

    assert.equal(
      newAmount,
      2,
      `Expected to have 2 events, but having ${newAmount}`
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('Events', null, {});
  },
};
