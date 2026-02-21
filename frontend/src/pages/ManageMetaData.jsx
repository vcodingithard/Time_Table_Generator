import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const ManageMetadata = () => {
  const [metadataList, setMetadataList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    classId: "",
    total_days: 6,
    slots_per_day: "",
    slot_times: "",
    tea_break_start: "",
    tea_break_end: "",
    lunch_break_start: "",
    lunch_break_end: ""
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaRes, classRes] = await Promise.all([
          timetableApi.getMetadata(),
          timetableApi.getClasses()
        ]);
        setMetadataList(metaRes.data.data || []);
        setClasses(classRes.data.data || []);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      classId: formData.classId,
      total_days: Number(formData.total_days),
      slots_per_day: Number(formData.slots_per_day),
      slot_times: formData.slot_times.split(",").map(s => s.trim()),
      breaks: {
        tea_break: {
          start_time: formData.tea_break_start,
          end_time: formData.tea_break_end
        },
        lunch_break: {
          start_time: formData.lunch_break_start,
          end_time: formData.lunch_break_end
        }
      }
    };

    try {
      const res = await timetableApi.upsertMetadata(payload);
      if (res.data.success) {
        // Refresh list to show populated class names
        const updatedMeta = await timetableApi.getMetadata();
        setMetadataList(updatedMeta.data.data);
        setFormData(initialForm);
        alert("Configuration Saved!");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error saving metadata");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this configuration?")) return;
    try {
      await timetableApi.deleteMetadata(id);
      setMetadataList(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 font-bold mb-6 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Timetable Configuration</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* CONFIGURATION FORM */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 p-2 rounded-lg text-blue-600">⚙️</span>
                Set Grid Rules
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Select Class</label>
                  <select name="classId" value={formData.classId} onChange={handleInputChange} required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Choose a Class...</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>Sem {cls.semester} - Section {cls.section}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">Days/Week</label>
                    <input type="number" name="total_days" value={formData.total_days} onChange={handleInputChange} className="w-full border p-3 rounded-xl" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">Slots/Day</label>
                    <input type="number" name="slots_per_day" value={formData.slots_per_day} onChange={handleInputChange} className="w-full border p-3 rounded-xl" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Slot Times (e.g. 9:00, 10:00...)</label>
                  <textarea name="slot_times" value={formData.slot_times} onChange={handleInputChange} className="w-full border p-3 rounded-xl h-20 text-sm" placeholder="Separated by commas" required />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Breaks Configuration</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="tea_break_start" placeholder="Tea Start" value={formData.tea_break_start} onChange={handleInputChange} className="border p-2 rounded-lg text-sm" />
                    <input type="text" name="tea_break_end" placeholder="Tea End" value={formData.tea_break_end} onChange={handleInputChange} className="border p-2 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="lunch_break_start" placeholder="Lunch Start" value={formData.lunch_break_start} onChange={handleInputChange} className="border p-2 rounded-lg text-sm" />
                    <input type="text" name="lunch_break_end" placeholder="Lunch End" value={formData.lunch_break_end} onChange={handleInputChange} className="border p-2 rounded-lg text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100 mt-2">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>

          {/* CONFIGURATION LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-5 font-bold text-slate-700">Class Target</th>
                    <th className="p-5 font-bold text-slate-700">Grid Info</th>
                    <th className="p-5 font-bold text-slate-700">Breaks</th>
                    <th className="p-5 font-bold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metadataList.map(meta => (
                    <tr key={meta._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="p-5">
                        <div className="font-bold text-blue-900">
                          Sem {meta.classId?.semester} — {meta.classId?.section}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{meta._id}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100">
                            {meta.total_days} DAYS
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-100">
                            {meta.slots_per_day} SLOTS
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-xs space-y-1">
                          <div className="text-slate-500 italic">Tea: {meta.breaks?.tea_break?.start_time || '-'} to {meta.breaks?.tea_break?.end_time || '-'}</div>
                          <div className="text-slate-500 italic">Lunch: {meta.breaks?.lunch_break?.start_time || '-'} to {meta.breaks?.lunch_break?.end_time || '-'}</div>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDelete(meta._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {metadataList.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-400">No configurations found. Add one on the left.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMetadata;