import type { ViewTypeOption, ViewTypeParam } from './types';

export const DEFAULT_VIEW_OPTION: ViewTypeOption = 'timeGridWeek';
export const DEFAULT_VIEW_PARAM: ViewTypeParam = 'week';

export const MQ_IS_DESKTOP = '(min-width: 860px)';
export const MQ_IS_MEDIUM = '(min-width: 600px)';

export enum ROLE {
  USER = 'user',
  ADMIN = 'admin',
}
