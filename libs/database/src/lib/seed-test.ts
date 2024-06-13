/* eslint-disable
@typescript-eslint/no-use-before-define,
no-plusplus,
max-len,
no-console */
import { addUserToOrg as propelAuthAddUserToOrg, createOrg as propelAuthCreateOrg, createUser as propelAuthCreateUser } from '@edvise/auth';
import { db } from '@edvise/database';
import {
  AdminUser,
  AnalyticsMoment,
  AnalyticsMomentType,
  Class,
  File,
  FileCollaborator,
  FocusArea,
  FocusAreaMoment,
  FocusAreaNote,
  FocusAreaNoteType,
  FocusAreaScore,
  FocusAreaType,
  GeneratedOutput,
  GeneratedOutputType,
  GeneratedPrompt,
  Moment,
  MomentType,
  Observation,
  ObservationCollaborator,
  ObservationType,
  Organization,
  Prisma,
  Rubric,
  TeacherUser,
  TranscriptMoment,
  TranscriptMomentType,
  User,
  UserType,
  VideoNote,
} from '@edvise/database/client';
import {
  randomIndex,
  randomNumber,
  uniqueRandomNumbers,
} from '@edvise/helpers';
import { faker } from '@faker-js/faker';
import { Org as PropelAuthOrg, User as PropelAuthUser } from '@propelauth/node';

const hardcodedGenerate = {
  users: 50,
  observations: 250,
  organizations: 5,
};

const amountToGenerate = {
  ...hardcodedGenerate,
  teacherAndAdminUsers: hardcodedGenerate.users,
  generatedPrompts: hardcodedGenerate.observations * 10,
  videoNotes: hardcodedGenerate.observations * 10,
  focusAreaNotes: hardcodedGenerate.observations * 50,
  moments: hardcodedGenerate.observations * 5,
  // roughly half of users are teachers
  // should generate ~10 generated outputs per teacher
  generatedOutputs: hardcodedGenerate.users * 5,
};

type RubricWithoutId = Omit<Rubric, 'id'>;
type GeneratedPromptWithoutId = Omit<GeneratedPrompt, 'id'>;
type VideoNoteWithoutId = Omit<VideoNote, 'id'>;
type TranscriptMomentWithoutId = Omit<TranscriptMoment, 'id'>;
type AnalyticsMomentWithoutId = Omit<AnalyticsMoment, 'id'>;
type FocusAreaScoreWithoutId = Omit<FocusAreaScore, 'id'>;
type FocusAreaNoteWithoutId = Omit<FocusAreaNote, 'id'>;
type ClassWithoutId = Omit<Class, 'id'>;
type UserWithoutStatus = Omit<User, 'status'>;
type GeneratedOutputWithoutId = Omit<GeneratedOutput, 'id'>;

const generate = hoistGenerateFunctions();

const generateUsersToCreate = (numToGenerate: number): UserWithoutStatus[] => {
  const users: UserWithoutStatus[] = Array(numToGenerate);
  const type = ['teacher', 'admin'];

  for (let i = 0; i < numToGenerate; i++) {
    const name = faker.name.fullName();
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];
    const user: UserWithoutStatus = {
      id: i + 1,
      email: faker.internet.email(firstName, lastName),
      name,
      type: type[Math.floor(Math.random() * type.length)] as UserType,
      organization_id: randomNumber(1, amountToGenerate.organizations),
      propelauth_id: '',
    };
    users[i] = user;
  }
  return users;
};

const generateOrgsToCreate = (numToGenerate: number): Organization[] => {
  const organizations: Organization[] = Array(numToGenerate);
  for (let i = 0; i < numToGenerate; i++) {
    const organization: Organization = {
      id: i + 1,
      name: `Organization ${i + 1}`,
      propelauth_id: '',
    };
    organizations[i] = organization;
  }
  return organizations;
};

async function createPropelAuthUsers(users: UserWithoutStatus[]) {
  const propelauth_users: Promise<PropelAuthUser>[] = [];
  for (let i = 0; i < users.length; i++) {
    propelauth_users.push(
      propelAuthCreateUser({
        email: users[i].email,
        firstName: users[i].name.split(' ')[0],
        lastName: users[i].name.split(' ')[1],
        password: 'Edvise!Propel123',
        sendEmailToConfirmEmailAddress: false,
      }),
    );
  }
  return Promise.all(propelauth_users);
}

async function addPropelAuthUsersToOrgs(
  usersToCreate: UserWithoutStatus[],
  propelauth_users: PropelAuthUser[],
  propelauth_orgs: PropelAuthOrg[],
) {
  const propelauth_add_user_to_org: Promise<boolean>[] = [];
  for (let i = 0; i < propelauth_users.length; i++) {
    // add each user to matching org
    const organization_id_to_add_to = usersToCreate[i].organization_id; // ranges from 1 - 5
    const propel_auth_org_id = propelauth_orgs[organization_id_to_add_to - 1].orgId;

    propelauth_add_user_to_org.push(
      propelAuthAddUserToOrg({
        userId: propelauth_users[i].userId, // propelauth user_id
        orgId: propel_auth_org_id, // propelauth org_id
        role: usersToCreate[i].type === 'teacher' ? 'Teacher' : 'Admin',
      }),
    );
  }
  return Promise.all(propelauth_add_user_to_org);
}

