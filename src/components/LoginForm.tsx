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
    <div className="max-w-2xl mx-auto my-6 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white p-6 text-center relative border-b-4 border-amber-400">
        <div className="inline-flex p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-lg mb-2">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-wider text-amber-300">
          SISTEM LOGIN ABSENSI SEKOLAH
        </h2>
        <p className="text-xs text-blue-200 font-semibold mt-1">
          {schoolName} — Hak Akses Administrator & Guru
        </p>
        <div className="text-[11px] font-extrabold text-amber-300 mt-1.5 inline-block bg-blue-900/60 px-3 py-0.5 rounded-full border border-amber-400/30">
          by Ahmad Zahid, M.Pd
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1">
              Username / Nama Pengguna
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username (contoh: admin / walikelas4)"
                className="w-full pl-9 pr-3 py-2.5 text-xs border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-9 pr-10 py-2.5 text-xs border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-blue-600 focus:ring-0 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <ShieldCheck className="w-5 h-5 text-amber-300" /> MASUK KE SISTEM (LOGIN)
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" /> Akun Demo Siap Pakai (Klik Langsung Login)
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Username & Password Default</span>
          </div>

          <div className="space-y-2">
            {/* Admin Button */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-rose-200 shadow-xs">
              <div>
                <span className="font-bold text-slate-900 block">ADMIN / KEPALA SEKOLAH</span>
                <span className="text-[10px] text-slate-500 font-mono">User: <strong>admin</strong> | Pass: <strong>admin123</strong></span>
              </div>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] rounded-md transition-all flex items-center gap-1"
              >
                Login Admin <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Wali Kelas & Guru Grid */}
            <div className="space-y-1 pt-1">
              <span className="font-extrabold text-[11px] text-slate-700 block uppercase">AKUN WALI KELAS:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INITIAL_USERS.filter((u) => u.role === 'walikelas').map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.username)}
                    className="bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 p-2 rounded-lg text-left transition-all shadow-xs group"
                  >
                    <span className="font-black text-emerald-950 block text-[11px] group-hover:text-emerald-800">
                      {u.assignedKelas}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {u.username} / 123456
                    </span>
                  </button>
                ))}
              </div>

              <span className="font-extrabold text-[11px] text-slate-700 block uppercase pt-2">AKUN GURU MAPEL / PENGAJAR (ABSEN SISWA):</span>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_USERS.filter((u) => u.role === 'guru').map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.username)}
                    className="bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 p-2 rounded-lg text-left transition-all shadow-xs group"
                  >
                    <span className="font-black text-blue-950 block text-[11px] group-hover:text-blue-800">
                      {u.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      User: {u.username} | Pass: 123456
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roles Info Box */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-950 space-y-1">
          <p className="font-bold flex items-center gap-1 text-amber-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Ketentuan Hak Akses Role:
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-[10px] text-slate-700 font-medium">
            <li><strong>Admin / Kepala Sekolah:</strong> Mengelola profil sekolah, master guru, master kelas, dan seluruh kelas siswa.</li>
            <li><strong>Wali Kelas:</strong> Mengabsen siswa kelasnya, mengedit data siswa kelasnya, serta melihat rekap/laporan khusus kelasnya.</li>
            <li><strong>Guru Mapel / Pengajar:</strong> Memiliki akses penuh untuk mengabsen siswa di seluruh kelas (Kelas I s/d VI) serta mencatat jam pelajaran.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
