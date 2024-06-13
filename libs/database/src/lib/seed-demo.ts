/* eslint-disable
@typescript-eslint/no-use-before-define,
no-plusplus,
max-len */

import { db } from '..';

// WARNING: CURRENTLY OUT OF DATE.
export default async function seed() {
  const organization = {};
  const teacher = {
    email: 'john.smith@gmail.com',
    password: 'password',
    name: 'John Smith',
    type: 'teacher',
    organization_id: 1,
    teacherUser: {
      create: {
        requiredObservations: 5,
        completedObservations: 2,
        observationScheduled: true,
        nextObservationDate: new Date(Date.parse('22 Feb 2023 00:12:00 GMT')),
      },
    },
  };
  const admin = {
    email: 'mary.smith@gmail.com',
    password: 'password',
    name: 'Mary Smith',
    type: 'admin',
    organization_id: 1,
    adminUser: {
      create: {},
    },
  };

  const generatedPrompts = [
    {
      title: 'Prompt 1',
      content: 'Prompt 1 content',
    },
    {
      title: 'Prompt 2',
      content: 'Prompt 2 content',
    },
  ];

  const videoNotes = [
    {
      content: 'Note 1',
      timestamp: 50,
    },
    {
      content: 'Note 2',
      timestamp: 82,
    },
  ];
  // if we want focusAreaNote and focusAreaScore to populate, we need to remove the createMany and create the focusAreas separately (for nesting)
  const focusAreas = [
    {
      title: '1a: Demonstrating Knowledge of Content and Pedagogy',
      description: 'Focus Area 1a description',
      type: 'scored',
      rubric_id: 1,
      // focusAreaNote: {},
      // moment: {},
      focusAreaScore: {
        create: {
          title: '4: Distinguished',
          selected: true,
          score: 98,
          description:
            'The teacher displays extensive knowledge of the important concepts in the discipline and how these relate both to one another and to other disciplines. The teacher demonstrates understanding of prerequisite relationships among topics and concepts and understands the link to necessary cognitive structures that ensure student understanding. The teacher’s plans and practice reflect familiarity with a wide range of effective pedagogical approaches in the discipline and the ability to anticipate student misconceptions.',
        },
      },
    },
    {
      title: '1b: Demonstrating Knowledge of Students',
      description: 'Focus Area 1a description',
      type: 'scored',
      rubric_id: 1,
      // focusAreaNote: {},
      // moment: {},
      focusAreaScore: {
        create: {
          title: '1: Unsatisfactory',
          selected: false,
          score: 53,
          description:
            'The teacher displays minimal understanding of how students learn—and little knowledge of their varied approaches to learning, knowledge and skills, special needs, and interests and cultural heritages—and does not indicate that such knowledge is valuable.',
        },
      },
    },
  ];

  const observation = {
    name: 'Observation 1',
    date: new Date(Date.parse('15 Feb 2023 00:12:00 GMT')),
    type: 'async',
    teacher_id: 1,
    collaborator_id: 1,
    moment: {}, // populated after with momentList
    generatedPrompt: {
      createMany: { data: generatedPrompts },
    },
    videoNote: {
      createMany: { data: videoNotes },
    },
    rubric: {
      create: {
        name: 'Rubric 1',
        description: 'Rubric 1 description',
      },
    },
  };

  // need one of each of these. each moment created separately. TranscriptMoment & AnalyticsMoment
  const momentList = {
    type: 'transcript',
    attachedToFocusArea: false,
    focusArea_id: 1,
    observation_id: 1, // attached to the observation
    transcriptMoment: {
      create: {
        speaker: 'Teacher',
        startTime: 12,
        endTime: 19,
        text: 'This is a transcript moment',
        type: 'sentence',
      },
    },
  };

  // User (unused)
  await db.organization.create({ data: organization });
  await db.user.create({ data: teacher as any });
  await db.user.create({ data: admin as any });
  // Observation
  await db.observation.create({ data: observation as any });
  await db.focusArea.create({ data: focusAreas[0] as any });
  await db.focusArea.create({ data: focusAreas[1] as any });

  // TODO: Will need loop to create all Moments...
  await db.moment.create({
    data: momentList as any,
  });
}