export default async function seed() {
  const usersToCreate: UserWithoutStatus[] = generateUsersToCreate(amountToGenerate.users);
  const orgsToCreate: Organization[] = generateOrgsToCreate(amountToGenerate.organizations);

  // create propelauth users/orgs first
  const propelAuthUsers = await createPropelAuthUsers(usersToCreate);
  const propelAuthOrgs = await createPropelAuthOrgs(orgsToCreate);

  // add propelauth users to propelauth orgs
  const adding_to_orgs = await addPropelAuthUsersToOrgs(
    usersToCreate,
    propelAuthUsers,
    propelAuthOrgs,
  );

  if (!adding_to_orgs.every((val) => val === true)) {
    throw Error('Error adding users to orgs');
  }

  // create db users/orgs with propelauth ids
  const organizations = generate.organizations(orgsToCreate, propelAuthOrgs);
  const {
    users, teacherUsers, adminUsers, classes,
  } = generate.users(
    usersToCreate,
    propelAuthUsers,
  );
  // create the rest of the data
  const {
    observations, observationCollaborators, files, fileCollaborators, rubrics, focusAreas, focusAreaScores, focusAreaMoments,
  } = generate.observations(
    amountToGenerate.observations,
    teacherUsers,
  );
  const { moments, transcriptMoments, analyticsMoments } = generate.moments(
    amountToGenerate.moments,
  );
  const focusAreaNotes = generate.focusAreaNotes(
    amountToGenerate.focusAreaNotes,
    focusAreas.length,
  );
  const generatedPrompts = generate.generatedPrompt(
    amountToGenerate.generatedPrompts,
  );
  const videoNotes = generate.videoNote(amountToGenerate.videoNotes);
  const generatedOutputs = generate.generatedOutput(amountToGenerate.generatedOutputs, classes.length);

  // some of these are marked with ts-ignore
  // because of a specific type error that is too verbose to be worth fixing
  // https://github.com/prisma/prisma/issues/9247
  await db.organization.createMany({ data: organizations });
  await db.user.createMany({ data: users });
  await db.adminUser.createMany({ data: adminUsers });
  await db.teacherUser.createMany({ data: teacherUsers });
  await db.observation.createMany({ data: observations });
  await db.file.createMany({ data: files });
  await db.rubric.createMany({ data: rubrics });
  await db.focusArea.createMany({ data: focusAreas });
  await db.focusAreaScore.createMany({ data: focusAreaScores });
  await db.focusAreaNote.createMany({ data: focusAreaNotes });
  await db.moment.createMany({ data: moments });
  await db.transcriptMoment.createMany({ data: transcriptMoments });
  // @ts-ignore
  await db.analyticsMoment.createMany({ data: analyticsMoments });
  await db.generatedPrompt.createMany({ data: generatedPrompts });
  await db.videoNote.createMany({ data: videoNotes });
  await db.focusAreaMoment.createMany({ data: focusAreaMoments });
  await db.observationCollaborator.createMany({ data: observationCollaborators });
  await db.fileCollaborator.createMany({ data: fileCollaborators });
  await db.class.createMany({ data: classes });
  // @ts-ignore
  await db.generatedOutput.createMany({ data: generatedOutputs });
}

async function createPropelAuthOrgs(orgs: Organization[]) {
  const propelauth_orgs: Promise<PropelAuthOrg>[] = [];
  for (let i = 0; i < orgs.length; i++) {
    const org: Organization = orgs[i];
    propelauth_orgs.push(
      propelAuthCreateOrg({
        name: org.name,
      }),
    );
  }
  return Promise.all(propelauth_orgs);
}

