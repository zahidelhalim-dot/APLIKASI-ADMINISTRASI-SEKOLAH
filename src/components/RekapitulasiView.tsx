import React, { useState } from 'react';
import { SchoolInfo, Student, Teacher, AttendanceRecord, MonthOption } from '../types';
import { MONTH_LIST } from '../data/initialData';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToWord } from '../utils/wordExporter';
import { FileSpreadsheet, Download, Printer, Filter, Users, UserCheck, FileText } from 'lucide-react';

interface RekapitulasiViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  selectedMonth: MonthOption | null;
  onSelectMonth: (m: MonthOption) => void;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  schoolInfo,
  students,
  teachers,
  attendanceRecords,
  selectedMonth,
  onSelectMonth,
}) => {
  const [targetType, setTargetType] = useState<'siswa' | 'guru'>('siswa');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    selectedMonth ? selectedMonth.key : 'agustus'
  );

  const currentMonthOption =
    MONTH_LIST.find((m) => m.key === selectedMonthKey) || MONTH_LIST[0];

  const filteredRecords = attendanceRecords.filter((r) => {
    if (r.targetType !== targetType) return false;
    if (!r.date) return false;
    const dateObj = new Date(r.date);
    return dateObj.getMonth() === currentMonthOption.monthIndex;
  });

  // Calculate Overall Totals and Percentages
  let totalH = 0;
  let totalS = 0;
  let totalI = 0;
  let totalA = 0;
  let totalTL = 0;
  let totalRecordsSum = 0;

  if (targetType === 'siswa') {
    students.forEach((s) => {
      const studentAtt = filteredRecords.filter((r) => r.targetId === s.id);
      totalH += studentAtt.filter((r) => r.status === 'H').length;
      totalS += studentAtt.filter((r) => r.status === 'S').length;
      totalI += studentAtt.filter((r) => r.status === 'I').length;
      totalA += studentAtt.filter((r) => r.status === 'A').length;
      totalRecordsSum += studentAtt.length;
    });
  } else {
    teachers.forEach((t) => {
      const teacherAtt = filteredRecords.filter((r) => r.targetId === t.id);
      const hariWajibList = t.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];
      const DAY_NAMES_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      totalH += teacherAtt.filter((r) => r.status === 'H').length;
      totalS += teacherAtt.filter((r) => r.status === 'S').length;
      totalI += teacherAtt.filter((r) => r.status === 'I').length;
      totalTL += teacherAtt.filter((r) => r.status === 'TL').length;

      const a = teacherAtt.filter((r) => {
        if (r.status !== 'A') return false;
        const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
        return hariWajibList.includes(dayName);
      }).length;
      totalA += a;

      const totalRelevant = teacherAtt.filter((r) => {
        if (r.status !== 'A') return true;
        const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
        return hariWajibList.includes(dayName);
      }).length;
      totalRecordsSum += totalRelevant;
    });
  }

  const overallPct = totalRecordsSum > 0 ? Math.round(((totalH + totalTL) / totalRecordsSum) * 100) : 0;
  const countPeople = targetType === 'siswa' ? students.length : teachers.length;

  const handleMonthChange = (key: string) => {
    setSelectedMonthKey(key);
    const mOpt = MONTH_LIST.find((m) => m.key === key);
    if (mOpt) onSelectMonth(mOpt);
  };

  const handleExportPDF = () => {
    exportToPDF({
      schoolInfo,
      title: `REKAPITULASI ABSENSI ${targetType === 'siswa' ? 'SISWA' : 'GURU'}`,
      subtitle: `Laporan Rekapitulasi Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      students,
      teachers,
      attendanceRecords: filteredRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  const handleExportWord = () => {
    exportToWord({
      schoolInfo,
      title: `REKAPITULASI ABSENSI ${targetType === 'siswa' ? 'SISWA' : 'GURU'}`,
      subtitle: `Laporan Rekapitulasi Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      students,
      teachers,
      attendanceRecords: filteredRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-amber-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-300" /> REKAPITULASI KEHADIRAN BULANAN
          </h2>
          <p className="text-xs text-amber-200">
            {schoolInfo.namaSekolah} — Periode: {currentMonthOption.label}
          </p>
        </div>

        {/* Target & Month Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Toggle */}
          <div className="bg-black/30 p-1 rounded-lg flex gap-1 border border-amber-500/30">
            <button
              onClick={() => setTargetType('siswa')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                targetType === 'siswa' ? 'bg-amber-400 text-amber-950 shadow' : 'text-amber-100 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Siswa
            </button>
            <button
              onClick={() => setTargetType('guru')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                targetType === 'guru' ? 'bg-amber-400 text-amber-950 shadow' : 'text-amber-100 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Guru / PTK
            </button>
          </div>

          {/* Month Selector */}
          <select
            value={selectedMonthKey}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-amber-100 text-amber-950 font-black text-xs px-3 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {MONTH_LIST.map((m) => (
              <option key={m.key} value={m.key}>
                BULAN {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>
            Menampilkan Rekap {targetType === 'siswa' ? 'Siswa' : 'Guru'} Bulan{' '}
            <span className="text-rose-800 font-black">{currentMonthOption.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Download PDF Laporan Resmi"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>

          <button
            onClick={handleExportWord}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Download Dokumen Microsoft Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5" /> Download Word
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Cetak Langsung / Print"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Ringkasan Total Absensi Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Personel</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{countPeople} Personel</p>
          <p className="text-[10px] text-slate-600 font-medium">{targetType === 'siswa' ? `Kelas ${selectedKelas}` : 'Guru & PTK'}</p>
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Hadir (H)</p>
          <p className="text-lg font-black text-emerald-900 mt-0.5">{totalH} Hari</p>
          <p className="text-[10px] text-emerald-700 font-bold">{totalRecordsSum > 0 ? Math.round((totalH / totalRecordsSum) * 100) : 0}% Akumulasi</p>
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Sakit & Izin</p>
          <p className="text-lg font-black text-amber-900 mt-0.5">{totalS + totalI} Hari</p>
          <p className="text-[10px] text-amber-800 font-semibold">{totalS} Sakit | {totalI} Izin</p>
        </div>

        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Tanpa Ket. (Alpa)</p>
          <p className="text-lg font-black text-rose-900 mt-0.5">{totalA} Hari</p>
          <p className="text-[10px] text-rose-700 font-semibold">{totalRecordsSum > 0 ? Math.round((totalA / totalRecordsSum) * 100) : 0}% Rasio Alpa</p>
        </div>

        <div className="bg-emerald-900 text-white p-3 rounded-xl border border-emerald-950 shadow-md text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Rata-Rata Kehadiran</p>
          <p className="text-xl font-black text-amber-300 mt-0.5">{overallPct}%</p>
          <p className="text-[10px] text-emerald-200 font-semibold">
            {overallPct >= 90 ? '🟢 Sangat Baik' : overallPct >= 75 ? '🟡 Cukup Baik' : '🔴 Perlu Evaluasi'}
          </p>
        </div>
      </div>

      {/* Table Rekapitulasi */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-28">{targetType === 'siswa' ? 'NIS' : 'NIP'}</th>
                <th className="py-3 px-3">{targetType === 'siswa' ? 'Nama Siswa' : 'Nama Guru / PTK'}</th>
                <th className="py-3 px-3 text-center w-12">L/P</th>
                <th className="py-3 px-3 w-32">{targetType === 'siswa' ? 'Kelas' : 'Jabatan'}</th>
                <th className="py-2 px-2 text-center bg-emerald-700 text-white w-14">Hadir (H)</th>
                <th className="py-2 px-2 text-center bg-amber-600 text-white w-14">Sakit (S)</th>
                <th className="py-2 px-2 text-center bg-blue-600 text-white w-14">Izin (I)</th>
                <th className="py-2 px-2 text-center bg-rose-600 text-white w-14">Alpa (A)</th>
                {targetType === 'guru' && (
                  <th className="py-2 px-2 text-center bg-teal-700 text-white w-14">TL</th>
                )}
                <th className="py-2 px-2 text-center bg-slate-900 text-white w-16">Total</th>
                <th className="py-2 px-2 text-center bg-emerald-900 text-white w-20">% Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {targetType === 'siswa' ? (
                students.map((s, idx) => {
                  const studentAtt = filteredRecords.filter((r) => r.targetId === s.id);
                  const h = studentAtt.filter((r) => r.status === 'H').length;
                  const sakit = studentAtt.filter((r) => r.status === 'S').length;
                  const i = studentAtt.filter((r) => r.status === 'I').length;
                  const a = studentAtt.filter((r) => r.status === 'A').length;
                  const total = studentAtt.length || 1;
                  const pct = Math.round((h / total) * 100);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{s.nis}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{s.jenisKelamin}</td>
                      <td className="py-2.5 px-3 text-slate-700">{s.kelas}</td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-700 bg-emerald-50/50">
                        {h}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/50">
                        {sakit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-blue-700 bg-blue-50/50">
                        {i}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/50">
                        {a}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-800 bg-slate-100">
                        {studentAtt.length}
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-900 bg-emerald-100">
                        {pct}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                teachers.map((t, idx) => {
                  const teacherAtt = filteredRecords.filter((r) => r.targetId === t.id);
                  const hariWajibList = t.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];
                  const DAY_NAMES_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

                  const h = teacherAtt.filter((r) => r.status === 'H').length;
                  const sakit = teacherAtt.filter((r) => r.status === 'S').length;
                  const i = teacherAtt.filter((r) => r.status === 'I').length;
                  const tl = teacherAtt.filter((r) => r.status === 'TL').length;

                  // Alpa is only counted if it falls on teacher's mandatory schedule
                  const a = teacherAtt.filter((r) => {
                    if (r.status !== 'A') return false;
                    const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
                    return hariWajibList.includes(dayName);
                  }).length;

                  // Filter total records that are relevant (either present/excused, or Alpa on mandatory day)
                  const totalRelevant = teacherAtt.filter((r) => {
                    if (r.status !== 'A') return true;
                    const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
                    return hariWajibList.includes(dayName);
                  }).length;

                  const total = totalRelevant || 1;
                  const pct = Math.round(((h + tl) / total) * 100);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{t.nip}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{t.nama}</div>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                          Jadwal Wajib: {hariWajibList.length} Hari ({hariWajibList.join(', ')})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{t.jenisKelamin}</td>
                      <td className="py-2.5 px-3 text-slate-700">{t.jabatan}</td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-700 bg-emerald-50/50">
                        {h}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/50">
                        {sakit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-blue-700 bg-blue-50/50">
                        {i}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/50">
                        {a}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-teal-700 bg-teal-50/50">
                        {tl}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-800 bg-slate-100">
                        {totalRelevant}
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-emerald-900 bg-emerald-100">
                        {pct}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-slate-900 text-white font-black uppercase text-xs">
              <tr>
                <td colSpan={5} className="py-3 px-3 text-right tracking-wider text-amber-300">
                  TOTAL KESELURUHAN ({countPeople} {targetType === 'siswa' ? 'SISWA' : 'GURU'}):
                </td>
                <td className="py-3 px-2 text-center bg-emerald-800 text-emerald-100 text-sm font-black">
                  {totalH}
                </td>
                <td className="py-3 px-2 text-center bg-amber-800 text-amber-100 font-bold">
                  {totalS}
                </td>
                <td className="py-3 px-2 text-center bg-blue-800 text-blue-100 font-bold">
                  {totalI}
                </td>
                <td className="py-3 px-2 text-center bg-rose-800 text-rose-100 font-bold">
                  {totalA}
                </td>
                {targetType === 'guru' && (
                  <td className="py-3 px-2 text-center bg-teal-800 text-teal-100 font-bold">
                    {totalTL}
                  </td>
                )}
                <td className="py-3 px-2 text-center bg-slate-800 text-white font-black">
                  {totalRecordsSum}
                </td>
                <td className="py-3 px-2 text-center bg-emerald-950 text-amber-300 text-sm font-black border-l border-amber-500/50">
                  {overallPct}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
