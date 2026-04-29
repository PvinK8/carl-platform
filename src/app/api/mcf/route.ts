import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const salary = searchParams.get('salary') || '4000'

    const url = `https://api.mycareersfuture.gov.sg/v2/jobs?search=${encodeURIComponent(q)}&salary=${salary}&employmentType=Full%20Time&sortBy=new_posting_date&limit=5&page=0`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) throw new Error(`MCF API error: ${res.status}`)

    const data = await res.json()

    const jobs = (data.results || []).map((j: any) => {
      const postedDate = j.metadata?.newPostingDate || ''
      const daysAgo = postedDate
        ? Math.floor((Date.now() - new Date(postedDate).getTime()) / 86400000)
        : null
      return {
        title: j.title || '',
        company: j.postedCompany?.name || '',
        salary: j.salary
          ? `SGD ${Number(j.salary.minimum).toLocaleString()} - ${Number(j.salary.maximum).toLocaleString()}`
          : 'Salary not specified',
        daysAgo,
        url: j.metadata?.jobDetailsUrl || `https://www.mycareersfuture.gov.sg/job/${j.uuid}`,
      }
    })

    return NextResponse.json({ jobs })
  } catch (e: any) {
    return NextResponse.json({ jobs: [], error: e.message }, { status: 500 })
  }
}