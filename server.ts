import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

function getAcademicFallback(scenario: string, course: any, student: any, data: any) {
  const profName = `${course?.professorTitle || 'Professor'} ${course?.professorLastName || '[Last Name]'}`;
  const courseCode = course?.courseCode || 'Course';
  const studentName = student?.studentName || 'Student';
  const studentId = student?.studentId ? `\nStudent ID: ${student.studentId}` : '';

  let subjectLines = [
    `[${courseCode}] Question regarding coursework - ${studentName}`,
    `[${courseCode}] Inquiry from ${studentName}`,
    `[${courseCode}] Correspondence regarding class - ${studentName}`,
  ];
  let body = `I hope your week is going well.\n\nI am a student in your ${courseCode} course. I am writing to respectfully inquire about our coursework and ensure I am following appropriate academic expectations.\n\nThank you very much for your time and guidance.`;
  let etiquetteTips = [
    'Always provide a concrete timeline or proposed date.',
    'Keep your email under 150 words for busy faculty.',
  ];

  if (scenario === 'deadline_extension') {
    const assignment = data?.assignmentName || 'the upcoming assignment';
    const origDate = data?.originalDueDate || 'the scheduled date';
    const newDate = data?.proposedDueDate || '48 hours later';
    const reason = data?.reasonDetail || 'unforeseen personal/health circumstances';

    subjectLines = [
      `[${courseCode}] Extension Request: ${assignment} - ${studentName}`,
      `[${courseCode}] Question regarding deadline for ${assignment} (${studentName})`,
      `[${courseCode}] Inquiring about a brief extension on ${assignment}`,
    ];
    body = `I hope your week is going well.\n\nI am writing to respectfully request a short extension on ${assignment}, originally due ${origDate}.\n\nUnfortunately, due to ${reason}, I have experienced an unavoidable delay in completing my submission to the academic standard I strive for. I have already begun the research and outline, and I am working diligently to finish.\n\nWould it be possible to submit my completed work by ${newDate}? I completely understand and respect your syllabus policies, and I would be deeply grateful for any flexibility you can grant.\n\nThank you for your understanding and guidance.`;
    etiquetteTips = [
      'State a specific proposed date and time rather than a vague "as soon as possible".',
      'Reach out as early as possible before the deadline.',
    ];
  } else if (scenario === 'grade_inquiry') {
    const item = data?.examOrPaperName || 'the recent assignment';
    const question = data?.specificRubricQuestion || 'the specific rubric feedback';

    subjectLines = [
      `[${courseCode}] Feedback Clarification: ${item} - ${studentName}`,
      `[${courseCode}] Request for Rubric Discussion on ${item} (${studentName})`,
      `[${courseCode}] Office Hours Follow-Up regarding ${item}`,
    ];
    body = `I hope you are having a pleasant week.\n\nI am writing to respectfully ask for clarification regarding the feedback on ${item}. I carefully reviewed your notes and the grading criteria to see how I can improve.\n\nI would value the opportunity to understand ${question} more deeply so that I can better apply these concepts to future assignments.\n\nCould I briefly meet with you during your office hours, or schedule a 10-minute appointment? I have prepared specific questions to keep our conversation focused.\n\nThank you for your time and feedback throughout the semester.`;
    etiquetteTips = [
      'Frame the inquiry around learning and mastering material, never arguing over points.',
      'Wait at least 24 hours after receiving a grade before sending an email.',
    ];
  } else if (scenario === 'recommendation_letter') {
    const opp = data?.programOrJobTitle || 'an academic fellowship';
    const deadline = data?.deadlineDate || 'in 4 weeks';

    subjectLines = [
      `[${courseCode}] Letter of Recommendation Request - ${studentName}`,
      `Recommendation Letter Request for ${opp} - ${studentName}`,
      `[${courseCode}] Inquiring about an Academic Reference - ${studentName}`,
    ];
    body = `I hope you are having a wonderful semester.\n\nI am writing to inquire if you would feel comfortable writing a letter of recommendation on my behalf for my application to ${opp}. The deadline for submission is ${deadline}.\n\nI greatly valued taking ${courseCode} with you, particularly working on course projects. Your mentorship was instrumental in shaping my academic trajectory in this discipline.\n\nI have attached my updated CV and personal statement for your convenience. If you are willing, I would also be glad to share summary bullet points highlighting key milestones.\n\nI completely understand if your current commitments prevent you from taking this on. Thank you so much for your mentorship and consideration.`;
    etiquetteTips = [
      'Provide at least 3-4 weeks notice before the deadline.',
      'Always offer a polite "out" in case the professor is overburdened.',
    ];
  }

  return {
    subjectLines,
    selectedSubjectIndex: 0,
    greeting: `Dear ${profName},`,
    body,
    signoff: `Sincerely,\n${studentName}${studentId}`,
    etiquetteTips,
    checklist: [
      { label: 'Professional Salutation', passed: true, explanation: 'Uses academic honorific and last name.' },
      { label: 'Course Code in Subject', passed: true, explanation: 'Bracketed course code included for fast indexing.' },
      { label: 'Clear & Direct Request', passed: true, explanation: 'States the specific ask in early paragraphs.' },
      { label: 'Respectful Academic Tone', passed: true, explanation: 'Respects faculty time and syllabus policies.' },
      { label: 'Complete Sign-Off', passed: true, explanation: 'Student name and ID provided.' },
    ],
  };
}

