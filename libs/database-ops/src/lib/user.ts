import {
  createUser as propelAuthCreateUser,
  addUserToOrg,
  updateUserMetadata,
  updateUserPassword,
  jwtService,
} from '@edvise/auth';
import { db } from '@edvise/database';
import {
  InviteTokenStatus, UserStatus, UserType,
} from '@edvise/database/client';
import { splitIndieTeacherData } from '@edvise/helpers';
import { resolveWindowedConnection, setAround } from '@edvise/pothos/helpers';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateUser = {
  email: string;
  password: string;
  name: string;
  type: UserType;
  organization_id?: GlobalIDShape<any>;
  propelauth_org_id: string;
  invite_token?: string;
};

type GetUserById = {
  id?: GlobalIDShape<any> | null;
  propelAuthID?: string | null;
};

type GetAllUsers = {
  organization_id?: number;
};

type UpdateUser = {
  id: GlobalIDShape<any>;
  email?: string;
  password?: string;
  name?: string;
  type?: UserType;
  organization_id?: GlobalIDShape<any>;
  invite_token?: string;
  status?: UserStatus;
  propel_auth_id?: string;
};

type DeleteUser = {
  id: GlobalIDShape<any>;
};

type HandleCreateOrUpdateConstraints = {
  invite_token?: string;
  organization_id?: GlobalIDShape<any>;
  type?: UserType;
  email?: string;
};

type UserData = {
  email: string;
  name: string;
};

type TeacherUserData = {
  requiredObservations: number;
  completedObservations: number;
  observationScheduled?: boolean;
  nextObservationDate?: Date;
};

export type CreateIndieTeacher = { password: string } & UserData & TeacherUserData;

export async function handleCreateOrUpdateConstraints<T>(
  data: T & HandleCreateOrUpdateConstraints,
) {
  if (data?.invite_token && data?.organization_id) {
    throw new Error('Cannot add arguments for organization_id when invite_token is defined');
  }

  if (data.invite_token) {
    const { invite_token, ...others } = data;

    // Verify token
    const isValidToken = await db.inviteToken.findMany({
      where: {
        email: data.email,
        status: InviteTokenStatus.active,
      },
    });

    if (isValidToken.length < 1) {
      throw Error('Invalid Token');
    }

    // Validate token
    const { organization_id, role: type, propelauth_org_id } = jwtService.decrypt(invite_token);

    return {
      organization_id,
      type,
      propelauth_org_id,
      ...others,
    };
  }

  return data;
}

export async function updatePasswordOnPropelAuth(
  { propelUser, password }: { propelUser: string; password: string },
) {
  await updateUserPassword(propelUser, {
    password,
  });
}

export async function updateNameOnPropelAuth(
  { propelUser, name }: { propelUser: string; name: string },
) {
  const [firstName, lastName] = name.split(' ');
  await updateUserMetadata(propelUser, {
    firstName,
    lastName,
  });
}

export async function createUser(root: any, args: any) {
  try {
    let data = args.input as CreateUser;

    data = await handleCreateOrUpdateConstraints(data);

    const {
      password, propelauth_org_id, organization_id, ...others
    } = data;

    const [firstName, lastName] = data.name.split(' ');

    // save user to propel auth
    const propelUser = await propelAuthCreateUser({
      email: data.email,
      firstName,
      lastName,
      password,
    });

    // add user to propel auth org
    addUserToOrg({
      orgId: propelauth_org_id,
      userId: propelUser.userId,
      role: others.type,
    });

    // save user to @edvise/database
    const user = await db.user.create({
      ...root,
      data: {
        ...others,
        organization_id: parseInt(organization_id?.id, 10) || undefined,
        propelauth_id: propelUser.userId,
      },
    });

    // deactivate token
    await db.inviteToken.updateMany({
      where: {
        email: data.email,
        status: InviteTokenStatus.active,
      },
      data: {
        status: InviteTokenStatus.inactive,
      },
    });

    return {
      success: true,
      data: user,
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

export async function getUserById(query: any, args: GetUserById) {
  const { id, propelAuthID } = args;

  if (id && propelAuthID) throw new Error('Cannot add arguments for both id and propelAuthID');
  if (!id && !propelAuthID) throw new Error('Must add arguments for either id or propelAuthID');

  const where = id ? { id: parseInt(id.id, 10) } : { propelauth_id: propelAuthID };

  return db.user.findUnique({
    ...query,
    where,
  });
}

export async function getAllUsers(args: any, context: any, info: any) {
  const { around, args: argsNoAround } = setAround(args as GetAllUsers);

  return resolveWindowedConnection({ args: argsNoAround, around }, async ({ limit, offset }) => {
    const organization_id = parseInt(argsNoAround.organization_id?.id, 10);

    const users = await db.user.findMany({
      ...queryFromInfo({
        context,
        info,
        path: ['edges', 'node', 'teacherUser', 'adminUser'],
      }),
      take: limit,
      skip: offset,
      where: {
        ...(organization_id && { organization_id }),
      },
    });

    const totalCount = await db.user.count({
      where: {
        ...(organization_id && { organization_id }),
      },
    });

    return {
      around,
      items: users,
      totalCount,
    };
  });
}

export async function updateUser(root: any, args: any) {
  try {
    let data = args.input as UpdateUser;

    data = await handleCreateOrUpdateConstraints(data);

    const { id, ...others } = data;

    // TODO: grab user object from context instead of this query
    const person = await db.user.findUnique({
      where: {
        id: parseInt(id.id, 10),
      },
    });

    if (!person) throw new Error('User not found');

    const promises = [];

    if (others.name) {
      promises.push(updateNameOnPropelAuth({
        propelUser: person.propelauth_id,
        name: others.name,
      }));

      // TODO: forgot to update name on the DB
    }

    if (others.password) {
      promises.push(updatePasswordOnPropelAuth({
        propelUser: person.propelauth_id,
        password: others.password,
      }));
    }

    await Promise.all(promises);

    // Update email in propel auth
    // TODO: add email confirmation
    const user = db.user.update({
      ...root,
      others,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: user,
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

export async function deleteUser(root: any, args: any) {
  try {
    const { id } = args.input as DeleteUser;

    const user = db.user.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: user,
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

export async function createIndieTeacher(root: any, args: any) {
  try {
    const input = args.input as CreateIndieTeacher;

    const { password, ...data } = input;

    const [firstName, lastName] = data.name.split(' ');

    // save user to propel auth
    const propelUser = await propelAuthCreateUser({
      email: data.email,
      firstName,
      lastName,
      password,
      sendEmailToConfirmEmailAddress: true,
    });

    // fetch default org
    const organization = await db.organization.findUnique({
      where: {
        id: 1, // default org id
      },
    });

    // add user to propel auth org
    addUserToOrg({
      orgId: organization!.propelauth_id,
      userId: propelUser.userId,
      role: UserType.teacher,
    });

    const {
      userData,
      teacherUserData,
    } = splitIndieTeacherData<UserData, TeacherUserData>(data);

    // Create user base data
    const user = await db.user.create({
      ...root,
      data: {
        ...userData,
        propelauth_id: propelUser.userId,
        organization_id: organization!.id,
      },
      select: {
        id: true,
      },
    });

    // Create teacher specific data
    await db.teacherUser.create({
      ...root,
      data: {
        user_id: user.id,
        ...teacherUserData,
      },
      select: false,
    });

    // Fetch data back. This is good practice
    const result = db.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        teacherUser: true,
      },
    });

    return {
      success: true,
      data: result,
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
