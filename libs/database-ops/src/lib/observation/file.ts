import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateFile = {
  isLesson: boolean;
  collaborator_id?: GlobalIDShape<any>;
  teacher_id: GlobalIDShape<any>;
  observation_id: GlobalIDShape<any>;
};

type UpdateFile = {
  id: GlobalIDShape<any>;
  isLesson?: boolean;
  collaborator_id?: GlobalIDShape<any>;
  teacher_id?: GlobalIDShape<any>;
  observation_id?: GlobalIDShape<any>;
};

type DeleteFile = {
  id: GlobalIDShape<any>;
};

export async function createFile(root: any, args: any) {
  try {
    const {
      collaborator_id, teacher_id, observation_id, ...data
    } = args.input as CreateFile;

    const file = db.file.create({
      ...root,
      data: {
        ...data,
        observation_id: parseInt(observation_id.id, 10),
        teacher_id: parseInt(teacher_id.id, 10),
        collaborator_id: parseInt(collaborator_id?.id, 10) || undefined,
      },
    });

    return {
      success: true,
      data: file,
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

export async function updateFile(root: any, args: any) {
  try {
    const {
      id, collaborator_id, teacher_id, observation_id, ...data
    } = args.input as UpdateFile;

    const file = db.file.update({
      ...root,
      data: {
        ...data,
        observation_id: parseInt(observation_id?.id, 10) || undefined,
        teacher_id: parseInt(teacher_id?.id, 10) || undefined,
        collaborator_id: parseInt(collaborator_id?.id, 10) || undefined,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: file,
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

export async function deleteFile(root: any, args: any) {
  try {
    const { id } = args.input as DeleteFile;

    const file = db.file.delete({
      ...root,
      where: {
        id,
      },
    });

    return {
      success: true,
      data: file,
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
