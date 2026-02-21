import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    semester: "",
    section: "",
    room: "",
    coordinator: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, roomRes, facultyRes] = await Promise.all([
        timetableApi.getClasses(),
        timetableApi.getRooms(),
        timetableApi.getFaculty(),
      ]);
      
      setClasses(classRes.data.data || []);
      setRooms(roomRes.data.data || []);
      setFaculty(facultyRes.data.data || []);
    } catch (err) {
      console.error("Error loading management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!form.semester || !form.section || !form.room || !form.coordinator) {
      alert("Please fill all fields");
      return;
    }

    try {
      await timetableApi.createClass({
        ...form,
        semester: Number(form.semester),
      });
      
      // Reset form and refresh list
      setForm({ semester: "", section: "", room: "", coordinator: "" });
      const res = await timetableApi.getClasses();
      setClasses(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving class");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? This will also remove its timetable.")) return;
    try {
      await timetableApi.deleteClass(id);
      setClasses(classes.filter((c) => c._id !== id));
    } catch (err) {
      alert("Error deleting class");
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading classes...</div>;

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-bold mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-blue-900 mb-8">Manage Classes</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Class Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAddClass} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Class</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Semester</label>
                  <input
                    type="number"
                    value={form.semester}
                    onChange={(e) => setForm({...form, semester: e.target.value})}
                    placeholder="e.g. 4"
                    className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Section</label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) => setForm({...form, section: e.target.value})}
                    placeholder="e.g. A"
                    className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Primary Room</label>
                  <select
                    value={form.room}
                    onChange={(e) => setForm({...form, room: e.target.value})}
                    className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>{r.room_no} ({r.room_type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Class Coordinator</label>
                  <select
                    value={form.coordinator}
                    onChange={(e) => setForm({...form, coordinator: e.target.value})}
                    className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map((f) => (
                      <option key={f._id} value={f._id}>{f.faculty_name}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition">
                  Create Class
                </button>
              </div>
            </form>
          </div>

          {/* Classes Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-700">Sem / Section</th>
                    <th className="p-4 font-bold text-slate-700">Room</th>
                    <th className="p-4 font-bold text-slate-700">Coordinator</th>
                    <th className="p-4 font-bold text-slate-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400">No classes found. Add your first one!</td></tr>
                  ) : (
                    classes.map((cls) => (
                      <tr key={cls._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-4">
                          <span className="font-bold text-blue-900">Sem {cls.semester}</span>
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{cls.section}</span>
                        </td>
                        <td className="p-4 text-slate-600">{cls.room?.room_no || "N/A"}</td>
                        <td className="p-4 text-slate-600 font-medium">{cls.coordinator?.faculty_name || "N/A"}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(cls._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
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

export default ManageClasses;