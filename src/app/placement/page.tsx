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
  { label: 'Below $2,000',     value: '1' },
  { label: '$2,000 – $2,999',  value: '2' },
  { label: '$3,000 – $3,999',  value: '3' },
  { label: '$4,000 – $4,999',  value: '4' },
  { label: '$5,000 – $6,999',  value: '5' },
  { label: '$7,000 and above', value: '6' },
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

interface Role {
  title: string;
  why: string;
  orgTypes: string;
  mcfKeyword: string;
  mcfUrl: string;
  fitScore: number;
}

interface Result {
  roles: Role[];
  top5Indices: number[];
  candidateName: string;
  courseTitle: string;
  courseSkills: string;
  apolloContacts: Array<{ name: string; title: string; email: string; linkedin: string } | null>;
}

export default function RoleLauncherPage() {
  const [candidateName, setCandidateName] = useState('');
  const [cv, setCv] = useState('');
  const [course, setCourse] = useState('');
  const [salaryBand, setSalaryBand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'deciding' | 'manual' | 'confirmed'>('deciding');
  const [activeTab, setActiveTab] = useState<'roles' | 'candidate' | 'employer'>('roles');

  const handleSubmit = async () => {
    if (!candidateName || !cv || !course || !salaryBand) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true); setResult(null); setMode('deciding'); setSelected(new Set());
    try {
      const res = await fetch('/api/placement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, course, salaryBand, candidateName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setSelected(new Set(data.top5Indices));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  const toggleRole = (i: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const selectedRoles = result ? result.roles.filter((_, i) => selected.has(i)) : [];

  const candidateMessage = result ? [
    'Hi ' + result.candidateName + ',',
    '',
    'Here are some role directions I have shortlisted for you based on your background and your ' + result.courseTitle + ' course.',
    'These have been selected because they align with your experience combined with your new digital skills.',
    'Each one includes a direct link to search live openings on MyCareersFuture.',
    '',
    ...selectedRoles.map((r, i) =>
      (i + 1) + '. ' + r.title +
      '\n   ' + r.why +
      '\n   Where to look: ' + r.orgTypes +
      '\n   Search live jobs → ' + r.mcfUrl
    ),
    '',
    'Review at your own pace and flag any that interest you — happy to discuss in our next session.',
  ].join('\n') : '';

  const whatsappPrompt = result ? [
    'You are helping a career specialist send a WhatsApp message to a job seeker named ' + result.candidateName + '.',
    'Write a warm encouraging message sharing these ' + selectedRoles.length + ' role directions that match their profile.',
    'Keep it conversational, brief and mobile-friendly. Include the MCF search link for each.',
    '',
    'Roles to share:',
    ...selectedRoles.map((r, i) => (i + 1) + '. ' + r.title + ' | ' + r.mcfUrl),
  ].join('\n') : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a2342 0%,#1a4a8a 50%,#1565c0 100%)', fontFamily: "'Segoe UI',system-ui,sans-serif", color: 'white', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '1.5rem' }}>← Back to CARL</a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4ade80,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Role Launcher</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Smart role matching · Live MCF search links · Employer outreach</p>
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
              placeholder="Paste candidate resume or career summary. Include job titles, responsibilities, domain, achievements. The AI uses this to find roles where their background is a genuine advantage — not just generic titles."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        </div>

        {error && <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '0.85rem 1.1rem', marginBottom: '0.85rem', color: '#fca5a5', fontSize: '0.85rem' }}>⚠️ {error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '1rem', border: 'none', borderRadius: 13, fontFamily: 'inherit',
          background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#16a34a,#15803d)',
          color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem', boxShadow: loading ? 'none' : '0 8px 28px rgba(22,163,74,.35)',
        }}>
          {loading ? '⟳ Finding matching roles…' : '🚀 Launch Role Search'}
        </button>

        {result && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {result.roles.length} Role Directions — ranked by fit
                </p>
                {mode === 'deciding' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setSelected(new Set(result.top5Indices)); setMode('confirmed'); setActiveTab('candidate'); }}
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

              {result.roles.map((r, i) => {
                const isSelected = selected.has(i);
                const isTop5 = result.top5Indices.includes(i);
                return (
                  <div key={i} onClick={() => mode === 'manual' && toggleRole(i)}
                    style={{ background: isSelected ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (isSelected ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'), borderRadius: 12, padding: '1rem', marginBottom: '0.6rem', cursor: mode === 'manual' ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {mode === 'manual' && (
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid ' + (isSelected ? '#4ade80' : 'rgba(255,255,255,0.3)'), background: isSelected ? '#4ade80' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</span>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {isTop5 && <span style={{ fontSize: '0.65rem', background: 'rgba(74,222,128,0.2)', color: '#4ade80', padding: '0.15rem 0.5rem', borderRadius: 20, fontWeight: 700 }}>TOP 5</span>}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.fitScore >= 75 ? '#4ade80' : r.fitScore >= 55 ? '#facc15' : '#f87171' }}>{r.fitScore}% fit</span>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#4ade80', lineHeight: 1.45 }}>↳ {r.why}</p>
                        <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>🏢 {r.orgTypes}</p>
                        <a href={r.mcfUrl} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          Search "{r.mcfKeyword}" on MCF →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {mode === 'confirmed' && selectedRoles.length > 0 && (
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
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Copy this prompt into a new Claude chat to generate a WhatsApp message:</p>
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
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                      These are template outreach emails for companies in the sectors relevant to this candidate. Personalise the company name and role before sending.
                    </p>
                    {selectedRoles.map((r, i) => {
                      const contact = result.apolloContacts?.[i] ?? null;
                      const firstName = contact?.name?.split(' ')[0] ?? 'there';
                      const emailBody = [
                        'Subject: Candidate opportunity — ' + r.title,
                        '',
                        'Hi ' + firstName + ',',
                        '',
                        'I noticed [Company] is hiring for [role similar to ' + r.title + ']. I happen to know someone who could be a strong fit.',
                        '',
                        result.candidateName + ' brings solid domain experience combined with newly acquired ' + result.courseSkills.split(',').slice(0, 3).join(', ') + ' skills. They are actively looking and available to start relatively soon.',
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
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.title}</div>
                              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Sector: {r.orgTypes}</div>
                              {contact
                                ? <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: 2 }}>Apollo contact: {contact.name} ({contact.title}){contact.email ? ' · ' + contact.email : ''}</div>
                                : <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>No Apollo contact found — search manually on apollo.io</div>
                              }
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(emailBody)}
                              style={{ padding: '0.35rem 0.7rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
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
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}