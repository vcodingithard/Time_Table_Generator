import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timetableApi } from '../api/timetableApi';

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    faculty_code: "",
    faculty_name: "",
    max_hours_per_week: 18,
    courses_handled: []
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [tempSelectedCourseIds, setTempSelectedCourseIds] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, cRes] = await Promise.all([
        timetableApi.getFaculty(),
        timetableApi.getCourses()
      ]);
      setFaculty(fRes.data.data || []);
      setCourses(cRes.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Toggle for the "Add Faculty" form
  const toggleCourseInForm = (courseId) => {
    setFormData(prev => {
      const exists = prev.courses_handled.includes(courseId);
      return {
        ...prev,
        courses_handled: exists 
          ? prev.courses_handled.filter(id => id !== courseId) 
          : [...prev.courses_handled, courseId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await timetableApi.createFaculty(formData);
      setFaculty(prev => [...prev, res.data.data]);
      setFormData({ faculty_code: "", faculty_name: "", max_hours_per_week: 18, courses_handled: [] });
      alert("Faculty added successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Error adding faculty");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this faculty? This will also unassign them from courses.")) return;
    try {
      await timetableApi.deleteFaculty(id);
      setFaculty(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // --- Modal Logic ---
  const handleEditClick = (facultyMember) => {
    setSelectedFaculty(facultyMember);
    // Store only IDs for the toggle logic
    const currentIds = facultyMember.courses_handled?.map(c => 
      typeof c === 'object' ? c._id : c
    ) || [];
    setTempSelectedCourseIds(currentIds);
    setShowModal(true);
  };

  const toggleCourseInModal = (courseId) => {
    setTempSelectedCourseIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const saveCourseAssignments = async () => {
    try {
      await timetableApi.updateFacultyCourses(selectedFaculty._id, tempSelectedCourseIds);
      await loadData(); // Refresh to get populated course objects
      setShowModal(false);
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <div className="pt-32 text-center text-blue-900 font-bold">Loading Faculty Data...</div>;

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 font-bold mb-6 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Faculty Management</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: ADD FACULTY FORM */}
          <div className="lg:col-span-4 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Add New Faculty</h2>
              <div className="space-y-4">
                <input name="faculty_code" placeholder="Code (e.g. JS01)" value={formData.faculty_code} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                <input name="faculty_name" placeholder="Full Name" value={formData.faculty_name} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Max Hours/Week</label>
                  <input type="number" name="max_hours_per_week" value={formData.max_hours_per_week} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="border rounded-xl p-3 bg-slate-50">
                  <p className="text-sm font-bold text-slate-600 mb-2">Assign Initial Courses</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {courses.map(c => (
                      <div 
                        key={c._id} 
                        onClick={() => toggleCourseInForm(c._id)}
                        className={`text-xs p-2 rounded-lg cursor-pointer border transition ${formData.courses_handled.includes(c._id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        {c.course_code} - {c.course_name}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-md">
                  Register Faculty
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: FACULTY LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-700">Faculty</th>
                    <th className="p-4 font-bold text-slate-700">Workload</th>
                    <th className="p-4 font-bold text-slate-700">Handled Courses</th>
                    <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(f => (
                    <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-blue-900">{f.faculty_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{f.faculty_code}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                          {f.max_hours_per_week} HRS/WK
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {f.courses_handled?.length > 0 ? f.courses_handled.map((c, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                              {typeof c === 'object' ? c.course_code : c}
                            </span>
                          )) : <span className="text-xs text-slate-300 italic">Unassigned</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(f)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                            Courses
                          </button>
                          <button onClick={() => handleDelete(f._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Assign Courses</h2>
                <p className="text-sm text-slate-500">{selectedFaculty?.faculty_name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {courses.map(course => {
                  const isSelected = tempSelectedCourseIds.includes(course._id);
                  return (
                    <div
                      key={course._id}
                      onClick={() => toggleCourseInModal(course._id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1 ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-300 bg-white"}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-blue-900">{course.course_code}</span>
                        {isSelected && <div className="bg-blue-600 rounded-full p-0.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                      </div>
                      <span className="text-xs text-slate-600 line-clamp-1">{course.course_name}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                <button onClick={saveCourseAssignments} className="flex-1 py-3 rounded-xl font-bold bg-blue-900 text-white hover:bg-blue-800 transition shadow-lg">Save Assignments</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaculty;