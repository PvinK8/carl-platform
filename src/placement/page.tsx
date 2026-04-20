'use client'
import { useState } from 'react'
import Link from 'next/link'

const COURSES: Record<string, string> = {
  PDDS: 'Professional Diploma in Data Science',
  PDDI: 'Professional Diploma in Digital Innovation',
  ACIS: 'Advanced Certificate in Infrastructure Support',
  PDCA: 'Professional Diploma in Cloud Administration',
  PDDM: 'Professional Diploma in Digital Marketing',
  PDFSWD: 'Professional Diploma in Full Stack Web Development',
}

const COURSES_SKILLS: Record<string, string> = {
  PDDS: 'Power BI, Python, Machine Learning, Deep Learning, Generative AI, Azure AI, Power Automate, Data Visualisation, NLP, Scrum',
  PDDI: 'Power BI, Power Automate, Power Apps, Generative AI, Microsoft Copilot, Digital Transformation, Agile, Low-code Development, Prompt Engineering',
  ACIS: 'Server Administration, Networking, IT Operating Systems, Cloud Fundamentals (Azure), Linux, IT Customer Service, Virtualisation, Shell Scripting',
  PDCA: 'Azure Cloud Administration, Hybrid Cloud, Azure AD, Azure Virtual Desktop, Cloud Security Governance, Identity Management, Windows Server',
  PDDM: 'Google Ads, Facebook Ads, SEO, Email Marketing, Web Analytics, Marketing Automation, CRM, WordPress, Video Marketing, Omni-channel, Agile',
  PDFSWD: 'HTML/CSS, JavaScript, React, Node.js, SQL, NoSQL, MVC, REST APIs, Generative AI, GitHub Copilot, Agile, Enterprise Software Development',
}

interface Role {
  title: string
  tier: 'Best Fit' | 'Good Fit' | 'Stretch'
  rationale: string
  salary_min: number
  salary_max: number
  companies: string[]
  search_keywords: string[]
}

interface Analysis {
  name: string
  headline: string
  experience_years: number
  top_skills: string[]
  roles: Role[]
}

interface MCFJob {
  title: string
  company: string
  salary: string
  url: string
  posted: string
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  'Best Fit': { bg: '#EAF3DE', text: '#3B6D11' },
  'Good Fit': { bg: '#E6F1FB', text: '#185FA5' },
  'Stretch': { bg: '#FAEEDA', text: '#854F0B' },
}

