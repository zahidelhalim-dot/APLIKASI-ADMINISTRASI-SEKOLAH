import React, { useState, useEffect } from 'react';
import { ViewMode, MonthOption, UserAccount } from '../types';
import { MONTH_LIST } from '../data/initialData';
import {
  Home,
  GraduationCap,
  Briefcase,
  Users,
  UserCheck,
  Layers,
  FileSpreadsheet,
  PieChart,
  Calendar as CalendarIcon,
  Printer,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  ShieldCheck,
  School,
  Award,
  Sparkles,
  Palette,
  RotateCcw,
  CheckCircle2,
  FolderOpen,
  ClipboardList,
  BarChart3,
  BookOpen,
  CreditCard,
  QrCode,
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  selectedMonth: MonthOption | null;
  onSelectMonth: (month: MonthOption) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  schoolName: string;
  isOpen: boolean;
  onCloseMobile: () => void;
  classicTheme: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  selectedMonth,
  onSelectMonth,
  currentUser,
  onLogout,
  schoolName,
  isOpen,
  onCloseMobile,
  classicTheme,
  onToggleTheme,
  onResetData,
}) => {
  // Accordion Group Expanded States
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    absensi: true,
    datamaster: true,
    laporan: true,
  });

  // Month sub-menu expanded state
  const [isMonthSubOpen, setIsMonthSubOpen] = useState<boolean>(true);

  // Auto expand group if activeView changes
  useEffect(() => {
    if (activeView === 'absen_siswa' || activeView === 'absen_guru' || activeView === 'kartu_siswa') {
      setOpenGroups((prev) => ({ ...prev, absensi: true }));
    } else if (
      activeView === 'data_siswa' ||
      activeView === 'data_guru' ||
      activeView === 'kategori_kelas'
    ) {
      setOpenGroups((prev) => ({ ...prev, datamaster: true }));
    } else if (
      activeView === 'rekap' ||
      activeView === 'grafik' ||
      activeView === 'kalender' ||
      activeView === 'laporan'
    ) {
      setOpenGroups((prev) => ({ ...prev, laporan: true }));
    }
  }, [activeView]);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleNavClick = (view: ViewMode) => {
    onSelectView(view);
    onCloseMobile();
  };

  const handleMonthClick = (month: MonthOption) => {
    onSelectMonth(month);
    onSelectView('rekap');
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Navigation Drawer / Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static lg:z-auto'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-slate-950 border-b border-amber-500/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center font-black shadow-lg border border-amber-400/40 shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider block truncate">
                COMMAND CENTER
              </span>
              <h2 className="font-extrabold text-xs text-slate-950 uppercase tracking-wide truncate">
                ABSENSI DIGITAL
              </h2>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-900/80 hover:text-slate-950 hover:bg-amber-500/50 rounded-lg transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Badge */}
        {currentUser && (
          <div className="px-3.5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-100 block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold block truncate">
                  {currentUser.role === 'admin'
                    ? 'Administrator / Kepsek'
                    : currentUser.role === 'walikelas'
                    ? `Wali Kelas ${currentUser.assignedKelas}`
                    : 'Guru Mapel'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 bg-rose-950/80 hover:bg-rose-700 text-rose-300 hover:text-white rounded-lg transition-colors border border-rose-800/60"
              title="Logout / Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Sub-Menu Accordion Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Main Menu Item: Dashboard */}
          <div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeView === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 shadow-lg font-black scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home
                  className={`w-4 h-4 shrink-0 ${
                    activeView === 'dashboard' ? 'text-slate-950' : 'text-amber-400'
                  }`}
                />
                <span>Dashboard Panel</span>
              </div>
              {activeView === 'dashboard' && (
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
              )}
            </button>
          </div>

          {/* SECTION 1: INPUT ABSENSI HARIAN (Sub-Menu Category) */}
          <div className="space-y-1 bg-slate-950/40 rounded-2xl p-2 border border-slate-800/80">
            <button
              onClick={() => toggleGroup('absensi')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                Input Absensi Harian
              </span>
              {openGroups.absensi ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {openGroups.absensi && (
              <div className="space-y-1 pt-1 pl-1">
                {/* Sub Menu: Absen Siswa */}
                <button
                  onClick={() => handleNavClick('absen_siswa')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'absen_siswa'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'absen_siswa' ? 'text-slate-950' : 'text-blue-400'
                      }`}
                    />
                    <span>Absensi Siswa</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                      activeView === 'absen_siswa'
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    Harian
                  </span>
                </button>

                {/* Sub Menu: Kartu Siswa & QR Code */}
                <button
                  onClick={() => handleNavClick('kartu_siswa')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'kartu_siswa'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'kartu_siswa' ? 'text-slate-950' : 'text-amber-400'
                      }`}
                    />
                    <span>Kartu Siswa & QR Scan</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                      activeView === 'kartu_siswa'
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    Cetak/QR
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: DATA MASTER SEKOLAH (Sub-Menu Category) */}
          <div className="space-y-1 bg-slate-950/40 rounded-2xl p-2 border border-slate-800/80">
            <button
              onClick={() => toggleGroup('datamaster')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                Data Master Sekolah
              </span>
              {openGroups.datamaster ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {openGroups.datamaster && (
              <div className="space-y-1 pt-1 pl-1">
                {/* Sub Menu: Data Siswa */}
                <button
                  onClick={() => handleNavClick('data_siswa')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'data_siswa'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'data_siswa' ? 'text-slate-950' : 'text-teal-400'
                      }`}
                    />
                    <span>Data Master Siswa</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'data_siswa' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>

                {/* Sub Menu: Data Guru */}
                <button
                  onClick={() => handleNavClick('data_guru')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'data_guru'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'data_guru' ? 'text-slate-950' : 'text-emerald-400'
                      }`}
                    />
                    <span>Data Master Guru</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'data_guru' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>

                {/* Sub Menu: Kategori Kelas */}
                <button
                  onClick={() => handleNavClick('kategori_kelas')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'kategori_kelas'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'kategori_kelas' ? 'text-slate-950' : 'text-amber-400'
                      }`}
                    />
                    <span>Kategori Rombel/Kelas</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'kategori_kelas' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: LAPORAN, REKAP & GRAFIK (Sub-Menu Category) */}
          <div className="space-y-1 bg-slate-950/40 rounded-2xl p-2 border border-slate-800/80">
            <button
              onClick={() => toggleGroup('laporan')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                Laporan & Rekapitulasi
              </span>
              {openGroups.laporan ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {openGroups.laporan && (
              <div className="space-y-1 pt-1 pl-1">
                {/* Sub Menu: Rekapitulasi Bulanan */}
                <div>
                  <button
                    onClick={() => {
                      handleNavClick('rekap');
                      setIsMonthSubOpen(!isMonthSubOpen);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      activeView === 'rekap'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet
                        className={`w-4 h-4 shrink-0 ${
                          activeView === 'rekap' ? 'text-slate-950' : 'text-rose-400'
                        }`}
                      />
                      <span>Rekapitulasi Bulanan</span>
                    </div>
                    {isMonthSubOpen ? (
                      <ChevronDown
                        className={`w-3.5 h-3.5 ${
                          activeView === 'rekap' ? 'text-slate-950' : 'text-slate-400'
                        }`}
                      />
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          activeView === 'rekap' ? 'text-slate-950' : 'text-slate-500'
                        }`}
                      />
                    )}
                  </button>

                  {/* Nested Month Selector Sub-Items */}
                  {isMonthSubOpen && (
                    <div className="ml-4 pl-2.5 border-l-2 border-amber-500/50 my-1 space-y-1 py-1 max-h-48 overflow-y-auto scrollbar-thin">
                      {MONTH_LIST.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => handleMonthClick(m)}
                          className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between ${
                            selectedMonth?.key === m.key && activeView === 'rekap'
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                          }`}
                        >
                          <span>Bulan {m.label}</span>
                          {selectedMonth?.key === m.key && activeView === 'rekap' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub Menu: Grafik Absensi */}
                <button
                  onClick={() => handleNavClick('grafik')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'grafik'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PieChart
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'grafik' ? 'text-slate-950' : 'text-orange-400'
                      }`}
                    />
                    <span>Grafik & Analisis</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'grafik' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>

                {/* Sub Menu: Kalender Akademik */}
                <button
                  onClick={() => handleNavClick('kalender')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'kalender'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'kalender' ? 'text-slate-950' : 'text-amber-400'
                      }`}
                    />
                    <span>Kalender Akademik</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'kalender' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>

                {/* Sub Menu: Cetak Laporan */}
                <button
                  onClick={() => handleNavClick('laporan')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    activeView === 'laporan'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Printer
                      className={`w-4 h-4 shrink-0 ${
                        activeView === 'laporan' ? 'text-slate-950' : 'text-emerald-400'
                      }`}
                    />
                    <span>Cetak Laporan (PDF)</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeView === 'laporan' ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onToggleTheme}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              title="Ganti Tema Warna (Klasik vs Modern)"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>{classicTheme ? 'Tema Klasik' : 'Tema Modern'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset ulang data absensi dan profil ke awal?')) {
                  onResetData();
                }
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] border border-slate-700 transition-colors"
              title="Reset Data Ke Bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Command Center • v02 • Ahmad Zahid, M.Pd
          </div>
        </div>
      </aside>
    </>
  );
};
