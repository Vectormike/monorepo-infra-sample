import { db } from '@edvise/database';
import { FocusAreaType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateFocusArea = {
  title: string;
  description: string;
  type: FocusAreaType;
  rubric_id: GlobalIDShape<any>;
  addToBottom: boolean;
};

type UpdateFocusArea = {
  id: GlobalIDShape<any>;
  title?: string;
  description?: string;
  rubric_id?: GlobalIDShape<any>;
};

type DeleteFocusArea = {
  id: GlobalIDShape<any>;
};

type AddMomentToFocusAreas = {
  moment_id: GlobalIDShape<any>;
  focusArea_ids: GlobalIDShape<any>[];
};

type RemoveMomentFromFocusAreas = {
  moment_id: GlobalIDShape<any>;
  focusArea_ids: GlobalIDShape<any>[];
};

export async function createFocusArea(root: any, args: any) {
  try {
    const { rubric_id, addToBottom, ...others } = args.input as CreateFocusArea;

    const { _max: max, _min: min } = await db.focusArea.aggregate({
      where: {
        rubric_id: parseInt(rubric_id.id, 10),
      },
      _max: {
        order: true,
      },
      _min: {
        order: true,
      },
    });

    let newOrder: number;

    if (addToBottom) {
      // eslint-disable-next-line no-param-reassign
      newOrder = max?.order ? max.order + 1 : 1;
    } else {
      // eslint-disable-next-line no-param-reassign
      newOrder = min?.order ? min.order - 1 : -1;
    }

    const focusArea = await db.focusArea.create({
      ...root,
      data: {
        ...others,
        rubric_id: parseInt(rubric_id.id, 10),
        order: newOrder,
      },
    });

    return {
      success: true,
      data: focusArea,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
}

export async function updateFocusArea(root: any, args: any) {
  const { id, rubric_id, ...data } = args as UpdateFocusArea;

  const focusArea = db.focusArea.update({
    ...root,
    data: {
      ...data,
      rubric_id: parseInt(rubric_id?.id, 10) || undefined,
    },
    where: {
      id: parseInt(id.id, 10),
    },
  });

  return {
    success: true,
    data: focusArea,
  };
}

export async function deleteFocusArea(root: any, args: any) {
  const { id } = args.input as DeleteFocusArea;

  const focusArea = await db.focusArea.delete({
    ...root,
    where: {
      id: parseInt(id.id, 10),
    },
  });

  return {
    success: true,
    data: focusArea,
  };
}

export async function addMomentToFocusAreas(root: any, args: any) {
  try {
    const { moment_id, focusArea_ids } = args as AddMomentToFocusAreas;

    const data = focusArea_ids.map((focusArea_id) => ({
      moment_id: parseInt(moment_id.id, 10),
      focusArea_id: parseInt(focusArea_id.id, 10),
    }));

    const focusAreaMoment = await db.focusAreaMoment.createMany({
      ...root,
      data,
      skipDuplicates: true,
    });

    return {
      success: true,
      data: focusAreaMoment,
    };
  } catch (error) {
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}

export async function removeMomentFromFocusAreas(root: any, args: any) {
  try {
    const { moment_id, focusArea_ids } = args as RemoveMomentFromFocusAreas;

    const data = focusArea_ids.map((focusArea_id) => parseInt(focusArea_id.id, 10));

    const focusAreaMoment = db.focusAreaMoment.deleteMany({
      ...root,
      where: {
        focusArea_id: {
          in: data,
        },
        moment_id: parseInt(moment_id.id, 10),
      },
    });
    return {
      success: true,
      data: focusAreaMoment,
    };
  } catch (error) {
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}
