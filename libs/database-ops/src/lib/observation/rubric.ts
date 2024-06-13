import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateRubric = {
  name: string;
  description: string;
  observation_id: GlobalIDShape<any>;
};

type UpdateRubric = {
  id: GlobalIDShape<any>;
  name?: string;
  description?: string;
  observation_id?: GlobalIDShape<any>;
};

type DeleteRubric = {
  id: GlobalIDShape<any>;
};

export async function createRubric(root: any, args: any) {
  try {
    const { observation_id, ...data } = args.input as CreateRubric;

    const rubric = db.rubric.create({
      ...root,
      data: {
        ...data,
        observation_id: parseInt(observation_id.id, 10),
      },
    });

    return {
      success: true,
      data: rubric,
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

export async function updateRubric(root: any, args: any) {
  try {
    const { id, observation_id, ...data } = args.input as UpdateRubric;

    const rubric = db.rubric.update({
      ...root,
      data: {
        ...data,
        observation_id: parseInt(observation_id?.id, 10) || undefined,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: rubric,
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

export async function deleteRubric(root: any, args: any) {
  try {
    const { id } = args.input as DeleteRubric;

    const rubric = db.rubric.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: rubric,
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
