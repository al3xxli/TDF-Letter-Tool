export interface EtiquetteRule {
  id: string;
  category: 'Do' | 'Don’t' | 'Pro Tip';
  title: string;
  description: string;
  example: string;
}

export const ETIQUETTE_RULES: EtiquetteRule[] = [
  {
    id: 'salutation',
    category: 'Do',
    title: 'Default to "Dear Professor [Last Name]" or "Dear Dr. [Last Name]"',
    description: 'Unless the instructor explicitly instructed you to use their first name, always use "Dear Professor" or "Dear Dr.". Avoid "Hey Professor", "Mr.", "Mrs.", or "Hi there".',
    example: 'Good: "Dear Dr. Martinez," | Avoid: "Hey Dr. Martinez," or "Dear Mrs. Martinez,"'
  },
  {
    id: 'subject_tag',
    category: 'Do',
    title: 'Always bracket your course code in the subject line',
    description: 'Professors teach multiple classes with hundreds of students. An email without a course code gets delayed because they must search their roster.',
    example: 'Good: "[BIOL 101] Midterm 2 Question - Alex Li" | Avoid: "Question about test"'
  },
  {
    id: 'syllabus_first',
    category: 'Pro Tip',
    title: 'Check the syllabus before asking policy questions',
    description: 'Many questions regarding exam dates, grading scale, late policies, and office hour locations are explicitly detailed in the syllabus. Mentioning you already checked builds great goodwill.',
    example: '"I reviewed our course syllabus regarding the late policy, and wanted to clarify..."'
  },
  {
    id: 'the_ask',
    category: 'Do',
    title: 'State your specific request clearly by the 2nd sentence',
    description: 'Avoid long narrative preambles. Busy instructors read emails between lectures or on their phones. State what you need, why, and what action is required.',
    example: '"I am writing to inquire if it might be possible to schedule a 10-minute meeting this Thursday."'
  },
  {
    id: 'avoid_missed_anything',
    category: 'Don’t',
    title: 'Never ask "Did I miss anything important?"',
    description: 'This phrase implies that some class sessions are unimportant or worthless to attend. Instead, state that you got notes from a peer and ask specific follow-ups.',
    example: 'Good: "I reviewed notes from a classmate regarding today\'s lecture on mitosis..." | Avoid: "Did I miss anything important today?"'
  },
  {
    id: 'proposed_times',
    category: 'Do',
    title: 'Always provide 2 to 3 concrete time options for meetings',
    description: 'Avoid open-ended back-and-forth like "When are you free?". Suggest specific days, windows of availability, or confirm you will attend their posted office hours.',
    example: '"I am available Tuesday between 2:00-4:00 PM or Wednesday after 1:00 PM."'
  },
  {
    id: 'grade_etiquette',
    category: 'Don’t',
    title: 'Don’t negotiate or demand points via email',
    description: 'Email is great for scheduling a time to review feedback, but poor for arguing over grade cutoffs. Express a desire to learn from mistakes and improve on future assignments.',
    example: 'Good: "I would love to understand the feedback on question 4 to prepare for the final." | Avoid: "Why did you dock me 5 points? That\'s unfair."'
  },
  {
    id: 'student_details',
    category: 'Do',
    title: 'Include your Full Name and Student ID in the sign-off',
    description: 'Universities often have multiple students with similar names. Your Student ID allows the professor or TA to pull up your records immediately without friction.',
    example: 'Sincerely,\nAlex Li\nStudent ID: #9842109\nSophomore, Cognitive Science'
  }
];