// Generate letter
app.post('/api/generate', async (req, res) => {
  const { scenario, course, student, data, tone, customInstructions } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      letter: getAcademicFallback(scenario, course, student, data),
    });
  }

  const systemPrompt = `You are an expert academic advisor and university communication coach assisting college and graduate students.
Your goal is to compose highly professional, polite, respectful, clear, and context-appropriate emails to professors and instructors.
Academic conventions to enforce:
1. Always start with "Dear [Title] [LastName],"
2. The subject line must be high-clarity and include [Course Code], a concise topic description, and student's full name. Provide 3 distinct variations.
3. The opening sentence should be warm yet professional.
4. State the main reason/ask clearly early on (no burying the lede, but remain respectful).
5. Acknowledge the professor's time and busy schedule.
6. Provide specific actionable timelines or proposed dates when asking for extensions, meetings, or recommendations.
7. Include a proper sign-off: "Sincerely," followed by Student Full Name, Student ID, and Major/Year.
8. Evaluate the draft against standard academic communication checklists.`;

  const userPrompt = `Please draft a student-to-professor email with the following details:
- Scenario Type: ${scenario}
- Professor: ${course?.professorTitle || 'Professor'} ${course?.professorLastName || '[Last Name]'}
- Course Code: ${course?.courseCode || 'Course'}
- Section: ${course?.courseSection || '01'}
- Student Name: ${student?.studentName || 'Student'}
- Student ID: ${student?.studentId || ''}
- Major/Year: ${student?.majorYear || ''}
- Desired Tone: ${tone || 'formal'}
- Specific Details: ${JSON.stringify(data || {})}
${customInstructions ? `- Additional Custom Instructions: ${customInstructions}` : ''}

Generate structured JSON output with:
- subjectLines: Array of 3 academic subject line options
- greeting: The salutation (e.g. "Dear Dr. Smith,")
- body: The full email body paragraphs (do not include the greeting or signoff in body; format paragraphs with standard double linebreaks)
- signoff: The closing (e.g. "Sincerely,\\nAlex Li\\nStudent ID: 12345")
- etiquetteTips: Array of 2-3 specific etiquette tips for this situation
- checklist: Array of 5 checks with { label: string, passed: boolean, explanation: string } for Salutation, Course Code, Clear Ask, Respectful Tone, and Sign-off.`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjectLines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 strong academic subject line variations',
              },
              greeting: {
                type: Type.STRING,
                description: 'The salutation line',
              },
              body: {
                type: Type.STRING,
                description: 'The main letter body paragraphs',
              },
              signoff: {
                type: Type.STRING,
                description: 'The sign-off and student signature details',
              },
              etiquetteTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Helpful etiquette reminders for the student',
              },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    passed: { type: Type.BOOLEAN },
                    explanation: { type: Type.STRING },
                  },
                  required: ['label', 'passed', 'explanation'],
                },
              },
            },
            required: ['subjectLines', 'greeting', 'body', 'signoff', 'checklist'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && parsed.body) {
        return res.json({
          success: true,
          letter: {
            ...parsed,
            selectedSubjectIndex: 0,
          },
        });
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed or busy, trying next...`);
    }
  }

  // Graceful fallback to verified template
  return res.json({
    success: true,
    fallback: true,
    letter: getAcademicFallback(scenario, course, student, data),
  });
});

// Refine/Transform existing letter
app.post('/api/refine', async (req, res) => {
  try {
    const { action, currentBody, currentSubject, course, student } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No Gemini API key, edit locally.',
      });
    }

    let instruction = '';
    switch (action) {
      case 'shorten':
        instruction = 'Make this email significantly shorter and more concise (under 120 words). Keep only the essential academic context and direct ask.';
        break;
      case 'more_formal':
        instruction = 'Elevate the formal academic etiquette of this email. Use distinguished, respectful language suitable for a dean or senior tenure professor.';
        break;
      case 'more_polite':
        instruction = 'Soften the tone to be extra polite, humble, and considerate of the professor\'s busy workload. Ensure zero entitlement.';
        break;
      case 'clearer_ask':
        instruction = 'Sharpen the specific action item / request. Make sure the professor immediately knows what is being requested in a clear, easy-to-answer format.';
        break;
      case 'confident':
        instruction = 'Infuse a confident, articulate, and academically mature tone without being boastful. Ideal for research and recommendation letters.';
        break;
      default:
        instruction = action || 'Polish and improve clarity.';
    }

    const prompt = `You are an academic writing coach. A student has written this email to their professor (${course?.professorTitle || 'Professor'} ${course?.professorLastName || ''}) for course ${course?.courseCode || ''}:

Original Subject: ${currentSubject}
Original Body:
${currentBody}

Task: ${instruction}

Respond with JSON:
- body: The revised email body only (exclude greeting and signoff).
- explanation: A 1-sentence explanation of what changes you made.`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                body: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['body', 'explanation'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed && parsed.body) {
          return res.json({ success: true, ...parsed });
        }
      } catch (e) {
        console.warn(`Refine on ${modelName} encountered error, trying next...`);
      }
    }

    // Smart fallback if AI models are unavailable
    let revised = currentBody;
    let explanation = 'Polished academic text.';
    if (action === 'shorten') {
      const parts = currentBody.split('\n\n');
      revised = parts.filter((_: string, idx: number) => idx !== 1 || parts.length <= 2).join('\n\n');
      explanation = 'Condensed letter length for busy faculty.';
    } else if (action === 'more_formal') {
      revised = currentBody.replace(/can I/gi, 'would it be permissible to').replace(/thanks/gi, 'Thank you for your valuable guidance');
      explanation = 'Adjusted syntax to formal academic tone.';
    } else if (action === 'more_polite') {
      revised = `${currentBody}\n\nI completely understand if your current commitments limit flexibility, and I appreciate your time and consideration.`;
      explanation = 'Enhanced consideration of professor workload.';
    }
    return res.json({ success: true, body: revised, explanation });
  } catch (err: any) {
    console.error('Refine error:', err);
    return res.status(200).json({ fallback: true, error: err?.message });
  }
});

// Critique / Audit student's own draft
app.post('/api/critique', async (req, res) => {
  try {
    const { draftText, subject } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'AI draft critique requires active API key.',
      });
    }

    const prompt = `Analyze this email draft written by a college student to their professor:
Subject: ${subject || '(None provided)'}
Body:
${draftText}

Evaluate this strictly from the perspective of a university faculty member.
Check for:
1. Professional greeting (Is it "Dear Professor..." or an informal "Hey"?)
2. Course identification (Did they mention the course code and section?)
3. Tone and entitlement (Is it polite and appreciative, or demanding?)
4. Specificity of request (Do they propose concrete times/dates, or vague questions?)
5. Readability & brevity (Is it concise or rambling?)
6. Proper sign-off with student ID

Return JSON:
- overallScore: integer from 1 to 100
- etiquetteRating: "Excellent" | "Good" | "Needs Revision" | "Unprofessional"
- strengths: Array of 2-3 positive points
- improvements: Array of 2-3 specific constructive suggestions
- rewrittenVersion: A polished, faculty-friendly rewrite of their exact email preserving their original intent.`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER },
                etiquetteRating: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                rewrittenVersion: { type: Type.STRING },
              },
              required: ['overallScore', 'etiquetteRating', 'strengths', 'improvements', 'rewrittenVersion'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed && parsed.overallScore) {
          return res.json({ success: true, critique: parsed });
        }
      } catch (e) {
        console.warn(`Critique on ${modelName} encountered error, trying next...`);
      }
    }

    // Rule-based fallback audit
    const hasProf = /dr\.|prof/i.test(draftText);
    const hasHey = /^hey/i.test(draftText.trim());
    const hasThanks = /thank/i.test(draftText);
    const words = (draftText || '').trim().split(/\s+/).length;

    let score = 72;
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (hasProf && !hasHey) {
      score += 12;
      strengths.push('Uses academic honorific rather than casual greeting.');
    } else {
      score -= 15;
      improvements.push('Replace informal greeting with "Dear Professor [LastName]," or "Dear Dr. [LastName],".');
    }

    if (hasThanks) {
      score += 8;
      strengths.push('Shows gratitude for the instructor’s time.');
    } else {
      improvements.push('Conclude with a clear expression of thanks acknowledging the professor’s busy schedule.');
    }

    if (words <= 160) {
      strengths.push('Concise length suited for rapid faculty review.');
    } else {
      improvements.push('Consider trimming background details to keep email under 150 words.');
    }

    return res.json({
      success: true,
      critique: {
        overallScore: Math.max(45, Math.min(95, score)),
        etiquetteRating: score >= 80 ? 'Good' : 'Needs Revision',
        strengths: strengths.length ? strengths : ['Clear core intent'],
        improvements: improvements.length ? improvements : ['Add course code in subject line'],
        rewrittenVersion: `Dear Professor,\n\nI hope you are having a pleasant week.\n\n${draftText.replace(/hey\s*prof[a-z]*/i, 'I am writing to inquire regarding our coursework')}\n\nThank you very much for your time, guidance, and consideration.\n\nSincerely,\n[Your Full Name]\n[Student ID]`,
      },
    });
  } catch (err: any) {
    console.error('Critique error:', err);
    return res.status(200).json({ fallback: true, error: err?.message });
  }
});

// ==========================================
// ROLE CARD: PEER CLASSMATE ASSISTANT ENDPOINTS (ADAPTABLE)
// ==========================================

function getPeerFallbackResponse(
  step: number,
  options?: {
    initialAsk?: string;
    additionalInfo?: string;
    userMessage?: string;
    professorName?: string;
    courseCode?: string;
    professorStyle?: string;
    useCase?: string;
  }
): string {
  const prof = options?.professorName || 'the instructor';
  const course = options?.courseCode || 'class';
  const useCase = options?.useCase || 'sickness_absence';
  const msg = options?.userMessage || options?.additionalInfo || '';

  if (useCase === 'deadline_extension') {
    if (step === 1) {
      return `I think sending a polite extension note at least 24 to 48 hours before the deadline is the best way to go, proposing a specific completion date and offering to share your progress so far.`;
    }
    if (step === 2) {
      return `I know having a concrete proposed timeline helps a lot when asking for an extension, so what specific new deadline are you thinking of requesting and how far along is your draft?`;
    }
    if (step === 3) {
      return `I think attaching the portions you have already completed alongside your proposed date shows accountability and reassures ${prof} that you are actively prioritizing the coursework.`;
    }
    return `I know another option is asking if you can submit the primary sections on time and request an extra day or two just for the final polish or appendix.`;
  }

  if (useCase === 'grade_inquiry') {
    if (step === 1) {
      return `I think reaching out to request a brief meeting during office hours to go over the rubric feedback is the right approach, focusing on understanding the evaluation rather than arguing over points.`;
    }
    if (step === 2) {
      return `I know focusing on specific grading criteria makes the conversation much more productive, so which particular rubric item or exam question are you hoping to get clarified?`;
    }
    if (step === 3) {
      return `I think coming to the meeting with your exam notes and specific questions about where your understanding diverged from the solution key will keep the discussion constructive and positive.`;
    }
    return `I know another option is checking in with the graduate student instructor or head TA first to get a detailed breakdown of the grading guidelines before speaking with ${prof}.`;
  }

  if (useCase === 'recommendation_letter') {
    if (step === 1) {
      return `I think sending a polite inquiry giving at least four weeks of advance notice is ideal, clearly specifying the program deadline and attaching your updated CV and brief project highlights.`;
    }
    if (step === 2) {
      return `I know faculty appreciate knowing what specific program or fellowship you are targeting, so what is the deadline for this submission and what key experiences from ${course} do you want highlighted?`;
    }
    if (step === 3) {
      return `I think offering to provide a 1-page summary sheet with bullet points of your contributions in ${course} will make it much easier for ${prof} to write a detailed, personalized letter.`;
    }
    return `I know another option is offering to jump on a quick 10-minute Zoom call or stop by office hours to discuss your graduate goals if their schedule permits.`;
  }

  if (useCase === 'research_opportunity') {
    if (step === 1) {
      return `I think writing a concise cold email that mentions a specific recent paper or project from their lab, along with your relevant technical skills and weekly availability, will stand out.`;
    }
    if (step === 2) {
      return `I know research groups care most about your background and time commitment, so what technical skills or relevant courses do you bring and how many hours a week can you commit?`;
    }
    if (step === 3) {
      return `I think keeping your initial email under 150 words with your CV attached and proposing a brief 15-minute chat will respect their busy schedule while demonstrating clear initiative.`;
    }
    return `I know another option is reading their lab group's latest publication and attending their open department seminar to introduce yourself in person before emailing.`;
  }

  // Default: sickness_absence (Hugh Dubberly / MDes baseline)
  if (step === 1) {
    return "I think sending a short heads-up note before class starts is the way to go, focusing strictly on when you expect to return and letting the instructor know your studio partner is briefed so project momentum doesn't stall.";
  }
  if (step === 2) {
    return "I know having a rough sense of your condition helps figure out whether you'll need an official Tang Center note or just a simple email, so what symptoms are you dealing with and how long do you think you'll be out?";
  }
  if (step === 3) {
    const symptomDetail = msg || 'those symptoms';
    return `I think with ${symptomDetail.toLowerCase().includes('fever') || symptomDetail.toLowerCase().includes('sick') ? symptomDetail : 'a serious illness like that'} you should definitely stay away from Jacobs Hall, use eTang or visit the Tang Center to grab medical verification for your records, and let the instructor know your studio partner can present your part of the design review.`;
  }
  return "I know another option is asking if someone in your studio group can record the critique notes for you or if you can leave sticky notes on the Miro board for asynchronous feedback while you recover.";
}

