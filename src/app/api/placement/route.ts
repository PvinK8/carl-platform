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

const SAL_MAP: Record<string, number> = {
  '1': 2000, '2': 2500, '3': 3500, '4': 4500, '5': 6000, '6': 8000,
};

async function findApolloContact(companyName: string) {
  try {
    const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': process.env.APOLLO_API_KEY ?? '' },
      body: JSON.stringify({
        q_organization_name: companyName,
        person_titles: ['HR Manager', 'Talent Acquisition', 'Recruiter', 'HR Director', 'People Manager'],
        page: 1, per_page: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const person = data.people?.[0];
    if (!person) return null;
    return {
      name: person.first_name + ' ' + person.last_name,
      title: person.title ?? '',
      email: person.email ?? '',
      linkedin: person.linkedin_url ?? '',
    };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salaryBand, candidateName } = await req.json();

    const courseSkills = COURSE_SKILLS[course] ?? '';
    const courseTitle = COURSE_TITLES[course] ?? course;
    const salaryMin = SAL_MAP[salaryBand] ?? 3000;

    const prompt = [
      'You are a Singapore career counsellor. Given this candidate profile, generate 8 smart job role recommendations.',
      'Do NOT use generic titles. Think about what organisations actually need from someone with this background and these new skills.',
      'For each role, also suggest the best MCF search keyword to find it.',
      'Return ONLY valid JSON array, no markdown:',
      '[{',
      '  "title": "specific role title that matches this candidate",',
      '  "why": "1-2 sentences on why this candidate specifically suits this role - mention their domain background",',
      '  "orgTypes": "types of organisations hiring for this e.g. VWOs, banks, healthcare groups, tech startups",',
      '  "mcfKeyword": "2-3 word search term to find this on MCF",',
      '  "fitScore": 85',
      '}]',
      '',
      'CV: ' + (cv || '').slice(0, 2000),
      'Course: ' + courseTitle + ' | Skills: ' + courseSkills,
      'Salary expectation: SGD ' + salaryMin.toLocaleString() + '/mo',
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
    const roles = JSON.parse(cleaned);

    const rolesWithLinks = roles.map((r: any) => ({
      ...r,
      mcfUrl: 'https://www.mycareersfuture.gov.sg/search?search=' + encodeURIComponent(r.mcfKeyword) + '&salary=' + salaryMin + '&sortBy=new_posting_date',
    }));

    const top3Companies = rolesWithLinks.slice(0, 3).map((r: any) => r.orgTypes?.split(',')[0]?.trim() ?? '');
    const apolloContacts = await Promise.all(
      top3Companies.map((company: string) => company ? findApolloContact(company) : Promise.resolve(null))
    );

    return NextResponse.json({
      roles: rolesWithLinks,
      top5Indices: [0, 1, 2, 3, 4],
      candidateName,
      courseTitle,
      courseSkills,
      apolloContacts,
    });

  } catch (e: unknown) {
    console.error('[/api/placement]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}