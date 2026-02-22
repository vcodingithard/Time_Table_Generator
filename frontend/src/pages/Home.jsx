import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, School, Settings, MapPin,
  Sparkles, ArrowRight, Check, Zap, Crown, ShieldCheck
} from 'lucide-react';
import { timetableApi } from '../api/timetableApi';
import { load } from "@cashfreepayments/cashfree-js";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  // 1. Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch plans and subscription status
        const [plansRes, subRes] = await Promise.allSettled([
          timetableApi.getAvailablePlans(),
          timetableApi.getSubscriptionStatus()
        ]);

        if (plansRes.status === 'fulfilled') {
          setPlans(plansRes.value.data.data);
        }

        if (subRes.status === 'fulfilled') {
          setMySub(subRes.value.data.data);
        } else {
          console.warn("Subscription not found or user not logged in");
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Handle Payment Redirection
  const handleUpgrade = async (planId) => {
    if (processing) return;
    setProcessing(true);

    try {
      const response = await timetableApi.createPaymentOrder({ planId });

      const cashfree = await load({
        mode: import.meta.env.VITE_NODE_ENV === "production"
          ? "production"
          : "sandbox"
      });

      const { payment_session_id } = response.data.data;

      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      alert("Payment failed to start.");
    } finally {
      setProcessing(false);
    }
  };

  // Helper: Dynamic Styles for Plans
  const getPlanStyles = (name) => {
    switch (name?.toUpperCase()) {
      case 'PRO':
        return { icon: <Crown className="w-5 h-5 text-amber-500" />, color: "border-blue-500 shadow-lg shadow-blue-500/10" };
      case 'ENTERPRISE':
        return { icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />, color: "border-slate-200" };
      default:
        return { icon: <Zap className="w-5 h-5 text-slate-500" />, color: "border-slate-200" };
    }
  };

  const adminTools = [
    { title: "Faculty Management", desc: "Register professors and manage availability.", path: "/manage-faculty", icon: <Users className="w-6 h-6 text-blue-600" />, color: "bg-blue-50" },
    { title: "Room Allocation", desc: "Manage classrooms, labs, and capacities.", path: "/manage-rooms", icon: <MapPin className="w-6 h-6 text-emerald-600" />, color: "bg-emerald-50" },
    { title: "Course Catalog", desc: "Define subjects, hours per week, and types.", path: "/manage-courses", icon: <BookOpen className="w-6 h-6 text-purple-600" />, color: "bg-purple-50" },
    { title: "Class Structure", desc: "Organize semesters, sections, and departments.", path: "/manage-classes", icon: <School className="w-6 h-6 text-orange-600" />, color: "bg-orange-50" },
    { title: "System Metadata", desc: "Configure time slots, breaks, and institute rules.", path: "/manage-metadata", icon: <Settings className="w-6 h-6 text-slate-600" />, color: "bg-slate-100" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500 animate-pulse">Syncing Institute Data...</p>
        </div>
      </div>
    );
  }

  // Safe Data Extraction
  const callsUsed = mySub?.calls_used || 0;
  const callLimit = mySub?.plan?.call_limit || 0;
  const currentPlanId = mySub?.plan?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header & Usage Tracker */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Institute Control Center</h1>
          <p className="text-slate-500 text-lg">Manage resources and generate AI-optimized schedules.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Credits</p>
            <p className="text-sm font-black text-slate-900">{callsUsed} / {callLimit || '∞'} Used</p>
          </div>
          <div className="w-24 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${(callsUsed / callLimit) > 0.8 ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${callLimit > 0 ? Math.min((callsUsed / callLimit) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Hero and Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="lg:col-span-1 lg:row-span-2">
          <div className="h-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">AI Timetable Engine</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">Cross-reference faculty, rooms, and constraints in seconds.</p>
            </div>
            <Link to="/generate-timetable" className="relative z-10 bg-white text-blue-700 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition-all transform active:scale-95">
              GENERATE NOW <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminTools.map((tool, idx) => (
            <Link key={idx} to={tool.path} className="group bg-white p-6 rounded-[1.5rem] border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex items-start gap-5">
              <div className={`${tool.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>{tool.icon}</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Subscription Plans</h2>
          <p className="text-slate-500">Upgrade to unlock more AI generation capacity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const styles = getPlanStyles(plan.name);
            const isCurrent = currentPlanId === plan._id;

            return (
              <div key={plan._id} className={`bg-white border-2 ${styles.color} rounded-[2.5rem] p-8 flex flex-col transition-all hover:translate-y-[-4px]`}>
                <div className="flex items-center gap-3 mb-4">
                  {styles.icon}
                  <span className="font-black text-slate-900 tracking-tight uppercase">{plan.name}</span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-400 font-medium text-sm"> / {plan.validity_days} Days</span>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" /> {plan.call_limit} AI Generations
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" /> Multi-Class Conflicts Check
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" /> Professional Support
                  </li>
                </ul>

                <button
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan._id)}
                  className={`w-full py-4 rounded-2xl font-black transition-all ${isCurrent
                    ? "bg-slate-100 text-slate-400 cursor-default"
                    : "bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-lg shadow-slate-200"
                    }`}
                >
                  {isCurrent ? "Active Plan" : "Upgrade Now"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Steps */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-10">
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 1</span>
          <p className="text-slate-600 font-medium italic">Configure Faculty & Rooms</p>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Step 2</span>
          <p className="text-slate-600 font-medium italic">Add Classes & Metadata</p>
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