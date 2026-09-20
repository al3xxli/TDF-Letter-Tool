import { ScenarioType, ToneType, CourseDetails, StudentProfile, ScenarioSpecificData, GeneratedLetter } from '../types';

export interface ScenarioDefinition {
  id: ScenarioType;
  title: string;
  shortDesc: string;
  category: 'Deadlines & Grades' | 'Attendance & Class' | 'Opportunities & Career' | 'General';
  iconName: string;
  recommendedTone: ToneType;
  defaultPromptHelp: string;
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'deadline_extension',
    title: 'Deadline Extension Request',
    shortDesc: 'Ask respectfully for extra time on a paper or project before it is due.',
    category: 'Deadlines & Grades',
    iconName: 'ClockAlert',
    recommendedTone: 'formal',
    defaultPromptHelp: 'Explain your timeline, take accountability, and propose an exact new date.',
  },
  {
    id: 'grade_inquiry',
    title: 'Grade / Feedback Clarification',
    shortDesc: 'Inquire about assignment grading respectfully to understand how to improve.',
    category: 'Deadlines & Grades',
    iconName: 'HelpCircle',
    recommendedTone: 'formal',
    defaultPromptHelp: 'Focus on understanding rubrics and pedagogical feedback, never argue or demand points.',
  },
  {
    id: 'absence_notice',
    title: 'Class Absence Notice',
    shortDesc: 'Inform the professor in advance of an unavoidable missed lecture or lab.',
    category: 'Attendance & Class',
    iconName: 'CalendarX',
    recommendedTone: 'concise',
    defaultPromptHelp: 'State the date, take responsibility for getting notes from peers, and ask relevant questions.',
  },
  {
    id: 'office_hours',
    title: 'Office Hours Appointment',
    shortDesc: 'Schedule a 1-on-1 meeting or confirm office hours attendance.',
    category: 'Attendance & Class',
    iconName: 'CalendarCheck',
    recommendedTone: 'concise',
    defaultPromptHelp: 'State your specific questions in advance and propose 2-3 precise time blocks.',
  },
  {
    id: 'concept_clarification',
    title: 'Course Concept Question',
    shortDesc: 'Ask a specific question about lecture material or reading.',
    category: 'Attendance & Class',
    iconName: 'BookOpen',
    recommendedTone: 'warm',
    defaultPromptHelp: 'Demonstrate the effort you have already made to solve or research the problem.',
  },
  {
    id: 'recommendation_letter',
    title: 'Letter of Recommendation',
    shortDesc: 'Request an academic reference for grad school, internship, or scholarship.',
    category: 'Opportunities & Career',
    iconName: 'Award',
    recommendedTone: 'confident',
    defaultPromptHelp: 'Give 4-6 weeks advance notice, specify the opportunity, and offer resume/statement.',
  },
  {
    id: 'research_opportunity',
    title: 'Research / Lab Inquiry',
    shortDesc: 'Reach out to a faculty member about joining their lab or assisting a project.',
    category: 'Opportunities & Career',
    iconName: 'FlaskConical',
    recommendedTone: 'confident',
    defaultPromptHelp: 'Reference a specific paper of theirs, state your skills, and keep it under 200 words.',
  },
  {
    id: 'follow_up',
    title: 'Polite Email Follow-Up',
    shortDesc: 'Gently follow up on a previous email that hasn’t received a response after 4-7 days.',
    category: 'General',
    iconName: 'RefreshCw',
    recommendedTone: 'concise',
    defaultPromptHelp: 'Remain polite, acknowledge their busy schedule, and briefly restate the core question.',
  },
  {
    id: 'apology_emergency',
    title: 'Missing Work / Emergency',
    shortDesc: 'Explain an urgent personal or health emergency causing missed academic milestones.',
    category: 'General',
    iconName: 'AlertTriangle',
    recommendedTone: 'apologetic',
    defaultPromptHelp: 'Keep personal details respectful, share documentation readiness, and ask for next steps.',
  },
  {
    id: 'custom',
    title: 'Custom Academic Message',
    shortDesc: 'Draft any unique communication tailored to your specific professor and situation.',
    category: 'General',
    iconName: 'PenTool',
    recommendedTone: 'formal',
    defaultPromptHelp: 'Provide key context, the specific request, and any relevant dates.',
  },
];

