export type InteractionLoopStep = 1 | 2 | 3 | 4;

export type SpecificOutputType =
  | 'letter_draft'
  | 'school_policy_resources'
  | 'organized_feedback'
  | 'studio_critique_protocol';

export type ProfessorArchetype =
  | 'direct_systems' // e.g. Hugh Dubberly: systems clarity, timelines, team accountability, zero fluff
  | 'formal_traditional' // Traditional etiquette, academic hierarchy, polite deference
  | 'busy_concise' // Ultra-busy: upfront ask, bullet points, under 100 words
  | 'warm_supportive' // Student-centered, values reflection and learning journey
  | 'research_pi'; // Lab PI: technical competence, research interest, availability

export type StudentUseCaseType =
  | 'sickness_absence' // Medical illness, health center documentation, studio continuity
  | 'deadline_extension' // Unforeseen delay, project extension, proposed milestone
  | 'grade_inquiry' // Respectful rubric question, understanding evaluation
  | 'recommendation_letter' // Graduate school, fellowship, internship letter
  | 'research_opportunity' // Cold inquiry for lab RA or project position
  | 'office_hours_meeting' // 1-on-1 appointment scheduling or discussion
  | 'concept_clarification' // Difficult lecture topic or assignment question
  | 'follow_up_nudge' // Polite nudge after 3-5 business days of silence
  | 'late_submission_apology' // Taking ownership of late deliverable
  | 'prereq_override'; // Course waitlist, capacity waiver, prerequisite exception

export interface PeerConsultationInput {
  professorName: string;
  courseCode: string;
  professorStyle: ProfessorArchetype;
  useCase: StudentUseCaseType;
  initialAsk: string;
  specificOutput: SpecificOutputType;
  additionalInformation: string;
}

export interface PeerMessage {
  id: string;
  sender: 'user' | 'peer';
  text: string; // Must be a single short paragraph, no name address, casual conversational, "I think"/"I would"/"I know"
  step: InteractionLoopStep;
  timestamp: number;
}

export interface LetterDraftPayload {
  subject: string;
  body: string;
  recipient: string;
  noteOnTone: string;
}

export interface OrganizedFeedbackOutput {
  initialRecommendation: string;
  letterDraftToHugh: LetterDraftPayload; // Kept for compatibility
  letterDraft?: LetterDraftPayload;
  berkeleyPolicyAndResources: {
    tangCenterGuidelines: string;
    mdesStudioAttendance: string;
    studioPartnerCoordination: string;
    dspAndDeanNotice: string;
  };
  policyGuidelines?: {
    primaryPolicy: string;
    academicProcedure: string;
    documentationRequirement: string;
    communicationWindow: string;
  };
  alternativeOptions: string[];
}

export type ScenarioType =
  | 'deadline_extension'
  | 'grade_inquiry'
  | 'absence_notice'
  | 'recommendation_letter'
  | 'research_opportunity'
  | 'office_hours'
  | 'concept_clarification'
  | 'follow_up'
  | 'apology_emergency'
  | 'custom';

export type ToneType =
  | 'formal'
  | 'concise'
  | 'warm'
  | 'apologetic'
  | 'confident';

export interface StudentProfile {
  studentName: string;
  studentId: string;
  majorYear?: string;
}

export interface CourseDetails {
  professorTitle: 'Prof.' | 'Dr.' | 'Instructor';
  professorLastName: string;
  courseCode: string;
  courseSection: string;
}

export interface ScenarioSpecificData {
  assignmentName?: string;
  originalDueDate?: string;
  proposedDueDate?: string;
  reasonCategory?: string;
  reasonDetail?: string;
  examOrPaperName?: string;
  specificRubricQuestion?: string;
  preparationEffort?: string;
  absenceDate?: string;
  absenceReason?: string;
  planForCatchingUp?: string;
  programOrJobTitle?: string;
  institutionOrCompany?: string;
  deadlineDate?: string;
  pastProjectHighlight?: string;
  submissionInstructions?: string;
  labOrPaperTopic?: string;
  studentRelevantSkills?: string;
  weeklyHoursAvailable?: string;
  topicsToDiscuss?: string;
  studentAvailability?: string;
  previousEmailTopic?: string;
  daysSinceSent?: string;
  customNotes?: string;
}

export interface GeneratedLetter {
  subjectLines: string[];
  selectedSubjectIndex: number;
  greeting: string;
  body: string;
  signoff: string;
  etiquetteTips: string[];
  checklist: {
    label: string;
    passed: boolean;
    explanation: string;
  }[];
}

export interface SavedDraft {
  id: string;
  scenario: ScenarioType;
  title: string;
  subject: string;
  body: string;
  professorName: string;
  courseCode: string;
  createdAt: number;
  updatedAt: number;
}
