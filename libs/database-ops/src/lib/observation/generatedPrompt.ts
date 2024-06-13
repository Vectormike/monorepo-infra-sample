import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateGeneratedPrompt = {
  title: string;
  content: string;
  observation_id: GlobalIDShape<any>;
};

type UpdateGeneratedPrompt = {
  id: GlobalIDShape<any>;
  title?: string;
  content?: string;
  observation_id?: GlobalIDShape<any>;
};

type DeleteGeneratedPrompt = {
  id: GlobalIDShape<any>;
};

export async function createGeneratedPrompt(root: any, args: any) {
  try {
    const { observation_id, ...data } = args.input as CreateGeneratedPrompt;

    const generatedPrompt = db.generatedPrompt.create({
      ...root,
      data: {
        ...data,
        observation_id: parseInt(observation_id.id, 10),
      },
    });

    return {
      success: true,
      data: generatedPrompt,
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

export async function updateGeneratedPrompt(root: any, args: any) {
  try {
    const { id, observation_id, ...data } = args.input as UpdateGeneratedPrompt;

    const generatedPrompt = db.generatedPrompt.update({
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
      data: generatedPrompt,
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

export async function deleteGeneratedPrompt(root: any, args: any) {
  try {
    const { id } = args.input as DeleteGeneratedPrompt;

    return await db.generatedPrompt.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-ex-assign
    error = (error as Error)?.message ?? JSON.stringify(error);

    return {
      success: false,
      error,
    };
  }
}
