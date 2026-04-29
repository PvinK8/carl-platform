import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { cv, course, courseLabel, salMin, salMax } = await req.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})

    const txt = cv.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500)
    const sal = `SGD ${parseInt(salMin).toLocaleString()} to ${parseInt(salMax).toLocaleString()} per month`

    const prompt = `You are a Singapore recruitment consultant. Write a professional 5-line recruiter pitch for a hiring manager.

Candidate background: ${txt}
Course completed: ${courseLabel} (${course})
Salary expectation: ${sal}
Profile tags: D2 (SCTP), High Touch candidate

Return ONLY this JSON with no markdown:
{
  "subject": "email subject line",
  "lines": ["line1", "line2", "line3", "line4", "line5"]
}

The pitch should:
- Open with a strong hook about the candidate
- Highlight how their past experience combines with new course skills
- Mention the course and D2 SCTP programme
- State salary expectation
- End with a clear call to action`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}