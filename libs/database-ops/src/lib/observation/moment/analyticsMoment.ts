import { db } from '@edvise/database';
import { AnalyticsMomentType } from '@edvise/database/client';
import { GlobalIDShape } from '@pothos/plugin-relay';

type CreateAnalyticsMoment = {
  moment_id: GlobalIDShape<any>;
  data: JSON;
  type: AnalyticsMomentType;
};

type UpdateAnalyticsMoment = {
  id: GlobalIDShape<any>;
  moment_id?: GlobalIDShape<any>;
  data?: JSON;
  type?: AnalyticsMomentType;
};

type DeleteAnalyticsMoment = {
  id: GlobalIDShape<any>;
};

export async function createAnalyticsMoment(root: any, args: any) {
  try {
    const { moment_id, ...data } = args.input as CreateAnalyticsMoment;

    const analyticsMoment = db.analyticsMoment.create({
      ...root,
      data: {
        ...data,
        moment_id: parseInt(moment_id.id, 10),
      },
    });

    return {
      success: true,
      data: analyticsMoment,
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

export async function updateAnalyticsMoment(root: any, args: any) {
  try {
    const { id, moment_id, ...data } = args.input as UpdateAnalyticsMoment;

    const analyticsMoment = db.analyticsMoment.update({
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
      data: analyticsMoment,
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

export async function deleteAnalyticsMoment(root: any, args: any) {
  try {
    const { id } = args.input as DeleteAnalyticsMoment;

    const analyticsMoment = db.analyticsMoment.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: analyticsMoment,
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
