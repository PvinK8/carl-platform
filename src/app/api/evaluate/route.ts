import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const COURSE_TITLES: Record<string, string> = {
  PDDS:   'Professional Diploma in Data Science',
  PDDI:   'Professional Diploma in Digital Innovation',
  ACIS:   'Advanced Certificate in Infrastructure Support',
  PDCA:   'Professional Diploma in Cloud Administration',
  PDDM:   'Professional Diploma in Digital Marketing',
  PDFSWD: 'Professional Diploma in Full Stack Web Development',
};

const COURSE_SKILLS: Record<string, string> = {
  PDDS:   'Power BI, Python, Machine Learning, Deep Learning, Generative AI, Azure AI, Power Automate, Data Visualisation, NLP, Scrum',
  PDDI:   'Power BI, Power Automate, Power Apps, Generative AI, Microsoft Copilot, Digital Transformation, Agile, Low-code Development, Prompt Engineering',
  ACIS:   'Server Administration, Networking, IT Operating Systems, Cloud Fundamentals (Azure), Linux, IT Customer Service, Virtualisation, Shell Scripting',
  PDCA:   'Azure Cloud Administration, Hybrid Cloud, Azure AD, Azure Virtual Desktop, Cloud Security Governance, Identity Management, Windows Server',
  PDDM:   'Google Ads, Facebook Ads, SEO, Email Marketing, Web Analytics, Marketing Automation, CRM, WordPress, Video Marketing, Omni-channel, Agile',
  PDFSWD: 'HTML/CSS, JavaScript, React, Node.js, SQL, NoSQL, MVC, REST APIs, Generative AI, GitHub Copilot, Agile, Enterprise Software Development',
};

const COURSE_SALARY_CONTEXT: Record<string, string> = {
  PDDS:   'Domain-specific data roles (HR analytics, FinServ data, healthcare BI) pay $3,800-$6,000/mo. Generic Data Analyst roles start at $3,200-$4,500.',
  PDDI:   'Domain-specific digital transformation roles pay $3,500-$6,500/mo. Digital process analyst entry roles start at $3,200.',
  ACIS:   'IT Support/Infrastructure entry roles pay $2,500-$3,800/mo. Azure certification can push ceiling to $4,500.',
  PDCA:   'Azure Cloud Admin roles pay $4,000-$7,500/mo. AZ-104 certified candidates are actively sought by Singapore banks and MNCs.',
  PDDM:   'Domain-specific digital marketing (FinServ, healthcare, education) pays $3,200-$5,500/mo. Generic digital marketing starts at $2,800.',
  PDFSWD: 'Domain-specific developer roles (HR tech, FinTech, EdTech) pay $4,500-$7,000/mo. Junior developers without a portfolio start at $3,800.',
};

const SAL_LABELS: Record<string, string> = {
  '1': 'Below $2,000/mo', '2': '$2,000-$2,999/mo', '3': '$3,000-$3,999/mo',
  '4': '$4,000-$4,999/mo', '5': '$5,000-$6,999/mo', '6': '$7,000+/mo',
};