export default function Placement() {
  const [step, setStep] = useState(0)
  const [course, setCourse] = useState('PDDS')
  const [cv, setCv] = useState('')
  const [salMin, setSalMin] = useState('4000')
  const [salMax, setSalMax] = useState('6000')
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [pitch, setPitch] = useState<{ subject: string; lines: string[] } | null>(null)
  const [error, setError] = useState('')
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [mcfJobs, setMcfJobs] = useState<Record<string, MCFJob[]>>({})
  const [mcfLoading, setMcfLoading] = useState(false)
  const [jobDays, setJobDays] = useState(7)
  const [copied, setCopied] = useState(false)

  async function analyse() {
    if (!cv.trim()) { setError('Please paste the candidate CV.'); return }
    if (parseInt(salMin) > parseInt(salMax)) { setError('Min salary cannot be higher than max.'); return }
    setError(''); setLoading(true)
    try {
      setLoadMsg('Analysing candidate profile...')
      const r1 = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, course, salMin, salMax, courseSkills: COURSES_SKILLS[course] })
      })
      const d1 = await r1.json()
      if (d1.error) throw new Error(d1.error)
      setAnalysis(d1)
      setStep(1)
      setLoadMsg('Writing recruiter pitch...')
      const r2 = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, course, courseLabel: COURSES[course], salMin, salMax })
      })
      const d2 = await r2.json()
      if (!d2.error) setPitch(d2)
    } catch (e: any) {
      setError('Analysis failed: ' + e.message)
    }
    setLoading(false); setLoadMsg('')
  }

  async function loadMCF(roleTitle: string, keywords: string) {
    if (mcfJobs[roleTitle]) return
    setMcfLoading(true)
    try {
      const r = await fetch(`/api/mcf?q=${encodeURIComponent(keywords)}&salary=${salMin}`)
      const d = await r.json()
      setMcfJobs(p => ({ ...p, [roleTitle]: d.jobs || [] }))
    } catch { setMcfJobs(p => ({ ...p, [roleTitle]: [] })) }
    setMcfLoading(false)
  }

  function reset() {
    setStep(0); setAnalysis(null); setPitch(null); setCv('')
    setActiveRole(null); setError(''); setMcfJobs({})
  }

  const steps = ['Candidate Profile', 'Role Matches', 'Live Jobs', 'Recruiter Pitch']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#185FA5' }}>
              <span className="text-white font-bold text-xs tracking-widest">CARL</span>
            </div>
            <div>
              <h1 className="font-medium text-gray-900">Placement</h1>
              <p className="text-xs text-gray-500">Post-course job matching · Singapore</p>
            </div>
          </div>
        </div>

        {/* Step tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1">
          {steps.map((s, i) => {
            const isActive = step === i
            const isDone = i < step
            return (
              <button key={i} onClick={() => analysis && setStep(i)}
                className="flex-1 py-2 px-1 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
                style={{ background: isActive ? '#185FA5' : isDone ? '#EAF3DE' : 'transparent', color: isActive ? '#fff' : isDone ? '#3B6D11' : '#888' }}>
                <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center"
                  style={{ background: isActive ? 'rgba(255,255,255,0.2)' : isDone ? '#3B6D11' : '#ddd', color: isActive || isDone ? '#fff' : '#888' }}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            )
          })}
        </div>

        {/* Step 0 — Input */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Course</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.keys(COURSES).map(c => (
                  <button key={c} onClick={() => setCourse(c)}
                    className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                    style={{ background: course === c ? '#185FA5' : 'transparent', color: course === c ? '#fff' : '#666', borderColor: course === c ? '#185FA5' : '#ddd' }}>
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">{COURSES[course]}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">CV / Resume Text <span className="text-red-400">*</span></p>
              <textarea value={cv} onChange={e => setCv(e.target.value)}
                placeholder="Paste full CV here — work history, education, skills..."
                className="w-full h-48 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700" />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Salary Expectation</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">SGD</span>
                <input type="number" value={salMin} onChange={e => setSalMin(e.target.value)} step="500"
                  className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <span className="text-sm text-gray-400">to</span>
                <input type="number" value={salMax} onChange={e => setSalMax(e.target.value)} step="500"
                  className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <span className="text-sm text-gray-400">/month</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button onClick={analyse} disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all"
              style={{ background: loading ? '#ddd' : '#185FA5', color: loading ? '#888' : '#fff' }}>
              {loading ? (loadMsg || 'Analysing...') : 'Analyse candidate with CARL'}
            </button>
          </div>
        )}

        {/* Step 1 — Roles */}
        {step === 1 && analysis && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[['Candidate', analysis.name], ['Experience', analysis.experience_years + ' yrs'], ['Course', course], ['Salary', 'SGD ' + parseInt(salMin).toLocaleString() + '-' + parseInt(salMax).toLocaleString()]].map(([l, v]) => (
                <div key={l} className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{l}</p>
                  <p className="text-sm font-medium text-gray-800">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['High Touch', 'D2 (SCTP)', course].map(b => (
                <span key={b} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#E6F1FB', color: '#185FA5' }}>{b}</span>
              ))}
              {analysis.top_skills?.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{s}</span>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveRole(null)}
                className="px-3 py-1 rounded-full text-xs border transition-all"
                style={{ background: !activeRole ? '#185FA5' : 'transparent', color: !activeRole ? '#fff' : '#888', borderColor: !activeRole ? '#185FA5' : '#ddd' }}>All</button>
              {Object.keys(TIER_COLORS).map(tier => {
                const tc = TIER_COLORS[tier]
                return (
                  <button key={tier} onClick={() => setActiveRole(activeRole === tier ? null : tier)}
                    className="px-3 py-1 rounded-full text-xs border transition-all"
                    style={{ background: activeRole === tier ? tc.bg : 'transparent', color: activeRole === tier ? tc.text : '#888', borderColor: activeRole === tier ? tc.text : '#ddd' }}>
                    {tier}
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              {analysis.roles?.filter(r => !activeRole || r.tier === activeRole).map((r, i) => {
                const tc = TIER_COLORS[r.tier] || TIER_COLORS['Good Fit']
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{r.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: tc.bg, color: tc.text }}>{r.tier}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">SGD {r.salary_min?.toLocaleString()}-{r.salary_max?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">per month</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{r.rationale}</p>
                    <div className="flex flex-wrap gap-2">
                      {r.companies?.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-md text-xs bg-gray-50 text-gray-500 border border-gray-100">{c}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setStep(2)} className="w-full mt-4 py-3 rounded-xl font-medium text-sm text-white" style={{ background: '#185FA5' }}>View Live Jobs</button>
          </div>
        )}

        {/* Step 2 — Jobs */}
        {step === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-gray-900">Live jobs from MyCareersFuture</p>
                <p className="text-xs text-gray-400 mt-0.5">Click Load to fetch real listings for each role</p>
              </div>
              <div className="flex gap-2">
                {[7, 14].map(d => (
                  <button key={d} onClick={() => setJobDays(d)}
                    className="px-3 py-1 rounded-full text-xs border transition-all"
                    style={{ background: jobDays === d ? '#185FA5' : 'transparent', color: jobDays === d ? '#fff' : '#888', borderColor: jobDays === d ? '#185FA5' : '#ddd' }}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {analysis?.roles?.map((r, i) => {
                const tc = TIER_COLORS[r.tier] || TIER_COLORS['Good Fit']
                const keywords = (r.search_keywords || []).join(' ') || r.title
                const loaded = mcfJobs.hasOwnProperty(r.title)
                const jobs = mcfJobs[r.title] || []
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{r.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: tc.bg, color: tc.text }}>{r.tier}</span>
                      </div>
                      <button onClick={() => loadMCF(r.title, keywords)} disabled={mcfLoading}
                        className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-all"
                        style={{ background: '#185FA5' }}>
                        {mcfLoading && !loaded ? 'Loading...' : loaded ? 'Refresh' : 'Load MCF'}
                      </button>
                    </div>

                    {!loaded && <p className="text-xs text-gray-400 italic">Searching: {keywords}</p>}

                    {loaded && jobs.length > 0 && (
                      <div className="border-t border-gray-50 pt-3 space-y-2">
                        {jobs.map((j, ji) => (
                          <div key={ji} className="flex justify-between items-center gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{j.title}</p>
                              <p className="text-xs text-gray-400">{j.company} · {j.salary}</p>
                            </div>
                            <a href={j.url} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg text-xs font-medium shrink-0"
                              style={{ background: '#EAF3DE', color: '#3B6D11' }}>
                              View Post
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    {loaded && jobs.length === 0 && (
                      <p className="text-xs text-gray-400 mt-2">No listings found. Try 14 days or adjust salary.</p>
                    )}
                  </div>
                )
              })}
            </div>
            <button onClick={() => setStep(3)} className="w-full mt-4 py-3 rounded-xl font-medium text-sm text-white" style={{ background: '#185FA5' }}>Generate Recruiter Pitch</button>
          </div>
        )}

        {/* Step 3 — Pitch */}
        {step === 3 && (
          <div>
            {!pitch ? <p className="text-gray-400 text-sm">Generating pitch...</p> : (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                <p className="font-medium text-gray-900 mb-4">{pitch.subject}</p>
                <div className="border-t border-gray-50 pt-4 space-y-3">
                  {pitch.lines?.map((line, i) => <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>)}
                </div>
                <div className="flex gap-2 mt-4">
                  {['High Touch', 'D2 (SCTP)', course].map(b => (
                    <span key={b} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#E6F1FB', color: '#185FA5' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => {
              if (!pitch) return
              navigator.clipboard.writeText('Subject: ' + pitch.subject + '\n\n' + pitch.lines.join('\n'))
              setCopied(true); setTimeout(() => setCopied(false), 2000)
            }} className="w-full mt-4 py-3 rounded-xl font-medium text-sm border transition-all"
              style={{ background: copied ? '#EAF3DE' : '#f5f5f5', color: copied ? '#3B6D11' : '#444' }}>
              {copied ? 'Copied!' : 'Copy Pitch to Clipboard'}
            </button>
            <button onClick={reset} className="w-full mt-2 py-3 rounded-xl font-medium text-sm text-white" style={{ background: '#185FA5' }}>
              Analyse Another Candidate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}