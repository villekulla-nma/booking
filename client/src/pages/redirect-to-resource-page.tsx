import { FC } from 'react';
import { Redirect, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

import type { ViewTypeParam } from '../types';
import { DEFAULT_VIEW_PARAM } from '../constants';
import { FORMAT_DATE } from '../helpers/date';

interface Params {
  resourceId: string;
  view?: string;
}

const validateView = (value?: string): ViewTypeParam => {
  switch (value) {
    case 'day':
    case 'week':
    case 'month':
      return value;
    default:
      return DEFAULT_VIEW_PARAM;
  }
};

export const RedirectToResourcePage: FC = () => {
  const { pathname: from } = useLocation();
  const { resourceId, view: viewFromParams } = useParams<Params>();
  const view = validateView(viewFromParams);
  const now = format(new Date(), FORMAT_DATE);
  const to = `/resources/${resourceId}/${view}/${now}`;

  return <Redirect from={from} to={to} />;
};
