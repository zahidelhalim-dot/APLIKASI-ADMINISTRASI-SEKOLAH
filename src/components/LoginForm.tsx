import React, { useState } from 'react';
import { UserAccount } from '../types';
import { INITIAL_USERS, DEFAULT_PASSWORDS } from '../data/initialData';
import { ShieldCheck, User, Lock, KeyRound, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, School } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: UserAccount) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  schoolName: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  currentUser,
  onLogout,
  schoolName,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim().toLowerCase();
    const user = INITIAL_USERS.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      setErrorMessage('Username tidak ditemukan! Silakan periksa kembali username Anda.');
      return;
    }

    const correctPassword = DEFAULT_PASSWORDS[user.username] || '123456';
    if (password !== correctPassword) {
      setErrorMessage('Kata sandi (Password) salah! Silakan coba lagi.');
      return;
    }

    // Success
    onLoginSuccess(user);
  };

  const handleQuickLogin = (targetUsername: string) => {
    const user = INITIAL_USERS.find((u) => u.username === targetUsername);
    if (user) {
      setUsername(user.username);
      setPassword(DEFAULT_PASSWORDS[user.username] || '123456');
      onLoginSuccess(user);
    }
  };

  if (currentUser) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-lg border border-blue-700/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 font-black flex items-center justify-center text-lg border-2 border-white shadow">
            {currentUser.role === 'admin' ? 'A' : currentUser.role === 'walikelas' ? 'WK' : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-amber-200">{currentUser.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                currentUser.role === 'admin' ? 'bg-rose-600 text-white' : currentUser.role === 'walikelas' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {currentUser.role === 'admin' ? 'ADMIN / KEPALA SEKOLAH' : currentUser.role === 'walikelas' ? `WALI ${currentUser.assignedKelas}` : 'GURU MAPEL / PENGAJAR'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Login Aktif — Hak Akses: <strong className="text-white">{currentUser.assignedKelas === 'SEMUA' ? 'Semua Kelas & Mengabsen Siswa' : `Fokus Data & Absensi ${currentUser.assignedKelas}`}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 border border-rose-500"
        >
          <Lock className="w-3.5 h-3.5" /> Keluar (Logout)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white p-6 text-center relative border-b-4 border-emerald-400">
        <div className="inline-flex p-3 bg-white text-teal-800 rounded-2xl shadow-lg mb-3 border border-emerald-100">
          <School className="w-8 h-8 text-teal-700" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-wider text-white">
          SISTEM ABSENSI SEKOLAH
        </h2>
        <p className="text-xs text-teal-100 font-medium mt-1">
          {schoolName}
        </p>
        <div className="text-[11px] font-bold text-amber-300 mt-2 inline-block bg-teal-950/60 px-3 py-1 rounded-full border border-amber-400/40 shadow-xs">
          Silakan Login Untuk Mengakses Aplikasi
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
              Username / Nama Pengguna
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda..."
                className="w-full pl-9 pr-3 py-2.5 text-xs border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-teal-600 focus:ring-0 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-9 pr-10 py-2.5 text-xs border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-teal-600 focus:ring-0 transition-all bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" /> MASUK KE SISTEM (LOGIN)
          </button>
        </form>

        {/* Roles Info Box */}
        <div className="bg-teal-50/80 border border-teal-200 p-3.5 rounded-xl text-[11px] text-teal-950 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-teal-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" /> Ketentuan Hak Akses Sistem:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-700 font-medium">
            <li><strong>Admin / Kepala Sekolah:</strong> Mengelola profil sekolah, master guru, master kelas, data siswa, dan rekapitulasi.</li>
            <li><strong>Wali Kelas:</strong> Mengabsen & mengelola siswa kelas yang ditugaskan.</li>
            <li><strong>Guru Mapel / Pengajar:</strong> Akses penuh absensi siswa di semua kelas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
