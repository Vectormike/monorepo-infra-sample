import { db } from '@edvise/database';
import { GeneratedOutputType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateGeneratedOutput = {
  type: GeneratedOutputType;
  input: JSON;
  class_id: GlobalIDShape<any>;
};

type UpdateGeneratedOutput = {
  id: GlobalIDShape<any>;
  type?: GeneratedOutputType;
  input?: JSON;
  class_id?: GlobalIDShape<any>;
};

type DeleteGeneratedOutput = {
  id: GlobalIDShape<any>;
};

export async function createGeneratedOutput(root: any, args: any) {
  try {
    const { type, input, class_id } = args.input as CreateGeneratedOutput;

    // TODO - generate output from GPT-4 API
    const output = {};

    const generatedOutput = db.generatedOutput.create({
      ...root,
      data: {
        type,
        input,
        output,
        class_id: parseInt(class_id.id, 10),
      },
    });

    return {
      success: true,
      data: generatedOutput,
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

export async function updateGeneratedOutput(root: any, args: any) {
  try {
    const { id, class_id, ...data } = args.input as UpdateGeneratedOutput;

    const generatedOutput = db.generatedOutput.update({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
      data: {
        ...data,
        class_id: class_id ? parseInt(class_id.id, 10) : undefined,
      },
    });

    return {
      success: true,
      data: generatedOutput,
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

export async function deleteGeneratedOutput(root: any, args: any) {
  try {
    const { id } = args.input as DeleteGeneratedOutput;

    await db.generatedOutput.delete({
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
