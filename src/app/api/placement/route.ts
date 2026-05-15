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

async function getSearchKeywords(cv: string, course: string, courseSkills: string): Promise<string[]> {
  const prompt = [
    'You are a Singapore recruitment expert. Given this candidate profile, generate 6 smart MCF job search keyword phrases.',
    'Do NOT use generic titles. Think about what organisations actually need from someone with this background and these new skills.',
    'A person with HR background doing a digital course should not just get "HR Analyst" — think "people analytics", "HR tech implementation", "digital learning coordinator" etc.',
    'Return ONLY a JSON array of 6 short keyword strings, no explanation.',
    '',
    'CV: ' + cv.slice(0, 2000),
    'Course: ' + course,
    'Course skills: ' + courseSkills,
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function searchMCF(keyword: string, salaryMin: number, salaryMax: number) {
  const params = new URLSearchParams({
    search: keyword,
    salary: salaryMin.toString(),
    limit: '5',
  });
  const res = await fetch('https://api.mycareersfuture.gov.sg/v2/jobs?' + params.toString(), {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).filter((j: any) => {
    const max = j.salary?.maximum ?? 0;
    return max === 0 || max >= salaryMin;
  }).slice(0, 5);
}

async function rankAndExplainJobs(jobs: any[], cv: string, course: string, courseSkills: string) {
  if (jobs.length === 0) return [];
  const jobList = jobs.map((j, i) =>
    i + ': ' + (j.title ?? '') + ' at ' + (j.postedCompany?.name ?? '') +
    ' | Salary: ' + (j.salary?.minimum ?? '?') + '-' + (j.salary?.maximum ?? '?') +
    ' | ' + (j.description ?? '').slice(0, 200)
  ).join('\n');

  const prompt = [
    'You are a Singapore career counsellor. Rank these jobs by fit for this candidate and explain WHY each one suits them specifically.',
    'Focus on how their domain background + new course skills create a genuine advantage for each role.',
    'Be specific — not generic. Mention what they bring that a fresh grad would not.',
    'Return ONLY valid JSON array, no markdown:',
    '[{ "index": 0, "fitScore": 85, "fitReason": "why this candidate specifically suits this role in 1-2 sentences" }]',
    '',
    'CV: ' + cv.slice(0, 1500),
    'Course: ' + course + ' | Skills: ' + courseSkills,
    '',
    'Jobs:',
    jobList,
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.5 }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function findApolloContact(companyName: string) {
  try {
    const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': process.env.APOLLO_API_KEY ?? '' },
      body: JSON.stringify({
        q_organization_name: companyName,
        person_titles: ['HR Manager', 'Talent Acquisition', 'Recruiter', 'HR Director', 'People Manager', 'Hiring Manager'],
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
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salaryBand, candidateName } = await req.json();

    const courseSkills = COURSE_SKILLS[course] ?? '';
    const courseTitle = COURSE_TITLES[course] ?? course;
    const salaryMin = SAL_MAP[salaryBand] ?? 3000;
    const salaryMax = salaryMin * 2;

    const keywords = await getSearchKeywords(cv, courseTitle, courseSkills);

    const allJobsRaw: any[] = [];
    const seen = new Set<string>();
    for (const kw of keywords) {
      const results = await searchMCF(kw, salaryMin, salaryMax);
      for (const j of results) {
        const id = j.uuid ?? j.id ?? (j.title + j.postedCompany?.name);
        if (!seen.has(id)) { seen.add(id); allJobsRaw.push(j); }
      }
    }

    const rankings = await rankAndExplainJobs(allJobsRaw, cv, courseTitle, courseSkills);

    const ranked = rankings
      .map((r: any) => ({ ...allJobsRaw[r.index], fitScore: r.fitScore, fitReason: r.fitReason }))
      .sort((a: any, b: any) => b.fitScore - a.fitScore)
      .slice(0, 10);

    const top5 = ranked.slice(0, 5);

    const jobsWithContacts = await Promise.all(
      ranked.map(async (j: any) => {
        const contact = await findApolloContact(j.postedCompany?.name ?? '');
        return { ...j, apolloContact: contact };
      })
    );

    return NextResponse.json({
      keywords,
      jobs: jobsWithContacts,
      top5Indices: top5.map((_: any, i: number) => i),
      candidateName,
      courseTitle,
      courseSkills,
    });

  } catch (e: unknown) {
    console.error('[/api/placement]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}