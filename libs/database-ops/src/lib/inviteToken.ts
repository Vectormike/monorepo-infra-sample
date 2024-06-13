import { jwtService } from '@edvise/auth';
import { UserType } from '@edvise/database/client';
import { db } from '@edvise/database';
import { getBaseUrl, sendEmail } from '@edvise/helpers';
import { resolveWindowedConnection, setAround } from '@edvise/pothos/helpers';
import { queryFromInfo } from '@pothos/plugin-prisma';

type CreateInviteToken = {
  email: string;
  propelauthOrgId: string;
  role: UserType;
};

type _GetInviteTokens = {
  status?: string;
};

export async function createInvite(root: any, args: any) {
  try {
    const { email, role, propelauthOrgId } = args.input as CreateInviteToken;

    const organization = await db.organization.findUnique({
      where: {
        propelauth_id: propelauthOrgId,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const inviteData = {
      email,
      role,
      organization_id: organization!.id,
    // propelauthOrgId // TO DO: Add to invite token schema or redeploy schema
    };

    const token = jwtService.encrypt(inviteData);

    Object.assign(inviteData, { token });

    // Send email with token
    const link = new URL(`${getBaseUrl()}/register`);
    link.searchParams.append('in_t', token);
    link.searchParams.append('role', role);
    link.searchParams.append('organization', organization!.name);
    link.searchParams.append('email', email);

    sendEmail({
      recipients: [email],
      subject: 'Edvise Invite',
      body: `You have been invited to join Edvise as a ${role}. Please click the link below to accept the invite. ${link}`,
    });

    const invite = db.inviteToken.upsert({
      ...root,
      where: { email },
      create: inviteData,
      update: inviteData,
    });

    return {
      success: true,
      data: invite,
    };
  } catch (error: any) {
    // eslint-disable-next-line no-ex-assign
    error = (error as Error)?.message ?? JSON.stringify(error);

    return {
      success: false,
      error,
    };
  }
}

export function getInviteToken(
  query: any,
  email: string,
) {
  return db.inviteToken.findUnique({
    ...query,
    where: {
      email,
    },
  });
}

export function getInviteTokens(
  args: any,
  context: any,
  info: any,
) {
  const { around, args: argsNoAround } = setAround(args);
  return resolveWindowedConnection(
    { args: argsNoAround, around },
    async ({ limit, offset }) => {
      const inviteTokens = await db.inviteToken.findMany({
        ...queryFromInfo({
          context,
          info,
          path: ['edges', 'node'],
        }),
        take: limit,
        skip: offset,
        where: {
          ...(args.status && { status: args.status }),
        },
      });

      const totalCount = await db.inviteToken.count({
        where: {
          ...(args.status && { status: args.status }),
        },
      });

      return {
        around,
        items: inviteTokens,
        totalCount,
      };
    },
  );
}
