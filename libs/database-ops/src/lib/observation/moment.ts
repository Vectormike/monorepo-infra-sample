import { db } from '@edvise/database';
import { MomentType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateMoment = {
  type: MomentType;
  focusArea_id: GlobalIDShape<any>;
  observation_id: GlobalIDShape<any>;
};

type UpdateMoment = {
  id: GlobalIDShape<any>;
  type?: MomentType;
  focusArea_id?: GlobalIDShape<any>;
  observation_id?: GlobalIDShape<any>;
};

type DeleteMoment = {
  id: GlobalIDShape<any>;
};

export async function createMoment(root: any, args: any) {
  try {
    const { type, focusArea_id, observation_id } = args.input as CreateMoment;

    const moment = db.moment.create({
      ...root,
      data: {
        type,
        focusArea_id: parseInt(focusArea_id.id, 10),
        observation_id: parseInt(observation_id.id, 10),
      },
    });

    return {
      success: true,
      data: moment,
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

export async function updateMoment(root: any, args: any) {
  try {
    const {
      id, focusArea_id, observation_id, ...data
    } = args.input as UpdateMoment;

    const moment = db.moment.update({
      ...root,
      data: {
        ...data,
        focusArea_id: parseInt(focusArea_id?.id, 10) || undefined,
        observation_id: parseInt(observation_id?.id, 10) || undefined,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: moment,
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

export async function deleteMoment(root: any, args: any) {
  try {
    const { id } = args.input as DeleteMoment;

    const moment = db.moment.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: moment,
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
