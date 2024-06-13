export const titles = [
  '1a: Demonstrating Knowledge of Content and Pedagogy',
  '1b: Demonstrating Knowledge of Students',
  '1c: Setting Instructional Outcomes',
  '1d: Demonstrating Knowledge of Resources',
  '1e: Designing Coherent Instruction',
];

export const scores: Array<Record<string, string>> = [
  {
    unsatisfactory:
      'In planning and practice, the teacher makes content errors or does not correct errors made by students. The teacher displays little understanding of prerequisite knowledge important to student learning of the content. The teacher displays little or no understanding of the range of pedagogical approaches suitable to student learning of the content.',
    basic:
      'The teacher is familiar with the important concepts in the discipline but displays a lack of awareness of how these concepts relate to one another. The teacher indicates some awareness of prerequisite learning, although such knowledge may be inaccurate or incomplete. The teacher’s plans and practice reflect a limited range of pedagogical approaches to the discipline or to the students.',
    proficient:
      'The teacher displays solid knowledge of the important concepts in the discipline and how these relate to one another. The teacher demonstrates accurate understanding of prerequisite relationships among topics. The teacher’s plans and practice reflect familiarity with a wide range of effective pedagogical approaches in the subject.',
    distinguished:
      'The teacher displays extensive knowledge of the important concepts in the discipline and how these relate both to one another and to other disciplines. The teacher demonstrates understanding of prerequisite relationships among topics and concepts and understands the link to necessary cognitive structures that ensure student understanding. The teacher’s plans and practice reflect familiarity with a wide range of effective pedagogical approaches in the discipline and the ability to anticipate student misconceptions.',
  },
  {
    unsatisfactory:
      'The teacher displays minimal understanding of how students learn—and little knowledge of their varied approaches to learning, knowledge and skills, special needs, and interests and cultural heritages—and does not indicate that such knowledge is valuable.',
    basic:
      'The teacher displays generally accurate knowledge of how students learn and of their varied approaches to learning, knowledge and skills, special needs, and interests and cultural heritages, yet may apply this knowledge not to individual students but to the class as a whole.',
    proficient:
      'The teacher understands the active nature of student learning and attains information about levels of development for groups of students. The teacher also purposefully acquires knowledge from several sources about groups of students’ varied approaches to learning, knowledge and skills, special needs, and interests and cultural heritages.',
    distinguished:
      'The teacher understands the active nature of student learning and acquires information about levels of development for individual students. The teacher also systematically acquires knowledge from several sources about individual students’ varied approaches to learning, knowledge and skills, special needs, and interests and cultural heritages.',
  },
  {
    unsatisfactory:
      'The outcomes represent low expectations for students and lack of rigor, and not all of these outcomes reflect important learning in the discipline. They are stated as \nstudent activities, rather than as outcomes for learning. Outcomes reflect only one type of learning and only one discipline or strand and are suitable for only some students.',
    basic:
      'Outcomes represent moderately high expectations and rigor. Some reflect important learning in the discipline and consist of a combination of outcomes and activities. Outcomes reflect several types of learning, but teacher has made no effort at coordination or integration. Outcomes, based on global assessments of student learning, are suitable for most of the students in the class.',
    proficient:
      'Most outcomes represent rigorous and important learning in the discipline and are clear, are written in the form of student learning, and suggest viable methods of assessment. Outcomes reflect several different types of learning and opportunities for coordination, and they are differentiated, in whatever way is needed, for different groups of students.',
    distinguished:
      'All outcomes represent high-level learning in the discipline. They are clear, are written in the form of student learning, and permit viable methods of assessment. Outcomes reflect several different types of learning and, where appropriate, represent both coordination and integration. Outcomes are differentiated, in whatever way is needed, for individual students.',
  },
  {
    unsatisfactory:
      'The teacher is unaware of resources to assist student learning beyond materials provided by the school or district, nor is the teacher aware of resources for expanding one’s own professional skill.',
    basic:
      'The teacher displays some awareness of resources beyond those provided by the school or district for classroom use and for extending one’s professional skill but does not seek to expand this knowledge.',
    proficient:
      'The teacher displays awareness of resources beyond those provided by the school or district, including those on the Internet, for classroom use and for extending one’s professional skill, and seeks out such resources.',
    distinguished:
      'The teacher’s knowledge of resources for classroom use and for extending one’s professional skill is extensive, including those available through the school or district, in the community, through professional organizations and universities, and on the Internet.',
  },
  {
    unsatisfactory:
      'Learning activities are poorly aligned with the instructional outcomes, do not follow an organized progression, are not designed to engage students in active intellectual activity, and have unrealistic time allocations. Instructional groups are not suitable to the activities and offer no variety.',
    basic:
      'Some of the learning activities and materials are aligned with the instructional outcomes and represent moderate cognitive challenge, but with no differentiation for different students. Instructional groups partially support the activities, with some variety. The lesson or unit has a recognizable structure; but the progression of activities is uneven, with only some reasonable time allocations.',
    proficient:
      'Most of the learning activities are aligned with the instructional outcomes and follow an organized progression suitable to groups of students. The learning activities have reasonable time allocations; they represent significant cognitive challenge, with some differentiation for different groups of students and varied use of instructional groups.',
    distinguished:
      'The sequence of learning activities follows a coherent sequence, is aligned to instructional goals, and is designed to engage students in high-level cognitive activity. These are appropriately differentiated for individual learners. Instructional groups are varied appropriately, with some opportunity for student choice.',
  },
];

type Rubric = {
  name: string;
  description: string;
  getFocusAreaTitle?: (title: string) => string;
};

export const rubricDictionary: Record<string, Rubric> = {
  base: {
    name: 'Base Rubric',
    description:
      'This is a default base rubric. Fill it in with Focus Areas to assess instruction!',
  },
  corporate: {
    name: 'Corporate Training Rubric',
    description:
      "This is the default corporate training rubric, based on Danielson's Framework.",
    getFocusAreaTitle: (title: string) => title.split(': ')[1],
  },
  danielsons: {
    name: 'Danielson’s Rubric',
    description:
      'Danielson divides the complex activity of teaching into twenty-two components clustered into four domains of teaching responsibility: (1) planning and preparation, (2) the classroom environment, (3) instruction, and (4) professional responsibilities.',
    getFocusAreaTitle: (title: string) => title,
  },
};
