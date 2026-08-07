import React from 'react';
import { ViewMode, UserAccount } from '../types';
import { Palette, RotateCcw, Award, User, LogOut, ShieldCheck, UserCheck, Menu } from 'lucide-react';

interface HeaderProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  classicTheme: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  classicTheme,
  onToggleTheme,
  onResetData,
  currentUser,
  onOpenLogin,
  onLogout,
  onToggleSidebar,
}) => {
  return (
    <header className="print:hidden space-y-2">
      {/* Top Banner (3D Bevel Green like Screenshot) */}
      <div
        className={`p-3 rounded-2xl border-4 shadow-xl flex flex-wrap items-center justify-between gap-3 transition-all ${
          classicTheme
            ? 'bg-gradient-to-r from-[#2e7d32] via-[#388e3c] to-[#1b5e20] border-[#81c784] text-white shadow-emerald-950/30'
            : 'bg-slate-900 border-slate-700 text-white shadow-slate-900/20'
        }`}
      >
        {/* Left Tut Wuri Handayani Badge + Sidebar Toggle + Title */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow border border-amber-200 transition-all flex items-center justify-center"
              title="Buka / Tutup Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-slate-950" />
            </button>
          )}

          <div className="w-12 h-12 bg-amber-400 border-2 border-amber-200 rounded-full flex items-center justify-center shadow-md p-1.5 text-amber-950 font-black shrink-0">
            {/* Tut Wuri Handayani Symbol / Emblem */}
            <Award className="w-8 h-8 text-emerald-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-300 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                YAYASAN AL-HUSAINI
              </span>
              {currentUser && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border shadow-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-500 border-rose-300 text-white'
                      : currentUser.role === 'walikelas'
                      ? 'bg-emerald-300 border-emerald-100 text-emerald-950'
                      : 'bg-blue-500 border-blue-300 text-white'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Role: ADMIN' : currentUser.role === 'walikelas' ? `Role: WALI ${currentUser.assignedKelas}` : 'Role: GURU MAPEL'}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-wide uppercase font-sans text-amber-100 drop-shadow-sm">
              APLIKASI ABSENSI KELAS & KEPALA SEKOLAH
            </h1>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User Account Login Status Badge / Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-400/50 p-1.5 rounded-lg text-xs font-bold">
              <div className="flex items-center gap-1.5 px-1">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                )}
                <span className="text-amber-200 font-extrabold max-w-[120px] sm:max-w-[180px] truncate">
                  {currentUser.name}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded transition-all flex items-center gap-1 shadow-xs"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg border border-amber-200 transition-all flex items-center gap-1.5 shadow-md animate-pulse"
            >
              <User className="w-4 h-4 text-slate-950" /> Login (Guru / Wali / Admin)
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center gap-1.5 shadow-sm ${
              classicTheme
                ? 'bg-amber-300 text-amber-950 border-amber-400 hover:bg-amber-400'
                : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
            }`}
            title="Ganti Tema Tampilan (Klasik Excel vs Modern Slate)"
          >
            <Palette className="w-4 h-4 text-emerald-900" />
            <span className="hidden sm:inline">{classicTheme ? 'Klasik' : 'Modern'}</span>
          </button>

          {/* Reset Demo Data Button (Admin Only) */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                if (confirm('Reset ulang data absensi dan profil ke data awal bawaan?')) {
                  onResetData();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-900/80 hover:bg-emerald-950 text-emerald-100 border border-emerald-600 transition-all flex items-center gap-1"
              title="Reset Data Bawaan (Khusus Admin)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

