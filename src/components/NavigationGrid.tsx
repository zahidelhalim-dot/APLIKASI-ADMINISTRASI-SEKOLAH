import React from 'react';
import { ViewMode, MonthOption, UserAccount } from '../types';
import { MONTH_LIST } from '../data/initialData';
import {
  Users,
  UserCheck,
  FileSpreadsheet,
  PieChart,
  Calendar as CalendarIcon,
  Printer,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';

interface NavigationGridProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  selectedMonth: MonthOption | null;
  onSelectMonth: (month: MonthOption) => void;
  classicTheme: boolean;
  currentUser: UserAccount | null;
}

export const NavigationGrid: React.FC<NavigationGridProps> = ({
  activeView,
  onSelectView,
  selectedMonth,
  onSelectMonth,
  classicTheme,
  currentUser,
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';

  return (
    <div className="flex flex-col gap-3">
      {/* Top Main Action Buttons (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={() => onSelectView('absen_siswa')}
          className={`group relative py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all duration-150 active:scale-98 border-b-4 flex items-center justify-center gap-2 ${
            activeView === 'absen_siswa'
              ? 'bg-blue-700 border-blue-900 ring-4 ring-blue-300'
              : classicTheme
              ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-950 hover:from-blue-500 hover:to-blue-700 shadow-blue-900/40'
              : 'bg-blue-600 border-blue-800 hover:bg-blue-700'
          }`}
        >
          <GraduationCap className="w-5 h-5 text-blue-200" />
          <span>ABSEN SISWA</span>
        </button>

        <button
          onClick={() => onSelectView('absen_guru')}
          className={`group relative py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all duration-150 active:scale-98 border-b-4 flex items-center justify-center gap-2 ${
            activeView === 'absen_guru'
              ? 'bg-indigo-700 border-indigo-900 ring-4 ring-indigo-300'
              : classicTheme
              ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 border-indigo-950 hover:from-indigo-500 hover:to-indigo-700 shadow-indigo-900/40'
              : 'bg-indigo-600 border-indigo-800 hover:bg-indigo-700'
          }`}
        >
          <Briefcase className="w-5 h-5 text-indigo-200" />
          <span>ABSEN GURU {isAdmin ? '' : '(ADMIN)'}</span>
        </button>
      </div>

      {/* Sub Action Buttons (Data Siswa/Guru & Rekap & Kategori Kelas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onSelectView('kategori_kelas')}
          className={`py-2 px-2 rounded-lg font-extrabold text-xs tracking-tight shadow border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeView === 'kategori_kelas'
              ? 'bg-slate-800 text-white border-black'
              : classicTheme
              ? 'bg-gradient-to-b from-amber-200 to-amber-300 text-amber-950 border-amber-500 hover:bg-amber-400'
              : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-800" />
          <span>Kategori Kelas</span>
        </button>

        <button
          onClick={() => onSelectView('data_siswa')}
          className={`py-2 px-2 rounded-lg font-extrabold text-xs tracking-tight shadow border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeView === 'data_siswa'
              ? 'bg-slate-800 text-white border-black'
              : classicTheme
              ? 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950 border-amber-400 hover:bg-amber-300'
              : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-700" />
          <span>Data Siswa</span>
        </button>

        <button
          onClick={() => onSelectView('data_guru')}
          className={`py-2 px-2 rounded-lg font-extrabold text-xs tracking-tight shadow border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeView === 'data_guru'
              ? 'bg-slate-800 text-white border-black'
              : classicTheme
              ? 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950 border-amber-400 hover:bg-amber-300'
              : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Data Guru</span>
        </button>

        <button
          onClick={() => onSelectView('rekap')}
          className={`py-2 px-2 rounded-lg font-black text-xs uppercase tracking-wider text-white shadow border-b-2 transition-all flex items-center justify-center gap-1 ${
            activeView === 'rekap'
              ? 'bg-rose-800 border-rose-950 ring-2 ring-rose-300'
              : classicTheme
              ? 'bg-gradient-to-b from-rose-600 to-rose-800 border-rose-950 hover:from-rose-500 hover:to-rose-700'
              : 'bg-rose-600 border-rose-800 hover:bg-rose-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>REKAP</span>
        </button>
      </div>

      {/* Monthly Buttons Grid (Yellow bevel buttons like image) */}
      <div className="bg-emerald-800/20 p-2.5 rounded-xl border-2 border-emerald-700/40">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1.5 flex justify-between items-center px-1">
          <span>PILIH BULAN ABSENSI (JULI - JUNI)</span>
          {selectedMonth && (
            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[9px] font-black">
              Aktif: {selectedMonth.label}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-1.5">
          {MONTH_LIST.map((m) => {
            const isMonthActive = activeView === 'rekap' && selectedMonth?.key === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  onSelectMonth(m);
                  onSelectView('rekap');
                }}
                className={`py-2 px-3 rounded-lg font-black text-xs tracking-wider transition-all border-b-2 text-center uppercase shadow-sm ${
                  isMonthActive
                    ? 'bg-amber-400 text-amber-950 border-amber-600 ring-2 ring-amber-500 shadow-md scale-[1.02]'
                    : classicTheme
                    ? 'bg-gradient-to-b from-yellow-200 via-amber-200 to-yellow-300 text-slate-900 border-yellow-500 hover:from-yellow-300 hover:to-yellow-400'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Main Buttons (Grafik & Kalender) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => onSelectView('grafik')}
          className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all border-b-4 flex items-center justify-center gap-1.5 ${
            activeView === 'grafik'
              ? 'bg-orange-700 text-white border-orange-900 ring-2 ring-orange-300'
              : classicTheme
              ? 'bg-gradient-to-b from-orange-200 via-amber-200 to-amber-300 text-amber-950 border-amber-500 hover:bg-amber-300'
              : 'bg-orange-600 text-white border-orange-800 hover:bg-orange-700'
          }`}
        >
          <PieChart className="w-4 h-4 text-orange-900" />
          <span>GRAFIK ABSENSI</span>
        </button>

        <button
          onClick={() => onSelectView('kalender')}
          className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all border-b-4 flex items-center justify-center gap-1.5 ${
            activeView === 'kalender'
              ? 'bg-amber-500 text-amber-950 border-amber-700 ring-2 ring-amber-300'
              : classicTheme
              ? 'bg-gradient-to-b from-yellow-300 to-amber-400 text-amber-950 border-amber-600 hover:bg-yellow-400'
              : 'bg-amber-400 text-amber-950 border-amber-600 hover:bg-amber-500'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-amber-950" />
          <span>KALENDER</span>
        </button>
      </div>

      {/* Direct Laporan & Cetak PDF / Word button */}
      <button
        onClick={() => onSelectView('laporan')}
        className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg transition-all duration-150 border-b-4 flex items-center justify-center gap-2 ${
          activeView === 'laporan'
            ? 'bg-emerald-800 border-emerald-950 ring-4 ring-emerald-300'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-900 hover:from-emerald-500 hover:to-emerald-600'
        }`}
      >
        <Printer className="w-4 h-4" />
        <span>LAPORAN & CETAK (PDF / WORD)</span>
      </button>
    </div>
  );
};
