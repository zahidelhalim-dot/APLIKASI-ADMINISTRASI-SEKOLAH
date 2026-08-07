import React, { useState } from 'react';
import { UserAccount, UserRole, ClassCategory } from '../types';
import {
  UserCog,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Users,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  GraduationCap,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface UserManagementViewProps {
  users: UserAccount[];
  userPasswords: { [username: string]: string };
  onAddUser: (newUser: UserAccount, password: string) => void;
  onUpdateUser: (updatedUser: UserAccount, password?: string) => void;
  onDeleteUser: (userId: string) => void;
  classes: ClassCategory[];
  currentUser: UserAccount | null;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  userPasswords,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  classes,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('walikelas');
  const [assignedKelas, setAssignedKelas] = useState('Kelas I');
  const [password, setPassword] = useState('123456');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('walikelas');
    setAssignedKelas(classes.length > 0 ? classes[0].namaKelas : 'Kelas I');
    setPassword('123456');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setAssignedKelas(user.assignedKelas || 'SEMUA');
    setPassword(userPasswords[user.username] || '123456');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !name.trim()) {
      alert('Mohon isi Username dan Nama Lengkap pengguna!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    if (!editingUser) {
      // Check duplicate username
      if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
        alert(`Username "${cleanUsername}" sudah digunakan! Silakan pilih username lain.`);
        return;
      }

      const newUser: UserAccount = {
        id: `U_${Date.now()}`,
        username: cleanUsername,
        name: name.trim(),
        role,
        assignedKelas: role === 'admin' ? 'SEMUA' : assignedKelas,
      };

      onAddUser(newUser, password || '123456');
      showNotif(`Akun pengguna ${newUser.username} berhasil ditambahkan!`);
    } else {
      const updated: UserAccount = {
        ...editingUser,
        username: cleanUsername,
        name: name.trim(),
        role,
        assignedKelas: role === 'admin' ? 'SEMUA' : assignedKelas,
      };

      onUpdateUser(updated, password);
      showNotif(`Akun pengguna ${updated.username} berhasil diperbarui!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif login!');
      return;
    }

    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (user.role === 'admin' && adminCount <= 1) {
      alert('Sistem membutuhkan minimal 1 akun Administrator!');
      return;
    }

    if (confirm(`Yakin ingin menghapus akun pengguna "${user.name}" (${user.username})?`)) {
      onDeleteUser(user.id);
      showNotif(`Akun ${user.username} berhasil dihapus.`);
    }
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const pwd = userPasswords[user.username] || '123456';
    const text = `Akses Login Absensi Sekolah:\nUsername: ${user.username}\nPassword: ${pwd}\nRole: ${user.role.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotif(`Detail login ${user.username} berhasil disalin ke clipboard!`);
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.assignedKelas || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  const totalAdmin = users.filter((u) => u.role === 'admin').length;
  const totalWali = users.filter((u) => u.role === 'walikelas').length;
  const totalGuru = users.filter((u) => u.role === 'guru').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border-2 border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600/30 border-2 border-indigo-400/50 rounded-2xl flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
            <UserCog className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                AKSES OTORITAS SISTEM
              </span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                {users.length} Akun Terdaftar
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
              KELOLA AKUN PENGGUNA & HAK AKSES
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Atur kredensial username, kata sandi, dan pembagian kelas tugas bagi Administrator, Wali Kelas, serta Guru Pengajar.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg border-2 border-amber-300 flex items-center gap-2 cursor-pointer transition-all scale-100 hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          <span>+ TAMBAH AKUN BARU</span>
        </button>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase">Total Pengguna</span>
            <span className="text-2xl font-black text-slate-900">{users.length} <span className="text-xs font-normal text-slate-500">Akun</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-rose-200 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-700 block uppercase">Administrator</span>
            <span className="text-2xl font-black text-rose-950">{totalAdmin} <span className="text-xs font-normal text-slate-500">Kepsek / Admin</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-emerald-200 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 block uppercase">Wali Kelas</span>
            <span className="text-2xl font-black text-emerald-950">{totalWali} <span className="text-xs font-normal text-slate-500">Wali Rombel</span></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-blue-200 flex items-center gap-3.5">
          <div className="w-11 h-11 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-700 block uppercase">Guru Mapel / Pengajar</span>
            <span className="text-2xl font-black text-blue-950">{totalGuru} <span className="text-xs font-normal text-slate-500">Pengajar</span></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, username, atau kelas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1">Filter Role:</span>
          {[
            { key: 'ALL', label: 'Semua Akun' },
            { key: 'admin', label: 'Admin' },
            { key: 'walikelas', label: 'Wali Kelas' },
            { key: 'guru', label: 'Guru Mapel' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                roleFilter === f.key
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User List Table / Cards */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <h2 className="font-extrabold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            DAFTAR AKUN PENGGUNA TERDAFTAR
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Menampilkan {filteredUsers.length} dari {users.length} akun
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black uppercase text-[10.5px]">
                <th className="p-3.5">No</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Nama Lengkap Pengguna</th>
                <th className="p-3.5">Role / Peran</th>
                <th className="p-3.5">Tugas Akses Kelas</th>
                <th className="p-3.5">Kata Sandi</th>
                <th className="p-3.5 text-center">Aksi & Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    Tidak ada akun pengguna yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isCurrent = user.id === currentUser?.id;
                  const pwd = userPasswords[user.username] || '123456';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-amber-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg">
                          {user.username}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              AKUN ANDA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10.5px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            user.role === 'admin'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : user.role === 'walikelas'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {user.role === 'admin' && <Shield className="w-3 h-3 text-rose-700" />}
                          {user.role === 'walikelas' && <GraduationCap className="w-3 h-3 text-emerald-700" />}
                          {user.role === 'guru' && <UserCog className="w-3 h-3 text-blue-700" />}
                          {user.role === 'admin'
                            ? 'Admin / Kepsek'
                            : user.role === 'walikelas'
                            ? 'Wali Kelas'
                            : 'Guru Mapel'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg text-[11px]">
                          {user.assignedKelas || 'SEMUA'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {pwd}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(user)}
                            className={`p-1.5 rounded-lg border font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                              copiedId === user.id
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                            title="Salin Kredensial Login"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg transition-all cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-800" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isCurrent
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300 cursor-pointer'
                            }`}
                            title={isCurrent ? 'Akun aktif tidak dapat dihapus' : 'Hapus Akun'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-500 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b-2 border-indigo-400">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-300" />
                {editingUser ? 'EDIT AKUN PENGGUNA' : 'TAMBAH AKUN PENGGUNA BARU'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-1 uppercase">
                  Username (Untuk Login):
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: walikelas7, gurumatematika"
                  className="w-full p-2.5 border-2 border-slate-300 rounded-xl font-mono font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="text-[10.5px] text-slate-500 block mt-1">
                  Gunakan huruf kecil tanpa spasi. Contoh: walikelas1, gurupai
                </span>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1 uppercase">
                  Nama Lengkap Pengguna & Gelar:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: M. Suriadie, S.Pd (Wali Kelas IV)"
                  className="w-full p-2.5 border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1 uppercase">
                    Role / Hak Akses:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      if (newRole === 'admin') {
                        setAssignedKelas('SEMUA');
                      }
                    }}
                    className="w-full p-2.5 border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="walikelas">Wali Kelas</option>
                    <option value="guru">Guru Mapel / Pengajar</option>
                    <option value="admin">Administrator / Kepala Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1 uppercase">
                    Akses Rombel / Kelas:
                  </label>
                  {role === 'admin' ? (
                    <input
                      type="text"
                      value="SEMUA KELAS"
                      disabled
                      className="w-full p-2.5 border-2 border-slate-200 bg-slate-100 rounded-xl font-bold text-slate-500"
                    />
                  ) : (
                    <select
                      value={assignedKelas}
                      onChange={(e) => setAssignedKelas(e.target.value)}
                      className="w-full p-2.5 border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="SEMUA">SEMUA KELAS</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.namaKelas}>
                          {c.namaKelas}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1 uppercase">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full p-2.5 border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 pr-20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPassword('123456')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-700"
                  >
                    Set 123456
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg border border-indigo-500 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Tambah Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
