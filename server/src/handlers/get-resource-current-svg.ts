import { timingSafeEqual } from 'crypto';
import type { FastifyReply, RouteShorthandOptions } from 'fastify';
import type { EventResult } from '@booking/types';
import { isBefore, isAfter } from 'date-fns';
import S from 'fluent-json-schema';
import type { Request } from './pre-verify-session';
import { getScopedEvents } from '../controllers/event';
import { getFauxUTCDate, isToday, format } from '../utils/date';
import { drawOccupationSvg } from '../utils/draw-occupation-svg';
import type { AssignHandlerFunction } from './type';
import type { Db } from '../db';

interface Querystring {
  key: string;
}

interface Params {
  resourceId: string;
}

// TODO: move into .env
const API_KEY =
  'b78196c7243e5a62d75abe229c65461b89a45f4ebc57fb6b18e6acc8c6eaf565';

const querystringSchema = S.object()
  .prop('key', S.string().required())
  .valueOf();

const paramsSchema = S.object()
  .prop('resourceId', S.string().required())
  .valueOf();

const isOccupied = (event?: EventResult) => {
  if (!event) {
    return false;
  }

  const now = getFauxUTCDate();
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  return isBefore(eventStart, now) && isAfter(eventEnd, now);
};

const preVerifyKey = async (
  request: Request,
  reply: FastifyReply
): Promise<void> => {
  const { key } = request.query as Querystring;

  if (!key) {
    reply.code(400).send('Bad request');
    return;
  }

  const length = Math.max(key.length, API_KEY.length);
  if (
    timingSafeEqual(
      Buffer.alloc(length, key),
      Buffer.alloc(length, API_KEY)
    ) === false
  ) {
    reply.code(401).send('Unauthorized');
    return;
  }
};

const opts: RouteShorthandOptions = {
  schema: {
    querystring: querystringSchema,
    params: paramsSchema,
  },
  preHandler: preVerifyKey,
};

export const getCurrentOccupationGraphic = async (
  db: Db,
  resourceId: string
) => {
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  const events = await getScopedEvents(
    db,
    resourceId,
    new Date().toISOString(),
    end.toISOString()
  );
  const occupied = isOccupied(events[0]);
  const listOffset = occupied ? 1 : 0;

  return drawOccupationSvg({
    occupied,
    upcoming: events.slice(0 + listOffset, 4 + listOffset).map((event) => ({
      dateTime: (() => {
        const start = new Date(event.start);
        const date = isToday(start) ? '' : format(start, 'date');
        const time = event.allDay ? '' : format(start, 'time');

        return date + (time && date ? ', ' : '') + time;
      })(),
      unit: event.unit,
    })),
  });
};

export const assignGetResourceCurrentSvgHandler: AssignHandlerFunction = async (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request<Params>, reply) => {
    const { resourceId } = request.params;
    const graphic = await getCurrentOccupationGraphic(db, resourceId);

    reply.type('image/svg+xml').send(graphic);
  });
};
