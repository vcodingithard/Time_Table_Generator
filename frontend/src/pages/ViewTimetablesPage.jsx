import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Sparkles } from 'lucide-react';
import { timetableApi } from '../api/timetableApi';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const ViewTimetablesPage = () => {
  const [timetables, setTimetables] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTimetables = async () => {
      try {
        const res = await timetableApi.searchTimetables({});
        const items = res?.data?.data || [];
        setTimetables(items);
        if (items.length > 0 && !selectedId) {
          setSelectedId(items[0]._id);
        }
      } catch (err) {
        console.error('Failed to load timetables', err);
      } finally {
        setLoading(false);
      }
    };

    loadTimetables();
  }, []);

  const filteredTimetables = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return timetables.filter((item) => {
      const text = `${item.display_info?.semester || ''} ${item.display_info?.section || ''} ${item.display_info?.department || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [searchTerm, timetables]);

  useEffect(() => {
    if (!filteredTimetables.length) {
      setSelectedId('');
      return;
    }

    if (!filteredTimetables.some((item) => item._id === selectedId)) {
      setSelectedId(filteredTimetables[0]._id);
    }
  }, [filteredTimetables, selectedId]);

  const selectedTimetable =
    filteredTimetables.find((item) => item._id === selectedId) || filteredTimetables[0] || null;

  return (
    <div className="pt-20 sm:pt-24 px-4 pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Timetables</h1>
            <p className="text-slate-500">Browse and review all existing schedules for your institute.</p>
          </div>
          <Link
            to="/generate-timetable"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" /> Generate New
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                Find a timetable
              </h2>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by semester, section or department"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-5 space-y-3 max-h-[520px] overflow-y-auto pr-2">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Loading timetables...
                </div>
              ) : filteredTimetables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No timetables found.
                </div>
              ) : (
                filteredTimetables.map((item) => {
                  const isActive = selectedTimetable?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedId(item._id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">
                            Class {item.display_info?.semester || '-'}-{item.display_info?.section || '-'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.display_info?.department || 'Department'}
                          </p>
                        </div>
                        <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          {item.timetable ? Object.keys(item.timetable).length : 0} days
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        Updated{' '}
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'recently'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {selectedTimetable ? (
              <>
                <div className="bg-blue-900 px-6 py-6 text-white">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        Class {selectedTimetable.display_info?.semester || '-'}-
                        {selectedTimetable.display_info?.section || '-'}
                      </h2>
                      <p className="text-blue-100 text-sm">
                        {selectedTimetable.display_info?.department || 'Department'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold">
                      <CalendarDays className="h-4 w-4" />
                      {selectedTimetable.classId?.class_name || 'Saved schedule'}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto p-4 sm:p-6">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border-b border-r border-slate-200 p-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Day / Slot
                        </th>
                        {[...Array(8)].map((_, index) => (
                          <th
                            key={index}
                            className="border-b border-slate-200 p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                          >
                            Slot {index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <tr key={day} className="border-b border-slate-100 last:border-0">
                          <td className="border-r border-slate-200 bg-slate-50/70 p-3 text-sm font-black text-slate-700">
                            {day}
                          </td>
                          {[...Array(8)].map((_, index) => {
                            const session = selectedTimetable.timetable?.[day]?.find(
                              (item) => item.slot_index === index
                            );
                            return (
                              <td key={`${day}-${index}`} className="p-2 align-top">
                                {session ? (
                                  <div
                                    className={`min-h-[90px] rounded-2xl border p-3 ${
                                      session.activity === 'LAB'
                                        ? 'border-purple-200 bg-purple-50'
                                        : 'border-blue-200 bg-blue-50'
                                    }`}
                                  >
                                    <p className="text-xs font-black text-slate-900">
                                      {session.course?.course_name || 'Course'}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-600">
                                      👤 {session.faculty?.faculty_name || 'N/A'}
                                    </p>
                                    <p className="text-[11px] text-slate-600">
                                      📍 {session.room?.room_no || 'N/A'}
                                    </p>
                                    <p
                                      className={`mt-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                                        session.activity === 'LAB'
                                          ? 'text-purple-600'
                                          : 'text-blue-600'
                                      }`}
                                    >
                                      {session.activity}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="min-h-[90px] rounded-2xl border border-dashed border-slate-200" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center text-slate-500">
                Select a timetable from the left to preview it.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ViewTimetablesPage;