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

const URGENCY_OPTIONS = [
  { label: 'Immediate — need job ASAP',         value: 'immediate' },
  { label: 'Within 3 months post-course',       value: '3_months'  },
  { label: 'Within 6 months post-course',       value: '6_months'  },
  { label: 'Flexible / still exploring',        value: 'flexible'  },
];

const BACKGROUND_OPTIONS = [
  'Admin / Operations', 'Banking / Finance', 'Customer Service',
  'Education / Training', 'Engineering (non-IT)', 'F&B / Hospitality',
  'Healthcare', 'HR / Talent / L&D', 'IT (existing, upskilling)',
  'Logistics / Supply Chain', 'Marketing / Comms', 'Retail / Sales', 'Other',
];

interface FormData {
  candidateName: string; age: string; currentRole: string; background: string;
  yearsExperience: string; targetCourse: string; resumeText: string;
  motivationStatement: string; urgency: string; lastSalary: string;
  expectedSalary: string; concerns: string;
}

interface RoleCard { tier: 'best' | 'good' | 'stretch'; title: string; why: string; }

interface EvalResult {
  overallScore: number; verdict: string; verdictColor: string; counsellorSummary: string;
  domainRoles: RoleCard[]; domainEdge: string;
  salaryGap: { lastLabel: string; expLabel: string; direction: string; directionColor: string; bandDiff: string; counsellorRead: string; };
  marketSalary: string; marketSalarySub: string; marketDemand: string; marketNote: string;
  motivationScore: number; motivationNotes: string;
  urgencyScore: number; urgencyNotes: string;
  courseFitScore: number; courseFitNotes: string;
  salaryScore: number; salaryNotes: string;
  greenFlags: string[]; redFlags: string[]; talkingPoints: string[]; salaryTalkingPoint: string;
}

const EMPTY_FORM: FormData = {
  candidateName: '', age: '', currentRole: '', background: '', yearsExperience: '',
  targetCourse: '', resumeText: '', motivationStatement: '', urgency: '',
  lastSalary: '', expectedSalary: '', concerns: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px', padding: '0.7rem 1rem', color: 'white',
  fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.01em',
};

function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#60a5fa', marginLeft: 2 }}>*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#60a5fa', marginLeft: 2 }}>*</span>}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
        color: value ? 'white' : 'rgba(255,255,255,0.3)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem',
      }}>
        <option value="" disabled>Select…</option>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1a4a8a', color: 'white' }}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ title, children, borderColor }: { title: string; children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderRadius: '18px', border: `1px solid ${borderColor ?? 'rgba(255,255,255,0.1)'}`, padding: '1.5rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.1rem' }}>{title}</p>
      {children}
    </div>
  );
}

function ScoreBar({ score, label, notes }: { score: number; label: string; notes: string }) {
  const color = score >= 75 ? '#4ade80' : score >= 55 ? '#facc15' : '#f87171';
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color, fontWeight: 700 }}>{score}/100</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1.2s cubic-bezier(.16,1,.3,1)' }} />
      </div>
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{notes}</p>
    </div>
  );
}

