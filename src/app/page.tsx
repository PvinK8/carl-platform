import Link from 'next/link'

const modules = [
  { title: 'Talent Evaluation Assistant', desc: 'Pre-enrolment eligibility evaluation and course fit assessment', href: '/ee', icon: '🎯', tag: 'TEA' },
  { title: 'Coaching Buddy', desc: 'Mid-course career guidance and skills coaching sessions', href: '/coaching', icon: '🤝', tag: 'CB' },
  { title: 'Role Launcher', desc: 'Post-course job matching, live MCF listings and recruiter pitch', href: '/placement', icon: '🚀', tag: 'RL' },
  { title: 'Career Compass', desc: 'Personalised career pathway planning and skills milestone tracker', href: '/compass', icon: '🧭', tag: 'CC' },
  { title: 'CCP Launcher', desc: 'IMDA Skills Framework JD builder and career converter eligibility check', href: '/ccp', icon: '📋', tag: 'CCP' },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a2342 0%, #1a4a8a 50%, #1565c0 100%)' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(37,99,235,0.3))', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(96,165,250,0.4)', animation: 'float 3s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
                </div>
                <div style={{ width: 28, height: 1.5, background: 'rgba(96,165,250,0.5)', borderRadius: 2 }} />
                <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>🤖</div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(96,165,250,0.1)', animationDuration: '2s' }} />
          </div>

          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">CARL</h1>
          <p className="text-xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Candidate Analysis and Role Launcher</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>AI-powered career intelligence · Singapore ICT</p>

          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.4)', animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, i) => (
            <Link key={m.href} href={m.href}
              className="group block rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', anim