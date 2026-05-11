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

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salLastDrawn, salExpected, motivation, urgency, concerns } = await req.json();

    const courseTitle = COURSE_TITLES[course] ?? course;
    const courseSkills = COURSE_SKILLS[course] ?? '';
    const salContext = 'Last drawn: SGD ' + parseInt(salLastDrawn || 0).toLocaleString()
      + '/mo. Expected: SGD ' + parseInt(salExpected || 0).toLocaleString() + '/mo';

    const promptParts = [
      'You are an expert career counsellor pre-assessing candidates for Singapore SCTP ICT courses.',
      'Give counsellors specific, actionable intelligence.',
      '',
      'CANDIDATE CV:',
      (cv || '').slice(0, 3000),
      '',
      'COURSE: ' + courseTitle + ' (' + course + ')',
      'COURSE SKILLS THEY WILL GAIN: ' + courseSkills,
      'SALARY: ' + salContext,
      'MOTIVATION: ' + (motivation || ''),
      'JOB SEARCH URGENCY: ' + (urgency || ''),
      'CONCERNS: ' + (concerns || 'None stated'),
      '',
      'Return ONLY valid JSON with no markdown:',
      '{',
      '  "overallScore": <0-100>,',
      '  "verdict": "Strong Candidate or Good Candidate or Borderline or Needs Development",',
      '  "verdictColor": "#4ade80 for Strong, #facc15 for Good, #fb923c for Borderline, #f87171 for Needs Development",',
      '  "counsellorSummary": "<2-3 sentence actionable summary for the EE counsellor>",',
      '  "domainRoles": "<specific ICT roles candidate can target based on background and course>",',
      '  "domainEdge": "<what makes candidate stand out vs generic course graduates>",',
      '  "salaryGap": { "direction": "realistic or stretch or conservative", "notes": "<1 sentence>" },',
      '  "marketSalary": "<market range e.g. SGD 3500-5500/mo>",',
      '  "marketSalarySub": "<one line on what pushes the ceiling>",',
      '  "marketDemand": "<demand signal for target roles in Singapore>",',
      '  "marketNote": "<2-3 sentences on candidate specific market positioning>",',
      '  "motivationScore": <0-100>,',
      '  "motivationNotes": "<1 sentence>",',
      '  "urgencyScore": <0-100>,',
      '  "