export default function TalentEvaluationPage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [salBanner, setSalBanner] = useState<{ type: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState('');

  const set = (field: keyof FormData) => (value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'lastSalary' || field === 'expectedSalary') {
        const l = parseInt(field === 'lastSalary' ? value : prev.lastSalary);
        const e = parseInt(field === 'expectedSalary' ? value : prev.expectedSalary);
        if (l && e) {
          const d = e - l;
          if (d > 1)  setSalBanner({ type: 'jump', text: `Expecting a jump of ${d} salary bands — walk them through a realistic 12–24 month trajectory instead of an immediate leap.` });
          else if (d === 1) setSalBanner({ type: 'jump', text: 'One band up. Achievable for high-demand courses within 12–18 months — validate against actual starting salaries for their target role.' });
          else if (d === 0) setSalBanner({ type: 'flat', text: 'Same salary band — realistic mindset. Reinforce that the domain+skills combination creates meaningful upside in years 2–3.' });
          else setSalBanner({ type: 'drop', text: `Willing to drop ${Math.abs(d)} band${Math.abs(d) > 1 ? 's' : ''} — strong commitment signal. Acknowledge this directly and ask about their financial runway and support system.` });
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!form.candidateName)       missing.push('Candidate Name');
    if (!form.targetCourse)        missing.push('Target Course');
    if (!form.resumeText)          missing.push('Resume / Work History');
    if (!form.lastSalary)          missing.push('Last Drawn Salary');
    if (!form.expectedSalary)      missing.push('Expected Salary');
    if (!form.motivationStatement) missing.push('Motivation Statement');
    if (!form.urgency)             missing.push('Job Search Urgency');
    if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setTimeout(() => document.getElementById('tea-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Evaluation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setForm(EMPTY_FORM); setSalBanner(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const TIER_COLOR  = { best: '#4ade80', good: '#60a5fa', stretch: '#fb923c' } as const;
  const TIER_LABEL  = { best: 'Best Fit', good: 'Good Fit', stretch: 'Stretch' } as const;
  const BAN_BG      = { jump: 'rgba(248,113,113,0.08)', flat: 'rgba(74,222,128,0.08)',  drop: 'rgba(251,191,36,0.08)'  } as const;
  const BAN_BDR     = { jump: 'rgba(248,113,113,0.22)', flat: 'rgba(74,222,128,0.22)',  drop: 'rgba(251,191,36,0.22)'  } as const;
  const BAN_COL     = { jump: 'rgba(248,113,113,0.9)',  flat: 'rgba(74,222,128,0.9)',   drop: 'rgba(251,191,36,0.9)'   } as const;
  const BAN_ICON    = { jump: '⚠️', flat: '✅', drop: '💛' } as const;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a2342 0%,#1a4a8a 50%,#1565c0 100%)', fontFamily: "'Segoe UI',system-ui,sans-serif", color: 'white', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '1.5rem' }}>← Back to CARL</a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#60a5fa,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, boxShadow: '0 8px 20px rgba(37,99,235,.4)' }}>🎯</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Talent Evaluation Assistant</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Pre-enrolment readiness + domain-specific role mapping · TEA · SCTP D2</p>
          </div>
        </div>

        <Card title="01 · Candidate Profile">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Candidate Name" value={form.candidateName} onChange={set('candidateName')} placeholder="e.g. Ahmad bin Hassan" required />
            <Field label="Age" value={form.age} onChange={set('age')} placeholder="e.g. 38" type="number" />
            <Field label="Current / Last Job Title" value={form.currentRole} onChange={set('currentRole')} placeholder="e.g. Talent Acquisition Manager" />
            <SelectField label="Industry Background" value={form.background} onChange={set('background')} options={BACKGROUND_OPTIONS.map(b => ({ label: b, value: b }))} />
            <Field label="Years of Experience" value={form.yearsExperience} onChange={set('yearsExperience')} placeholder="e.g. 10" type="number" />
            <SelectField label="Target Course" value={form.targetCourse} onChange={set('targetCourse')} options={COURSES.map(c => ({ label: `${c.code} — ${c.title}`, value: c.code }))} required />
          </div>
        </Card>

        <Card title="02 · Resume / Work History — paste directly, no formatting needed">
          <label style={labelStyle}>Resume or Career Summary <span style={{ color: '#60a5fa' }}>*</span></label>
          <textarea value={form.resumeText} onChange={e => set('resumeText')(e.target.value)} rows={6}
            placeholder={`Paste your resume text or summarise your work history:\n• Job titles and companies\n• Key responsibilities and tools used\n• Achievements or notable projects\n• Qualifications / certifications\n\nThe AI reads this to surface domain-specific roles — not generic titles.`}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            💡 Include your actual domain (HR, talent, L&D, finance, healthcare…). The AI finds roles where your background is a competitive advantage over a pure-tech hire.
          </p>
        </Card>

        <Card title="03 · Salary — Last Drawn &amp; Expected">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <SelectField label="Last Drawn Monthly Salary" value={form.lastSalary} onChange={set('lastSalary')} options={SALARY_RANGES} required />
            <SelectField label="Expected Salary After Course" value={form.expectedSalary} onChange={set('expectedSalary')} options={SALARY_RANGES} required />
          </div>
          {salBanner && (
            <div style={{ marginTop: '0.75rem', background: BAN_BG[salBanner.type as keyof typeof BAN_BG], border: `1px solid ${BAN_BDR[salBanner.type as keyof typeof BAN_BDR]}`, borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{BAN_ICON[salBanner.type as keyof typeof BAN_ICON]}</span>
              <span style={{ fontSize: '0.78rem', color: BAN_COL[salBanner.type as keyof typeof BAN_COL], lineHeight: 1.5 }}>{salBanner.text}</span>
            </div>
          )}
        </Card>

        <Card title="04 · Motivation &amp; Readiness">
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>Why do you want to make this career switch? <span style={{ color: '#60a5fa' }}>*</span></label>
            <textarea value={form.motivationStatement} onChange={e => set('motivationStatement')(e.target.value)} rows={3}
              placeholder='e.g. "I have spent 10 years in talent and L&D. I want to bring digital skills into this space — building tools that make hiring and learning smarter."'
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <SelectField label="Job Search Urgency" value={form.urgency} onChange={set('urgency')} options={URGENCY_OPTIONS} required />
          </div>
          <label style={labelStyle}>Concerns or Hesitations <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>— optional</span></label>
          <textarea value={form.concerns} onChange={e => set('concerns')(e.target.value)} rows={2}
            placeholder="e.g. Not sure if my HR background will be taken seriously in tech roles."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </Card>

        {error && <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '0.85rem 1.1rem', marginBottom: '0.85rem', color: '#fca5a5', fontSize: '0.85rem' }}>⚠️ {error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '1rem', border: 'none', borderRadius: 13, fontFamily: 'inherit',
          background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
          color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '2rem', boxShadow: loading ? 'none' : '0 8px 28px rgba(37,99,235,.35)',
        }}>
          {loading ? <><span style={{ display: 'inline-block', animation: 'teaSpin 0.9s linear infinite' }}>⟳</span> Analysing with AI…</> : '🎯 Run Talent Evaluation'}
        </button>

        {result && (
          <div id="tea-results" style={{ animation: 'teaFadeUp 0.45s ease both' }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderRadius: 18, border: `1px solid ${result.verdictColor}30`, padding: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="33" fill="none" stroke={result.verdictColor} strokeWidth="6"
                    strokeDasharray={`${(result.overallScore / 100 * 2 * Math.PI * 33).toFixed(1)} ${(2 * Math.PI * 33).toFixed(1)}`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: result.verdictColor, lineHeight: 1 }}>{result.overallScore}</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>/100</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: result.verdictColor, marginBottom: '0.35rem' }}>{result.verdict}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>{result.counsellorSummary}</p>
              </div>
            </div>
            <Card title="🎯 Domain-Specific Role Map — your background × course skills" borderColor="rgba(74,222,128,0.2)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.85rem' }}>
                {result.domainRoles.map((r, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: TIER_COLOR[r.tier], marginBottom: '0.3rem' }}>{TIER_LABEL[r.tier]}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.3rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>{r.why}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Why your background is an advantage here</div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>{result.domainEdge}</p>
              </div>
            </Card>
            <Card title="💰 Salary Gap Analysis" borderColor="rgba(251,191,36,0.15)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.6rem', marginBottom: '0.85rem', alignItems: 'center' }}>
                {[{ lbl: 'Last drawn', val: result.salaryGap.lastLabel }, null, { lbl: 'Expected', val: result.salaryGap.expLabel }].map((item, i) =>
                  item === null
                    ? <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 800, color: result.salaryGap.directionColor }}>{result.salaryGap.direction}</div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: result.salaryGap.directionColor, marginTop: 2 }}>{result.salaryGap.bandDiff}</div></div>
                    : <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.85rem', textAlign: 'center' }}><div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{item.lbl}</div><div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.val}</div></div>
                )}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Counsellor read</div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>{result.salaryGap.counsellorRead}</p>
              </div>
            </Card>
            <div style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.85rem' }}>📊 Market Context</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Salary range (domain roles)</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{result.marketSalary}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{result.marketSalarySub}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Demand signal</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{result.marketDemand}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Positioning note</div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>{result.marketNote}</p>
              </div>
            </div>
            <Card title="Score Breakdown">
              <ScoreBar score={result.motivationScore} label="Motivation & Drive"     notes={result.motivationNotes} />
              <ScoreBar score={result.urgencyScore}    label="Urgency & Readiness"    notes={result.urgencyNotes} />
              <ScoreBar score={result.courseFitScore}  label="Course–Background Fit"  notes={result.courseFitNotes} />
              <ScoreBar score={result.salaryScore}     label="Salary Realism"         notes={result.salaryNotes} />
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              {[{ title: '✅ Green Flags', items: result.greenFlags, color: '#4ade80', bg: 'rgba(74,222,128,0.07)', bdr: 'rgba(74,222,128,0.18)' },
                { title: '🚩 Red Flags',   items: result.redFlags,   color: '#f87171', bg: 'rgba(248,113,113,0.07)', bdr: 'rgba(248,113,113,0.18)' }].map(col => (
                <div key={col.title} style={{ background: col.bg, border: `1px solid ${col.bdr}`, borderRadius: 14, padding: '1.1rem' }}>
                  <p style={{ margin: '0 0 0.7rem', fontSize: '0.68rem', fontWeight: 700, color: col.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{col.title}</p>
                  {col.items.length === 0
                    ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', margin: 0 }}>None identified</p>
                    : col.items.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: col.color, flexShrink: 0, fontSize: '0.8rem', marginTop: 2 }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>{f}</span>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
            <Card title="💬 Counsellor Talking Points for EE Call">
              {result.talkingPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: i < result.talkingPoints.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>{p}</p>
                </div>
              ))}
              {result.salaryTalkingPoint && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', marginTop: '0.5rem', background: 'rgba(251,191,36,0.07)', borderRadius: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>💰</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>{result.salaryTalkingPoint}</p>
                </div>
              )}
            </Card>
            <button onClick={reset} style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 11, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ↩ Evaluate Another Candidate
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes teaSpin   { to { transform: rotate(360deg); } }
        @keyframes teaFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input:focus, textarea:focus, select:focus  { border-color: rgba(96,165,250,0.5) !important; box-shadow: 0 0 0 3px rgba(96,165,250,0.08) !important; }
        a:hover { color: rgba(255,255,255,0.8) !important; }
      `}</style>
    </div>
  );
}