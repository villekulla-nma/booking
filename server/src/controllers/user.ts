import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';
import type { UserAttributes, UserRole } from '@booking/types';

import type { UserResult } from './types';
import type { Db } from '../db';
import type { UserInstance } from '../models/user';

const toUserResult = (
  user: UserInstance,
  includePassword = false
): UserResult => {
  const { id, role, firstName, lastName, fullName, email, groupId, password } =
    user;

  return {
    id,
    role,
    firstName,
    lastName,
    fullName,
    email,
    groupId,
    ...(includePassword === true ? { password } : undefined),
  };
};

export const getAllUsers = async ({ User }: Db): Promise<UserResult[]> => {
  const users = await User.findAll();

  return users.map((user) => toUserResult(user));
};

export const getUserById = async (
  { User }: Db,
  id: string
): Promise<UserResult | null> => {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  return toUserResult(user);
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

  return toUserResult(user, true);
};

export const createUser = async (
  { User }: Db,
  role: UserRole,
  email: string,
  firstName: string,
  lastName: string,
  groupId: string
): Promise<string> => {
  const id = shortid();

  await User.create({
    id,
    role,
    email,
    firstName,
    lastName,
    groupId,
  });

  return id;
};

export const removeUser = async (
  { User }: Db,
  userId: string
): Promise<boolean> => {
  const result = await User.destroy({
    where: {
      id: { [Op.eq]: userId },
    },
  });

  return result === 1;
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