function hoistGenerateFunctions() {
  return {
    // generates users, teacher users, and admin users
    users: (
      usersToCreate: UserWithoutStatus[],
      propelAuthUserIdArr: PropelAuthUser[],
    ): {
      users: UserWithoutStatus[];
      teacherUsers: TeacherUser[];
      adminUsers: AdminUser[];
      classes: ClassWithoutId[];
    } => {
      const teacherUsers: TeacherUser[] = [];
      const adminUsers: AdminUser[] = [];
      const classes: ClassWithoutId[] = [];
      let teacherCounter = 0;
      let adminCounter = 0;
      const propelAuthId = propelAuthUserIdArr.map((user) => user.userId);
      const users = Array(usersToCreate.length);

      for (let i = 0; i < usersToCreate.length; i++) {
        // add propelauth_id to user
        const user = usersToCreate[i];
        user.propelauth_id = propelAuthId[i];
        users[i] = user;

        // add admin and teacher users
        if (user.type === 'admin') {
          adminCounter++;
          const adminUser: AdminUser = {
            id: adminCounter,
            user_id: users[i].id,
          };
          adminUsers.push(adminUser);
        } else if (user.type === 'teacher') {
          teacherCounter++;
          const requiredObservations = randomNumber(0, 10);
          const observationScheduled = faker.datatype.boolean();
          const numOfClasses = randomNumber(0, 6);
          const teacherUser: TeacherUser = {
            id: teacherCounter,
            requiredObservations,
            completedObservations: randomNumber(0, requiredObservations),
            observationScheduled,
            nextObservationDate: observationScheduled
              ? faker.date.soon(30)
              : null,
            user_id: users[i].id,
            onboardingCompleted: (numOfClasses > 0),
          };
          teacherUsers.push(teacherUser);

          const grades = ['kindergarten', 'firstGrade', 'secondGrade', 'thirdGrade', 'fourthGrade', 'fifthGrade', 'sixthGrade', 'seventhGrade', 'eighthGrade', 'ninthGrade', 'tenthGrade', 'eleventhGrade', 'twelfthGrade', 'college'];

          for (let j = 0; j < numOfClasses; j++) {
            const classData: ClassWithoutId = {
              teacher_id: teacherCounter,
              grade: grades[randomIndex(grades)],
              subject: faker.random.word(),
            };
            classes.push(classData);
          }
        }
      }

      return {
        users, teacherUsers, adminUsers, classes,
      };
    },
    // generates observations, files, and rubrics
    observations: (
      numToGenerate: number,
      teachers: TeacherUser[],
    ): {
      observations: Observation[];
      observationCollaborators: ObservationCollaborator[];
      files: File[];
      fileCollaborators: FileCollaborator[];
      rubrics: RubricWithoutId[];
      focusAreas: FocusArea[];
      focusAreaScores: FocusAreaScoreWithoutId[];
      focusAreaMoments: FocusAreaMoment[];
    } => {
      const observations: Observation[] = Array(numToGenerate);
      const observationCollaborators: ObservationCollaborator[] = [];
      const files: File[] = [];
      const fileCollaborators: FileCollaborator[] = [];
      const rubrics: RubricWithoutId[] = [];
      const focusAreas: FocusArea[] = [];
      const focusAreaScores: FocusAreaScoreWithoutId[] = [];
      const focusAreaMoments: FocusAreaMoment[] = [];
      let fileCounter = 0;
      let rubricCounter = 0;
      let focusAreaCounter = 0;
      const type = ['sync', 'async'];
      const focusAreaType = ['scored', 'unscored'];
      for (let i = 0; i < numToGenerate; i++) {
        const hasFile = faker.datatype.boolean();
        const hasRubric = faker.datatype.boolean();
        const [teacher_id, collaborators] = userIds(teachers);
        const observation_id = i + 1;
        const observation = {
          id: observation_id,
          name: faker.lorem.words(3),
          date: faker.date.recent(90),
          type: type[
            Math.floor(Math.random() * type.length)
          ] as ObservationType,
          organization_id: randomNumber(1, amountToGenerate.organizations),
          teacher_id,
        };
        observations[i] = observation;

        if (collaborators.length !== 0) {
          collaborators.forEach((collaborator_id) => {
            const observationCollaborator: ObservationCollaborator = {
              observation_id,
              collaborator_id,
            };
            observationCollaborators.push(observationCollaborator);
          });
        }

        if (hasFile) {
          fileCounter++;
          const file: File = {
            id: fileCounter,
            isLesson: faker.datatype.boolean(),
            teacher_id,
            observation_id,
          };

          if (collaborators.length !== 0) {
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            collaborators.forEach((collaborator_id) => {
              const fileCollaborator: FileCollaborator = {
                file_id: fileCounter,
                collaborator_id,
              };
              fileCollaborators.push(fileCollaborator);
            });
          }
          files.push(file);
        }

        if (hasRubric) {
          rubricCounter++;
          const rubric: Rubric = {
            id: rubricCounter,
            name: faker.lorem.words(3),
            description: faker.lorem.sentences(2),
            observation_id,
          };
          rubrics.push(rubric);

          const numOfFocusAreasForRubric = randomNumber(0, 7);
          const order = uniqueRandomNumbers(numOfFocusAreasForRubric, -2, numOfFocusAreasForRubric - 3);
          for (let j = 0; j < numOfFocusAreasForRubric; j++) {
            focusAreaCounter++;
            const focusArea: FocusArea = {
              id: focusAreaCounter,
              title: faker.lorem.words(3),
              description: faker.lorem.sentences(3),
              type: focusAreaType[Math.floor(Math.random() * focusAreaType.length)] as FocusAreaType,
              rubric_id: rubricCounter,
              order: order[j],
            };
            focusAreas.push(focusArea);

            if (numOfFocusAreasForRubric !== 0) {
              const moment_ids = uniqueRandomNumbers(amountToGenerate.moments, 1, amountToGenerate.moments);
              for (let k = 0; k < numOfFocusAreasForRubric; k++) {
                const focusAreaMoment: FocusAreaMoment = {
                  focusArea_id: focusAreaCounter,
                  moment_id: moment_ids[k],
                };
                focusAreaMoments.push(focusAreaMoment);
              }
            }

            if (focusArea.type === 'scored') {
              for (let l = 0; l < randomNumber(0, 5); l++) {
                const focusAreaScore: FocusAreaScoreWithoutId = {
                  title: faker.lorem.words(3),
                  focusArea_id: focusAreaCounter,
                  selected: faker.datatype.boolean(),
                  score: randomNumber(1, 100),
                  description: faker.lorem.sentences(2),
                };
                focusAreaScores.push(focusAreaScore);
              }
            }
          }
        }
      }
      return {
        observations, observationCollaborators, files, fileCollaborators, rubrics, focusAreas, focusAreaScores, focusAreaMoments,
      };
    },
    // generates moments, transcript moments, and analytics moments
    moments: (
      numToGenerate: number,
    ): {
      moments: Moment[];
      transcriptMoments: TranscriptMomentWithoutId[];
      analyticsMoments: AnalyticsMomentWithoutId[];
    } => {
      const moments: Moment[] = Array(numToGenerate);
      const transcriptMoments: TranscriptMomentWithoutId[] = [];
      const analyticsMoments: AnalyticsMomentWithoutId[] = [];
      const type = ['transcript', 'analytics'];

      for (let i = 0; i < numToGenerate; i++) {
        const moment_id = i + 1;
        const moment: Moment = {
          id: moment_id,
          type: type[Math.floor(Math.random() * type.length)] as MomentType,
          observation_id: randomNumber(1, amountToGenerate.observations),
        };
        moments[i] = moment;

        if (moment.type === 'transcript') {
          const startTime = randomNumber(0, 60);
          const transcriptMomentTypes = ['sentence', 'paragraph'];
          const transcriptMomentType = transcriptMomentTypes[
            Math.floor(Math.random() * transcriptMomentTypes.length)
          ] as TranscriptMomentType;
          const transcriptMoment: TranscriptMomentWithoutId = {
            moment_id,
            type: transcriptMomentType,
            speaker: faker.name.firstName(),
            startTime,
            endTime:
              transcriptMomentType === 'sentence'
                ? randomNumber(startTime, startTime + 10)
                : randomNumber(startTime, startTime + 60),
            text:
              transcriptMomentType === 'sentence'
                ? faker.lorem.sentence()
                : faker.lorem.paragraph(),
          };
          transcriptMoments.push(transcriptMoment);
        } else if (moment.type === 'analytics') {
          const analyticsMomentTypes = ['bar', 'pie'];
          const analyticsMoment: AnalyticsMomentWithoutId = {
            moment_id,
            type: analyticsMomentTypes[
              Math.floor(Math.random() * analyticsMomentTypes.length)
            ] as AnalyticsMomentType,
            data: {
              teacher: randomNumber(0, 100),
              student: randomNumber(0, 100),
            } as Prisma.JsonObject,
          };
          analyticsMoments.push(analyticsMoment);
        }
      }
      return { moments, transcriptMoments, analyticsMoments };
    },
    generatedOutput: (numToGenerate: number, classesAmt: number): GeneratedOutputWithoutId[] => {
      const generatedOutputs: GeneratedOutputWithoutId[] = Array(numToGenerate);
      const type = ['lessonOutline', 'lessonPlan', 'unitCoverageAndStandards', 'multipleChoiceTest', 'discussionTopics', 'exitTicket', 'activities'];
      for (let i = 0; i < numToGenerate; i++) {
        const generatedOutput: GeneratedOutputWithoutId = {
          type: type[Math.floor(Math.random() * type.length)] as GeneratedOutputType,
          class_id: randomNumber(1, classesAmt),
          input: {},
          output: {},
        };

        // all of the generated data inputs and outputs are intentionally constants
        // for seeding purposes per Kevin's instructions & frontend testing usecase

        // eslint-disable-next-line default-case
        switch (generatedOutput.type) {
          // still in review stage in PromptHub on Notion
          case 'lessonOutline':
            generatedOutput.input = {};
            generatedOutput.output = {};
            break;
          case 'lessonPlan':
            generatedOutput.input = {
              topicName: 'ABC',
              template: 'Madeline Hunter',
              content: 'Distributive property: Simplifying fractions',
            };
            generatedOutput.output = {
              blooms: {
                remembering: 'Recall the definition of the distributive property, and the process for simplifying fractions.',
                understanding: 'Explain how the distributive property can be used to simplify fractions in arithmetic problems.',
                applying: 'Apply the distributive property to simplify fractions in various mathematical expressions and word problems.',
                analyzing: 'Analyze and identify instances where the distributive property can be applied to simplify fractions, and determine the most efficient method to solve the expression or problem.',
                evaluating: 'Evaluate the effectiveness of using the distributive property when simplifying fractions, comparing it to other methods when applicable.',
                creating: 'Create original word problems and mathematical expressions that involve using the distributive property to simplify fractions.',
              },
              statedObjectives: 'Students will learn about the distributive property and how it can be applied to simplifying fractions. By the end of this lesson, they will be able to use the distributive property to simplify fractions in various mathematical expressions and word problems.',
              anticipatorySet: 'Begin the lesson by presenting real-life examples where simplifying fractions is necessary, such as dividing a pizza or measuring ingredients in a recipe. Introduce the distributive property as a tool to help with these situations and make the mathematical process more efficient.',
              directInstructionAndCheckingForUnderstanding: 'Introduce the distributive property and explain how it works with fractions. Use examples like, a(b + c) = ab + ac. Demonstrate the importance of simplifying fractions before applying the distributive property. Ask probing questions to ensure students understand the concept, such as "How can we simplify the fraction 12/16?" or "What is the distributive property?"',
              inputModeling: 'Model the process of applying the distributive property to simplify fractions using step-by-step examples, both with numerical expressions and word problems. Encourage students to replicate the process, either individually or as a whole class activity.',
              checkingUnderstanding: 'As students practice the process, observe their work and listen to their explanations. Ask questions like, "Why did you choose to simplify this fraction first?" and "How did the distributive property help you solve this problem?"',
              guidedPractice: 'Provide students with several problems that involve using the distributive property to simplify fractions. Walk around the room to offer support and guidance as they work on each problem. Encourage group discussions and peer feedback.',
              independentPractice: 'Assign a set of problems covering different levels of complexity and specific content for students to work on independently, either in class or as homework. This will help solidify their understanding of the distributive property and its application to simplifying fractions.',
              commonAreasOfStruggle: 'Students may struggle with identifying when it is appropriate to use the distributive property, as well as properly simplifying fractions before applying the property. They may also struggle with comprehending how this method can be employed in word problems.',
              variedExamples: 'Provide multiple explanations and examples to reinforce the concept. These could include: (1) Examples with numbers, such as 2(1/2 + 1/4) = 1 + 1/2 (simplified before applying the distributive property). (2) Word problems, like splitting the cost of a meal, with different fractions. (3) Geometric examples, using shapes and the distributive property to simplify their areas. (4) Real-world examples involving cooking and recipes that require the distributive property to determine ingredient ratios. (5) Examples with variables, showing how the distributive property can be applied to fraction expressions with unknowns.',
              closure: 'Conclude the lesson by summarizing the key concepts learned, emphasizing the link between the distributive property and simplifying fractions. Review the objectives and ask students to share their thoughts and experiences working with the distributive property. Connect these ideas back to the real-life examples presented at the beginning of the lesson.',
            };
            break;
          // still in review stage in PromptHub on Notion
          case 'unitCoverageAndStandards':
            generatedOutput.input = {};
            generatedOutput.output = {};
            break;
          case 'multipleChoiceTest':
            generatedOutput.input = {
              topicName: 'ABC',
              numOfQuestions: 10,
              description: 'Distributive property: Simplifying fractions',
            };
            // needs to be stored in JSON object opposed to array
            // to be proper JSON returnable by the JSON GraphQL scalar
            generatedOutput.output = {
              output: [
                {
                  question: 'What is the distributive property?',
                  choices: [
                    'A property that allows you to multiply a sum by multiplying each addend separately and then add the products',
                    'A property that allows you to add fractions with the same denominator',
                    'A property that states that multiplying a number by its inverse results in 1',
                    'A property that combines addition and subtraction operations',
                  ],
                  correctAnswer: 0,
                  difficulty: 'easy',
                },
                {
                  question: 'How do you simplify 12/16 using the distributive property?',
                  choices: [
                    '3/4',
                    '2/3',
                    '8/10',
                    '6/12',
                  ],
                  correctAnswer: 0,
                  difficulty: 'medium',
                },
                {
                  question: 'What is 5 x (2 + 6) using the distributive property?',
                  choices: [
                    '40',
                    '50',
                    '30',
                    '25',
                  ],
                  correctAnswer: 0,
                  difficulty: 'medium',
                },
                {
                  question: 'What is the distributive property of: 4 x (3 + 5)?',
                  choices: [
                    '(4 x 3) + (4 x 5)',
                    '(4 + 3) + (4 + 5)',
                    '(4 x 3) - (4 x 5)',
                    '(4 + 3) x (4 + 5)',
                  ],
                  correctAnswer: 0,
                  difficulty: 'easy',
                },
                {
                  question: 'What does it mean to simplify a fraction?',
                  choices: [
                    'To convert it to a decimal',
                    'To reduce it to its smallest equivalent expression',
                    'To change the denominator and multiply the numerator',
                    'To make the numerator as small as possible',
                  ],
                  correctAnswer: 1,
                  difficulty: 'easy',
                },
                {
                  question: 'Simplify the fraction 9/27 by finding the greatest common divisor (GCD).',
                  choices: [
                    '1/3',
                    '2/6',
                    '3/9',
                    '2/3',
                  ],
                  correctAnswer: 0,
                  difficulty: 'medium',
                },
                {
                  question: 'What is the simplified form of the fraction 18/24?',
                  choices: [
                    '3/4',
                    '1/2',
                    '3/8',
                    '2/3',
                  ],
                  correctAnswer: 0,
                  difficulty: 'medium',
                },
                {
                  question: 'How can you simplify the fraction 36/48 using the GCD?',
                  choices: [
                    '9/12',
                    '12/18',
                    '3/4',
                    '2/3',
                  ],
                  correctAnswer: 2,
                  difficulty: 'hard',
                },
                {
                  question: 'What is the distributive property of: 7 x (5 + 9)?',
                  choices: [
                    '99',
                    '98',
                    '110',
                    '112',
                  ],
                  correctAnswer: 1,
                  difficulty: 'medium',
                },
                {
                  question: 'Simplify the fraction 42/56 by finding the greatest common divisor (GCD).',
                  choices: [
                    '14/15',
                    '6/8',
                    '3/4',
                    '10/14',
                  ],
                  correctAnswer: 2,
                  difficulty: 'hard',
                },
              ],
            };
            break;
          case 'discussionTopics':
            generatedOutput.input = {
              blooms: {
                remembering: 'Students will be able to recall the basic properties of sound, including pitch, volume, and frequency.',
                understanding: 'Students will be able to explain the meaning of pitch, volume, and frequency and summarize how sound waves are created and travel through different mediums.',
                applying: 'Students will be able to apply their knowledge of sound properties to create different sounds using their voices and various materials.',
                analyzing: 'Students will be able to analyze and interpret the observations they make about the different properties of sound they encounter in their experiments, such as identifying patterns and relationships between pitch, volume, and frequency.',
                evaluating: 'Students will be able to evaluate the effectiveness of their experiments and compare their results to the expected outcomes.',
                creating: 'Students will be able to use their knowledge and skills to design and create their own sound experiments.',
              },
              statedObjectives: 'Students will be able to describe the basic properties of sound, including pitch, volume, and frequency, and identify how sound waves are created and how they travel through different mediums.',
              anticipatorySet: 'Ask students to brainstorm different sources of sound they encounter in their daily lives.',
              directInstructionAndCheckingForUnderstanding: 'Define pitch, volume, and frequency and provide examples to help students understand each property. Quickly assess whether students understand the concepts presented.',
              inputModeling: 'Conduct a demonstration to show how sound waves are created and how they travel through different mediums, such as air and water. Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Instructors could also use a video for this portion.',
              checkingUnderstanding: 'Observe and record students\' observations about the different properties of sound they encounter in their experiments. This portion takes place as students experiment with creating different sounds using their voices and various materials.',
              guidedPractice: 'Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Encourage students to observe and record their observations about the different properties of sound they encounter in their experiments. Provide immediate feedback at individual levels.',
              independentPractice: 'Encourage students to design and create their own sound experiments. Provide immediate feedback at individual levels.',
              commonAreasOfStruggle: 'Students may struggle with understanding the difference between pitch, volume, and frequency, as well as how sound waves travel through different mediums.',
              variedExamples: "Pitch is like the high or low notes on a piano. Volume is like the volume control on a TV or radio, making the sound louder or quieter. Frequency is like the number of waves that pass by in a certain amount of time, similar to the frequency of waves in the ocean. Another analogy for frequency is the number of beats per minute in a song, while pitch can also be compared to the tone of someone's voice or the sound of a bird chirping.",
              closure: 'Ask students to summarize what they learned about the properties of sound and how sound waves are created and travel through different mediums. Review the different experiments students conducted and discuss their observations and findings.',
            };
            // needs to be stored in JSON object opposed to array
            // to be proper JSON returnable by the JSON GraphQL scalar
            generatedOutput.output = {
              output: [
                {
                  topic: 'How might different mediums (air, water, solid objects) affect the way sound waves travel?',
                  question_level: 'Analyzing',
                },
                {
                  topic: 'How does the source of a sound impact its pitch, volume, and frequency?',
                  question_level: 'Understanding',
                },
                {
                  topic: 'Describe real-life scenarios where understanding sound properties can be helpful or important.',
                  question_level: 'Applying',
                },
                {
                  topic: 'What are some ways humans use sound properties (pitch, volume, frequency) in communication and technology? Can you give some examples?',
                  question_level: 'Evaluating',
                },
                {
                  topic: 'How might the temperature or altitude of an environment influence the way sound waves travel? Why?',
                  question_level: 'Analyzing',
                },
                {
                  topic: 'Design an experiment to test the effect of changing volume on how far sound waves travel.',
                  question_level: 'Creating',
                },
                {
                  topic: 'Compare and contrast the way sound travels through air and water. How does this relate to the way animals communicate underwater?',
                  question_level: 'Evaluating',
                },
              ],
            };
            break;
          case 'exitTicket':
            generatedOutput.input = {
              blooms: {
                remembering: 'Students will be able to recall the basic properties of sound, including pitch, volume, and frequency.',
                understanding: 'Students will be able to explain the meaning of pitch, volume, and frequency and summarize how sound waves are created and travel through different mediums.',
                applying: 'Students will be able to apply their knowledge of sound properties to create different sounds using their voices and various materials.',
                analyzing: 'Students will be able to analyze and interpret the observations they make about the different properties of sound they encounter in their experiments, such as identifying patterns and relationships between pitch, volume, and frequency.',
                evaluating: 'Students will be able to evaluate the effectiveness of their experiments and compare their results to the expected outcomes.',
                creating: 'Students will be able to use their knowledge and skills to design and create their own sound experiments.',
              },
              statedObjectives: 'Students will be able to describe the basic properties of sound, including pitch, volume, and frequency, and identify how sound waves are created and how they travel through different mediums.',
              anticipatorySet: 'Ask students to brainstorm different sources of sound they encounter in their daily lives.',
              directInstructionAndCheckingForUnderstanding: 'Define pitch, volume, and frequency and provide examples to help students understand each property. Quickly assess whether students understand the concepts presented.',
              inputModeling: 'Conduct a demonstration to show how sound waves are created and how they travel through different mediums, such as air and water. Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Instructors could also use a video for this portion.',
              checkingUnderstanding: 'Observe and record students\' observations about the different properties of sound they encounter in their experiments. This portion takes place as students experiment with creating different sounds using their voices and various materials.',
              guidedPractice: 'Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Encourage students to observe and record their observations about the different properties of sound they encounter in their experiments. Provide immediate feedback at individual levels.',
              independentPractice: 'Encourage students to design and create their own sound experiments. Provide immediate feedback at individual levels.',
              commonAreasOfStruggle: 'Students may struggle with understanding the difference between pitch, volume, and frequency, as well as how sound waves travel through different mediums.',
              variedExamples: "Pitch is like the high or low notes on a piano. Volume is like the volume control on a TV or radio, making the sound louder or quieter. Frequency is like the number of waves that pass by in a certain amount of time, similar to the frequency of waves in the ocean. Another analogy for frequency is the number of beats per minute in a song, while pitch can also be compared to the tone of someone's voice or the sound of a bird chirping.",
              closure: 'Ask students to summarize what they learned about the properties of sound and how sound waves are created and travel through different mediums. Review the different experiments students conducted and discuss their observations and findings.',
            };
            // should be plain text but also needs to be stored as JSON to be compatible with database.
            // using output as key to store JSON string
            generatedOutput.output = {
              output: `Exit Ticket:

              Please answer the following questions based on today's lesson. Answer in complete sentences and provide specific examples when possible.
              
              Define pitch, volume, and frequency, and provide an example illustrating each concept.
              
              Explain how sound waves are created and describe how they travel through different mediums, such as air and water.
              
              Describe the sound experiment you conducted during today's lesson. What observations did you make about the properties of sound (e.g., pitch, volume, or frequency) during your experiment?
              
              Based on your understanding and observations, how do pitch, volume, and frequency affect how we perceive sound in our daily lives? Provide examples from real-life situations.
              
              If you were to design a sound experiment to further explore the properties of sound, what would it involve and what do you hope to discover?`,
            };
            break;
          case 'activities':
            generatedOutput.input = {
              blooms: {
                remembering: 'Students will be able to recall the basic properties of sound, including pitch, volume, and frequency.',
                understanding: 'Students will be able to explain the meaning of pitch, volume, and frequency and summarize how sound waves are created and travel through different mediums.',
                applying: 'Students will be able to apply their knowledge of sound properties to create different sounds using their voices and various materials.',
                analyzing: 'Students will be able to analyze and interpret the observations they make about the different properties of sound they encounter in their experiments, such as identifying patterns and relationships between pitch, volume, and frequency.',
                evaluating: 'Students will be able to evaluate the effectiveness of their experiments and compare their results to the expected outcomes.',
                creating: 'Students will be able to use their knowledge and skills to design and create their own sound experiments.',
              },
              statedObjectives: 'Students will be able to describe the basic properties of sound, including pitch, volume, and frequency, and identify how sound waves are created and how they travel through different mediums.',
              anticipatorySet: 'Ask students to brainstorm different sources of sound they encounter in their daily lives.',
              directInstructionAndCheckingForUnderstanding: 'Define pitch, volume, and frequency and provide examples to help students understand each property. Quickly assess whether students understand the concepts presented.',
              inputModeling: 'Conduct a demonstration to show how sound waves are created and how they travel through different mediums, such as air and water. Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Instructors could also use a video for this portion.',
              checkingUnderstanding: 'Observe and record students\' observations about the different properties of sound they encounter in their experiments. This portion takes place as students experiment with creating different sounds using their voices and various materials.',
              guidedPractice: 'Provide opportunities for students to experiment with creating different sounds using their voices and various materials. Encourage students to observe and record their observations about the different properties of sound they encounter in their experiments. Provide immediate feedback at individual levels.',
              independentPractice: 'Encourage students to design and create their own sound experiments. Provide immediate feedback at individual levels.',
              commonAreasOfStruggle: 'Students may struggle with understanding the difference between pitch, volume, and frequency, as well as how sound waves travel through different mediums.',
              variedExamples: "Pitch is like the high or low notes on a piano. Volume is like the volume control on a TV or radio, making the sound louder or quieter. Frequency is like the number of waves that pass by in a certain amount of time, similar to the frequency of waves in the ocean. Another analogy for frequency is the number of beats per minute in a song, while pitch can also be compared to the tone of someone's voice or the sound of a bird chirping.",
              closure: 'Ask students to summarize what they learned about the properties of sound and how sound waves are created and travel through different mediums. Review the different experiments students conducted and discuss their observations and findings.',
            };
            // should be plain text but also needs to be stored as JSON to be compatible with database.
            // using output as key to store JSON string
            generatedOutput.output = {
              output: `Activity: Sound Wave Stations

Objective: Students will apply their knowledge of sound properties to explore different types of sound through hands-on activities.

Materials:
- Plastic cups with different amounts of water
- Straws or pencils
- Rulers
- Desktop cymbals or small pan lids
- Balloons filled with air
- Tuning forks of different pitches
- Rubber bands of various sizes
- Notebooks or worksheets for recording observations

Instructions:

1. Divide the class into small groups (3 to 4 students per group).

2. Set up sound wave stations around the classroom, each with one of the following activities:
   a. Water Glasses: Students gently tap plastic cups filled with various amounts of water using straws or pencils, observing how pitch changes with the amount of water in the cups.
   b. Vibrating Rulers: Students press a ruler against the edge of a desk or table with varying amounts of the ruler hanging off the edge, and then gently pluck or flick the ruler to observe how the pitch changes.
   c. Cymbals: Students gently tap two cymbals or pan lids together, noting the volume and frequency of the sound produced.
   d. Balloon Vibrations: Students hold a balloon to their face and tap their finger on it, feeling the vibrations from the sound waves.
   e. Tuning Forks: Students strike various tuning forks on a surface and hold them close to their ears, comparing the pitch of each.
   f. Rubber Band Guitars: Students stretch rubber bands of various sizes over a shoebox and pluck each band to observe the pitch, volume, and frequency produced.

3. Students spend equal time at each station, taking turns and recording their observations about pitch, volume and frequency in their notebooks or on worksheets.

4. After completing each station, students reassemble into their groups to share and analyze their findings, identifying patterns and relationships between pitch, volume, and frequency.

5. Students present their group findings to the class, discussing how each material or method affected sound properties in their experiments.

Follow-up Projects/Extensions:
1. Design a sound wave experiment: Students work in pairs or small groups to come up with their own experiments to explore sound properties, using the knowledge and skills gained from the sound wave stations. Have them present their experiment ideas and expected results to the class.
2. Create sound wave art: Have students use their creativity to draw or paint art representing sound waves, incorporating their understanding of pitch, volume and frequency.
3. Sound scavenger hunt: Have students listen for sounds in their everyday environment, noting the different properties of the sounds. They can then share their findings with the class and discuss how the properties of the sounds relate to the sources that produced them.`,
            };
            break;
        }

        generatedOutputs[i] = generatedOutput;
      }
      return generatedOutputs;
    },
    generatedPrompt: (numToGenerate: number): GeneratedPromptWithoutId[] => {
      const generatedPrompts: GeneratedPromptWithoutId[] = Array(numToGenerate);
      for (let i = 0; i < numToGenerate; i++) {
        const generatedPrompt: GeneratedPromptWithoutId = {
          title: faker.lorem.words(3),
          content: faker.lorem.sentences(2),
          observation_id: randomNumber(1, amountToGenerate.observations),
        };
        generatedPrompts[i] = generatedPrompt;
      }
      return generatedPrompts;
    },
    videoNote: (numToGenerate: number): VideoNoteWithoutId[] => {
      const videoNotes: VideoNoteWithoutId[] = Array(numToGenerate);
      for (let i = 0; i < numToGenerate; i++) {
        const videoNote: VideoNoteWithoutId = {
          content: faker.lorem.sentences(2),
          timestamp: randomNumber(1, 100),
          observation_id: randomNumber(1, amountToGenerate.observations),
        };
        videoNotes[i] = videoNote;
      }
      return videoNotes;
    },
    focusAreaNotes: (numToGenerate: number, focusAreasLength: number): FocusAreaNoteWithoutId[] => {
      const focusAreaNotes: FocusAreaNoteWithoutId[] = Array(numToGenerate);
      const type = ['generated', 'user'];
      for (let i = 0; i < numToGenerate; i++) {
        const focusAreaNote: FocusAreaNoteWithoutId = {
          focusArea_id: randomNumber(1, focusAreasLength),
          type: type[
            Math.floor(Math.random() * type.length)
          ] as FocusAreaNoteType,
          content: faker.lorem.sentences(2),
        };
        focusAreaNotes[i] = focusAreaNote;
      }
      return focusAreaNotes;
    },
    organizations: (
      organizationsToCreate: Organization[],
      propelAuthOrganizationIdArr: PropelAuthOrg[],
    ): Organization[] => {
      const organizations = Array(organizationsToCreate.length);
      for (let i = 0; i < organizationsToCreate.length; i++) {
        // add propelauth_id to organization
        const organization = organizationsToCreate[i];
        organization.name = faker.company.name();
        organization.propelauth_id = propelAuthOrganizationIdArr[i].orgId;
        organizations[i] = organization;
      }
      return organizations;
    },
  };
}

function userIds(teachers: TeacherUser[]): [number, number[]] {
  const numOfCollaborators = randomNumber(0, 5);
  const teacher = randomIndex(teachers).id;
  const collaborators = uniqueRandomNumbers(numOfCollaborators, 1, amountToGenerate.users);

  const indexOfMatch = collaborators.indexOf(teacher);
  if (indexOfMatch !== 0) collaborators.splice(indexOfMatch, 1);
  return [teacher, collaborators];
}
