import { ROLE } from '../constants';

const roleToInt = (role?: ROLE): number => {
  switch (role) {
    case ROLE.ADMIN:
      return 2;
    case ROLE.USER:
      return 1;
    default:
      return 0;
  }
};

export const isAuthorized = (
  expectedRole: ROLE,
  receivedRole: ROLE | undefined
): boolean | undefined => {
  const expected = roleToInt(expectedRole);
  const received = roleToInt(receivedRole);

  if (typeof receivedRole === 'undefined') {
    return undefined;
  }

  return received >= expected;
};
