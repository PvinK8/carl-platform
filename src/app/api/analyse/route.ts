import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salMin, salMax, courseSkills } = await req.json();

    const txt = cv.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500);
    const sal = 'SGD ' + parseInt(salMin).toLocaleString() + ' to ' + parseInt(salMax).toLocaleString() + ' per month';

    const promptParts = [
      'You are a Singapore recruitment expert. Analyse this candidate CV and return ONLY valid JSON with no markdown.',
      '',
      'CV: ' + txt,
      'Course completed: ' + course,
      'Course skills: ' + courseSkills,
      'Salary expectation: ' + sal,
      '',
      'Return this exact JSON:',
      '{',
      '  "name": "candidate full name",',
      '  "headline": "one line professional summary",',
      '  "experience_years": 0,',
      '  "top_skills": ["skill1","skill2","skill3","skill4","skill5","skill6"],',
      '  "domain": "primary domain e.g. HR Finance Healthcare Logistics Marketing IT",',
      '  "course_fit": "how course connects to background in 1-2 sentences",',
      '  "best_roles": ["role1","role2","role3"],',
      '  "salary_verdict": "realistic or stretch or conservative",',
      '  "counsellor_note": "one key insight for the talent specialist"',
      '}',
    ];
    const prompt = promptParts.join('\n');

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
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    console.error('[/api/analyse]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}