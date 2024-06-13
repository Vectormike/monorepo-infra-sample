import { db } from '@edvise/database';
import { resolveWindowedConnection, setAround } from '@edvise/pothos/helpers';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateOrganization = {
  name: string;
  propelauth_id: string;
};

type GetOrganizationById = {
  id?: GlobalIDShape<any> | null;
  propelAuthID?: string | null;
};

type UpdateOrganization = {
  id: GlobalIDShape<any>;
  name?: string;
};

type DeleteOrganization = {
  id: GlobalIDShape<any>;
};

export async function createOrganization(root: any, args: any) {
  try {
    const data = args.input as CreateOrganization;

    const organization = db.organization.create({
      ...root,
      data,
    });

    return {
      success: true,
      data: organization,
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

export async function getOrganizationById(query: any, args: GetOrganizationById) {
  const { id, propelAuthID } = args;
  if (id && propelAuthID) throw new Error('Cannot add arguments for both id and propelAuthID');
  if (!id && !propelAuthID) throw new Error('Must add arguments for either id or propelAuthID');

  const where = id ? { id: parseInt(id.id, 10) } : { propelauth_id: propelAuthID };

  return db.organization.findUnique({
    ...query,
    where,
  });
}

export async function getAllOrganizations(args: any, context: any, info: any) {
  const { around, args: argsNoAround } = setAround(args);

  return resolveWindowedConnection({ args: argsNoAround, around }, async ({ limit, offset }) => {
    const organizations = await db.organization.findMany({
      ...queryFromInfo({
        context,
        info,
        path: ['edges', 'node'],
      }),
      take: limit,
      skip: offset,
      where: args.where ?? {},
    });

    const totalCount = await db.organization.count({
      where: args.where ?? {},
    });

    return {
      around,
      items: organizations,
      totalCount,
    };
  });
}

export async function updateOrganization(root: any, args: any) {
  try {
    const { id, ...data } = args.input as UpdateOrganization;

    const organization = db.organization.update({
      ...root,
      data,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: organization,
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

export async function deleteOrganization(root: any, args: any) {
  try {
    const { id } = args.input as DeleteOrganization;

    const organization = db.organization.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: organization,
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
