import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timetableApi } from "../api/timetableApi";

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    room_no: "",
    room_type: "CLASSROOM",
    capacity: "",
    lab_number: ""
  });

  // Load Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await timetableApi.getRooms();
        setRooms(res.data.data || []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      lab_number: formData.room_type === "LAB" ? formData.lab_number : null
    };

    try {
      const res = await timetableApi.createRoom(payload);
      setRooms(prev => [...prev, res.data.data]);
      alert("Room added successfully!");
      setFormData({ room_no: "", room_type: "CLASSROOM", capacity: "", lab_number: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Error adding room");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await timetableApi.deleteRoom(id);
      setRooms(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-900 font-bold mb-6 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Room Management</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ADD ROOM FORM */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Add New Space</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Room/Hall Number</label>
                  <input name="room_no" placeholder="e.g. 301, LH-1" value={formData.room_no} onChange={handleInputChange} required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Type</label>
                  <select name="room_type" value={formData.room_type} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Lab / Practical</option>
                  </select>
                </div>

                {formData.room_type === "LAB" && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 ml-1">Lab Identifier</label>
                    <input name="lab_number" placeholder="e.g. Computer Lab 1" value={formData.lab_number} onChange={handleInputChange} required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Seating Capacity</label>
                  <input type="number" name="capacity" placeholder="e.g. 60" value={formData.capacity} onChange={handleInputChange} required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100">
                  Register Room
                </button>
              </div>
            </form>
          </div>

          {/* ROOM LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-5 font-bold text-slate-700">Room Info</th>
                    <th className="p-5 font-bold text-slate-700">Type</th>
                    <th className="p-5 font-bold text-slate-700">Capacity</th>
                    <th className="p-5 font-bold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic">Fetching rooms...</td></tr>
                  ) : rooms.map((room) => (
                    <tr key={room._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="p-5">
                        <div className="font-bold text-blue-900">{room.room_no}</div>
                        {room.lab_number && <div className="text-[10px] text-slate-400 uppercase tracking-wider">{room.lab_number}</div>}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${room.room_type === 'LAB' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {room.room_type}
                        </span>
                      </td>
                      <td className="p-5 text-slate-600 font-medium">
                        {room.capacity} Seats
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDelete(room._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && rooms.length === 0 && (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic">No rooms registered.</td></tr>
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

export default ManageRooms;