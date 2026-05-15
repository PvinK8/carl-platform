import { NextRequest, NextResponse } from 'next/server';

const COURSE_TITLES: Record<string, string> = {
  PDDS: 'Professional Diploma in Data Science',
  PDDI: 'Professional Diploma in Digital Innovation',
  ACIS: 'Advanced Certificate in Infrastructure Support',
  PDCA: 'Professional Diploma in Cloud Administration',
  PDDM: 'Professional Diploma in Digital Marketing',
  PDFSWD: 'Professional Diploma in Full Stack Web Development',
};

const COURSE_SKILLS: Record<string, string> = {
  PDDS: 'Power BI, Python, Machine Learning, Generative AI, Azure AI, Power Automate, Data Visualisation',
  PDDI: 'Power BI, Power Automate, Power Apps, Generative AI, Microsoft Copilot, Digital Transformation, Agile, Low-code Development',
  ACIS: 'Server Administration, Networking, IT Operating Systems, Cloud Fundamentals (Azure), Linux, IT Customer Service',
  PDCA: 'Azure Cloud Administration, Hybrid Cloud, Azure AD, Cloud Security Governance, Identity Management, Windows Server',
  PDDM: 'Google Ads, Facebook Ads, SEO, Email Marketing, Web Analytics, Marketing Automation, CRM, WordPress',
  PDFSWD: 'HTML/CSS, JavaScript, React, Node.js, SQL, REST APIs, Generative AI, GitHub Copilot, Agile',
};

const SAL_LABELS: Record<string, string> = {
  '1': 'Below $2,000', '2': '$2,000–$2,999', '3': '$3,000–$3,999',
  '4': '$4,000–$4,999', '5': '$5,000–$6,999', '6': '$7,000+',
};

export async function POST(req: NextRequest) {
  try {
    const { candidateName, age, currentRole, background, yearsExperience,
            targetCourse, resumeText, motivationStatement, urgency,
            lastSalary, expectedSalary, concerns } = await req.json();

    const courseTitle = COURSE_TITLES[targetCourse] ?? targetCourse;
    const courseSkills = COURSE_SKILLS[targetCourse] ?? '';
    const lastLabel = SAL_LABELS[lastSalary] ?? lastSalary;
    const expLabel = SAL_LABELS[expectedSalary] ?? expectedSalary;
    const salDiff = parseInt(expectedSalary) - parseInt(lastSalary);
    const directionColor = salDiff > 0 ? '#f87171' : salDiff < 0 ? '#facc15' : '#4ade80';
    const direction = salDiff > 0 ? '↑' : salDiff < 0 ? '↓' : '→';
    const bandDiff = salDiff === 0 ? 'Same band' : Math.abs(salDiff) + ' band' + (Math.abs(salDiff) > 1 ? 's' : '') + (salDiff > 0 ? ' up' : ' down');

    const prompt = [
      'You are an expert career counsellor pre-assessing candidates for Singapore SCTP ICT courses.',
      'Give counsellors specific, actionable intelligence. Return ONLY valid JSON, no markdown.',
      '',
      'CANDIDATE: ' + candidateName + ', Age: ' + (age || 'not stated'),
      'CURRENT ROLE: ' + (currentRole || 'not stated'),
      'BACKGROUND: ' + (background || 'not stated'),
      'YEARS EXPERIENCE: ' + (yearsExperience || 'not stated'),
      'COURSE: ' + courseTitle + ' (' + targetCourse + ')',
      'COURSE SKILLS: ' + courseSkills,
      'SALARY: Last drawn ' + lastLabel + ', Expected ' + expLabel,
      'MOTIVATION: ' + (motivationStatement || ''),
      'URGENCY: ' + (urgency || ''),
      'CONCERNS: ' + (concerns || 'None stated'),
      'RESUME:',
      (resumeText || '').slice(0, 3000),
      '',
      'Return this exact JSON structure:',
      '{',
      '  "overallScore": <0-100>,',
      '  "verdict": "Strong Candidate or Good Candidate or Borderline or Needs Development",',
      '  "verdictColor": "#4ade80 for Strong, #facc15 for Good, #fb923c for Borderline, #f87171 for Needs Development",',
      '  "counsellorSummary": "<2-3 sentence actionable summary>",',
      '  "domainRoles": [',
      '    { "tier": "best", "title": "<role title not limited to generic names>", "why": "<why this candidate specifically suits this role>" },',
      '    { "tier": "best", "title": "<role title>", "why": "<why>" },',
      '    { "tier": "good", "title": "<role title>", "why": "<why>" },',
      '    { "tier": "good", "title": "<role title>", "why": "<why>" },',
      '    { "tier": "stretch", "title": "<role title>", "why": "<why>" }',
      '  ],',
      '  "domainEdge": "<what makes this candidate stand out vs generic course graduates>",',
      '  "salaryGap": {',
      '    "lastLabel": "' + lastLabel + '",',
      '    "expLabel": "' + expLabel + '",',
      '    "direction": "' + direction + '",',
      '    "directionColor": "' + directionColor + '",',
      '    "bandDiff": "' + bandDiff + '",',
      '    "counsellorRead": "<1-2 sentences on how to handle this salary gap in the EE session>"',
      '  },',
      '  "marketSalary": "<market range e.g. SGD 3,500-5,500/mo>",',
      '  "marketSalarySub": "<one line on what pushes the ceiling>",',
      '  "marketDemand": "<demand signal e.g. High / Moderate / Emerging>",',
      '  "marketNote": "<2-3 sentences on this candidate specific market positioning>",',
      '  "motivationScore": <0-100>,',
      '  "motivationNotes": "<1 sentence>",',
      '  "urgencyScore": <0-100>,',
      '  "urgencyNotes": "<1 sentence>",',
      '  "courseFitScore": <0-100>,',
      '  "courseFitNotes": "<1 sentence>",',
      '  "salaryScore": <0-100>,',
      '  "salaryNotes": "<1 sentence>",',
      '  "greenFlags": ["<specific observation>", "<specific observation>", "<specific observation>"],',
      '  "redFlags": ["<specific concern>", "<specific concern>"],',
      '  "talkingPoints": ["<EE action>", "<EE action>", "<EE action>", "<EE action>", "<EE action>"],',
      '  "salaryTalkingPoint": "<salary-gap specific talking point for EE call>"',
      '}',
      '',
      'CRITICAL for domainRoles: Do NOT use generic titles. Think about what organisations actually need from someone with THIS background + THESE new skills. A fragrance merchandiser doing PDDI is not a Digital Analyst - they might be a Community Engagement Lead at a VWO, or a Digital Programme Coordinator at SINDA. Be specific to this candidate.',
    ].join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error('OpenAI error ' + res.status + ': ' + await res.text());
    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() ?? '';
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    console.error('[/api/evaluate]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}