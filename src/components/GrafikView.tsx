import React, { useState } from 'react';
import { SchoolInfo, Student, Teacher, AttendanceRecord } from '../types';
import { MONTH_LIST } from '../data/initialData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart, TrendingUp, Users, UserCheck } from 'lucide-react';

interface GrafikViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
}

export const GrafikView: React.FC<GrafikViewProps> = ({
  schoolInfo,
  students,
  teachers,
  attendanceRecords,
}) => {
  const [targetType, setTargetType] = useState<'siswa' | 'guru'>('siswa');

  // Build Monthly Aggregated Chart Data
  const monthlyData = MONTH_LIST.map((mOpt) => {
    const monthRecords = attendanceRecords.filter((r) => {
      if (r.targetType !== targetType) return false;
      if (!r.date) return false;
      const dateObj = new Date(r.date);
      return dateObj.getMonth() === mOpt.monthIndex;
    });

    const hadir = monthRecords.filter((r) => r.status === 'H').length;
    const sakit = monthRecords.filter((r) => r.status === 'S').length;
    const izin = monthRecords.filter((r) => r.status === 'I').length;
    const alpa = monthRecords.filter((r) => r.status === 'A').length;
    const tugasLuar = monthRecords.filter((r) => r.status === 'TL').length;

    return {
      month: mOpt.label,
      Hadir: hadir,
      Sakit: sakit,
      Izin: izin,
      Alpa: alpa,
      'Tugas Luar': tugasLuar,
    };
  });

  // Total Cumulative Pie Data
  const totalTargetRecords = attendanceRecords.filter((r) => r.targetType === targetType);
  const totalHadir = totalTargetRecords.filter((r) => r.status === 'H').length;
  const totalSakit = totalTargetRecords.filter((r) => r.status === 'S').length;
  const totalIzin = totalTargetRecords.filter((r) => r.status === 'I').length;
  const totalAlpa = totalTargetRecords.filter((r) => r.status === 'A').length;
  const totalTL = totalTargetRecords.filter((r) => r.status === 'TL').length;

  const pieData = [
    { name: 'Hadir (H)', value: totalHadir, color: '#16a34a' },
    { name: 'Sakit (S)', value: totalSakit, color: '#f59e0b' },
    { name: 'Izin (I)', value: totalIzin, color: '#2563eb' },
    { name: 'Alpa (A)', value: totalAlpa, color: '#dc2626' },
  ];

  if (targetType === 'guru') {
    pieData.push({ name: 'Tugas Luar (TL)', value: totalTL, color: '#0d9488' });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 to-amber-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-300" /> GRAFIK & DIAGRAM ABSENSI
          </h2>
          <p className="text-xs text-amber-200">
            Visualisasi Data Kehadiran — {schoolInfo.namaSekolah}
          </p>
        </div>

        {/* Toggle Target */}
        <div className="bg-black/30 p-1 rounded-lg flex gap-1 border border-amber-500/30">
          <button
            onClick={() => setTargetType('siswa')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
              targetType === 'siswa' ? 'bg-amber-400 text-amber-950 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Grafik Siswa
          </button>
          <button
            onClick={() => setTargetType('guru')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
              targetType === 'guru' ? 'bg-amber-400 text-amber-950 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Grafik Guru
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Tren Absensi Bulanan ({targetType === 'siswa' ? 'Siswa' : 'Guru / PTK'})
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Tahun Pelajaran {schoolInfo.tahunPelajaran}</span>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Hadir" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sakit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Izin" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Alpa" fill="#dc2626" radius={[4, 4, 0, 0]} />
                {targetType === 'guru' && <Bar dataKey="Tugas Luar" fill="#0d9488" radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (1 col) */}
        <div className="bg-white p-4 rounded-xl shadow border border-slate-200 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 border-b pb-2">
              Persentase Distribusi Total
            </h3>

            <div className="h-[220px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 border-t text-xs font-semibold">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Record</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
