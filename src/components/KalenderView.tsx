import React, { useState } from 'react';
import { SchoolInfo, AttendanceRecord } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react';

interface KalenderViewProps {
  schoolInfo: SchoolInfo;
  attendanceRecords: AttendanceRecord[];
}

export const KalenderView: React.FC<KalenderViewProps> = ({ schoolInfo, attendanceRecords }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'JANUARI',
    'FEBRUARI',
    'MARET',
    'APRIL',
    'MEI',
    'JUNI',
    'JULI',
    'AGUSTUS',
    'SEPTEMBER',
    'OKTOBER',
    'NOVEMBER',
    'DESEMBER',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayCells = [];
  // Pad blank cells before first day
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null);
  }
  // Fill month days
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(d);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-yellow-800 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-yellow-300" /> KALENDER AKADEMIK & MAPPING ABSENSI
          </h2>
          <p className="text-xs text-amber-200">
            {schoolInfo.namaSekolah} — Pemantauan Hari Efektif Sekolah & Rekam Kegiatan
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-black/30 p-1.5 rounded-lg border border-yellow-500/30">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-yellow-600/50 rounded transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="font-black text-xs text-yellow-300 uppercase tracking-wider min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-yellow-600/50 rounded transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
        <div className="grid grid-cols-7 text-center font-black text-xs text-slate-700 pb-2 border-b">
          <div className="text-rose-600">MINGGU</div>
          <div>SENIN</div>
          <div>SELASA</div>
          <div>RABU</div>
          <div>KAMIS</div>
          <div>JUMAT</div>
          <div className="text-blue-600">SABTU</div>
        </div>

        <div className="grid grid-cols-7 gap-1 pt-2 font-semibold text-xs">
          {dayCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`blank-${idx}`} className="h-20 bg-slate-50/50 rounded-lg"></div>;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;

            const recordsOnDay = attendanceRecords.filter((r) => r.date === dateStr);
            const isSunday = idx % 7 === 0;
            const isSaturday = idx % 7 === 6;

            const studentCount = recordsOnDay.filter((r) => r.targetType === 'siswa').length;
            const teacherCount = recordsOnDay.filter((r) => r.targetType === 'guru').length;

            return (
              <div
                key={`day-${dayNum}`}
                className={`h-20 p-1.5 border rounded-lg flex flex-col justify-between transition-all hover:border-amber-500 ${
                  isSunday
                    ? 'bg-rose-50/70 border-rose-200 text-rose-700'
                    : isSaturday
                    ? 'bg-blue-50/70 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-black text-sm ${isSunday ? 'text-rose-600' : ''}`}>
                    {dayNum}
                  </span>
                  {recordsOnDay.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </div>

                <div className="space-y-0.5 text-[9px] font-bold">
                  {studentCount > 0 && (
                    <div className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded truncate">
                      Absen Siswa ({studentCount})
                    </div>
                  )}
                  {teacherCount > 0 && (
                    <div className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded truncate">
                      Absen Guru ({teacherCount})
                    </div>
                  )}
                  {recordsOnDay.length === 0 && !isSunday && !isSaturday && (
                    <span className="text-slate-400 font-normal italic">Hari Efektif</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
