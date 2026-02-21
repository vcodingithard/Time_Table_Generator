import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const ManageMetadata = () => {
  const [metadataList, setMetadataList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

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

  const buildSlotObjects = (slotsString) => {
    return slotsString.split(",").map((time, index) => ({
      start_time: time.trim(),
      end_time: "",
      label: `Slot ${index + 1}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      classId: formData.classId,
      total_days: Number(formData.total_days),
      slots_per_day: Number(formData.slots_per_day),
      slot_times: buildSlotObjects(formData.slot_times),
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
      if (editId) {
        await timetableApi.updateMetadata(editId, payload);
      } else {
        await timetableApi.createMetadata(payload);
      }

      const updatedMeta = await timetableApi.getMetadata();
      setMetadataList(updatedMeta.data.data);
      setFormData(initialForm);
      setEditId(null);

      alert(editId ? "Configuration Updated!" : "Configuration Created!");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving metadata");
    }
  };

  const handleEdit = (meta) => {
    setEditId(meta._id);

    setFormData({
      classId: meta.classId?._id,
      total_days: meta.total_days,
      slots_per_day: meta.slots_per_day,
      slot_times: meta.slot_times.map(s => s.start_time).join(", "),
      tea_break_start: meta.breaks?.tea_break?.start_time || "",
      tea_break_end: meta.breaks?.tea_break?.end_time || "",
      lunch_break_start: meta.breaks?.lunch_break?.start_time || "",
      lunch_break_end: meta.breaks?.lunch_break?.end_time || ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this configuration?")) return;

    try {
      await timetableApi.deleteMetadata(id);
      setMetadataList(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 font-bold mb-6 hover:text-blue-700">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Timetable Configuration
        </h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* FORM */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                {editId ? "Edit Configuration" : "Set Grid Rules"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Select Class</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    required
                    className="w-full border p-3 rounded-xl"
                  >
                    <option value="">Choose a Class...</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        Sem {cls.semester} - Section {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="total_days"
                    value={formData.total_days}
                    onChange={handleInputChange}
                    placeholder="Days"
                    className="border p-3 rounded-xl"
                    required
                  />
                  <input
                    type="number"
                    name="slots_per_day"
                    value={formData.slots_per_day}
                    onChange={handleInputChange}
                    placeholder="Slots"
                    className="border p-3 rounded-xl"
                    required
                  />
                </div>

                <textarea
                  name="slot_times"
                  value={formData.slot_times}
                  onChange={handleInputChange}
                  placeholder="Slot Times separated by commas"
                  className="w-full border p-3 rounded-xl h-20 text-sm"
                  required
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    name="tea_break_start"
                    placeholder="Tea Start"
                    value={formData.tea_break_start}
                    onChange={handleInputChange}
                    className="border p-2 rounded-lg w-full"
                  />
                  <input
                    type="text"
                    name="tea_break_end"
                    placeholder="Tea End"
                    value={formData.tea_break_end}
                    onChange={handleInputChange}
                    className="border p-2 rounded-lg w-full"
                  />
                  <input
                    type="text"
                    name="lunch_break_start"
                    placeholder="Lunch Start"
                    value={formData.lunch_break_start}
                    onChange={handleInputChange}
                    className="border p-2 rounded-lg w-full"
                  />
                  <input
                    type="text"
                    name="lunch_break_end"
                    placeholder="Lunch End"
                    value={formData.lunch_break_end}
                    onChange={handleInputChange}
                    className="border p-2 rounded-lg w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold"
                >
                  {editId ? "Update Configuration" : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>

          {/* LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-5">Class</th>
                    <th className="p-5">Grid</th>
                    <th className="p-5">Breaks</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metadataList.map(meta => (
                    <tr key={meta._id} className="border-b">
                      <td className="p-5">
                        Sem {meta.classId?.semester} — {meta.classId?.section}
                      </td>
                      <td className="p-5">
                        {meta.total_days} Days / {meta.slots_per_day} Slots
                      </td>
                      <td className="p-5 text-xs">
                        Tea: {meta.breaks?.tea_break?.start_time || "-"} to {meta.breaks?.tea_break?.end_time || "-"} <br />
                        Lunch: {meta.breaks?.lunch_break?.start_time || "-"} to {meta.breaks?.lunch_break?.end_time || "-"}
                      </td>
                      <td className="p-5 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(meta)}
                          className="text-blue-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(meta._id)}
                          className="text-red-600"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {metadataList.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-400">
                        No configurations found.
                      </td>
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