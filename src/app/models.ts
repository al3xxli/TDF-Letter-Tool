export type ProfessorCommunicationStyle =
  | 'direct_systems'
  | 'formal_traditional'
  | 'supportive_encouraging'
  | 'brief_busy'
  | 'research_methodological';

export type StudentUseCaseType =
  | 'sickness_absence'
  | 'deadline_extension'
  | 'grade_inquiry'
  | 'recommendation_letter'
  | 'research_opportunity'
  | 'office_hours_meeting'
  | 'follow_up_nudge';

export type SpecificOutputType = 'letter' | 'advice' | 'policy';
export type InteractionLoopStep = 1 | 2 | 3 | 4;

export interface PeerConsultationInput {
  initialAsk: string;
  specificOutput: SpecificOutputType;
  professorStyle: ProfessorCommunicationStyle;
  professorName: string;
  courseCode: string;
  useCase: StudentUseCaseType;
  additionalInformation?: string;
  situationContext?: string;
}

export interface PeerMessage {
  id: string;
  sender: 'peer' | 'student';
  step: InteractionLoopStep;
  text: string;
  timestamp: string;
}

export interface LetterDraft {
  subject: string;
  recipient: string;
  body: string;
  noteOnTone: string;
}

export interface OrganizedFeedbackOutput {
  initialRecommendation: string;
  letterDraftToHugh: LetterDraft;
  letterDraft?: LetterDraft;
  policyGuidelines?: {
    primaryPolicy: string;
    academicProcedure: string;
    documentationRequirement: string;
    communicationWindow: string;
  };
  berkeleyPolicyAndResources: {
    mdesStudioAttendance: string;
    tangCenterGuidelines: string;
    studioPartnerCoordination: string;
    dspAndDeanNotice: string;
  };
  alternativeOptions: string[];
}
