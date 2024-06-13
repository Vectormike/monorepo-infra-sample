import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateTeacherUser = {
  user_id: GlobalIDShape<any>;
  requiredObservations: number;
  completedObservations: number;
  observationScheduled?: boolean;
  nextObservationDate?: Date;
};

type UpdateTeacherUser = {
  id: GlobalIDShape<any>;
  requiredObservations?: number;
  completedObservations?: number;
  observationScheduled?: boolean;
  nextObservationDate?: Date;
  onboardingCompleted?: boolean;
};

type DeleteTeacherUser = {
  id: GlobalIDShape<any>;
};

export async function createTeacherUser(root: any, args: any) {
  try {
    const { user_id, ...data } = args.input as CreateTeacherUser;

    const teacherUser = await db.teacherUser.create({
      ...root,
      data: {
        ...data,
        user_id: parseInt(user_id.id, 10),
      },
    });

    return {
      success: true,
      data: teacherUser,
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

export async function updateTeacherUser(root: any, args: any) {
  try {
    const { id, ...data } = args.input as UpdateTeacherUser;

    if (data.onboardingCompleted === true) {
      const teacherUser = await db.teacherUser.findUnique({
        where: {
          id: parseInt(id.id, 10),
        },
        include: {
          class: true,
        },
      });

      if (!teacherUser?.class || teacherUser?.class.length === 0) {
        throw new Error('Teacher must have at least one class');
      }
    }

    const teacherUser = db.teacherUser.update({
      ...root,
      data,
      where: {
        id: parseInt(id.id, 10),
      },
      include: {
        class: true,
      },
    });

    return {
      success: true,
      data: teacherUser,
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

export async function deleteTeacherUser(root: any, args: any) {
  try {
    const { id } = args.input as DeleteTeacherUser;

    const teacherUser = db.teacherUser.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: teacherUser,
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
