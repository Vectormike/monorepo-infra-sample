import { db } from '@edvise/database';
import { TranscriptMomentType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateTranscriptMoment = {
  moment_id: GlobalIDShape<any>;
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
  type: TranscriptMomentType
};

type UpdateTranscriptMoment = {
  id: GlobalIDShape<any>;
  moment_id?: GlobalIDShape<any>;
  speaker?: string;
  startTime?: number;
  endTime?: number;
  text?: string;
  type?: TranscriptMomentType
};

type DeleteTranscriptMoment = {
  id: GlobalIDShape<any>;
};

export async function createTranscriptMoment(root: any, args: any) {
  try {
    const { moment_id, ...data } = args.input as CreateTranscriptMoment;

    const transcriptMoment = db.transcriptMoment.create({
      ...root,
      data: {
        ...data,
        moment_id: parseInt(moment_id.id, 10),
      },
    });

    return {
      success: true,
      data: transcriptMoment,
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

export async function updateTranscriptMoment(root: any, args: any) {
  try {
    const { id, moment_id, ...data } = args.input as UpdateTranscriptMoment;

    const transcriptMoment = db.transcriptMoment.update({
      ...root,
      data: {
        ...data,
        moment_id: parseInt(moment_id?.id, 10) || undefined,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: transcriptMoment,
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

export async function deleteTranscriptMoment(root: any, args: any) {
  try {
    const { id } = args.input as DeleteTranscriptMoment;

    const transcriptMoment = db.transcriptMoment.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: transcriptMoment,
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