// Peer chat step handler adhering strictly to the role card across all professors & scenarios
app.post('/api/peer/chat', async (req, res) => {
  try {
    const {
      step = 1,
      initialAsk,
      specificOutput,
      additionalInformation,
      userMessage,
      history,
      professorName,
      courseCode,
      professorStyle,
      useCase,
    } = req.body;

    const prof = professorName || 'Professor Hugh Dubberly';
    const course = courseCode || 'UC Berkeley MDes Studio';
    const style = professorStyle || 'direct_systems';
    const scenario = useCase || 'sickness_absence';

    if (!ai) {
      return res.json({
        success: true,
        reply: getPeerFallbackResponse(step, {
          initialAsk,
          additionalInfo: additionalInformation,
          userMessage,
          professorName: prof,
          courseCode: course,
          professorStyle: style,
          useCase: scenario,
        }),
        step,
      });
    }

    const styleInstructions: Record<string, string> = {
      direct_systems: 'Values direct timelines, systems-level logic, team accountability, concise formatting, zero emotional drama.',
      formal_traditional: 'Values formal academic hierarchy, traditional titles, courteous deference, and syllabus-aligned protocol.',
      busy_concise: 'Extremely busy and reads emails quickly on mobile. Prefers upfront asks, 3-sentence limits, and zero fluff.',
      warm_supportive: 'Student-centered and approachable. Appreciates honest reflection, effort, and commitment to learning.',
      research_pi: 'Lab PI who values technical competence, reading their papers, concrete hours available, and direct deliverables.',
    };

    const styleGuide = styleInstructions[style] || styleInstructions.direct_systems;

    const systemPrompt = `You are a classmate helping a university peer according to this strict role card:
Purpose: To help classmates with school-related questions, specifically pertaining to relationships with professors and access to school resources. Informational and not conversational.
Engagement Context: The friend is seeking advice on how to communicate with ${prof} regarding ${scenario.replace(/_/g, ' ')} in ${course}.
Target Faculty Style: ${styleGuide}

BEHAVIORAL RULES (NON-NEGOTIABLE):
- High-level Informative.
- Diagnostic while keeping responses short and high-level.
- CRITICAL: Only respond in a SINGLE SHORT PARAGRAPH (2 to 4 sentences maximum). No greeting, no bullet points, no extra paragraphs.
- CRITICAL: Do NOT address anyone by name to keep a conversational tone (Never say "Hi Yuwen", "Hey ${prof}", or address anyone by name).
- Casual conversational language and tone between university peers.
- Make statements as an opinion, using "I think" or "I would" or "I know" or similar phrasing.
- Interaction Loop:
  * Step 1: Provide high-level suggestion. Ask ZERO questions.
  * Step 2: Diagnostic inquiry regarding situation variables. Ask AT MOST 1 question in this response.
  * Step 3: Clarify suggestion based on their situation and university/department policy. Ask ZERO questions.
  * Step 4: Provide alternative options. Ask ZERO questions.
- Do NOT ask more than 1 question in one response.
- Do NOT use the phrase "it's usually best" because it sounds preachy.
- Boundaries: A respectful peer without pushing for personal details or assuming feelings.
- Does NOT overly sympathize (avoid emotional drama like "I'm so so sorry", etc.).
- Does NOT fabricate information.
- Does NOT encourage disrespectful conduct.
- Does NOT go into high detail.
- Does NOT ask follow-up questions, only responds.`;

    const userPrompt = `Current Interaction Loop Step: ${step}
Target Professor: ${prof} (${course})
Professor Archetype: ${style}
Scenario: ${scenario}
Initial Ask: ${initialAsk || 'Advice on communicating with professor'}
Specific Output Requested: ${specificOutput || 'organized_feedback'}
Additional Information: ${additionalInformation || 'None provided yet'}
Latest User Message: ${userMessage || ''}
Prior conversation context: ${JSON.stringify(history || [])}

Remember: Respond in a SINGLE SHORT PARAGRAPH only. Do not address anyone by name. Use "I think" / "I would" / "I know". Casual peer tone. ${step === 2 ? 'Ask at most 1 diagnostic question.' : 'Ask ZERO questions.'} Do NOT say "it\'s usually best".`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        let text = response.text ? response.text.trim() : '';
        // Strip any leading name greetings if model slipped
        text = text.replace(/^(hey|hi|hello)\s+[a-z]+[,.]?\s*/i, '');
        // Ensure single paragraph
        text = text.split('\n\n')[0].replace(/\n+/g, ' ').trim();

        if (text) {
          return res.json({
            success: true,
            reply: text,
            step,
          });
        }
      } catch (err) {
        console.warn(`Peer chat on ${modelName} error, trying next`);
      }
    }

    return res.json({
      success: true,
      reply: getPeerFallbackResponse(step, {
        initialAsk,
        additionalInfo: additionalInformation,
        userMessage,
        professorName: prof,
        courseCode: course,
        professorStyle: style,
        useCase: scenario,
      }),
      step,
    });
  } catch (err: any) {
    console.error('Peer chat error:', err);
    return res.json({
      success: true,
      reply: getPeerFallbackResponse(req.body.step || 1),
      step: req.body.step || 1,
    });
  }
});

