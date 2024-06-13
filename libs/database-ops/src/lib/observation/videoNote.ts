import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateVideoNote = {
  content: string;
  timestamp: number;
  observation_id: GlobalIDShape<any>;
};

type UpdateVideoNote = {
  id: GlobalIDShape<any>;
  content?: string;
  timestamp?: number;
  observation_id?: GlobalIDShape<any>;
};

type DeleteVideoNote = {
  id: GlobalIDShape<any>;
};

export async function createVideoNote(root: any, args: any) {
  try {
    const { content, timestamp, observation_id } = args.input as CreateVideoNote;

    const videoNote = db.videoNote.create({
      ...root,
      data: {
        content,
        timestamp,
        observation_id: parseInt(observation_id.id, 10),
      },
    });

    return {
      success: true,
      data: videoNote,
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

export async function updateVideoNote(root: any, args: any) {
  try {
    const { id, observation_id, ...data } = args.input as UpdateVideoNote;

    const videoNote = db.videoNote.update({
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
      data: videoNote,
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

export async function deleteVideoNote(root: any, args: any) {
  try {
    const { id } = args.input as DeleteVideoNote;

    const videoNote = db.videoNote.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: videoNote,
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
