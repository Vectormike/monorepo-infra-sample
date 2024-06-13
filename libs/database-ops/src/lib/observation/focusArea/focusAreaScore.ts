/* eslint-disable @typescript-eslint/no-use-before-define */
import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateFocusAreaScore = {
  title: string;
  focusArea_id: GlobalIDShape<any>;
  selected: boolean;
  score: number;
  description: string;
};

type UpdateFocusAreaScore = {
  id: GlobalIDShape<any>;
  title?: string;
  focusArea_id?: GlobalIDShape<any>;
  selected?: boolean;
  score?: number;
  description?: string;
};

type DeleteFocusAreaScore = {
  id: GlobalIDShape<any>;
};

export async function createFocusAreaScore(root: any, args: any) {
  try {
    const { focusArea_id, ...data } = args.input as CreateFocusAreaScore;

    if (data.selected) await unselectOtherFocusAreaScores(parseInt(focusArea_id.id, 10));

    const focusAreaScore = db.focusAreaScore.create({
      ...root,
      data: {
        ...data,
        focusArea_id: parseInt(focusArea_id.id, 10),
      },
    });

    return {
      success: true,
      data: focusAreaScore,
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

export async function updateFocusAreaScore(root: any, args: any) {
  try {
    const { id, focusArea_id: inputFocusArea_id, ...data } = args.input as UpdateFocusAreaScore;

    if (data.selected || parseInt(id.id, 10) === 0) {
      const { focusArea_id } = await db.focusAreaScore.findUniqueOrThrow({
        where: {
          id: parseInt(id.id, 10),
        },
        select: {
          focusArea_id: true,
        },
      });
      await unselectOtherFocusAreaScores(focusArea_id);
    }
    const focusAreaScore = db.focusAreaScore.update({
      ...root,
      data: {
        ...data,
        focusArea_id: parseInt(inputFocusArea_id?.id, 10) || undefined,
      },
      where: {
        id,
      },
    });

    return {
      success: true,
      data: focusAreaScore,
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

export async function deleteFocusAreaScore(root: any, args: any) {
  try {
    const { id } = args.input as DeleteFocusAreaScore;

    const focusAreaScore = db.focusAreaScore.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: focusAreaScore,
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

export async function deselectFocusAreaScore(root: any, args: any) {
  try {
    const { focusArea_id } = args.input as { focusArea_id: GlobalIDShape<any> };

    await unselectOtherFocusAreaScores(parseInt(focusArea_id.id, 10));

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

export async function unselectOtherFocusAreaScores(focusArea_id: number) {
  // this should really only update one selected item, but just in case multiple are selected...
  // also, you can't use where on non-unique fields with update (you can with updateMany)
  // https://stackoverflow.com/questions/67556792/prisma-update-using-where-with-non-unique-fields
  return db.focusAreaScore.updateMany({
    where: {
      focusArea_id,
      selected: true,
    },
    data: {
      selected: false,
    },
  });
}
