import Link from 'next/link'

const modules = [
  {
    title: 'Talent Evaluation Assistant',
    desc: 'Pre-enrolment eligibility evaluation and course fit assessment',
    href: '/ee',
    icon: '🎯',
    tag: 'TEA'
  },
  {
    title: 'Coaching Buddy',
    desc: 'Mid-course career guidance and skills coaching sessions',
    href: '/coaching',
    icon: '🤝',
    tag: 'CB'
  },
  {
    title: 'Role Launcher',
    desc: 'Post-course job matching, live MCF listings and recruiter pitch',
    href: '/placement',
    icon: '🚀',
    tag: 'RL'
  },
  {
    title: 'Career Compass',
    desc: 'Personalised career pathway planning and skills milestone tracker',
    href: '/compass',
    icon: '🧭',
    tag: 'CC'
  },
  {
    title: 'CCP Launcher',
    desc: 'IMDA Skills Framework JD builder and career converter eligibility check',
    href: '/ccp',
    icon: '📋',
    tag: 'CCP'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a2342 0%, #1a4a8a 50%, #1565c0 100%)' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)' }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'float 3s ease-in-out infinite' }}>
                {/* Brain/circuit head */}
                <circle cx="26" cy="18" r="13" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
                {/* Circuit lines inside head */}
                <l