import type { UserCreationAttributes } from '../models/user';

type Attributes = keyof UserCreationAttributes;

const attributes: Attributes[] = [
  'id',
  'firstName',
  'lastName',
  'email',
  'password',
  'role',
  'unitId',
];

const keyPartsToCamelCase = ([first, ...rest]: string[]): string =>
  [
    first.toLowerCase(),
    ...rest.map((s) => `${s.slice(0, 1)}${s.slice(1).toLocaleLowerCase()}`),
  ].join('');

export const getAdminListFromEnv = (): UserCreationAttributes[] => {
  const rawEntries = Object.entries(process.env).filter(
    ([k]: [string, string]) => k.startsWith('VILLEKULLA_ADMIN_')
  );
  const entries = rawEntries
    .map(([k, value]: [string, string]): [number, string, string] | null => {
      const [indexString, ...keyParts] = k
        .replace('VILLEKULLA_ADMIN_', '')
        .split('_');
      const index = parseInt(indexString, 10);

      if (Number.isNaN(index)) {
        return null;
      }

      return [index, keyPartsToCamelCase(keyParts), value];
    })
    .filter(Boolean);

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
      item.unitId = 'tbd';

      return item;
    })
    .filter((item: Record<string, string>): item is UserCreationAttributes => {
      return Object.entries(item).reduce((result: boolean, [k, v]) => {
        if (result === false) {
          return false;
        }

        if (!attributes.includes(k as Attributes)) {
          return false;
        }

        return k === 'password' || v.length > 0;
      }, true);
    });
};
