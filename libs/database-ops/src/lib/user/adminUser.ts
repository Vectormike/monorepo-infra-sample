/* eslint-disable @typescript-eslint/naming-convention */
import { db } from '@edvise/database';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateAdminUser = {
  user_id: GlobalIDShape<any>;
};

type UpdateAdminUser = {
  id: GlobalIDShape<any>;
  user_id?: GlobalIDShape<any>;
};

type DeleteAdminUser = {
  id: GlobalIDShape<any>;
};

export async function createAdminUser(root: any, args: any) {
  try {
    const { user_id } = args.input as CreateAdminUser;

    const adminUser = db.adminUser.create({
      ...root,
      data: {
        user_id: parseInt(user_id.id, 10),
      },
    });

    return {
      success: true,
      data: adminUser,
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

export async function updateAdminUser(root: any, args: any) {
  try {
    const { id, user_id } = args.input as UpdateAdminUser;

    const adminUser = db.adminUser.update({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
      data: {
        user_id: parseInt(user_id?.id, 10) || undefined,
      },
    });

    return {
      success: true,
      data: adminUser,
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

export async function deleteAdminUser(root: any, args: any) {
  try {
    const { id } = args.input as DeleteAdminUser;

    const adminUser = db.adminUser.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: adminUser,
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
