import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    course_code: '',
    course_name: '',
    course_type: 'THEORY',
    hours_per_week: '',
    semester: '',
    classIds: []
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, classesRes] = await Promise.all([
        timetableApi.getCourses(),
        timetableApi.getClasses()
      ]);
      setCourses(coursesRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (err) {
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (classId) => {
    setFormData(prev => {
      const isSelected = prev.classIds.includes(classId);
      return {
        ...prev,
        classIds: isSelected 
          ? prev.classIds.filter(id => id !== classId) 
          : [...prev.classIds, classId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      hours_per_week: Number(formData.hours_per_week),
      semester: Number(formData.semester),
    };

    try {
      if (editingId) {
        const res = await timetableApi.updateCourse(editingId, payload);
        setCourses(courses.map(c => c._id === editingId ? res.data.data : c));
        setEditingId(null);
      } else {
        const res = await timetableApi.createCourse(payload);
        setCourses(prev => [...prev, res.data.data]);
      }
      setFormData(initialFormState);
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      course_type: course.course_type,
      hours_per_week: course.hours_per_week,
      semester: course.semester,
      classIds: course.classIds?.map(c => typeof c === 'object' ? c._id : c) || []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await timetableApi.deleteCourse(id);
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      alert("Error deleting course");
    }
  };

  if (loading) return <div className="pt-32 text-center text-blue-900 font-bold">Loading Courses...</div>;

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-bold mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-blue-900 mb-8">Manage Courses</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* FORM CARD */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
              <h2 className="text-xl font-bold mb-4 text-slate-800">
                {editingId ? "Edit Course" : "Create New Course"}
              </h2>
              <div className="space-y-4">
                <input name="course_code" placeholder="Course Code (e.g. CS101)" value={formData.course_code} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                <input name="course_name" placeholder="Course Name" value={formData.course_name} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                
                <select name="course_type" value={formData.course_type} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab</option>
                  <option value="ELECTIVE">Elective</option>
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="hours_per_week" placeholder="Hrs/Week" value={formData.hours_per_week} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="number" name="semester" placeholder="Semester" value={formData.semester} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>

                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                  <label className="text-sm font-bold text-slate-600 block mb-2">Assign to Classes</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {classes.map(cls => (
                      <label key={cls._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition cursor-pointer">
                        <input type="checkbox" checked={formData.classIds.includes(cls._id)} onChange={() => handleCheckboxChange(cls._id)} className="w-4 h-4 accent-blue-900" />
                        <span className="text-sm text-slate-700">Sem {cls.semester} - Sec {cls.section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-grow bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition">
                    {editingId ? "Update" : "Add Course"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => {setEditingId(null); setFormData(initialFormState);}} className="bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-300 transition">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* TABLE CARD */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-700">Course Info</th>
                    <th className="p-4 font-bold text-slate-700">Type</th>
                    <th className="p-4 font-bold text-slate-700">Hrs/Sem</th>
                    <th className="p-4 font-bold text-slate-700">Assigned Classes</th>
                    <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 transition group">
                      <td className="p-4">
                        <div className="font-bold text-blue-900 uppercase">{c.course_code}</div>
                        <div className="text-sm text-slate-500">{c.course_name}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          c.course_type === 'LAB' ? 'bg-purple-100 text-purple-700' : 
                          c.course_type === 'ELECTIVE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.course_type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="font-medium">{c.hours_per_week}h</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-xs">S{c.semester}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.classIds?.length > 0 ? c.classIds.map((cls, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">
                              {cls.semester}{cls.section}
                            </span>
                          )) : <span className="text-xs text-slate-300 italic">None</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
    </div>
  );
};

export default ManageCourses;