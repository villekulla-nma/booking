import type { UserCreationAttributes } from '../models/user';

const ATTRIBUTES = [
  'id',
  'firstName',
  'lastName',
  'email',
  'password',
  'role',
  'unitId',
];

const keyPartsToCamelCase = ([first, ...rest]: string[]) =>
  [
    first.toLowerCase(),
    ...rest.map(
      (s: string) => `${s.slice(0, 1)}${s.slice(1).toLocaleLowerCase()}`
    ),
  ].join('');

const isUserCreationAttributes = (
  o: Record<string, string>
): o is UserCreationAttributes =>
  Object.entries(o).reduce((result, [k, v]) => {
    if (result === false) {
      return false;
    }

    if (!ATTRIBUTES.includes(k)) {
      return false;
    }

    return k === 'password' || v.length > 0;
  }, true);

export const getAdminListFromEnv = (): UserCreationAttributes[] => {
  const rawEntries = Object.entries(process.env).filter(([k]) =>
    k.startsWith('VILLEKULLA_ADMIN_')
  );
  const entries = rawEntries
    .map(([k, value]) => {
      const [indexString, ...keyParts] = k
        .replace('VILLEKULLA_ADMIN_', '')
        .split('_');
      const index = parseInt(indexString, 10);

      if (Number.isNaN(index)) {
        return null;
      }

      return [index, keyPartsToCamelCase(keyParts), value];
    })
    .filter((item): item is [number, string, string] => item !== null);

  return entries
    .reduce((acc, [index, key, value]) => {
      if (!acc[index]) {
        acc[index] = {};
      }

      acc[index][key] = value;

      return acc;
    }, [])
    .map((item: Record<string, string>) => {
      item.role = 'admin';

      return item;
    })
    .filter((item) => isUserCreationAttributes(item));
};
