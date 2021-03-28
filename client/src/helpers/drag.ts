// @see https://github.com/testing-library/testing-library-docs/blob/6dbfa5adecf28a9e06e0cc56e5156cda5200bb73/docs/example-drag.mdx

import { fireEvent } from '@testing-library/react';

import { sleep } from './sleep';

interface Coords {
  x: number;
  y: number;
}

interface Args {
  to?: unknown;
  delta?: Coords;
  steps?: number;
  duration?: number;
}

// https://stackoverflow.com/a/53946549/1179377
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isElement = (obj: any): obj is HTMLElement => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  let prototypeStr, prototype;
  do {
    prototype = Object.getPrototypeOf(obj);
    // to work in iframe
    prototypeStr = Object.prototype.toString.call(prototype);
    // '[object Document]' is used to detect document
    if (
      prototypeStr === '[object Element]' ||
      prototypeStr === '[object Document]'
    ) {
      return true;
    }
    obj = prototype;
    // null is the terminal of object
  } while (prototype !== null);
  return false;
};

const getElementClientCenter = (element: HTMLElement): Coords => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCoords = (obj: any): obj is Coords => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number'
  );
};

const getCoords = (charlie: unknown): Coords | unknown =>
  isElement(charlie) ? getElementClientCenter(charlie) : charlie;

export const drag = async (
  element: HTMLElement,
  { to: inTo, delta, steps = 20, duration = 500 }: Args
): Promise<void> => {
  const from = getElementClientCenter(element);
  const to = delta
    ? {
        x: from.x + delta.x,
        y: from.y + delta.y,
      }
    : getCoords(inTo);

  if (!isCoords(to)) {
    return;
  }

  const step = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps,
  };

  const current = {
    clientX: from.x,
    clientY: from.y,
  };

  fireEvent.mouseEnter(element, current);
  fireEvent.mouseOver(element, current);
  fireEvent.mouseMove(element, current);
  fireEvent.mouseDown(element, current);
  for (let i = 0; i < steps; i++) {
    current.clientX += step.x;
    current.clientY += step.y;
    await sleep(duration / steps);
    fireEvent.mouseMove(element, current);
  }
  fireEvent.mouseUp(element, current);
};
