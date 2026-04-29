import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { cv, course, salMin, salMax, courseSkills } = await req.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const txt = cv.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500)
    const sal = `SGD ${parseInt(salMin).toLocaleString()} to ${parseInt(salMax).toLocaleString()} per month`

    const prompt = `You are a Singapore recruitment expert. Analyse this candidate CV and return ONLY valid JSON.

CV: ${txt}

Course completed: ${course}
Course skills: ${courseSkills}
Salary expectation: ${sal}

Return this exact JSON structure with no markdown:
{
  "name": "candidate full name",
  "headline": "one line professional summary",
  "experience_years": number,
  "top_skills": ["skill1", "skill2", "skill3"],
  "past_skills": ["past skill1", "past skill2", "past skill3"],
  "roles": [
    {
      "title": "job title",
      "tier": "Best Fit",
      "rationale": "explanation under 200 chars",
      "salary_min": number,
      "salary_max": number,
      "companies": ["company1", "company2", "company3"],
      "search_keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Provide exactly 6 roles: 2 Best Fit, 2 Good Fit, 2 Stretch.
All companies must be real Singapore employers.
Salaries in SGD per month.
search_keywords should blend past experience skills with new course skills for MCF job search.
Keep rationale concise.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}