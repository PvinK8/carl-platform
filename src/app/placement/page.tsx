'use client';

import { useState } from 'react';

const COURSES = [
  { code: 'PDDS',   title: 'Professional Diploma in Data Science' },
  { code: 'PDDI',   title: 'Professional Diploma in Digital Innovation' },
  { code: 'ACIS',   title: 'Advanced Certificate in Infrastructure Support' },
  { code: 'PDCA',   title: 'Professional Diploma in Cloud Administration' },
  { code: 'PDDM',   title: 'Professional Diploma in Digital Marketing' },
  { code: 'PDFSWD', title: 'Professional Diploma in Full Stack Web Development' },
];

const SALARY_RANGES = [
  { label: 'Below $2,000',     value: '1', min: 0    },
  { label: '$2,000 – $2,999',  value: '2', min: 2000 },
  { label: '$3,000 – $3,999',  value: '3', min: 3000 },
  { label: '$4,000 – $4,999',  value: '4', min: 4000 },
  { label: '$5,000 – $6,999',  value: '5', min: 5000 },
  { label: '$7,000 and above', value: '6', min: 7000 },
];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px', padding: '0.7rem 1rem', color: 'white',
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.01em',
};

interface MCFJob {
  uuid: string;
  title: string;
  postedCompany: { name: string };
  salary: { minimum: number; maximum: number };
  externalApplyUrl?: string;
  applyUrl?: string;
  metadata: { newPostingDate: string };
  fitReason?: string;
  fitScore?: number;
}

interface AIRole {
  title: string;
  why: string;
  orgTypes: string;
  mcfKeyword: string;
  fitScore: number;
}

interface Result {
  candidateName: string;
  courseTitle: string;
  courseSkills: string;
  aiRoles: AIRole[];
  jobs: MCFJob[];
}

