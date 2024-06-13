import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';
import { Grade } from '@edvise/database/client';

type CreateClass = {
  teacher_id: GlobalIDShape<any>;
  grade: Grade;
  subject: string;
};

type GetClassById = {
  id: GlobalIDShape<any>;
};

type UpdateClass = {
  id: GlobalIDShape<any>;
  grade?: Grade;
  subject?: string;
};

type DeleteClass = GetClassById;

export async function createClass(root: any, args: any) {
  try {
    const { teacher_id, ...data } = args.input as CreateClass;

    const classData = await db.class.create({
      ...root,
      data: {
        ...data,
        teacher_id: parseInt(teacher_id.id, 10),
      },
    });

    return {
      success: true,
      data: classData,
    };
  } catch (error) {
    // eslint-disable-next-line no-ex-assign
    error = (error as Error)?.message ?? JSON.stringify(error);

    return {
      success: false,
      error,
    };
  }
}

export function getClassById(query: any, args: any) {
  const { id } = args as GetClassById;

  return db.class.findUnique({
    where: {
      id: parseInt(id.id, 10),
    },
  });
}

export async function updateClass(root: any, args: any) {
  try {
    const { id, ...data } = args.input as UpdateClass;

    const classData = await db.class.update({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
      data,
    });

    return {
      success: true,
      data: classData,
    };
  } catch (error) {
    // eslint-disable-next-line no-ex-assign
    error = (error as Error)?.message ?? JSON.stringify(error);

    return {
      success: false,
      error,
    };
  }
}

export async function deleteClass(root: any, args: any) {
  try {
    const { id } = args.input as DeleteClass;

    await db.class.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    // eslint-disable-next-line no-ex-assign
    error = (error as Error)?.message ?? JSON.stringify(error);

    return {
      success: false,
      error,
    };
  }
}