const URGENCY_LABELS: Record<string, string> = {
  immediate: 'Immediate - needs job ASAP', '3_months': 'Within 3 months post-course',
  '6_months': 'Within 6 months post-course', flexible: 'Flexible / still exploring',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateName, age, currentRole, background, yearsExperience, targetCourse,
      resumeText, motivationStatement, urgency, lastSalary, expectedSalary, concerns } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const courseTitle   = COURSE_TITLES[targetCourse]   ?? targetCourse;
    const courseSkills  = COURSE_SKILLS[targetCourse]   ?? '';
    const salaryContext = COURSE_SALARY_CONTEXT[targetCourse] ?? '';
    const lastLabel     = SAL_LABELS[lastSalary]     ?? 'Not stated';
    const expLabel      = SAL_LABELS[expectedSalary] ?? 'Not stated';
    const urgencyLabel  = URGENCY_LABELS[urgency]    ?? urgency;
    const salDiff = parseInt(expectedSalary) - parseInt(lastSalary);
    const salSignal = !lastSalary || !expectedSalary ? 'No salary data provided.'
      : salDiff >= 2  ? `Expecting a jump of ${salDiff} salary bands - unrealistic for year 1.`
      : salDiff === 1 ? 'Expecting one band up - achievable within 12-18 months for high-demand courses.'
      : salDiff === 0 ? 'Expecting the same salary band - healthy and realistic.'
      : `Willing to drop ${Math.abs(salDiff)} salary band${Math.abs(salDiff) > 1 ? 's' : ''} - strong commitment signal.`;

    const prompt = `You are an expert career counsellor pre-assessing candidates for Singapore SCTP ICT courses. Give counsellors structured, frank intelligence BEFORE the Eligibility Evaluation (EE) call.

CANDIDATE
Name: ${candidateName}
Age: ${age || 'Not stated'}
Current / Last Role: ${currentRole || 'Not stated'}
Industry Background: ${background || 'Not stated'}
Years of Experience: ${yearsExperience || 'Not stated'}
Target Course: ${courseTitle} (${targetCourse})
Skills gained: ${courseSkills}
Urgency: ${urgencyLabel}
Last Drawn Salary: ${lastLabel}
Expected Salary After Course: ${expLabel}
Salary signal: ${salSignal}

Resume / Work History:
${resumeText}

Motivation Statement:
"${motivationStatement}"

Concerns / Hesitations:
${concerns || 'None stated'}

SINGAPORE CONTEXT
- SCTP is a government-funded mid-career reskilling programme. Candidates are typically 30+.
- Courses are 4-6 months full-time or intensive part-time.
- ${salaryContext}
- Strong candidates have both a push factor (career ceiling, redundancy) AND a pull factor (genuine interest, transferable skills).

CRITICAL ROLE MAPPING RULES
1. DO NOT suggest generic titles like "Business Analyst", "Data Analyst", "IT Support", or "Developer" without a domain qualifier.
2. READ THE RESUME carefully. Extract the candidate's actual domain - their industry, function, and specific responsibilities.
3. For each role, ask: does this candidate's domain experience give them a COMPETITIVE ADVANTAGE over a pure-tech hire? If yes, include it.
4. Every role title MUST include the domain context. Examples:
   - "People Analytics Specialist" not "Data Analyst"
   - "L&D Technology Specialist" not "Business Analyst"
   - "HR Digital Transformation Lead" not "Digital Transformation Analyst"
   - "FinTech Developer" not "Junior Developer"
5. The why field MUST reference BOTH the domain background AND specific course skills together.
6. Generate exactly 4 roles: 2 best, 1 good, 1 stretch.

TASK
Return ONLY valid JSON. No markdown, no backticks, no preamble.

{
  "overallScore": <integer 0-100, weighted: motivation 35%, courseFit 25%, urgency 20%, salary 20%>,
  "verdict": "<Strong Candidate or Promising Needs Coaching or At Risk Address Concerns or Not Ready Reconsider Timing>",
  "verdictColor": "<#4ade80 | #facc15 | #fb923c | #f87171>",
  "counsellorSummary": "<2-3 sentence frank peer-to-peer briefing referencing the candidate's domain and key watch-out>",
  "domainRoles": [
    { "tier": "best",    "title": "<domain-qualified title>", "why": "<dual-referenced reason: domain background + course skill>" },
    { "tier": "best",    "title": "<domain-qualified title>", "why": "<dual-referenced reason>" },
    { "tier": "good",    "title": "<domain-qualified title>", "why": "<dual-referenced reason>" },
    { "tier": "stretch", "title": "<domain-qualified title>", "why": "<dual-referenced reason>" }
  ],
  "domainEdge": "<2-3 sentences on why this candidate's domain background is an advantage over a pure-tech hire>",
  "salaryGap": {
    "lastLabel": "${lastLabel}",
    "expLabel": "${expLabel}",
    "direction": "<one of: up-up or up or same or down>",
    "directionColor": "<#f87171 | #fb923c | #4ade80 | #facc15>",
    "bandDiff": "<e.g. +2 bands or +1 band or Same or -1 band>",
    "counsellorRead": "<2-3 sentences on what this salary gap means and how to address it in the EE call>"
  },
  "marketSalary": "<realistic salary range for domain-specific roles>",
  "marketSalarySub": "<one line on what pushes the ceiling>",
  "marketDemand": "<demand signal>",
  "marketNote": "<2-3 sentences on the candidate's specific market positioning>",
  "motivationScore": <0-100>, "motivationNotes": "<1 sentence>",
  "urgencyScore": <0-100>, "urgencyNotes": "<1 sentence>",
  "courseFitScore": <0-100>, "courseFitNotes": "<1 sentence>",
  "salaryScore": <0-100>, "salaryNotes": "<1 sentence>",
  "greenFlags": ["<specific observation>"],
  "redFlags": ["<specific concern>"],
  "talkingPoints": ["<specific EE call action or question>"],
  "salaryTalkingPoint": "<salary-gap specific talking point for the EE call>"
}

Rules: verdictColor must match verdict tier. greenFlags and redFlags: 3-5 items each, specific to this candidate. talkingPoints: 5-6 items. domainRoles tier must be exactly best/good/stretch lowercase. Return ONLY the JSON.`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!, { apiVersion: 'v1' } as any);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const aiResult = await model.generateContent(prompt);
    const rawText = aiResult.response.text().trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    const required = [
      'overallScore','verdict','verdictColor','counsellorSummary',
      'domainRoles','domainEdge','salaryGap',
      'marketSalary','marketSalarySub','marketDemand','marketNote',
      'motivationScore','urgencyScore','courseFitScore','salaryScore',
      'motivationNotes','urgencyNotes','courseFitNotes','salaryNotes',
      'greenFlags','redFlags','talkingPoints','salaryTalkingPoint',
    ];
    for (const f of required) {
      if (!(f in parsed)) throw new Error(`Missing field: ${f}`);
    }
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('[/api/evaluate] Error:', err);
    return NextResponse.json(
      { error: `Evaluation failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}