// Endpoint to generate organized feedback structure matching the role card across all professors & use cases
app.post('/api/peer/organized-output', async (req, res) => {
  try {
    const {
      initialAsk,
      specificOutput,
      additionalInformation,
      symptoms,
      professorName,
      courseCode,
      professorStyle,
      useCase,
    } = req.body;

    const prof = professorName || 'Professor Hugh Dubberly';
    const course = courseCode || 'UC Berkeley MDes Studio';
    const style = professorStyle || 'direct_systems';
    const scenario = useCase || 'sickness_absence';
    const extra = symptoms || additionalInformation || 'Current academic situation';

    if (ai) {
      const prompt = `You are an expert academic advisor generating a structured feedback response for a student communicating with a professor.
Target Professor: ${prof}
Course: ${course}
Professor Communication Style: ${style} (e.g. direct_systems: timeline/logic; formal_traditional: academic deference; busy_concise: under 90 words; warm_supportive: reflective/growth; research_pi: technical skills/hours)
Student Use Case Scenario: ${scenario}
Initial Student Ask: ${initialAsk}
Additional Context: ${extra}

Generate a JSON object matching this schema:
{
  "initialRecommendation": "A 2-3 sentence high-level opinion recommendation on the best strategy for this professor and scenario.",
  "letterDraft": {
    "subject": "[${course}] Clear subject line with student name",
    "recipient": "${prof}",
    "body": "Full body of the email starting with Dear ${prof}, ... ending with professional signoff and student placeholder.",
    "noteOnTone": "Explanation of how the tone was specifically calibrated to ${prof}'s archetype (${style})."
  },
  "policyGuidelines": {
    "primaryPolicy": "Core university or departmental policy regarding this scenario.",
    "academicProcedure": "Standard procedural steps expected by the department.",
    "documentationRequirement": "Any official notes, forms, or verification required.",
    "communicationWindow": "Recommended timeframe for sending and follow-ups."
  },
  "alternativeOptions": [
    "Alternative solution 1",
    "Alternative solution 2",
    "Alternative solution 3"
  ]
}`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          if (parsed && parsed.letterDraft && parsed.letterDraft.body) {
            return res.json({
              success: true,
              output: {
                initialRecommendation: parsed.initialRecommendation || 'I think you should reach out with clear notice and proactive solutions.',
                letterDraftToHugh: parsed.letterDraft, // backward compatibility
                letterDraft: parsed.letterDraft,
                berkeleyPolicyAndResources: {
                  tangCenterGuidelines: parsed.policyGuidelines?.documentationRequirement || 'Follow university health or academic verification rules.',
                  mdesStudioAttendance: parsed.policyGuidelines?.primaryPolicy || 'Consult course syllabus regarding attendance and extensions.',
                  studioPartnerCoordination: parsed.policyGuidelines?.academicProcedure || 'Ensure team members are briefed on project deliverables.',
                  dspAndDeanNotice: parsed.policyGuidelines?.communicationWindow || 'Submit requests at least 24-48 hours in advance.',
                },
                policyGuidelines: parsed.policyGuidelines,
                alternativeOptions: parsed.alternativeOptions || [
                  'Attend upcoming office hours for 1-on-1 review.',
                  'Coordinate with group members for asynchronous progress updates.',
                  'Request an initial check-in via email or Slack.',
                ],
              },
            });
          }
        } catch (e) {
          console.warn(`Organized output on ${modelName} error, falling back`);
        }
      }
    }

    // High-quality deterministic fallback for any professor and scenario
    let subject = `[${course}] Absence Notice - ${prof}`;
    let letterBody = `Dear ${prof},\n\nI am writing to let you know that I will be unable to attend our ${course} session today due to a serious illness (${extra}). I am currently resting and securing medical verification.\n\nI have coordinated with my project partners so our deliverables will proceed on schedule. I anticipate returning by next class.\n\nSincerely,\n[Your Name]\nStudent ID: [Your Student ID]`;
    let noteOnTone = `Calibrated for ${prof} with direct timelines and team continuity.`;
    let initialRec = `I think reaching out early with clear timelines and verification details is the best way to handle this with ${prof}.`;
    let policy1 = 'University Health Services guidelines and syllabus absence protocols.';
    let policy2 = 'Maintain active communication with studio/lab group partners.';
    let policy3 = 'Request official documentation for absences exceeding 48 hours.';
    let policy4 = 'Send notice before class starts to ensure excused status.';
    let alternatives = [
      'Coordinate with a classmate to share lecture or critique notes.',
      'Submit questions asynchronously on the course discussion platform or Miro board.',
      'Schedule a brief follow-up during upcoming office hours once recovered.',
    ];

    if (scenario === 'deadline_extension') {
      subject = `[${course}] Extension Request: Project Deliverable - [Your Name]`;
      letterBody = `Dear ${prof},\n\nI hope your week is going well. I am writing to respectfully request a brief extension on the upcoming project for ${course}, originally due on [Date].\n\nDue to [unforeseen circumstances / technical setbacks], I need additional time to ensure the work meets the course standards. I have completed [mention completed sections] and would be grateful if I could submit the final deliverables by [Proposed New Date].\n\nI have attached my current progress for your review. Thank you very much for your time, consideration, and understanding.\n\nSincerely,\n[Your Name]\nStudent ID: [Your Student ID]`;
      noteOnTone = `Presents a specific new date, attaches current progress, and shows deep respect for ${prof}'s syllabus policy.`;
      initialRec = `I think proposing a firm new date and showing your current progress will demonstrate that you respect the syllabus and are actively working on it.`;
      policy1 = 'Course extension policies typically require at least 24-48 hours notice prior to the deadline.';
      policy2 = 'Submitting an outline or partial draft with your request validates good-faith effort.';
      policy3 = 'Significant extensions for emergencies may require documentation from academic advising.';
      policy4 = 'Adhere strictly to whatever extension window is granted without further delays.';
      alternatives = [
        'Submit the completed portions on time and request an extension only on the final analysis.',
        'Attend office hours today to get feedback on the difficult sections blocking your completion.',
        'Request permission to submit an ungraded draft first for review.',
      ];
    } else if (scenario === 'grade_inquiry') {
      subject = `[${course}] Question Regarding Rubric & Exam Feedback - [Your Name]`;
      letterBody = `Dear ${prof},\n\nThank you for the detailed feedback on our recent ${course} assessment. I am writing to ask if I might stop by your office hours to clarify a few concepts from the evaluation.\n\nSpecifically, on Question [Number] / Section [Topic], I want to make sure I understand how to approach the problem correctly so I can master the material for upcoming projects.\n\nWould you be available for a brief discussion during your scheduled office hours this week, or is there another time that works best for you?\n\nSincerely,\n[Your Name]\nStudent ID: [Your Student ID]`;
      noteOnTone = `Framed around mastering material and understanding concepts rather than disputing points.`;
      initialRec = `I think asking to review the feedback during office hours to better understand the material will be received very positively by ${prof}.`;
      policy1 = 'Grade inquiries should always follow the 24-hour waiting period after scores are posted.';
      policy2 = 'Focus strictly on learning outcomes and rubric criteria rather than grade comparisons.';
      policy3 = 'Bring your syllabus, rubric, and original work to the office hours appointment.';
      policy4 = 'First check with the graduate student instructor if they graded that specific section.';
      alternatives = [
        'Ask the head teaching assistant for an initial explanation of the deductions.',
        'Review the published answer key and write down 2 specific conceptual questions for office hours.',
        'Participate in the upcoming review session to see how similar problems were evaluated.',
      ];
    } else if (scenario === 'recommendation_letter') {
      subject = `[${course}] Recommendation Letter Request - [Your Name]`;
      letterBody = `Dear ${prof},\n\nI hope your semester is going smoothly. I am writing to ask if you would feel comfortable writing a letter of recommendation on my behalf for my upcoming application to [Program / Fellowship / Job]. The submission deadline is [Date, at least 4 weeks out].\n\nI thoroughly enjoyed ${course}, especially working on [specific project/topic], where your feedback helped strengthen my analytical and design skills. Because of that experience, your perspective would carry immense weight for this application.\n\nI have attached my updated CV and statement of purpose for your reference. I would also be glad to share summary bullet points highlighting my milestones in your course.\n\nI completely understand if your current commitments prevent you from taking this on. Thank you so much for your mentorship and time.\n\nSincerely,\n[Your Name]\n[Student ID]`;
      noteOnTone = `Warm, appreciative, provides 4 weeks notice, and gives ${prof} a polite out while providing all necessary background documents.`;
      initialRec = `I think providing 4 weeks of notice, offering summary bullet points, and attaching your CV will make it easy for ${prof} to write a strong letter.`;
      policy1 = 'Faculty require at least 3 to 4 weeks of advance notice for recommendation letters.';
      policy2 = 'Always provide the application deadlines, submission portals, and waiver status in writing.';
      policy3 = 'Provide a 1-page "brag sheet" highlighting your specific achievements in their class.';
      policy4 = 'Send a polite follow-up reminder 7 days before the deadline if not yet submitted.';
      alternatives = [
        'Schedule a 10-minute office hours chat to discuss your graduate ambitions.',
        'Offer to draft bullet points of key project highlights to save them time.',
        'Inquire whether a co-instructor or lab mentor could co-sign or provide a reference.',
      ];
    } else if (scenario === 'research_opportunity') {
      subject = `[Research Inquiry] Undergraduate/Graduate Research Opportunities - [Your Name]`;
      letterBody = `Dear ${prof},\n\nI hope this email finds you well. I am writing to express my strong interest in the research conducted in your lab, particularly your recent work on [Paper Topic or Project Name].\n\nI am currently a student in [Major/Program], and I have developed skills in [mention 2-3 skills, e.g. Python, CAD, user research] through ${course}. I am eager to contribute to your ongoing investigations and can commit [10-15] hours per week starting this term.\n\nI have attached my CV and transcript for your review. Would you or a member of your research team have 15 minutes in the coming weeks to discuss potential opportunities to assist in the lab?\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]\n[Student ID]`;
      noteOnTone = `Concise, references their published research specifically, details concrete technical skills and weekly hours available.`;
      initialRec = `I think keeping your cold email concise and citing their specific recent work while stating your exact weekly hours will capture ${prof}'s attention.`;
      policy1 = 'Departmental research assistantships usually require 8 to 15 hours of weekly commitment.';
      policy2 = 'Review at least two of the lab\'s most recent publications before reaching out.';
      policy3 = 'Attach your CV, unofficial transcript, and a portfolio or GitHub link if applicable.';
      policy4 = 'If no response after 7-10 business days, send one polite, brief follow-up.';
      alternatives = [
        'Attend their open lab meeting or department seminar to introduce yourself.',
        'Reach out to a current PhD student or postdoc in the lab for an informational chat.',
        'Apply through the university\'s formal undergraduate research apprentice program (URAP).',
      ];
    }

    return res.json({
      success: true,
      output: {
        initialRecommendation: initialRec,
        letterDraftToHugh: {
          subject,
          recipient: prof,
          body: letterBody,
          noteOnTone,
        },
        letterDraft: {
          subject,
          recipient: prof,
          body: letterBody,
          noteOnTone,
        },
        berkeleyPolicyAndResources: {
          tangCenterGuidelines: policy3,
          mdesStudioAttendance: policy1,
          studioPartnerCoordination: policy2,
          dspAndDeanNotice: policy4,
        },
        policyGuidelines: {
          primaryPolicy: policy1,
          academicProcedure: policy2,
          documentationRequirement: policy3,
          communicationWindow: policy4,
        },
        alternativeOptions: alternatives,
      },
    });
  } catch (err: any) {
    console.error('Organized output error:', err);
    return res.status(500).json({ error: 'Failed to generate organized output' });
  }
});


// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Letter Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
