import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const GenerateTimetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  useEffect(() => {
    timetableApi.getClasses().then(res => setClasses(res.data.data || []));
  }, []);

  const handleGenerate = async () => {
    if (!selectedClass) return alert("Please select a class first!");
    
    setLoading(true);
    try {
      // 1. Call the new CREATE service
      const res = await timetableApi.generateTimetable(selectedClass, suggestions);
      
      // 2. Since the service returns the raw ID version, we fetch the populated version
      // for the UI to display names instead of IDs
      const searchRes = await timetableApi.searchTimetables({ 
        semester: res.data.data.display_info.semester, 
        section: res.data.data.display_info.section 
      });

      setGeneratedData(searchRes.data.data[0]);
    } catch (err) {
      // 3. Robust Error Handling for the new service logic
      const errMsg = err.response?.data?.message || "Generation failed";
      
      if (errMsg.includes("already exists")) {
        const confirmDelete = window.confirm(
          "A timetable already exists for this class. Would you like to view it? (To regenerate, delete the existing one first)."
        );
        if (confirmDelete) {
            // Find the existing one to display it
            const target = classes.find(c => c._id === selectedClass);
            const existingRes = await timetableApi.searchTimetables({ 
                semester: target.semester, 
                section: target.section 
            });
            setGeneratedData(existingRes.data.data[0]);
        }
      } else {
        alert(`Error: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this timetable?")) return;
    
    try {
      await timetableApi.deleteTimetable(generatedData._id);
      setGeneratedData(null);
      alert("Timetable removed. You can now generate a new one.");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Schedule Generator</h1>
            <p className="text-slate-500">Generate conflict-free timetables using OpenRouter AI</p>
          </div>
          <Link to="/" className="text-blue-600 font-bold hover:underline text-sm">Return to Dashboard</Link>
        </div>

        {/* INPUT PANEL */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Target Class</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="">Select Semester & Section</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>Semester {c.semester} - Section {c.section}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">AI Instructions (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Keep Labs in the afternoon"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all transform active:scale-95 shadow-xl ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-200'}`}
            >
              {loading ? "SCHEDULING..." : "✨ GENERATE MAGIC"}
            </button>
          </div>
        </div>

        {/* TIMETABLE VIEW */}
        {generatedData ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-900 text-white p-6 rounded-3xl flex justify-between items-center shadow-2xl shadow-blue-200">
              <div>
                <h2 className="text-2xl font-bold">Class {generatedData.display_info.semester}-{generatedData.display_info.section}</h2>
                <p className="text-blue-200 text-sm">{generatedData.display_info.department}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 p-3 rounded-xl transition text-sm font-bold">
                  🗑️ Delete
                </button>
                <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition text-sm">
                  🖨️ Print PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 border-b border-r text-slate-400 text-xs font-black uppercase">Day / Slot</th>
                    {[...Array(8)].map((_, i) => (
                      <th key={i} className="p-4 border-b text-slate-400 text-xs font-black uppercase text-center">Slot {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day} className="border-b last:border-0 hover:bg-slate-50/50 transition">
                      <td className="p-4 border-r font-black text-slate-700 bg-slate-50/30 text-sm">{day}</td>
                      {[...Array(8)].map((_, index) => {
                        const session = generatedData.timetable[day]?.find(s => s.slot_index === index);
                        return (
                          <td key={index} className="p-2 min-w-[120px]">
                            {session ? (
                              <div className={`p-3 rounded-xl border h-full transition ${session.activity === 'LAB' ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
                                <div className="font-bold text-xs text-slate-900 line-clamp-1">{session.course?.course_name}</div>
                                <div className="text-[10px] text-slate-500 mt-1 flex flex-col">
                                  <span>👤 {session.faculty?.faculty_name || "N/A"}</span>
                                  <span>📍 {session.room?.room_no || "N/A"}</span>
                                </div>
                                <div className={`mt-2 text-[8px] font-black uppercase tracking-widest ${session.activity === 'LAB' ? 'text-purple-500' : 'text-blue-500'}`}>
                                  {session.activity}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full border-2 border-dashed border-slate-100 rounded-xl min-h-[80px]"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4">🗓️</div>
              <h3 className="text-lg font-bold text-slate-700">No Timetable Generated</h3>
              <p className="text-slate-400">Select a class above to create a new schedule</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GenerateTimetable;