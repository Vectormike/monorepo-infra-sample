import { db } from '@edvise/database';
import { FocusAreaScore, FocusAreaType, ObservationType } from '@edvise/database/client';
import {
  observationFilterQuery, resolveWindowedConnection, searchObservationsQuery, setAround,
} from '@edvise/pothos/helpers';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GlobalIDShape } from '@pothos/plugin-relay';
import { rubricDictionary, scores, titles } from '../data/createObservation';

type CreateObservation = {
  name: string;
  template: 'base' | 'corporate' | 'danielsons';
  date: Date;
  videoFile?: string;
  type: ObservationType;
  organization_id: GlobalIDShape<any>;
  collaborator_id?: GlobalIDShape<any>;
  teacher_id: GlobalIDShape<any>;
};

type GetObservationById = {
  id: GlobalIDShape<any>;
};

type _GetAllObservations = {
  startDate?: Date;
  endDate?: Date;
  organization_id?: GlobalIDShape<any>;
  teacher_id?: GlobalIDShape<any>;
  searchTerm?: string;
  propelAuth_id?: string;
};

type UpdateObservation = {
  id: GlobalIDShape<any>;
  name?: string;
  date?: Date;
  videoFile?: number;
  type?: ObservationType;
  organization_id?: GlobalIDShape<any>;
  collaborator_id?: GlobalIDShape<any>;
  teacher_id?: GlobalIDShape<any>;
};

type DeleteObservation = GetObservationById;

export async function createObservation(root: any, args: any) {
  try {
    const {
      organization_id,
      teacher_id,
      collaborator_id,
      template, ...data
    } = args.input as CreateObservation;

    // create observation
    const observation = await db.observation.create({
      ...root,
      data: {
        organization_id: parseInt(organization_id.id, 10),
        teacher_id: parseInt(teacher_id.id, 10),
        collaborator_id: parseInt(collaborator_id?.id, 10) || undefined,
        ...data,
      },
    });

    // create rubric
    const rubric = await db.rubric.create({
      ...root,
      data: {
        observation_id: observation.id,
        name: rubricDictionary[template].name,
        description: rubricDictionary[template].description,
      },
    });

    // return observation with base rubric no focus areas
    if (template === 'base') return observation;

    // create focus area
    const focusAreaData = [...new Array(5)].map((_, i) => db.focusArea.create({
      ...root,
      data: {
        title: rubricDictionary[template].getFocusAreaTitle!(titles[i]),
        type: FocusAreaType.scored,
        rubric_id: rubric.id,
        description: 'The focus area description',
      },
    }));

    const focusAreas = await Promise.all(focusAreaData);

    const focusAreaScoreData: Omit<FocusAreaScore, 'id'>[] = [];

    focusAreas.forEach((focusArea) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 4; i++) {
        const title = Object.keys(scores[i])[i];

        focusAreaScoreData.push({
          focusArea_id: focusArea.id,
          title,
          description: scores[i][title],
          score: Math.floor(Math.random() * 100),
          selected: true,
        });
      }
    });

    // create focus area score
    await db.focusAreaScore.createMany({
      ...root,
      data: focusAreaScoreData,
    });

    // return observation using standardized rubric with focus areas
    return {
      success: true,
      data: observation,
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

export async function getObservationById(query: any, id: GlobalIDShape<any>) {
  return db.observation.findUnique({
    ...query,
    where: {
      id: parseInt(id.id, 10),
    },
  });
}

export async function getAllObservations(args: any, context: any, info: any) {
  const { around, args: argsNoAround } = setAround(args);
  const { searchTerm, propelAuth_id } = argsNoAround;

  return resolveWindowedConnection({ args: argsNoAround, around }, async ({ limit, offset }) => {
    let type: string | null = '';

    if (searchTerm) {
      const user = await db.user.findUnique({
        select: {
          type: true,
        },
        where: {
          propelauth_id: propelAuth_id,
        },
      });

      type = user?.type ?? null;
    }

    const observations = await db.observation.findMany({
      ...queryFromInfo({
        context,
        info,
        path: ['edges', 'node', 'teacher', 'collaborator'],
      }),
      take: limit,
      skip: offset,
      where: {
        ...(searchTerm && searchObservationsQuery({ type, ...args })),
      },
    });

    const totalCount = await db.observation.count({
      where: {
        ...observationFilterQuery(args),
      },
    });

    return {
      around,
      items: observations,
      totalCount,
    };
  }) as any;
}

export async function updateObservation(root: any, args: any) {
  try {
    const {
      id,
      organization_id,
      teacher_id,
      collaborator_id,
      ...data
    } = args.input as UpdateObservation;

    const observation = db.observation.update({
      ...root,
      data: {
        organization_id: parseInt(organization_id?.id, 10) || undefined,
        teacher_id: parseInt(teacher_id?.id, 10) || undefined,
        collaborator_id: parseInt(collaborator_id?.id, 10) || undefined,
        ...data,
      },
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: observation,
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

export async function deleteObservation(root: any, args: any) {
  try {
    const { id } = args.input as DeleteObservation;

    const observation = db.observation.delete({
      ...root,
      where: {
        id: parseInt(id.id, 10),
      },
    });

    return {
      success: true,
      data: observation,
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
