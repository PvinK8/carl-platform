import { NextRequest, NextResponse } from 'next/server';

const COURSE_SKILLS: Record<string, string> = {
  PDDS: 'Power BI, Python, Machine Learning, Generative AI, Azure AI, Power Automate, Data Visualisation',
  PDDI: 'Power BI, Power Automate, Power Apps, Generative AI, Microsoft Copilot, Digital Transformation, Agile, Low-code Development',
  ACIS: 'Server Administration, Networking, IT Operating Systems, Cloud Fundamentals (Azure), Linux, IT Customer Service',
  PDCA: 'Azure Cloud Administration, Hybrid Cloud, Azure AD, Cloud Security Governance, Identity Management, Windows Server',
  PDDM: 'Google Ads, Facebook Ads, SEO, Email Marketing, Web Analytics, Marketing Automation, CRM, WordPress',
  PDFSWD: 'HTML/CSS, JavaScript, React, Node.js, SQL, REST APIs, Generative AI, GitHub Copilot, Agile',
};

const COURSE_TITLES: Record<string, string> = {
  PDDS: 'Professional Diploma in Data Science',
  PDDI: 'Professional Diploma in Digital Innovation',
  ACIS: 'Advanced Certificate in Infrastructure Support',
  PDCA: 'Professional Diploma in Cloud Administration',
  PDDM: 'Professional Diploma in Digital Marketing',
  PDFSWD: 'Professional Diploma in Full Stack Web Development',
};

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salaryBand, candidateName } = await req.json();

    const courseSkills = COURSE_SKILLS[course] ?? '';
    const courseTitle = COURSE_TITLES[course] ?? course;

    const prompt = [
      'You are a Singapore career counsellor. Given this candidate profile, generate 8 smart job role recommendations.',
      'Do NOT use generic titles. Think about what organisations actually need from someone with this background and these new skills.',
      'Return ONLY valid JSON array, no markdown:',
      '[{',
      '  "title": "specific role title that matches this candidate",',
      '  "why": "1-2 sentences on why this candidate specifically suits this role",',
      '  "orgTypes": "types of organisations hiring for this e.g. VWOs, banks, healthcare groups",',
      '  "mcfKeyword": "2-3 word search term to find this on MCF",',
      '  "fitScore": 85',
      '}]',
      '',
      'CV: ' + (cv || '').slice(0, 2000),
      'Course: ' + courseTitle + ' | Skills: ' + courseSkills,
    ].join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
    });

    if (!res.ok) throw new Error('OpenAI error ' + res.status);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const aiRoles = JSON.parse(cleaned);

    return NextResponse.json({
      aiRoles,
      candidateName,
      courseTitle,
      courseSkills,
    });

  } catch (e: unknown) {
    console.error('[/api/placement]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}