import React, { useState } from 'react';
import { Teacher, AttendanceRecord, AttendanceStatus, SchoolInfo } from '../types';
import { Calendar, Search, CheckCircle2, Save, Briefcase, RefreshCw, Clock, CalendarDays, CheckCircle, AlertCircle } from 'lucide-react';

interface TeacherAttendanceProps {
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  schoolInfo: SchoolInfo;
}

const DAY_NAMES_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TeacherAttendance: React.FC<TeacherAttendanceProps> = ({
  teachers,
  attendanceRecords,
  onSaveAttendance,
  schoolInfo,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);

  const selectedDateObj = new Date(selectedDate);
  const selectedDayName = DAY_NAMES_ID[selectedDateObj.getDay()] || 'Senin';

  // Local state for daily input
  const [dailyStatus, setDailyStatus] = useState<{
    [teacherId: string]: { status: AttendanceStatus; keterangan: string; jamMasuk: string };
  }>(() => {
    const initialMap: {
      [teacherId: string]: { status: AttendanceStatus; keterangan: string; jamMasuk: string };
    } = {};
    teachers.forEach((t) => {
      const existing = attendanceRecords.find(
        (r) => r.targetType === 'guru' && r.targetId === t.id && r.date === selectedDate
      );
      initialMap[t.id] = {
        status: existing ? existing.status : 'H',
        keterangan: existing?.keterangan || '',
        jamMasuk: existing?.jamMasuk || t.jamWajibMasuk || '07:15',
      };
    });
    return initialMap;
  });

  // Re-sync when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const newMap: {
      [teacherId: string]: { status: AttendanceStatus; keterangan: string; jamMasuk: string };
    } = {};
    teachers.forEach((t) => {
      const existing = attendanceRecords.find(
        (r) => r.targetType === 'guru' && r.targetId === t.id && r.date === newDate
      );
      newMap[t.id] = {
        status: existing ? existing.status : 'H',
        keterangan: existing?.keterangan || '',
        jamMasuk: existing?.jamMasuk || t.jamWajibMasuk || '07:15',
      };
    });
    setDailyStatus(newMap);
  };

  const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
    setDailyStatus((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status,
        jamMasuk: status === 'S' || status === 'I' || status === 'A' ? '-' : prev[teacherId]?.jamMasuk || '07:15',
      },
    }));
  };

  const handleKeteranganChange = (teacherId: string, keterangan: string) => {
    setDailyStatus((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        keterangan,
      },
    }));
  };

  const handleJamMasukChange = (teacherId: string, jamMasuk: string) => {
    setDailyStatus((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        jamMasuk,
      },
    }));
  };

  const handleMarkAllHadir = () => {
    const updated = { ...dailyStatus };
    teachers.forEach((t) => {
      updated[t.id] = { ...updated[t.id], status: 'H', jamMasuk: '07:15' };
    });
    setDailyStatus(updated);
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = teachers.map((t) => {
      const current = dailyStatus[t.id] || { status: 'H', keterangan: '', jamMasuk: '07:15' };
      return {
        id: `att_tch_${t.id}_${selectedDate}`,
        date: selectedDate,
        targetType: 'guru',
        targetId: t.id,
        status: current.status,
        keterangan: current.keterangan,
        jamMasuk: current.jamMasuk,
      };
    });

    onSaveAttendance(newRecords);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Daily Summary Stats
  const dailyList = Object.values(dailyStatus) as Array<{ status: AttendanceStatus; keterangan: string; jamMasuk: string }>;
  const countH = dailyList.filter((x) => x.status === 'H').length;
  const countS = dailyList.filter((x) => x.status === 'S').length;
  const countI = dailyList.filter((x) => x.status === 'I').length;
  const countA = dailyList.filter((x) => x.status === 'A').length;
  const countTL = dailyList.filter((x) => x.status === 'TL').length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-300" /> ABSENSI GURU & TENAGA KEPENDIDIKAN
          </h2>
          <p className="text-xs text-emerald-200">
            {schoolInfo.namaSekolah} — Monitoring Kehadiran Guru & Tenaga Kependidikan
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-emerald-950/70 p-2 rounded-lg border border-emerald-700/50">
          <Calendar className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold">Pilih Tanggal:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase">Hadir (H)</span>
          <span className="text-xl font-black text-emerald-700">{countH}</span>
        </div>
        <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-teal-800 uppercase">Tugas Luar (TL)</span>
          <span className="text-xl font-black text-teal-700">{countTL}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-amber-800 uppercase">Sakit (S)</span>
          <span className="text-xl font-black text-amber-700">{countS}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-blue-800 uppercase">Izin (I)</span>
          <span className="text-xl font-black text-blue-700">{countI}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-rose-800 uppercase">Alpa (A)</span>
          <span className="text-xl font-black text-rose-700">{countA}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-slate-100 border border-slate-300 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-slate-700 uppercase">Total Guru/PTK</span>
          <span className="text-xl font-black text-slate-900">{teachers.length}</span>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama / NIP / jabatan guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500 border-slate-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllHadir}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tandai Semua Hadir
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Simpan Absensi Guru
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-32">NIP</th>
                <th className="py-3 px-3">Nama Guru / PTK</th>
                <th className="py-3 px-3 w-32">Jabatan</th>
                <th className="py-3 px-3 text-center w-24">Jam Masuk</th>
                <th className="py-3 px-3 text-center w-64">Status Kehadiran</th>
                <th className="py-3 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    Tidak ada guru ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => {
                  const current = dailyStatus[teacher.id] || { status: 'H', keterangan: '', jamMasuk: '07:15' };
                  const hariWajibList = teacher.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                  const isMandatoryToday = hariWajibList.includes(selectedDayName);

                  return (
                    <tr
                      key={teacher.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        current.status === 'A' ? 'bg-rose-50/60' : current.status === 'TL' ? 'bg-teal-50/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{teacher.nip}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{teacher.nama}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isMandatoryToday ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-950 font-extrabold px-2 py-0.5 rounded border border-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-700" /> Hari Wajib Masuk ({selectedDayName})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-700" /> Outside Schedule (Opsional)
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {hariWajibList.length} Hari/Mgg ({hariWajibList.join(', ')})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{teacher.jabatan}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <input
                            type="text"
                            value={current.jamMasuk}
                            onChange={(e) => handleJamMasukChange(teacher.id, e.target.value)}
                            className="w-16 text-center px-1 py-0.5 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {(['H', 'TL', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => {
                            const isSelected = current.status === st;
                            let colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
                            if (isSelected) {
                              if (st === 'H') colorClasses = 'bg-emerald-600 text-white border-emerald-800 font-black shadow-sm';
                              if (st === 'TL') colorClasses = 'bg-teal-600 text-white border-teal-800 font-black shadow-sm';
                              if (st === 'S') colorClasses = 'bg-amber-500 text-white border-amber-700 font-black shadow-sm';
                              if (st === 'I') colorClasses = 'bg-blue-600 text-white border-blue-800 font-black shadow-sm';
                              if (st === 'A') colorClasses = 'bg-rose-600 text-white border-rose-800 font-black shadow-sm';
                            }
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(teacher.id, st)}
                                className={`px-2 py-1 rounded text-xs border font-bold transition-all ${colorClasses}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Catatan tugas / keterangan..."
                          value={current.keterangan}
                          onChange={(e) => handleKeteranganChange(teacher.id, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-bold">Data Absensi Guru Berhasil Disimpan!</span>
        </div>
      )}
    </div>
  );
};
