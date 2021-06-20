import type { UnitAttributes as UnitResult } from '@booking/types';
import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';

import type { Db } from '../db';

export const getAllUnits = async ({ Unit }: Db): Promise<UnitResult[]> => {
  const units = await Unit.findAll();

  return units.map(({ id, name, color }) => ({
    id,
    name,
    color,
  }));
};

export const getUnitById = async (
  { Unit }: Db,
  unitId: string
): Promise<UnitResult | null> => {
  const unit = await Unit.findByPk(unitId);

  return (
    unit && {
      id: unitId,
      name: unit.name,
      color: unit.color,
    }
  );
};

export const createUnit = async (
  { Unit }: Db,
  name: string,
  color: string
): Promise<string> => {
  const id = shortid();

  await Unit.create({ id, name, color });

  return id;
};

export const updateUnit = async (
  { Unit }: Db,
  unitId: string,
  name: string,
  color: string
): Promise<boolean> => {
  const [result] = await Unit.update(
    { name, color },
    {
      where: {
        id: { [Op.eq]: unitId },
      },
    }
  );
  return result === 1;
};

export const removeUnit = async (
  { Unit }: Db,
  unitId: string
): Promise<boolean> => {
  const result = await Unit.destroy({
    where: {
      id: { [Op.eq]: unitId },
    },
  });

  return result === 1;
};