export function buildFallbackLetter(
  scenario: ScenarioType,
  course: CourseDetails,
  student: StudentProfile,
  data: ScenarioSpecificData,
  tone: ToneType
): GeneratedLetter {
  const profName = `${course.professorTitle} ${course.professorLastName || '[Professor Last Name]'}`;
  const courseTag = course.courseCode ? `[${course.courseCode}]` : '[Course Code]';
  const studentName = student.studentName || '[Your Full Name]';
  const studentIdStr = student.studentId ? `\nStudent ID: ${student.studentId}` : '';
  const majorStr = student.majorYear ? `\n${student.majorYear}` : '';

  let subjectLines: string[] = [];
  let body = '';
  let etiquetteTips: string[] = [];

  switch (scenario) {
    case 'deadline_extension': {
      const assignment = data.assignmentName || 'Assignment 3';
      const origDate = data.originalDueDate || 'this Friday';
      const newDate = data.proposedDueDate || 'next Monday at 5:00 PM';
      const reason = data.reasonDetail || 'due to an unexpected illness / personal circumstance';

      subjectLines = [
        `${courseTag} Extension Request: ${assignment} - ${studentName}`,
        `${courseTag} Question regarding deadline for ${assignment} (${studentName})`,
        `${courseTag} Inquiring about a brief extension on ${assignment}`
      ];

      body = `I hope your week is going well.

I am writing to respectfully request a short extension on ${assignment}, which is currently scheduled to be due on ${origDate}.

Unfortunately, ${reason}, which has disrupted my ability to finish the assignment to the standard I aim for in your course. I have completed the preliminary research and outline, and I am working diligently to finalize it.

Would it be possible to submit my completed work by ${newDate}? I completely understand and respect your course policies regarding deadlines, and I would be deeply grateful for any flexibility you can grant.

Thank you very much for your time, consideration, and guidance.`;
      
      etiquetteTips = [
        'Always provide a concrete proposed submission date rather than an open-ended "whenever possible".',
        'Request the extension as early as possible before the deadline—professors rarely grant extensions requested 1 hour before.',
        'Acknowledge course policies politely without demanding special treatment.'
      ];
      break;
    }

    case 'grade_inquiry': {
      const assignment = data.examOrPaperName || 'the recent midterm / paper';
      const question = data.specificRubricQuestion || 'the specific areas where I lost marks in the analysis section';

      subjectLines = [
        `${courseTag} Feedback Clarification on ${assignment} - ${studentName}`,
        `${courseTag} Request for Rubric Discussion: ${assignment} (${studentName})`,
        `${courseTag} Office Hours Follow-Up regarding ${assignment}`
      ];

      body = `I hope you are having a pleasant week.

I am writing to inquire about the feedback and grading on ${assignment}, which was recently returned. I carefully reviewed your notes alongside the grading rubric to identify where I can improve.

I would appreciate the opportunity to gain a clearer understanding of ${question}, so that I can better apply these principles to our upcoming coursework.

Could I meet with you briefly during your office hours, or schedule a 10-minute appointment if that works better for your schedule? I have prepared specific questions in advance to keep our meeting focused and respectful of your time.

Thank you for your valuable feedback and support throughout the semester.`;

      etiquetteTips = [
        'Frame your request around learning and skill improvement, never "You took off points unfairly".',
        'Reference specific rubric criteria rather than general dissatisfaction.',
        'Respect the 24-hour rule: wait at least a full day after receiving a grade before sending an inquiry.'
      ];
      break;
    }

    case 'absence_notice': {
      const date = data.absenceDate || 'tomorrow\'s class';
      const reason = data.absenceReason || 'an unavoidable illness / medical appointment';
      const plan = data.planForCatchingUp || 'I have already arranged to borrow notes from a classmate and review the lecture slides on Canvas.';

      subjectLines = [
        `${courseTag} Absence Notice: ${date} - ${studentName}`,
        `${courseTag} Notification of Absence on ${date} (${studentName})`,
        `${courseTag} Class Absence - ${studentName}`
      ];

      body = `I hope you are having a good week.

I am writing to let you know in advance that I will unfortunately be unable to attend our class session on ${date} due to ${reason}.

To ensure I do not fall behind, ${plan} I will also complete the assigned readings prior to our subsequent session.

Please let me know if there are any specific announcements or materials I should complete. Thank you for your understanding.`;

      etiquetteTips = [
        'Never ask "Did I miss anything important?" (professors consider all lectures important!).',
        'Explicitly state what steps you are taking to get notes from peers first.',
        'Keep the medical/personal reason concise—professors do not need graphic personal details.'
      ];
      break;
    }

    case 'recommendation_letter': {
      const opp = data.programOrJobTitle || 'Graduate Program in Computer Science';
      const inst = data.institutionOrCompany || 'University Admissions';
      const deadline = data.deadlineDate || 'in 4 weeks (December 1st)';
      const project = data.pastProjectHighlight || 'the final research project in your class';

      subjectLines = [
        `${courseTag} Letter of Recommendation Request - ${studentName}`,
        `Recommendation Letter Request for ${opp} - ${studentName} (${course.courseCode || 'Former Student'})`,
        `${courseTag} Inquiring about a Reference Letter - ${studentName}`
      ];

      body = `I hope you are having a wonderful semester.

I am writing to ask if you would be willing to write a letter of recommendation on my behalf for my application to the ${opp} at ${inst}. The deadline for submission is ${deadline}.

I thoroughly enjoyed taking ${course.courseCode || 'your course'}, particularly working on ${project}. Your course was pivotal in shaping my academic direction and interest in this field.

I have attached my updated CV, transcript, and draft statement of purpose for your reference. If you agree, I would also be glad to share bullet points highlighting key milestones and specific prompt criteria.

I completely understand if your current commitments prevent you from taking this on. Thank you so much for your time, mentorship, and consideration.`;

      etiquetteTips = [
        'Give at least 3-4 weeks notice before the deadline.',
        'Always provide a polite "out" in case the professor is at capacity.',
        'Attach your CV, unofficial transcript, and draft statement of purpose upfront.'
      ];
      break;
    }

    case 'research_opportunity': {
      const topic = data.labOrPaperTopic || 'your recent paper on distributed algorithms';
      const skills = data.studentRelevantSkills || 'Python, data visualization, and statistical modeling';
      const hours = data.weeklyHoursAvailable || '8-10 hours';

      subjectLines = [
        `Undergraduate Research Inquiry: Interest in your lab - ${studentName}`,
        `Interest in Research Opportunities in ${course.courseCode || 'your group'} - ${studentName}`,
        `Research Inquiry regarding ${topic} - ${studentName}`
      ];

      body = `I hope this email finds you well.

My name is ${studentName}, and I am a student interested in your work on ${topic}. I recently read your publication regarding this subject and was especially intrigued by your methodological approach.

I am writing to inquire if you have any undergraduate research openings or assistantships in your research group in the coming term. I have coursework background in this domain, alongside hands-on experience in ${skills}. I would be eager to contribute ${hours} per week to support ongoing lab tasks.

I have attached my resume and academic transcript. If you have 10-15 minutes available this or next week, I would be grateful for the chance to introduce myself and learn more about your group's upcoming work.

Thank you very much for your time and research leadership.`;

      etiquetteTips = [
        'Cite a specific article or project from their lab to show genuine reading, not generic spam.',
        'Highlight your concrete technical skills and weekly time commitment.',
        'Attach your resume as a standard PDF.'
      ];
      break;
    }

    case 'office_hours': {
      const topic = data.topicsToDiscuss || 'clarification on the problem set 2 proofs';
      const availability = data.studentAvailability || 'Tuesdays between 2:00 PM - 4:00 PM or Thursdays after 3:00 PM';

      subjectLines = [
        `${courseTag} Office Hours Meeting Request - ${studentName}`,
        `${courseTag} Inquiring about meeting time regarding ${topic} (${studentName})`,
        `${courseTag} Quick appointment request - ${studentName}`
      ];

      body = `I hope you are having a productive week.

I am writing to request a brief meeting during your office hours to discuss ${topic}. I reviewed the assigned readings and attempted the practice problems, but I would value your guidance on a few specific questions before moving forward.

I see on the syllabus that your regular office hours are scheduled for this week. If that time slot is open, I plan to attend. Alternatively, if that time is full, I am available ${availability}.

Thank you for your time, and I look forward to speaking with you.`;

      etiquetteTips = [
        'Check the syllabus first to see when standard office hours are held before asking for an alternate slot.',
        'Give 2-3 specific time windows rather than asking "When are you free?".',
        'State your specific discussion topic so the professor can prepare.'
      ];
      break;
    }

    default: {
      const notes = data.customNotes || 'following up on course material';
      subjectLines = [
        `${courseTag} Question from student: ${studentName}`,
        `${courseTag} Correspondence regarding ${course.courseCode || 'coursework'} - ${studentName}`,
        `${courseTag} Inquiring about ${notes.slice(0, 30)} - ${studentName}`
      ];

      body = `I hope you are having a good week.

I am a student in your ${course.courseCode || 'course'} (Section ${course.courseSection || '01'}). I am writing regarding ${notes}.

I have reviewed the syllabus and course announcements, and wanted to reach out to ensure I am proceeding with the correct expectations.

Thank you very much for your guidance and support.`;

      etiquetteTips = [
        'Always include course code and section in both the subject and opening paragraph.',
        'Keep the message focused on a single clear request or question.'
      ];
      break;
    }
  }

  const signoff = `Sincerely,\n${studentName}${studentIdStr}${majorStr}`;

  return {
    subjectLines,
    selectedSubjectIndex: 0,
    greeting: `Dear ${profName},`,
    body,
    signoff,
    etiquetteTips,
    checklist: [
      {
        label: 'Professional Salutation',
        passed: Boolean(course.professorLastName),
        explanation: 'Uses formal academic honorific (Dr./Professor) and last name.'
      },
      {
        label: 'Clear Course Identification',
        passed: Boolean(course.courseCode),
        explanation: 'Includes course code in subject line and body so the professor immediately knows your class.'
      },
      {
        label: 'Direct & Actionable Ask',
        passed: true,
        explanation: 'Clearly states the purpose and proposed next step in the first 2 paragraphs.'
      },
      {
        label: 'Respectful Academic Tone',
        passed: true,
        explanation: 'Polite, respectful of the instructor’s time, and free of informal texting slang.'
      },
      {
        label: 'Complete Student Sign-Off',
        passed: Boolean(student.studentName),
        explanation: 'Includes your full name, student ID, and affiliation for easy verification in the gradebook.'
      }
    ]
  };
}
