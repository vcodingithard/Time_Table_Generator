import React from 'react'
import { Calendar, Cpu, Users, CheckCircle, Zap } from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 text-slate-900">

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-6">
          <Calendar size={16} /> AI Timetable Automation
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Smarter University Scheduling.
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Zero Conflicts. Zero Stress.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Generate department-wide timetables in seconds. Handle labs,
          electives, and faculty constraints with intelligent conflict resolution.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">
            <Cpu size={20} /> Generate Timetable
          </button>

          <button className="px-8 py-4 rounded-xl text-lg font-semibold border border-slate-300 hover:bg-slate-100 transition">
            View Demo
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Zap className="text-amber-500" />}
            title="AI Rule Engine"
            description="Add custom rules like 'No labs on Friday' or 'Morning-only classes' and watch schedules adapt instantly."
          />
          <FeatureCard
            icon={<Users className="text-blue-500" />}
            title="Multi-Department Control"
            description="Manage multiple semesters, sections, and rooms with structured slot-level metadata."
          />
          <FeatureCard
            icon={<CheckCircle className="text-green-500" />}
            title="Smart Conflict Detection"
            description="Prevents faculty overlaps, ensures lab continuity, and validates constraints automatically."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-t py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 mb-14">
            Built for institutions of all sizes.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            <PricingCard
              plan="Basic"
              price="Free"
              features={[
                '5 Departments',
                'Manual Overrides',
                'Standard Support'
              ]}
            />
            <PricingCard
              plan="Pro"
              price="$49"
              features={[
                'Unlimited Departments',
                'AI Rule Suggestions',
                'Priority Generation',
                'Advanced Validation'
              ]}
              featured
            />
          </div>
        </div>
      </section>

      

    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition duration-300">
    <div className="mb-5">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
)

const PricingCard = ({ plan, price, features, featured = false }) => (
  <div
    className={`p-10 rounded-3xl border transition duration-300 ${
      featured
        ? 'border-indigo-600 bg-indigo-50 shadow-xl'
        : 'border-slate-200 bg-white'
    }`}
  >
    <h3 className="text-xl font-semibold mb-3">{plan}</h3>

    <div className="text-4xl font-extrabold mb-8">
      {price}
      {price !== 'Free' && (
        <span className="text-lg text-slate-400 font-normal"> /month</span>
      )}
    </div>

    <ul className="space-y-4 text-left mb-8">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <CheckCircle size={18} className="text-indigo-600" />
          {feature}
        </li>
      ))}
    </ul>

    <button
      className={`w-full py-3 rounded-xl font-semibold transition ${
        featured
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-slate-100 hover:bg-slate-200'
      }`}
    >
      Choose {plan}
    </button>
  </div>
)

export default LandingPage