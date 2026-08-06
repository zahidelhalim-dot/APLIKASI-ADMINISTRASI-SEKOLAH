import React, { useState } from 'react';
import { SchoolInfo, Student, Teacher, AttendanceRecord, ClassCategory } from '../types';
import { MONTH_LIST } from '../data/initialData';
import { exportToPDF, exportIndividualPDF } from '../utils/pdfExporter';
import { exportToWord, exportIndividualWord } from '../utils/wordExporter';
import { ClassFilterBar } from './ClassFilterBar';
import { Printer, Download, FileText, User, Search, Layers, Calendar, CheckCircle2, AlertCircle, XCircle, Clock, Info } from 'lucide-react';

interface LaporanViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  classes?: ClassCategory[];
  attendanceRecords: AttendanceRecord[];
  selectedKelas?: string;
  onSelectKelas?: (kelas: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  schoolInfo,
  students,
  teachers,
  classes = [],
  attendanceRecords,
  selectedKelas = 'SEMUA',
  onSelectKelas,
}) => {
  const [reportMode, setReportMode] = useState<'kolektif' | 'perorangan'>('kolektif');
  const [targetType, setTargetType] = useState<'siswa' | 'guru'>('siswa');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('agustus');

  // Perorangan state
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [personSearchQuery, setPersonSearchQuery] = useState<string>('');

  const currentMonthOption =
    MONTH_LIST.find((m) => m.key === selectedMonthKey) || MONTH_LIST[0];

  // Kolektif Filtering
  const filteredStudents = students.filter((s) => {
    if (targetType !== 'siswa') return true;
    return selectedKelas === 'SEMUA' || s.kelas.toLowerCase() === selectedKelas.toLowerCase();
  });

  const filteredRecords = attendanceRecords.filter((r) => {
    if (r.targetType !== targetType) return false;
    if (!r.date) return false;
    const dateObj = new Date(r.date);
    return dateObj.getMonth() === currentMonthOption.monthIndex;
  });

  const activeWaliKelas = classes.find(
    (c) => c.namaKelas.toLowerCase() === selectedKelas.toLowerCase()
  );
  const waliKelasTeacher = teachers.find((t) => t.id === activeWaliKelas?.waliKelasId);

  // Kolektif Totals
  const sumH = filteredRecords.filter((r) => r.status === 'H').length;
  const sumS = filteredRecords.filter((r) => r.status === 'S').length;
  const sumI = filteredRecords.filter((r) => r.status === 'I').length;
  const sumA = filteredRecords.filter((r) => r.status === 'A').length;
  const sumTotalDays = filteredRecords.length;
  const sumPct = sumTotalDays > 0 ? Math.round((sumH / sumTotalDays) * 100) : 0;
  const currentDataset = targetType === 'siswa' ? filteredStudents : teachers;

  // Perorangan List & Auto Select
  const availablePeopleList = targetType === 'siswa'
    ? students.filter((s) => selectedKelas === 'SEMUA' || s.kelas.toLowerCase() === selectedKelas.toLowerCase())
    : teachers;

  const searchedPeopleList = availablePeopleList.filter((p) => {
    const q = personSearchQuery.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      ('nis' in p && p.nis.includes(q)) ||
      ('nip' in p && p.nip.includes(q)) ||
      ('kelas' in p && p.kelas.toLowerCase().includes(q))
    );
  });

  // Active Person Selection
  const currentPerson = availablePeopleList.find((p) => p.id === selectedPersonId) || availablePeopleList[0];

  // Attendance Records for Selected Individual
  const personAttendanceRecords = currentPerson
    ? attendanceRecords.filter((r) => {
        if (r.targetType !== targetType) return false;
        if (r.targetId !== currentPerson.id) return false;
        if (!r.date) return false;
        const dateObj = new Date(r.date);
        return dateObj.getMonth() === currentMonthOption.monthIndex;
      })
    : [];

  // Individual Stats
  const indH = personAttendanceRecords.filter((r) => r.status === 'H').length;
  const indS = personAttendanceRecords.filter((r) => r.status === 'S').length;
  const indI = personAttendanceRecords.filter((r) => r.status === 'I').length;
  const indA = personAttendanceRecords.filter((r) => r.status === 'A').length;
  const indTL = personAttendanceRecords.filter((r) => r.status === 'TL').length;
  const indTotal = personAttendanceRecords.length;
  const indPct = indTotal > 0 ? Math.round(((indH + indTL) / indTotal) * 100) : 0;

  // Kolektif Handlers
  const handleExportPDF = () => {
    exportToPDF({
      schoolInfo: {
        ...schoolInfo,
        kelas: selectedKelas === 'SEMUA' ? 'Semua Kelas (I - VI)' : selectedKelas,
        namaGuruKelas: waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas,
        nipGuruKelas: waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas,
      },
      title: `LAPORAN ABSENSI RESMI ${targetType === 'siswa' ? `SISWA - ${selectedKelas}` : 'GURU'}`,
      subtitle: `Dokumen Rekapitulasi Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      students: filteredStudents,
      teachers,
      attendanceRecords: filteredRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  const handleExportWord = () => {
    exportToWord({
      schoolInfo: {
        ...schoolInfo,
        kelas: selectedKelas === 'SEMUA' ? 'Semua Kelas (I - VI)' : selectedKelas,
        namaGuruKelas: waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas,
        nipGuruKelas: waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas,
      },
      title: `LAPORAN ABSENSI RESMI ${targetType === 'siswa' ? `SISWA - ${selectedKelas}` : 'GURU'}`,
      subtitle: `Dokumen Rekapitulasi Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      students: filteredStudents,
      teachers,
      attendanceRecords: filteredRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  // Perorangan Export Handlers
  const handleExportIndividualPDF = () => {
    if (!currentPerson) return;
    const isStudent = 'nis' in currentPerson;
    exportIndividualPDF({
      schoolInfo: {
        ...schoolInfo,
        namaGuruKelas: waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas,
        nipGuruKelas: waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas,
      },
      title: `RAPORT ABSENSI PERORANGAN ${isStudent ? 'SISWA' : 'GURU'}`,
      subtitle: `Catatan Ringkasan Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      person: {
        id: currentPerson.id,
        nama: currentPerson.nama,
        nisOrNip: isStudent ? (currentPerson as Student).nis : (currentPerson as Teacher).nip,
        nisn: isStudent ? (currentPerson as Student).nisn : undefined,
        jenisKelamin: currentPerson.jenisKelamin,
        kelasOrJabatan: isStudent ? (currentPerson as Student).kelas : (currentPerson as Teacher).jabatan,
      },
      attendanceRecords: personAttendanceRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  const handleExportIndividualWord = () => {
    if (!currentPerson) return;
    const isStudent = 'nis' in currentPerson;
    exportIndividualWord({
      schoolInfo: {
        ...schoolInfo,
        namaGuruKelas: waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas,
        nipGuruKelas: waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas,
      },
      title: `RAPORT ABSENSI PERORANGAN ${isStudent ? 'SISWA' : 'GURU'}`,
      subtitle: `Catatan Ringkasan Kehadiran Bulan ${currentMonthOption.label}`,
      targetType,
      person: {
        id: currentPerson.id,
        nama: currentPerson.nama,
        nisOrNip: isStudent ? (currentPerson as Student).nis : (currentPerson as Teacher).nip,
        nisn: isStudent ? (currentPerson as Student).nisn : undefined,
        jenisKelamin: currentPerson.jenisKelamin,
        kelasOrJabatan: isStudent ? (currentPerson as Student).kelas : (currentPerson as Teacher).jabatan,
      },
      attendanceRecords: personAttendanceRecords,
      periodLabel: `Bulan ${currentMonthOption.label}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 rounded-xl shadow-lg border border-emerald-700/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-700 text-emerald-100 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block">
            PUSAT LAPORAN & DOKUMEN KEPALA SEKOLAH
          </span>
          <h2 className="text-xl font-black tracking-wide flex items-center gap-2">
            <Printer className="w-6 h-6 text-emerald-300" /> DOKUMEN & LAPORAN ABSENSI RESMI
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            Cetak dokumen rekapitulasi kolektif per kelas atau Laporan Raport Absensi Perorangan (Individu) dalam format PDF, Microsoft Word, atau cetak fisik.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {reportMode === 'kolektif' ? (
            <>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download PDF Kolektif
              </button>

              <button
                onClick={handleExportWord}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" /> Download Word (.docx)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportIndividualPDF}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> PDF Perorangan
              </button>

              <button
                onClick={handleExportIndividualWord}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" /> Word Perorangan
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Cetak / Print
          </button>
        </div>
      </div>

      {/* Primary Report Mode Switcher Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setReportMode('kolektif')}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            reportMode === 'kolektif'
              ? 'bg-emerald-800 text-white shadow border border-emerald-900 font-black'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-300" />
          <span>LAPORAN REKAPITULASI KELAS / KOLEKTIF</span>
        </button>

        <button
          onClick={() => setReportMode('perorangan')}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            reportMode === 'perorangan'
              ? 'bg-emerald-800 text-white shadow border border-emerald-900 font-black'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-amber-300" />
          <span>LAPORAN ABSENSI PERORANGAN (RAPORT INDIVIDU)</span>
        </button>
      </div>

      {/* Class Category Filter if targetType === 'siswa' */}
      {targetType === 'siswa' && onSelectKelas && (
        <ClassFilterBar
          classes={classes}
          teachers={teachers}
          selectedKelas={selectedKelas}
          onSelectKelas={onSelectKelas}
          title="FILTER BERDASARKAN KATEGORI KELAS:"
        />
      )}

      {/* MODE 1: KOLEKTIF VIEW */}
      {reportMode === 'kolektif' && (
        <>
          {/* Settings Filter Card */}
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-black text-slate-700 mb-1">JENIS ABSENSI LAPORAN</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as 'siswa' | 'guru')}
                className="w-full p-2 border rounded-lg border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                <option value="siswa">Absensi Siswa (Per Kelas)</option>
                <option value="guru">Absensi Guru & Tenaga Kependidikan</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1">PERIODE BULAN</label>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="w-full p-2 border rounded-lg border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                {MONTH_LIST.map((m) => (
                  <option key={m.key} value={m.key}>
                    Bulan {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1">PENANDATANGAN DOKUMEN</label>
              <div className="p-2 bg-slate-50 border rounded-lg text-slate-800 font-semibold truncate">
                Kepala Sekolah: <span className="font-bold text-emerald-900">{schoolInfo.namaKepalaSekolah}</span>
              </div>
            </div>
          </div>

          {/* Live Document Preview Box */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 shadow-inner overflow-x-auto">
            <div className="bg-white max-w-4xl mx-auto p-8 shadow-2xl border border-slate-300 font-sans text-slate-900 space-y-4 rounded-sm">
              {/* Kop Surat Preview */}
              <div className="text-center border-b-4 border-double border-slate-900 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  YAYASAN AL-HUSAINI
                </h4>
                <h3 className="text-lg font-black uppercase text-slate-950 tracking-wide">
                  {schoolInfo.namaSekolah}
                </h3>
                <p className="text-[11px] text-slate-600">
                  {schoolInfo.alamat}, {schoolInfo.kelurahan}, {schoolInfo.kecamatan}, {schoolInfo.kabupatenKota}
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  NPSN: {schoolInfo.npsn} | Email: info@{schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id
                </p>
              </div>

              {/* Doc Title */}
              <div className="text-center space-y-1">
                <h4 className="font-black text-sm uppercase underline text-emerald-950">
                  LAPORAN REKAPITULASI ABSENSI {targetType === 'siswa' ? `SISWA - ${selectedKelas}` : 'GURU & PTK'}
                </h4>
                <p className="text-xs font-bold text-slate-700">
                  Periode: Bulan {currentMonthOption.label} — Tahun Pelajaran {schoolInfo.tahunPelajaran}
                </p>
              </div>

              {/* Doc Meta */}
              <div className="grid grid-cols-2 text-xs font-semibold pt-2 text-slate-700 border-t border-b py-2">
                <div>
                  <p>Kelas / Kategori: <span className="font-bold text-slate-900">{targetType === 'siswa' ? selectedKelas : 'Semua Guru & PTK'}</span></p>
                  <p>Wali Kelas: <span className="font-bold text-emerald-900">{waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas}</span></p>
                </div>
                <div className="text-right">
                  <p>Tanggal Cetak: <span className="font-bold text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  <p>Status Dokumen: <span className="text-emerald-700 font-black">VALID / RESMI</span></p>
                </div>
              </div>

              {/* Table Preview */}
              <table className="w-full text-xs text-left border-collapse border border-slate-400">
                <thead className="bg-emerald-800 text-white font-bold text-[10px] uppercase">
                  <tr>
                    <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 p-1.5">{targetType === 'siswa' ? 'NIS' : 'NIP'}</th>
                    <th className="border border-slate-400 p-1.5">{targetType === 'siswa' ? 'Nama Siswa' : 'Nama Guru'}</th>
                    <th className="border border-slate-400 p-1.5 text-center">Kelas</th>
                    <th className="border border-slate-400 p-1.5 text-center">Hadir</th>
                    <th className="border border-slate-400 p-1.5 text-center">Sakit</th>
                    <th className="border border-slate-400 p-1.5 text-center">Izin</th>
                    <th className="border border-slate-400 p-1.5 text-center">Alpa</th>
                    <th className="border border-slate-400 p-1.5 text-center">% Hadir</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] divide-y divide-slate-300">
                  {targetType === 'siswa'
                    ? filteredStudents.slice(0, 10).map((s, idx) => {
                        const studentAtt = filteredRecords.filter((r) => r.targetId === s.id);
                        const h = studentAtt.filter((r) => r.status === 'H').length;
                        const sakit = studentAtt.filter((r) => r.status === 'S').length;
                        const i = studentAtt.filter((r) => r.status === 'I').length;
                        const a = studentAtt.filter((r) => r.status === 'A').length;
                        const total = studentAtt.length || 1;
                        const pct = Math.round((h / total) * 100);

                        return (
                          <tr key={s.id}>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-mono">{s.nis}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{s.nama}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{s.kelas}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-800">{h}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-amber-800">{sakit}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-blue-800">{i}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-rose-800">{a}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-black">{pct}%</td>
                          </tr>
                        );
                      })
                    : teachers.slice(0, 10).map((t, idx) => {
                        const teacherAtt = filteredRecords.filter((r) => r.targetId === t.id);
                        const h = teacherAtt.filter((r) => r.status === 'H').length;
                        const sakit = teacherAtt.filter((r) => r.status === 'S').length;
                        const i = teacherAtt.filter((r) => r.status === 'I').length;
                        const a = teacherAtt.filter((r) => r.status === 'A').length;
                        const total = teacherAtt.length || 1;
                        const pct = Math.round((h / total) * 100);

                        return (
                          <tr key={t.id}>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-mono">{t.nip}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{t.nama}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{t.jabatan}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-800">{h}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-amber-800">{sakit}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-blue-800">{i}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-rose-800">{a}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-black">{pct}%</td>
                          </tr>
                        );
                      })}
                </tbody>
                <tfoot className="bg-slate-200 font-bold text-[11px]">
                  <tr>
                    <td colSpan={4} className="border border-slate-400 p-1.5 text-right font-black uppercase">
                      TOTAL KESELURUHAN ({currentDataset.length} {targetType === 'siswa' ? 'SISWA' : 'GURU'}):
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-black text-emerald-800">{sumH}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-black text-amber-800">{sumS}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-black text-blue-800">{sumI}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-black text-rose-800">{sumA}</td>
                    <td className="border border-slate-400 p-1.5 text-center font-black text-emerald-950 bg-emerald-100">{sumPct}%</td>
                  </tr>
                </tfoot>
              </table>

              {filteredStudents.length > 10 && (
                <p className="text-[10px] text-slate-500 italic text-center">
                  * Menampilkan preview 10 dari {targetType === 'siswa' ? filteredStudents.length : teachers.length} data. Dokumen hasil unduh PDF/Word akan berisi seluruh data lengkap.
                </p>
              )}

              {/* Signature Block Preview */}
              <div className="pt-8 grid grid-cols-2 text-xs font-semibold">
                <div>
                  <p>Mengetahui,</p>
                  <p>Wali Kelas / Pengelola</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas}</p>
                  <p className="text-[11px] text-slate-600">NIP. {waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas}</p>
                </div>

                <div className="text-right">
                  <p>{schoolInfo.kelurahan || 'Sekolah'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Kepala Sekolah,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-emerald-950">{schoolInfo.namaKepalaSekolah}</p>
                  <p className="text-[11px] text-slate-600">NIP. {schoolInfo.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODE 2: PERORANGAN VIEW */}
      {reportMode === 'perorangan' && (
        <div className="space-y-4">
          {/* Controls: Target Person Selector */}
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-black text-slate-700 mb-1 uppercase">1. JENIS SUBJEK LAPORAN</label>
              <select
                value={targetType}
                onChange={(e) => {
                  const newType = e.target.value as 'siswa' | 'guru';
                  setTargetType(newType);
                  setSelectedPersonId('');
                }}
                className="w-full p-2 border rounded-lg border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                <option value="siswa">Perorangan Siswa</option>
                <option value="guru">Perorangan Guru / PTK</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1 uppercase">2. PILIH BULAN ABSENSI</label>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="w-full p-2 border rounded-lg border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                {MONTH_LIST.map((m) => (
                  <option key={m.key} value={m.key}>
                    Bulan {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1 uppercase">3. CARI NAMA / NIS / NIP</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Ketik nama atau nomor identitas..."
                  value={personSearchQuery}
                  onChange={(e) => setPersonSearchQuery(e.target.value)}
                  className="w-full p-2 pl-8 border rounded-lg border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Select Person Dropdown List */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-black text-slate-700 uppercase block">
              PILIH {targetType === 'siswa' ? `SISWA (${selectedKelas})` : 'GURU / PTK'} UNTUK DILIHAT LAPORANNYA:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {searchedPeopleList.map((person) => {
                const isSelected = currentPerson?.id === person.id;
                const isStudent = 'nis' in person;

                return (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`p-2 rounded-lg text-left border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-950 ring-2 ring-emerald-400 font-bold shadow-md'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-emerald-700 text-white'
                    }`}>
                      {person.jenisKelamin}
                    </div>
                    <div className="truncate">
                      <p className="font-extrabold text-xs truncate leading-tight">{person.nama}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {isStudent ? `NIS: ${(person as Student).nis} | ${(person as Student).kelas}` : `NIP: ${(person as Teacher).nip}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Report Card Preview */}
          {currentPerson && (
            <div className="bg-slate-100 p-4 sm:p-6 rounded-xl border border-slate-300 shadow-inner overflow-x-auto">
              <div className="bg-white max-w-4xl mx-auto p-6 sm:p-8 shadow-2xl border border-slate-300 font-sans text-slate-900 space-y-5 rounded-sm">
                {/* Kop Surat */}
                <div className="text-center border-b-4 border-double border-slate-900 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    YAYASAN AL-HUSAINI
                  </h4>
                  <h3 className="text-lg font-black uppercase text-slate-950 tracking-wide">
                    {schoolInfo.namaSekolah}
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    {schoolInfo.alamat}, {schoolInfo.kelurahan}, {schoolInfo.kecamatan}, {schoolInfo.kabupatenKota}
                  </p>
                </div>

                {/* Doc Title */}
                <div className="text-center space-y-1">
                  <h4 className="font-black text-sm uppercase underline text-emerald-950 tracking-wide">
                    LAPORAN RAPORT ABSENSI PERORANGAN {targetType === 'siswa' ? 'SISWA' : 'GURU'}
                  </h4>
                  <p className="text-xs font-bold text-slate-700">
                    Periode Bulan: {currentMonthOption.label} — Tahun Pelajaran {schoolInfo.tahunPelajaran}
                  </p>
                </div>

                {/* Profile Box */}
                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-600 font-bold">NAMA LENGKAP : <span className="font-black text-slate-950 text-sm uppercase">{currentPerson.nama}</span></p>
                    <p className="text-slate-600 font-bold">
                      {'nis' in currentPerson ? 'NIS / NISN' : 'NIP'} :{' '}
                      <span className="font-mono font-black text-slate-900">
                        {'nis' in currentPerson ? `${(currentPerson as Student).nis} / ${(currentPerson as Student).nisn}` : (currentPerson as Teacher).nip}
                      </span>
                    </p>
                    <p className="text-slate-600 font-bold">JENIS KELAMIN : <span className="font-bold text-slate-900">{currentPerson.jenisKelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</span></p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-slate-600 font-bold">
                      {'kelas' in currentPerson ? 'KELAS' : 'JABATAN'} :{' '}
                      <span className="font-black text-emerald-900 uppercase">
                        {'kelas' in currentPerson ? (currentPerson as Student).kelas : (currentPerson as Teacher).jabatan}
                      </span>
                    </p>
                    <p className="text-slate-600 font-bold">SEMESTER : <span className="font-bold text-slate-900">{schoolInfo.semester}</span></p>
                    <p className="text-slate-600 font-bold">WALI KELAS : <span className="font-bold text-slate-900">{waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas}</span></p>
                  </div>
                </div>

                {/* Attendance Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  <div className="bg-emerald-100 p-2 rounded-lg border border-emerald-300">
                    <span className="text-[10px] font-black text-emerald-900 block uppercase">HADIR (H)</span>
                    <span className="text-lg font-black text-emerald-950">{indH}</span>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-lg border border-amber-300">
                    <span className="text-[10px] font-black text-amber-900 block uppercase">SAKIT (S)</span>
                    <span className="text-lg font-black text-amber-950">{indS}</span>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg border border-blue-300">
                    <span className="text-[10px] font-black text-blue-900 block uppercase">IZIN (I)</span>
                    <span className="text-lg font-black text-blue-950">{indI}</span>
                  </div>
                  <div className="bg-rose-100 p-2 rounded-lg border border-rose-300">
                    <span className="text-[10px] font-black text-rose-900 block uppercase">ALPA (A)</span>
                    <span className="text-lg font-black text-rose-950">{indA}</span>
                  </div>
                  {targetType === 'guru' && (
                    <div className="bg-indigo-100 p-2 rounded-lg border border-indigo-300">
                      <span className="text-[10px] font-black text-indigo-900 block uppercase">TUGAS LUAR (TL)</span>
                      <span className="text-lg font-black text-indigo-950">{indTL}</span>
                    </div>
                  )}
                  <div className="bg-slate-900 text-white p-2 rounded-lg border border-slate-950 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold text-amber-300 block uppercase">% KEHADIRAN</span>
                    <span className="text-lg font-black text-amber-200">{indPct}%</span>
                  </div>
                </div>

                {/* Detailed Log Table */}
                <div className="space-y-2">
                  <span className="font-extrabold text-xs uppercase text-slate-800 block border-b pb-1">
                    CATATAN DAILY LOG HARIAN BULAN {currentMonthOption.label.toUpperCase()}:
                  </span>

                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead className="bg-emerald-900 text-white font-bold text-[10px] uppercase">
                      <tr>
                        <th className="border border-slate-400 p-2 text-center w-12">No</th>
                        <th className="border border-slate-400 p-2">Tanggal</th>
                        <th className="border border-slate-400 p-2 text-center">Hari</th>
                        <th className="border border-slate-400 p-2 text-center">Status Absensi</th>
                        <th className="border border-slate-400 p-2">Jam Masuk / Keterangan Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] divide-y divide-slate-200">
                      {personAttendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-slate-500 font-semibold italic">
                            Belum ada catatan absensi untuk {currentPerson.nama} pada bulan {currentMonthOption.label}.
                          </td>
                        </tr>
                      ) : (
                        [...personAttendanceRecords]
                          .sort((x, y) => x.date.localeCompare(y.date))
                          .map((rec, idx) => {
                            const d = new Date(rec.date);
                            const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                            const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });

                            return (
                              <tr key={rec.id} className="hover:bg-slate-50">
                                <td className="border border-slate-300 p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">{dateStr}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">{dayName}</td>
                                <td className="border border-slate-300 p-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                    rec.status === 'H' ? 'bg-emerald-100 text-emerald-800' :
                                    rec.status === 'S' ? 'bg-amber-100 text-amber-800' :
                                    rec.status === 'I' ? 'bg-blue-100 text-blue-800' :
                                    rec.status === 'A' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {rec.status === 'H' ? 'HADIR (H)' :
                                     rec.status === 'S' ? 'SAKIT (S)' :
                                     rec.status === 'I' ? 'IZIN (I)' :
                                     rec.status === 'A' ? 'ALPA (A)' : 'TUGAS LUAR (TL)'}
                                  </span>
                                </td>
                                <td className="border border-slate-300 p-2 font-medium text-slate-800">
                                  {rec.jamMasuk ? `Masuk: ${rec.jamMasuk} ` : ''}
                                  {rec.keterangan ? `(${rec.keterangan})` : (!rec.jamMasuk ? '-' : '')}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Official Signatures */}
                <div className="pt-8 grid grid-cols-2 text-xs font-semibold">
                  <div>
                    <p>Mengetahui,</p>
                    <p>Wali Kelas / Pengelola</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-950">{waliKelasTeacher ? waliKelasTeacher.nama : schoolInfo.namaGuruKelas}</p>
                    <p className="text-[11px] text-slate-600">NIP. {waliKelasTeacher ? waliKelasTeacher.nip : schoolInfo.nipGuruKelas}</p>
                  </div>

                  <div className="text-right">
                    <p>{schoolInfo.kelurahan || 'Sekolah'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>Kepala Sekolah,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-emerald-950">{schoolInfo.namaKepalaSekolah}</p>
                    <p className="text-[11px] text-slate-600">NIP. {schoolInfo.nipKepalaSekolah}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

