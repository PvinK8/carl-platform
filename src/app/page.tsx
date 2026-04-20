import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{background:'#185FA5'}}>
            <span className="text-white font-bold text-lg tracking-widest">CARL</span>
          </div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">CARL Platform</h1>
          <p className="text-gray-500">Candidate Analysis and Role Launcher · Singapore</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {title:'Placement',desc:'Post-course job matching and recruiter pitch',href:'/placement',color:'#185FA5',icon:'🎯'},
            {title:'EE Assistant',desc:'Pre-enrolment eligibility evaluation tool',href:'/ee',color:'#3B6D11',icon:'✅'},
            {title:'Coaching Companion',desc:'Mid-course career guidance sessions',href:'/coaching',color:'#854F0B',icon:'🤝'},
            {title:'CCP JD Builder',desc:'IMDA-compliant job description builder',href:'/ccp',color:'#A32D2D',icon:'📋'},
            {title:'Career Compass',desc:'Personalised career pathway and skills planning',href:'/compass',color:'#0A66C2',icon:'🧭'},
          ].map((m) => (
            <Link key={m.href} href={m.href} className="block bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{m.icon}</div>
              <h2 className="font-medium text-gray-900 mb-1">{m.title}</h2>
              <p className="text-sm text-gray-500">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}