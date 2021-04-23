import { Op } from 'sequelize';
import type { UserAttributes } from '@booking/types';

import type { UserResult } from './types';
import type { Db } from '../db';

export const getUserById = async (
  { User }: Db,
  id: string
): Promise<UserResult | null> => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  const { role, firstName, lastName, fullName, email, password } = user;

  return { id, role, firstName, lastName, fullName, email, password };
};

export const getUserByKey = async (
  { User }: Db,
  key: keyof UserAttributes,
  value: string
): Promise<UserResult | null> => {
  const user = await User.findOne({
    where: {
      [key]: { [Op.eq]: value },
    },
  });

  if (!user) {
    return null;
  }

  const { id, role, firstName, lastName, fullName, email, password } = user;

  return { id, role, firstName, lastName, fullName, email, password };
};

export const updateUser = async (
  { User }: Db,
  id: string,
  data: Partial<UserAttributes>
): Promise<boolean> => {
  const [result] = await User.update(data, {
    where: {
      id: { [Op.eq]: id },
    },
  });
  return result === 1;
};