export default function RoleLauncherPage() {
  const [candidateName, setCandidateName] = useState('');
  const [cv, setCv] = useState('');
  const [course, setCourse] = useState('');
  const [salaryBand, setSalaryBand] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'deciding' | 'manual' | 'confirmed'>('deciding');
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidate' | 'employer'>('jobs');

  const handleSubmit = async () => {
    if (!candidateName || !cv || !course || !salaryBand) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true); setResult(null); setMode('deciding'); setSelected(new Set());

    try {
      // Step 1: Get AI keywords and role analysis
      setLoadingStatus('Analysing candidate profile…');
      const aiRes = await fetch('/api/placement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, course, salaryBand, candidateName }),
      });
      const aiData = await aiRes.json();
      if (aiData.error) throw new Error(aiData.error);

      const salaryMin = SALARY_RANGES.find(r => r.value === salaryBand)?.min ?? 0;

      // Step 2: Search MCF for each keyword directly from browser
      setLoadingStatus('Searching live MCF listings…');
      const allJobs: MCFJob[] = [];
      const seen = new Set<string>();

      for (const role of aiData.aiRoles) {
        try {
          const mcfRes = await fetch(
            'https://api.mycareersfuture.gov.sg/v2/jobs?search=' +
            encodeURIComponent(role.mcfKeyword) +
            '&salary=' + salaryMin +
            '&limit=5&sortBy=new_posting_date',
            { headers: { 'Accept': 'application/json' } }
          );
          if (!mcfRes.ok) continue;
          const mcfData = await mcfRes.json();
          const jobs = mcfData.results ?? [];
          for (const j of jobs) {
            const id = j.uuid ?? j.id ?? (j.title + j.postedCompany?.name);
            if (!seen.has(id)) {
              seen.add(id);
              allJobs.push({ ...j, fitReason: role.why, fitScore: role.fitScore });
            }
          }
        } catch { continue; }
      }

      // Step 3: Sort by fit score and recency
      allJobs.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));

      setResult({
        candidateName,
        courseTitle: aiData.courseTitle,
        courseSkills: aiData.courseSkills,
        aiRoles: aiData.aiRoles,
        jobs: allJobs.slice(0, 15),
      });

      // Auto select top 5
      setSelected(new Set([0, 1, 2, 3, 4]));

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); setLoadingStatus(''); }
  };

  const toggleJob = (i: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const selectedJobs = result ? result.jobs.filter((_, i) => selected.has(i)) : [];

  const candidateMessage = result ? [
    'Hi ' + result.candidateName + ',',
    '',
    'Here are some current openings I have shortlisted for you based on your background and your ' + result.courseTitle + ' course.',
    'These have been selected because they align with your experience combined with your new digital skills.',
    '',
    ...selectedJobs.map((j, i) =>
      (i + 1) + '. ' + (j.title ?? '') + ' — ' + (j.postedCompany?.name ?? '') +
      (j.salary?.minimum ? '\n   Salary: SGD ' + j.salary.minimum.toLocaleString() + (j.salary.maximum ? '–' + j.salary.maximum.toLocaleString() : '') + '/mo' : '') +
      '\n   ' + (j.fitReason ?? '') +
      '\n   Apply: ' + (j.externalApplyUrl ?? j.applyUrl ?? 'Check MCF listing')
    ),
    '',
    'Review at your own pace and flag any that interest you — happy to discuss in our next session.',
  ].join('\n') : '';

  const whatsappPrompt = result ? [
    'You are helping a career specialist send a WhatsApp message to ' + result.candidateName + '.',
    'Write a warm encouraging message sharing these ' + selectedJobs.length + ' job openings.',
    'Keep it brief and mobile-friendly. Include job title, company, and apply link for each.',
    '',
    ...selectedJobs.map((j, i) =>
      (i + 1) + '. ' + (j.title ?? '') + ' at ' + (j.postedCompany?.name ?? '') +
      ' | Apply: ' + (j.externalApplyUrl ?? j.applyUrl ?? 'MCF listing')
    ),
  ].join('\n') : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a2342 0%,#1a4a8a 50%,#1565c0 100%)', fontFamily: "'Segoe UI',system-ui,sans-serif", color: 'white', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '1.5rem' }}>← Back to CARL</a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4ade80,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Role Launcher</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Smart job matching · Live MCF listings · Employer outreach</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Candidate Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={labelStyle}>Candidate Name <span style={{ color: '#60a5fa' }}>*</span></label>
              <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="e.g. Siti Rahimah" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Course Completed <span style={{ color: '#60a5fa' }}>*</span></label>
              <select value={course} onChange={e => setCourse(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select course…</option>
                {COURSES.map(c => <option key={c.code} value={c.code} style={{ background: '#1a4a8a' }}>{c.code} — {c.title}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>Salary Expectation <span style={{ color: '#60a5fa' }}>*</span></label>
            <select value={salaryBand} onChange={e => setSalaryBand(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select range…</option>
              {SALARY_RANGES.map(r => <option key={r.value} value={r.value} style={{ background: '#1a4a8a' }}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Resume / Work History <span style={{ color: '#60a5fa' }}>*</span></label>
            <textarea value={cv} onChange={e => setCv(e.target.value)} rows={6}
              placeholder="Paste candidate resume or career summary. Include job titles, responsibilities, domain, achievements."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        </div>

        {error && <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '0.85rem 1.1rem', marginBottom: '0.85rem', color: '#fca5a5', fontSize: '0.85rem' }}>⚠️ {error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '1rem', border: 'none', borderRadius: 13, fontFamily: 'inherit',
          background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#16a34a,#15803d)',
          color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
        }}>
          {loading ? '⟳ ' + loadingStatus : '🚀 Launch Role Search'}
        </button>

        {result && (
          <div>
            {/* AI search angles used */}
            <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Search angles:</span>
              {result.aiRoles.map((r, i) => (
                <span key={i} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 20, color: 'rgba(255,255,255,0.6)' }}>{r.mcfKeyword}</span>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {result.jobs.length} Live Roles Found
                </p>
                {mode === 'deciding' && result.jobs.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setMode('confirmed'); setActiveTab('candidate'); }}
                      style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#4ade80,#16a34a)', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Accept top 5
                    </button>
                    <button onClick={() => setMode('manual')}
                      style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Pick manually
                    </button>
                  </div>
                )}
                {mode === 'manual' && (
                  <button onClick={() => { setMode('confirmed'); setActiveTab('candidate'); }}
                    style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#4ade80,#16a34a)', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Confirm {selected.size} selected
                  </button>
                )}
                {mode === 'confirmed' && (
                  <button onClick={() => setMode('manual')}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Edit selection
                  </button>
                )}
              </div>

              {result.jobs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  No live MCF listings found for these search angles. Try adjusting the salary range or check MCF directly.
                </div>
              )}

              {result.jobs.map((j, i) => {
                const isSelected = selected.has(i);
                return (
                  <div key={j.uuid ?? i} onClick={() => mode === 'manual' && toggleJob(i)}
                    style={{ background: isSelected ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (isSelected ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'), borderRadius: 12, padding: '1rem', marginBottom: '0.6rem', cursor: mode === 'manual' ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {mode === 'manual' && (
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid ' + (isSelected ? '#4ade80' : 'rgba(255,255,255,0.3)'), background: isSelected ? '#4ade80' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{j.title}</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{j.postedCompany?.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {i < 5 && <span style={{ fontSize: '0.65rem', background: 'rgba(74,222,128,0.2)', color: '#4ade80', padding: '0.15rem 0.5rem', borderRadius: 20, fontWeight: 700 }}>TOP 5</span>}
                          </div>
                        </div>
                        {j.salary?.minimum > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem' }}>
                            SGD {j.salary.minimum.toLocaleString()}{j.salary.maximum ? '–' + j.salary.maximum.toLocaleString() : ''}/mo
                          </div>
                        )}
                        {j.fitReason && <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#4ade80', lineHeight: 1.45 }}>↳ {j.fitReason}</p>}
                        {(j.externalApplyUrl ?? j.applyUrl) && (
                          <a href={j.externalApplyUrl ?? j.applyUrl} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none' }}>
                            Apply on MCF →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {mode === 'confirmed' && selectedJobs.length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[{ id: 'candidate', label: '💬 Candidate Message' }, { id: 'employer', label: '📧 Employer Outreach' }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                      style={{ padding: '0.6rem 1.1rem', borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: activeTab === t.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.5)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'candidate' && (
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Candidate Shortlist Message</p>
                      <button onClick={() => navigator.clipboard.writeText(candidateMessage)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Copy
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{candidateMessage}</pre>
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(96,165,250,0.08)', borderRadius: 12, border: '1px solid rgba(96,165,250,0.15)' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WhatsApp via Claude</p>
                      <pre style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 8 }}>{whatsappPrompt}</pre>
                      <button onClick={() => navigator.clipboard.writeText(whatsappPrompt)}
                        style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid rgba(96,165,250,0.3)', background: 'transparent', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Copy WhatsApp prompt
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'employer' && (
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Employer Outreach Emails</p>
                    {selectedJobs.map((j, i) => {
                      const emailBody = [
                        'Subject: Candidate for your ' + (j.title ?? 'open role') + ' position',
                        '',
                        'Hi there,',
                        '',
                        'I noticed ' + (j.postedCompany?.name ?? 'your company') + ' is hiring for ' + (j.title ?? 'this role') + '. I happen to know someone who could be a strong fit.',
                        '',
                        result.candidateName + ' brings solid domain experience combined with newly acquired ' + result.courseSkills.split(',').slice(0, 3).join(', ') + ' skills. They are actively looking and available to start soon.',
                        '',
                        'Is this role still open? If so, I would be happy to share the resume. No cost to you for accepting it.',
                        '',
                        'Best regards,',
                        '[Your name]',
                        'Lithan',
                      ].join('\n');

                      return (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.1rem', marginBottom: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{j.title} — {j.postedCompany?.name}</div>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(emailBody)}
                              style={{ padding: '0.35rem 0.7rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                              Copy
                            </button>
                          </div>
                          <pre style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{emailBody}</pre>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input:focus, textarea:focus, select:focus { border-color: rgba(96,165,250,0.5) !important; }
      `}</style>
    </div>
  );
}