import React, { useState } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, SchoolInfo, ClassCategory, Teacher, UserAccount } from '../types';
import { ClassFilterBar } from './ClassFilterBar';
import { Calendar, Search, CheckCircle2, Save, UserCheck, RefreshCw, User, ShieldCheck } from 'lucide-react';

interface StudentAttendanceProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassCategory[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  schoolInfo: SchoolInfo;
  selectedKelas: string;
  onSelectKelas: (kelas: string) => void;
  currentUser?: UserAccount | null;
}

export const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  students,
  teachers,
  classes,
  attendanceRecords,
  onSaveAttendance,
  schoolInfo,
  selectedKelas,
  onSelectKelas,
  currentUser,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Active Teacher Pengabsen state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    if (currentUser?.teacherId) return currentUser.teacherId;
    return teachers[0]?.id || 'T2';
  });

  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  // Filter students based on selected Class category and search query
  const displayStudents = students.filter((s) => {
    const matchesKelas =
      selectedKelas === 'SEMUA' || s.kelas.toLowerCase() === selectedKelas.toLowerCase();
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    return matchesKelas && matchesSearch;
  });

  // Local state for daily input
  const [dailyStatus, setDailyStatus] = useState<{ [studentId: string]: { status: AttendanceStatus; keterangan: string } }>(() => {
    const initialMap: { [studentId: string]: { status: AttendanceStatus; keterangan: string } } = {};
    students.forEach((s) => {
      const existing = attendanceRecords.find(
        (r) => r.targetType === 'siswa' && r.targetId === s.id && r.date === selectedDate
      );
      initialMap[s.id] = {
        status: existing ? existing.status : 'H',
        keterangan: existing?.keterangan || '',
      };
    });
    return initialMap;
  });

  // Re-sync when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const newMap: { [studentId: string]: { status: AttendanceStatus; keterangan: string } } = {};
    students.forEach((s) => {
      const existing = attendanceRecords.find(
        (r) => r.targetType === 'siswa' && r.targetId === s.id && r.date === newDate
      );
      newMap[s.id] = {
        status: existing ? existing.status : 'H',
        keterangan: existing?.keterangan || '',
      };
    });
    setDailyStatus(newMap);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDailyStatus((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleKeteranganChange = (studentId: string, keterangan: string) => {
    setDailyStatus((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        keterangan,
      },
    }));
  };

  const handleMarkAllHadir = () => {
    const updated = { ...dailyStatus };
    displayStudents.forEach((s) => {
      updated[s.id] = { ...updated[s.id], status: 'H' };
    });
    setDailyStatus(updated);
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = displayStudents.map((s) => {
      const current = dailyStatus[s.id] || { status: 'H', keterangan: '' };
      return {
        id: `att_std_${s.id}_${selectedDate}`,
        date: selectedDate,
        targetType: 'siswa',
        targetId: s.id,
        status: current.status,
        keterangan: current.keterangan,
      };
    });

    onSaveAttendance(newRecords);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Summary stats for currently displayed students
  const countH = displayStudents.filter((s) => (dailyStatus[s.id]?.status || 'H') === 'H').length;
  const countS = displayStudents.filter((s) => dailyStatus[s.id]?.status === 'S').length;
  const countI = displayStudents.filter((s) => dailyStatus[s.id]?.status === 'I').length;
  const countA = displayStudents.filter((s) => dailyStatus[s.id]?.status === 'A').length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-300" /> ABSENSI SISWA HARI INI
          </h2>
          <p className="text-xs text-blue-200">
            {schoolInfo.namaSekolah} — Filter: {selectedKelas === 'SEMUA' ? 'Semua Kelas (I - VI)' : selectedKelas}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-blue-950/70 p-2 rounded-lg border border-blue-700/50">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span className="text-xs font-bold">Pilih Tanggal:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Teacher Pengabsen & Access Control Bar */}
      <div className="bg-emerald-900 text-white p-3.5 rounded-xl shadow border border-emerald-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-400 text-slate-950 rounded-lg font-black shadow">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 block tracking-wider">
              GURU PENGABSEN / PETUGAS PENCATAT:
            </span>
            <span className="font-extrabold text-sm text-white">
              {activeTeacher ? activeTeacher.nama : 'Guru Pengajar'}
            </span>
            <span className="text-emerald-200 text-[11px] ml-2">
              ({activeTeacher ? activeTeacher.jabatan : 'Tenaga Pendidik'})
            </span>
          </div>
        </div>

        {/* Change Teacher Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-emerald-200">Ganti Guru Pengabsen:</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="bg-white text-slate-900 font-bold p-1.5 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-amber-400 text-xs"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama} ({t.jabatan})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Filter Bar Component */}
      <ClassFilterBar
        classes={classes}
        teachers={teachers}
        selectedKelas={selectedKelas}
        onSelectKelas={onSelectKelas}
        title="KATEGORI KELAS SANGGUP ABSENSI:"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase">Hadir (H)</span>
          <span className="text-xl font-black text-emerald-700">{countH}</span>
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
          <span className="block text-[10px] font-bold text-slate-700 uppercase">Siswa Terfilter</span>
          <span className="text-xl font-black text-slate-900">{displayStudents.length}</span>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama / NIS / NISN siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 border-slate-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllHadir}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-300 transition-all"
            title="Setel status siswa terfilter menjadi Hadir"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tandai Semua Hadir
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Simpan Absensi
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
                <th className="py-3 px-3 w-20">NIS</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3 text-center w-24">Kategori Kelas</th>
                <th className="py-3 px-3 text-center w-12">L/P</th>
                <th className="py-3 px-3 text-center w-60">Status Kehadiran</th>
                <th className="py-3 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {displayStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    Tidak ada siswa ditemukan dalam kategori kelas ini.
                  </td>
                </tr>
              ) : (
                displayStudents.map((student, index) => {
                  const current = dailyStatus[student.id] || { status: 'H', keterangan: '' };
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        current.status === 'A' ? 'bg-rose-50/60' : current.status === 'S' ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{student.nis}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{student.nama}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-300">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{student.jenisKelamin}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => {
                            const isSelected = current.status === st;
                            let colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
                            if (isSelected) {
                              if (st === 'H') colorClasses = 'bg-emerald-600 text-white border-emerald-800 font-black shadow-sm';
                              if (st === 'S') colorClasses = 'bg-amber-500 text-white border-amber-700 font-black shadow-sm';
                              if (st === 'I') colorClasses = 'bg-blue-600 text-white border-blue-800 font-black shadow-sm';
                              if (st === 'A') colorClasses = 'bg-rose-600 text-white border-rose-800 font-black shadow-sm';
                            }
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(student.id, st)}
                                className={`px-2.5 py-1 rounded text-xs border font-bold transition-all ${colorClasses}`}
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
                          placeholder="Catatan / Keterangan (opsional)..."
                          value={current.keterangan}
                          onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
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
          <span className="text-xs font-bold">Data Absensi Siswa Berhasil Disimpan!</span>
        </div>
      )}
    </div>
  );
};
