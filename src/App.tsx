import React, { useState, useEffect } from 'react';
import {
  SchoolInfo,
  Student,
  Teacher,
  AttendanceRecord,
  ViewMode,
  MonthOption,
  ClassCategory,
  UserAccount,
} from './types';
import {
  INITIAL_SCHOOL_INFO,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_USERS,
  MONTH_LIST,
  generateInitialAttendance,
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SchoolInfoCard } from './components/SchoolInfoCard';
import { NavigationGrid } from './components/NavigationGrid';
import { DashboardView } from './components/DashboardView';
import { StudentAttendance } from './components/StudentAttendance';
import { TeacherAttendance } from './components/TeacherAttendance';
import { StudentData } from './components/StudentData';
import { TeacherData } from './components/TeacherData';
import { ClassCategoryManager } from './components/ClassCategoryManager';
import { RekapitulasiView } from './components/RekapitulasiView';
import { GrafikView } from './components/GrafikView';
import { KalenderView } from './components/KalenderView';
import { LaporanView } from './components/LaporanView';
import { StudentCardView } from './components/StudentCardView';
import { PrintableReportView } from './components/PrintableReportView';
import { LoginForm } from './components/LoginForm';
import { ChevronRight, Info, ShieldAlert, X } from 'lucide-react';

export default function App() {
  // Auth state - strictly null when link is opened so user MUST enter username & password first
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // State initialization with localStorage fallback
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('absensi_school_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.namaSekolah === 'SD NEGERI 1 BATU PIRING' || parsed.namaSekolah?.includes('BATU PIRING')) {
          parsed.namaSekolah = 'MADRASAH DINIYAH ALHUSAINI PUNGGUR BESAR';
        }
        return parsed;
      } catch (e) {
        return INITIAL_SCHOOL_INFO;
      }
    }
    return INITIAL_SCHOOL_INFO;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('absensi_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('absensi_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [classes, setClasses] = useState<ClassCategory[]>(() => {
    const saved = localStorage.getItem('absensi_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('absensi_attendance');
    return saved ? JSON.parse(saved) : generateInitialAttendance();
  });

  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<MonthOption | null>(MONTH_LIST[1]); // Default August
  const [selectedKelas, setSelectedKelas] = useState<string>('SEMUA');
  const [classicTheme, setClassicTheme] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Sync auth state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('absensi_user', JSON.stringify(currentUser));
      if (currentUser.role === 'walikelas' && currentUser.assignedKelas) {
        setSelectedKelas(currentUser.assignedKelas);
      }
    } else {
      localStorage.removeItem('absensi_user');
    }
  }, [currentUser]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('absensi_school_info', JSON.stringify(schoolInfo));
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem('absensi_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('absensi_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('absensi_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('absensi_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Login & Logout Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    if ((user.role === 'walikelas' || user.role === 'guru') && user.assignedKelas) {
      if (user.assignedKelas !== 'SEMUA') {
        setSelectedKelas(user.assignedKelas);
      }
      setActiveView('absen_siswa');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  // Handlers for data updates
  const handleUpdateSchoolInfo = (info: SchoolInfo) => {
    setSchoolInfo(info);
  };

  const handleSaveAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      // Filter out existing records matching date & targetType for updated items
      const newMap = new Map(prev.map((item) => [item.id, item]));
      newRecords.forEach((item) => {
        newMap.set(item.id, item);
      });
      return Array.from(newMap.values());
    });
  };

  // Student CRUD
  const handleAddStudent = (s: Student) => setStudents((prev) => [...prev, s]);
  const handleUpdateStudent = (updated: Student) =>
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  const handleDeleteStudent = (id: string) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));
  const handleImportStudents = (newStudents: Student[], replaceExisting?: boolean) => {
    if (replaceExisting) {
      setStudents(newStudents);
    } else {
      setStudents((prev) => [...prev, ...newStudents]);
    }
  };

  // Teacher CRUD
  const handleAddTeacher = (t: Teacher) => setTeachers((prev) => [...prev, t]);
  const handleUpdateTeacher = (updated: Teacher) =>
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const handleDeleteTeacher = (id: string) =>
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  const handleImportTeachers = (newTeachers: Teacher[], replaceExisting?: boolean) => {
    if (replaceExisting) {
      setTeachers(newTeachers);
    } else {
      setTeachers((prev) => [...prev, ...newTeachers]);
    }
  };

  // Class CRUD
  const handleAddClass = (newClass: ClassCategory) =>
    setClasses((prev) => [...prev, newClass]);
  const handleUpdateClass = (updated: ClassCategory) =>
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  const handleDeleteClass = (id: string) =>
    setClasses((prev) => prev.filter((c) => c.id !== id));

  // Reset Data
  const handleResetData = () => {
    localStorage.removeItem('absensi_school_info');
    localStorage.removeItem('absensi_students');
    localStorage.removeItem('absensi_teachers');
    localStorage.removeItem('absensi_classes');
    localStorage.removeItem('absensi_attendance');

    setSchoolInfo(INITIAL_SCHOOL_INFO);
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setAttendanceRecords(generateInitialAttendance());
  };

  // IF NOT LOGGED IN: FORCE FULL SCREEN LOGIN FIRST
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          currentUser={null}
          onLogout={handleLogout}
          schoolName={schoolInfo.namaSekolah}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 flex ${
        classicTheme
          ? 'bg-[#332211] text-amber-950'
          : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Sidebar Navigation Drawer */}
      <div className="print:hidden">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          currentUser={currentUser}
          onLogout={handleLogout}
          schoolName={schoolInfo.namaSekolah}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          classicTheme={classicTheme}
          onToggleTheme={() => setClassicTheme(!classicTheme)}
          onResetData={handleResetData}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-2 sm:p-4 lg:p-6 overflow-x-hidden print:p-0 print:m-0 print:overflow-visible">
        {/* Container Frame */}
        <div
          className={`max-w-7xl mx-auto rounded-2xl p-3 sm:p-5 border-4 shadow-2xl space-y-4 print:p-0 print:m-0 print:border-none print:shadow-none print:bg-transparent print:space-y-0 ${
            classicTheme
              ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 border-amber-800 shadow-amber-950/50'
              : 'bg-white border-slate-300 shadow-slate-200 text-slate-800'
          }`}
        >
          {/* Header Banner */}
          <div className="print:hidden">
            <Header
              activeView={activeView}
              onSelectView={setActiveView}
              classicTheme={classicTheme}
              onToggleTheme={() => setClassicTheme(!classicTheme)}
              onResetData={handleResetData}
              currentUser={currentUser}
              onOpenLogin={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

        {/* User Role Quick Info Banner if Logged In */}
        {currentUser && (
          <div className="print:hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow border border-blue-700/50">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                AKUN TERHUBUNG
              </span>
              <span className="font-bold">
                Selamat Datang, <strong className="text-amber-200">{currentUser.name}</strong>
              </span>
              <span className="text-blue-300 font-semibold hidden sm:inline">
                ({currentUser.role === 'admin' ? 'Akses Penuh Admin / Kepala Sekolah' : currentUser.role === 'walikelas' ? `Wali Kelas khusus ${currentUser.assignedKelas}` : 'Guru Mapel / Pengajar — Akses Mengabsen Siswa'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-amber-300 hover:text-amber-100 underline text-[11px] font-bold"
              >
                [ Ganti Akun Login ]
              </button>
            </div>
          </div>
        )}

        {/* View Navigation Breadcrumb Bar */}
        {activeView !== 'dashboard' && (
          <div className="print:hidden flex items-center justify-between bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-950">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveView('dashboard')}
                className="hover:underline text-emerald-900 font-extrabold"
              >
                BERANDA UTAMA
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
              <span className="uppercase text-amber-900 font-black">
                {activeView.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="px-2.5 py-0.5 bg-amber-300 hover:bg-amber-400 border border-amber-500 rounded text-[11px] font-bold"
            >
              ← Kembali ke Menu Utama
            </button>
          </div>
        )}

        {/* Login Modal Overlay */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl my-auto">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-800 text-white hover:bg-rose-600 rounded-full flex items-center justify-center font-bold shadow-lg border border-white/20 transition-all"
                title="Tutup Modal Login"
              >
                <X className="w-5 h-5" />
              </button>
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                currentUser={currentUser}
                onLogout={handleLogout}
                schoolName={schoolInfo.namaSekolah}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main id="main-content" className={activeView === 'laporan' ? 'print:hidden' : ''}>
          {activeView === 'dashboard' && (
            <DashboardView
              schoolInfo={schoolInfo}
              onUpdateSchoolInfo={handleUpdateSchoolInfo}
              classicTheme={classicTheme}
              currentUser={currentUser}
              onOpenLogin={() => setShowLoginModal(true)}
              classes={classes}
              students={students}
              teachers={teachers}
              activeView={activeView}
              onSelectView={setActiveView}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}

          {activeView === 'kategori_kelas' && (
            <ClassCategoryManager
              classes={classes}
              teachers={teachers}
              students={students}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeView === 'absen_siswa' && (
            <StudentAttendance
              students={students}
              teachers={teachers}
              classes={classes}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
              schoolInfo={schoolInfo}
              selectedKelas={selectedKelas}
              onSelectKelas={setSelectedKelas}
              currentUser={currentUser}
            />
          )}

          {activeView === 'absen_guru' && (
            <TeacherAttendance
              teachers={teachers}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
              schoolInfo={schoolInfo}
            />
          )}

          {activeView === 'kartu_siswa' && (
            <StudentCardView
              students={students}
              teachers={teachers}
              classes={classes}
              schoolInfo={schoolInfo}
              selectedKelas={selectedKelas}
              onSelectKelas={setSelectedKelas}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
              onUpdateStudent={handleUpdateStudent}
              onUpdateTeacher={handleUpdateTeacher}
              onUpdateSchoolInfo={handleUpdateSchoolInfo}
              currentUser={currentUser}
            />
          )}

          {activeView === 'data_siswa' && (
            <StudentData
              students={students}
              teachers={teachers}
              classes={classes}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportStudents={handleImportStudents}
              schoolInfo={schoolInfo}
              selectedKelas={selectedKelas}
              onSelectKelas={setSelectedKelas}
            />
          )}

          {activeView === 'data_guru' && (
            <TeacherData
              teachers={teachers}
              classes={classes}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onImportTeachers={handleImportTeachers}
              schoolInfo={schoolInfo}
            />
          )}

          {activeView === 'rekap' && (
            <RekapitulasiView
              schoolInfo={schoolInfo}
              students={students}
              teachers={teachers}
              attendanceRecords={attendanceRecords}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}

          {activeView === 'grafik' && (
            <GrafikView
              schoolInfo={schoolInfo}
              students={students}
              teachers={teachers}
              attendanceRecords={attendanceRecords}
            />
          )}

          {activeView === 'kalender' && (
            <KalenderView schoolInfo={schoolInfo} attendanceRecords={attendanceRecords} />
          )}

          {activeView === 'laporan' && (
            <LaporanView
              schoolInfo={schoolInfo}
              students={students}
              teachers={teachers}
              classes={classes}
              attendanceRecords={attendanceRecords}
              selectedKelas={selectedKelas}
              onSelectKelas={setSelectedKelas}
            />
          )}
        </main>

        {/* Printable View (Visible only during browser print on Laporan/Rekap views) */}
        {(activeView === 'laporan' || activeView === 'rekap') && (
          <PrintableReportView
            schoolInfo={schoolInfo}
            students={students}
            teachers={teachers}
            attendanceRecords={attendanceRecords}
            selectedMonth={selectedMonth}
          />
        )}

        {/* Footer info matching screenshot designer tag */}
        <footer className="print:hidden pt-2 border-t border-amber-700/50 flex flex-wrap items-center justify-between text-[11px] font-bold text-amber-950 px-1">
          <div className="bg-emerald-800 text-white px-3 py-1 rounded-lg border border-emerald-600 shadow-sm flex items-center gap-2">
            <span>Designer / Pengembang: Ahmad Zahid, M.Pd</span>
            <span>•</span>
            <span>Versi 02 (Rilis 2026)</span>
          </div>

          <div className="text-amber-100 font-semibold flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Sistem Absensi Guru & Siswa untuk Kepala Sekolah (YAYASAN AL-HUSAINI)
          </div>
        </footer>
      </div>
    </div>
  </div>
  );
}


