import { db } from '@edvise/database';
import { FocusAreaNoteType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateFocusAreaNote = {
  focusArea_id: GlobalIDShape<any>;
  type: FocusAreaNoteType;
  content: string;
};

type UpdateFocusAreaNote = {
  id: GlobalIDShape<any>;
  focusArea_id?: GlobalIDShape<any>;
  type?: FocusAreaNoteType;
  content?: string;
};

type DeleteFocusAreaNote = {
  id: GlobalIDShape<any>;
};

export async function createFocusAreaNote(root: any, args: any) {
  try {
    const { focusArea_id, ...others } = args.input as CreateFocusAreaNote;

    const focusAreaNote = db.focusAreaNote.create({
      ...root,
      data: {
        ...others,
        focusArea_id: parseInt(focusArea_id.id, 10),
      },
    });

    return {
      success: true,
      data: focusAreaNote,
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

export async function updateFocusAreaNote(root: any, args: any) {
  try {
    const { id, focusArea_id, ...data } = args.input as UpdateFocusAreaNote;

    const focusAreaNote = db.focusAreaNote.update({
      ...root,
      data: {
        ...data,
        focusArea_id: parseInt(focusArea_id?.id, 10) || undefined,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: focusAreaNote,
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

export async function deleteFocusAreaNote(root: any, args: any) {
  try {
    const { id } = args.input as DeleteFocusAreaNote;

    const focusAreaNote = db.focusAreaNote.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: focusAreaNote,
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
