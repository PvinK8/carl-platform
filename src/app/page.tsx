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
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <span style={{ fontSize: 32 }}>{m.icon}</span>
                <span className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>{m.tag}</span>
              </div>
              <h2 className="font-semibold text-white mb-2 text-lg leading-tight">{m.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{m.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>Open module</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center mt-16 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Powered by OpenAI · MyCareersFuture · IMDA Skills Framework
        </p>
      </div>
      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
      `}</style>
    </div>
  )
}