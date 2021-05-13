import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { Op } from 'sequelize';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { getDates } from './helpers/get-dates';
import type { ResourceInstance } from '../models/resource';
import { createEvent, getOverlappingEvents } from '../controllers/event';
import type { EventInstance } from '../models/event';
import { getNow } from '../utils/date';

jest.mock('../controllers/event');

jest.mock('../utils/date');

describe('Server [PUT] /api/resources/:resourceId/events', () => {
  const { today, tomorrow, dayAfterTomorrow } = getDates();
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9100');
    log = console.log;

    console.log = () => undefined;

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'user',
      groupId: 'MTpZEtFhN',
    });
    await db.Resource.bulkCreate<ResourceInstance>([
      {
        id: 'Uj5SAS740',
        name: 'Resource #1',
      },
      {
        id: 'gWH5T7Kdz',
        name: 'Resource #2',
      },
    ]);
    await db.Event.bulkCreate<EventInstance>([
      {
        id: 'HBv7p7CVC',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T12:00:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'A nice event',
        userId: 'Ul2Zrv1BX',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'ctigHisJr',
        start: `${today}T07:00:00.000Z`,
        end: `${tomorrow}T00:00:00.000Z`,
        allDay: false,
        resourceId: 'gWH5T7Kdz',
        description: 'Thingies',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
    ]);

    cookieValue = await signJwt(
      { id: 'TD0sIeaoz', role: 'user' },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();

    console.log = log;
  });

  it.each([
    [1, `${tomorrow}T07:30:00.000Z`, `${tomorrow}T09:00:00.000Z`, false],
    [2, `${tomorrow}T09:00:00.000Z`, `${tomorrow}T11:00:00.000Z`, false],
    [3, `${tomorrow}T11:30:00.000Z`, `${tomorrow}T13:00:00.000Z`, false],
    [4, `${tomorrow}T00:00:00.000Z`, `${tomorrow}T23:59:59.000Z`, true],
  ])(
    'should respond with 400/overlapping [%i]',
    async (_, start, end, allDay) => {
      (getOverlappingEvents as jest.Mock).mockImplementation(
        jest.requireActual('../controllers/event').getOverlappingEvents
      );
      (getNow as jest.Mock).mockImplementation(
        jest.requireActual('../utils/date').getNow
      );

      const response = await fetch(
        'http://localhost:9100/api/resources/Uj5SAS740/events',
        {
          method: 'PUT',
          headers: {
            cookie: `login=${cookieValue}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            description: '',
            start,
            end,
            allDay,
          }),
        }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('overlapping');
    }
  );

  it.each([
    ['start too early', `${today}T12:30:00.000Z`, `${today}T16:00:00.000Z`],
    ['end too early', `${today}T09:00:00.000Z`, `${today}T11:00:00.000Z`],
    ['range inverted', `${today}T13:30:00.000Z`, `${today}T11:00:00.000Z`],
  ])('should respond with 400/invalid (%s)', async (_, start, end) => {
    (getNow as jest.Mock).mockImplementation(
      () => new Date(`${today}T13:30:00.000Z`)
    );

    const response = await fetch(
      'http://localhost:9100/api/resources/Uj5SAS740/events',
      {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          description: '',
          allDay: false,
          start,
          end,
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('invalid');
  });

  it('should respond with 400/invalid on Sequelize Validation Error', async () => {
    (getOverlappingEvents as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/event').getOverlappingEvents
    );
    (getNow as jest.Mock).mockImplementation(
      jest.requireActual('../utils/date').getNow
    );
    (createEvent as jest.Mock).mockRejectedValue(
      Object.assign(new Error('wrong'), { name: 'SequelizeValidationError' })
    );

    const response = await fetch(
      'http://localhost:9100/api/resources/Uj5SAS740/events',
      {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          description: '',
          start: '2021-04-02T11:22:33.000Z',
          end: '2021-04-02T12:22:33.000Z',
          allDay: false,
          createdAt: '2021-03-25T10:15:56.000Z',
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('invalid');
  });

  it('should respond with 500/error on failure', async () => {
    (getOverlappingEvents as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/event').getOverlappingEvents
    );
    (getNow as jest.Mock).mockImplementation(
      () => new Date('2021-03-25T13:15:56.000Z')
    );
    (createEvent as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch(
      'http://localhost:9100/api/resources/Uj5SAS740/events',
      {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          description: '',
          start: '2021-04-02T11:22:33.000Z',
          end: '2021-04-02T12:22:33.000Z',
          allDay: false,
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
  });

  describe('Successful events creations', () => {
    it.each([
      [
        'Event #1',
        'Uj5SAS740',
        `${tomorrow}T15:00:00.000Z`,
        `${tomorrow}T16:00:00.000Z`,
        false,
      ],
      [
        'Event #2',
        'gWH5T7Kdz',
        `${tomorrow}T00:00:00.000Z`,
        `${dayAfterTomorrow}T00:00:00.000Z`,
        true,
      ],
    ])(
      'should respond with 200/ok on success (%s)',
      async (description, resourceId, start, end, allDay) => {
        (getOverlappingEvents as jest.Mock).mockImplementation(
          jest.requireActual('../controllers/event').getOverlappingEvents
        );
        (getNow as jest.Mock).mockImplementation(
          jest.requireActual('../utils/date').getNow
        );
        (createEvent as jest.Mock).mockImplementation(
          jest.requireActual('../controllers/event').createEvent
        );

        const response = await fetch(
          `http://localhost:9100/api/resources/${resourceId}/events`,
          {
            method: 'PUT',
            headers: {
              cookie: `login=${cookieValue}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              createdAt: '2021-03-25T10:15:56.000Z',
              description,
              allDay,
              start,
              end,
            }),
          }
        );
        const data = await response.json();
        const event = await db.Event.findOne({
          where: {
            start: { [Op.eq]: start },
            end: { [Op.eq]: end },
          },
        });

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(event.description).toBe(description);
      }
    );
  });
});
