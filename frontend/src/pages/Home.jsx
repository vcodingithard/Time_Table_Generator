import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  School, 
  Settings, 
  MapPin, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react'; // Install lucide-react for professional icons

const Home = () => {
  const adminTools = [
    {
      title: "Faculty Management",
      desc: "Register professors and manage their availability.",
      path: "/manage-faculty",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Room Allocation",
      desc: "Manage classrooms, labs, and capacities.",
      path: "/manage-rooms",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      title: "Course Catalog",
      desc: "Define subjects, hours per week, and types.",
      path: "/manage-courses",
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      title: "Class Structure",
      desc: "Organize semesters, sections, and departments.",
      path: "/manage-classes",
      icon: <School className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50",
    },
    {
      title: "System Metadata",
      desc: "Configure time slots, breaks, and institute rules.",
      path: "/manage-metadata",
      icon: <Settings className="w-6 h-6 text-slate-600" />,
      color: "bg-slate-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Institute Control Center
        </h1>
        <p className="text-slate-500 text-lg">
          Manage your resources and generate optimized schedules.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: AI Generation Highlight (Taking up 2 rows) */}
        <div className="lg:col-span-1 lg:row-span-2">
          <div className="h-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">AI Timetable Generator</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Our AI algorithm cross-references faculty availability, room conflicts, and course hours to create a perfect schedule in seconds.
              </p>
            </div>
            
            <Link 
              to="/generate-timetable" 
              className="relative z-10 bg-white text-blue-700 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition-all transform active:scale-95"
            >
              LAUNCH AI ENGINE <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Decorative background element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          </div>
        </div>

        {/* Right: Grid of Resource Tools */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminTools.map((tool, idx) => (
            <Link 
              key={idx} 
              to={tool.path}
              className="group bg-white p-6 rounded-[1.5rem] border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex items-start gap-5"
            >
              <div className={`${tool.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Footer Quick Info */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-10">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 1</span>
          <p className="text-slate-600 font-medium italic">Configure Faculty & Rooms</p>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 2</span>
          <p className="text-slate-600 font-medium italic">Add Classes & Courses & Add metadata</p>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 3</span>
          <p className="text-slate-600 font-medium italic">Run AI Generation</p>
        </div>
      </section>
    </div>
  );
};

export default Home;