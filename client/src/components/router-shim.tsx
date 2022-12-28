// TODO: get rid of those shims as soon as React Router is on version 6

import type { FC, PropsWithChildren } from 'react';
import { Router, MemoryRouter } from 'react-router-dom';
import type { RouterProps, MemoryRouterProps } from 'react-router-dom';

export const RouterShim: FC<PropsWithChildren<RouterProps>> = (props) => (
  <Router {...props} />
);

export const MemoryRouterShim: FC<PropsWithChildren<MemoryRouterProps>> = (
  props
) => <MemoryRouter {...props} />;
