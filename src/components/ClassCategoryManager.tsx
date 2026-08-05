import React, { useState } from 'react';
import { ClassCategory, Teacher, Student } from '../types';
import { Layers, UserCheck, Plus, Edit2, Trash2, CheckCircle2, Users, BookOpen, AlertCircle } from 'lucide-react';

interface ClassCategoryManagerProps {
  classes: ClassCategory[];
  teachers: Teacher[];
  students: Student[];
  onAddClass: (newClass: ClassCategory) => void;
  onUpdateClass: (updatedClass: ClassCategory) => void;
  onDeleteClass: (classId: string) => void;
  onSelectClassView?: (className: string) => void;
}

export const ClassCategoryManager: React.FC<ClassCategoryManagerProps> = ({
  classes,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onSelectClassView,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassCategory | null>(null);

  // Form State
  const [namaKelas, setNamaKelas] = useState('');
  const [waliKelasId, setWaliKelasId] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setNamaKelas('');
    setWaliKelasId(teachers[0]?.id || '');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: ClassCategory) => {
    setEditingClass(cls);
    setNamaKelas(cls.namaKelas);
    setWaliKelasId(cls.waliKelasId);
    setKeterangan(cls.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        namaKelas: namaKelas.trim(),
        waliKelasId,
        keterangan: keterangan.trim(),
      });
      setToastMsg('Data Kategori Kelas & Wali Kelas berhasil diperbarui!');
    } else {
      const newCls: ClassCategory = {
        id: `C_${Date.now()}`,
        namaKelas: namaKelas.trim(),
        waliKelasId,
        keterangan: keterangan.trim(),
      };
      onAddClass(newCls);
      setToastMsg('Kategori Kelas baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleQuickWaliChange = (cls: ClassCategory, newWaliId: string) => {
    onUpdateClass({
      ...cls,
      waliKelasId: newWaliId,
    });
    const teacherName = teachers.find((t) => t.id === newWaliId)?.nama || 'Guru';
    setToastMsg(`Wali Kelas ${cls.namaKelas} berhasil diubah ke ${teacherName}!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-300" /> KATEGORISASI KELAS & WALI KELAS
          </h2>
          <p className="text-xs text-emerald-200">
            Pengelolaan Rombongan Belajar (Rombel), Penugasan Guru Wali Kelas, dan Penataan Kelompok Siswa
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas Baru
        </button>
      </div>

      {/* Summary Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border-2 border-emerald-200 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Rombel Kelas</span>
            <span className="text-xl font-black text-emerald-950">{classes.length} Kelas</span>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Wali Kelas Terplot</span>
            <span className="text-xl font-black text-blue-950">
              {classes.filter((c) => c.waliKelasId).length} Guru
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Siswa Terdaftar</span>
            <span className="text-xl font-black text-amber-950">{students.length} Siswa</span>
          </div>
        </div>
      </div>

      {/* Class Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const assignedTeacher = teachers.find((t) => t.id === cls.waliKelasId);
          const studentCount = students.filter(
            (s) => s.kelas.toLowerCase() === cls.namaKelas.toLowerCase()
          ).length;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-all p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              {/* Top Title Bar */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Kategori Kelas
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{cls.namaKelas}</h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleOpenEditModal(cls)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Nama / Keterangan Kelas"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kategori ${cls.namaKelas}?`)) {
                        onDeleteClass(cls.id);
                      }
                    }}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Student Count Badge */}
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex justify-between items-center text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Jumlah Siswa Terdaftar:
                </span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[11px] font-mono font-black">
                  {studentCount} Siswa
                </span>
              </div>

              {/* Wali Kelas Assignment Dropdown */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-900 flex items-center justify-between">
                  <span>WALI KELAS PENANGGUNG JAWAB:</span>
                  {assignedTeacher && (
                    <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-mono">
                      {assignedTeacher.statusPtk}
                    </span>
                  )}
                </label>

                <select
                  value={cls.waliKelasId}
                  onChange={(e) => handleQuickWaliChange(cls, e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded p-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.jabatan})
                    </option>
                  ))}
                </select>

                {assignedTeacher ? (
                  <p className="text-[10px] font-medium text-slate-600 font-mono pt-0.5">
                    NIP: {assignedTeacher.nip}
                  </p>
                ) : (
                  <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3" /> Belum ada Wali Kelas ditunjuk
                  </p>
                )}
              </div>

              {/* Description */}
              {cls.keterangan && (
                <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-1.5">
                  "{cls.keterangan}"
                </p>
              )}

              {/* Action Link to Filter View */}
              {onSelectClassView && (
                <button
                  onClick={() => onSelectClassView(cls.namaKelas)}
                  className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>Buka Absensi {cls.namaKelas}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border-2 border-slate-300 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-2">
              {editingClass ? 'Edit Kategori Kelas' : 'Tambah Kategori Kelas Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Nama Kelas (e.g. Kelas I, Kelas VII A)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas I A"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Pilih Guru Wali Kelas</label>
                <select
                  value={waliKelasId}
                  onChange={(e) => setWaliKelasId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
                >
                  <option value="">-- Tanpa Wali Kelas --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Keterangan / Catatan Kelas (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Ruang Gedung A Lantai 1..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow font-black"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
