import React from 'react';
import { SchoolInfo, Student, Teacher, AttendanceRecord, MonthOption } from '../types';

interface PrintableReportViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  selectedMonth: MonthOption | null;
}

export const PrintableReportView: React.FC<PrintableReportViewProps> = ({
  schoolInfo,
  students,
  teachers,
  attendanceRecords,
  selectedMonth,
}) => {
  const monthLabel = selectedMonth ? selectedMonth.label : 'AGUSTUS';
  const monthIdx = selectedMonth ? selectedMonth.monthIndex : 7;

  const filteredRecords = attendanceRecords.filter((r) => {
    if (!r.date) return false;
    const dateObj = new Date(r.date);
    return dateObj.getMonth() === monthIdx;
  });

  const studentRecords = filteredRecords.filter((r) => r.targetType === 'siswa');
  const teacherRecords = filteredRecords.filter((r) => r.targetType === 'guru');

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="hidden print:block font-serif text-black p-8 bg-white max-w-5xl mx-auto space-y-6">
      {/* Kop Surat Header */}
      <div className="text-center border-b-4 border-double border-black pb-3 space-y-0.5">
        <p className="text-xs font-bold uppercase tracking-widest">
          YAYASAN AL-HUSAINI
        </p>
        <h1 className="text-xl font-black uppercase tracking-wider">{schoolInfo.namaSekolah}</h1>
        <p className="text-xs">
          {schoolInfo.alamat}, {schoolInfo.kelurahan}, {schoolInfo.kecamatan},{' '}
          {schoolInfo.kabupatenKota}
        </p>
        <p className="text-[10px] italic">
          NPSN: {schoolInfo.npsn} | Email: info@
          {schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id
        </p>
      </div>

      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold underline uppercase">
          LAPORAN REKAPITULASI ABSENSI RESMI KEPALA SEKOLAH
        </h2>
        <p className="text-xs font-semibold">
          Periode Bulan: {monthLabel} — Tahun Pelajaran {schoolInfo.tahunPelajaran}
        </p>
      </div>

      {/* Meta */}
      <div className="flex justify-between text-xs font-bold border-t border-b border-black py-1.5">
        <div>
          <p>Kelas / Tingkat: {schoolInfo.kelas}</p>
          <p>Semester: {schoolInfo.semester}</p>
        </div>
        <div className="text-right">
          <p>Tanggal Cetak: {todayStr}</p>
          <p>Diterbitkan Oleh: Kepala Sekolah</p>
        </div>
      </div>

      {/* Table 1: Absensi Siswa */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase underline">A. Rekapitulasi Absensi Siswa</h3>
        <table className="w-full text-[10px] text-left border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200 uppercase font-bold text-center">
              <th className="border border-black p-1 w-6">No</th>
              <th className="border border-black p-1 w-16">NIS</th>
              <th className="border border-black p-1">Nama Siswa</th>
              <th className="border border-black p-1 w-8">L/P</th>
              <th className="border border-black p-1 w-10">Hadir</th>
              <th className="border border-black p-1 w-10">Sakit</th>
              <th className="border border-black p-1 w-10">Izin</th>
              <th className="border border-black p-1 w-10">Alpa</th>
              <th className="border border-black p-1 w-12">% Hadir</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => {
              const att = studentRecords.filter((r) => r.targetId === s.id);
              const h = att.filter((r) => r.status === 'H').length;
              const sakit = att.filter((r) => r.status === 'S').length;
              const i = att.filter((r) => r.status === 'I').length;
              const a = att.filter((r) => r.status === 'A').length;
              const total = att.length || 1;
              const pct = Math.round((h / total) * 100);

              return (
                <tr key={s.id}>
                  <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 font-mono">{s.nis}</td>
                  <td className="border border-black p-1 font-bold">{s.nama}</td>
                  <td className="border border-black p-1 text-center">{s.jenisKelamin}</td>
                  <td className="border border-black p-1 text-center">{h}</td>
                  <td className="border border-black p-1 text-center">{sakit}</td>
                  <td className="border border-black p-1 text-center">{i}</td>
                  <td className="border border-black p-1 text-center">{a}</td>
                  <td className="border border-black p-1 text-center font-bold">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table 2: Absensi Guru */}
      <div className="space-y-1 pt-2">
        <h3 className="text-xs font-bold uppercase underline">B. Rekapitulasi Absensi Guru & PTK</h3>
        <table className="w-full text-[10px] text-left border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200 uppercase font-bold text-center">
              <th className="border border-black p-1 w-6">No</th>
              <th className="border border-black p-1 w-28">NIP</th>
              <th className="border border-black p-1">Nama Guru / PTK</th>
              <th className="border border-black p-1 w-24">Jabatan</th>
              <th className="border border-black p-1 w-10">Hadir</th>
              <th className="border border-black p-1 w-10">Sakit</th>
              <th className="border border-black p-1 w-10">Izin</th>
              <th className="border border-black p-1 w-10">Alpa</th>
              <th className="border border-black p-1 w-10">TL</th>
              <th className="border border-black p-1 w-12">% Hadir</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, idx) => {
              const att = teacherRecords.filter((r) => r.targetId === t.id);
              const h = att.filter((r) => r.status === 'H').length;
              const sakit = att.filter((r) => r.status === 'S').length;
              const i = att.filter((r) => r.status === 'I').length;
              const a = att.filter((r) => r.status === 'A').length;
              const tl = att.filter((r) => r.status === 'TL').length;
              const total = att.length || 1;
              const pct = Math.round(((h + tl) / total) * 100);

              return (
                <tr key={t.id}>
                  <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 font-mono">{t.nip}</td>
                  <td className="border border-black p-1 font-bold">{t.nama}</td>
                  <td className="border border-black p-1">{t.jabatan}</td>
                  <td className="border border-black p-1 text-center">{h}</td>
                  <td className="border border-black p-1 text-center">{sakit}</td>
                  <td className="border border-black p-1 text-center">{i}</td>
                  <td className="border border-black p-1 text-center">{a}</td>
                  <td className="border border-black p-1 text-center">{tl}</td>
                  <td className="border border-black p-1 text-center font-bold">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="pt-10 flex justify-between text-xs font-bold">
        <div>
          <p>Mengetahui,</p>
          <p>Guru Kelas / Pengelola</p>
          <div className="h-16"></div>
          <p className="underline">{schoolInfo.namaGuruKelas}</p>
          <p className="text-[10px]">NIP. {schoolInfo.nipGuruKelas}</p>
        </div>

        <div className="text-right">
          <p>
            {schoolInfo.kelurahan || 'Sekolah'}, {todayStr}
          </p>
          <p>Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="underline">{schoolInfo.namaKepalaSekolah}</p>
          <p className="text-[10px]">NIP. {schoolInfo.nipKepalaSekolah}</p>
        </div>
      </div>
    </div>
  );
};
