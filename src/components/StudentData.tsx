import React, { useState } from 'react';
import { Student, SchoolInfo, ClassCategory, Teacher } from '../types';
import { ClassFilterBar } from './ClassFilterBar';
import { Plus, Edit2, Trash2, Search, Users, Check, X } from 'lucide-react';

interface StudentDataProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassCategory[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  schoolInfo: SchoolInfo;
  selectedKelas: string;
  onSelectKelas: (kelas: string) => void;
}

export const StudentData: React.FC<StudentDataProps> = ({
  students,
  teachers,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  schoolInfo,
  selectedKelas,
  onSelectKelas,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nis: '',
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    kelas: selectedKelas !== 'SEMUA' ? selectedKelas : classes[0]?.namaKelas || 'Kelas I',
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: String(1000 + students.length + 1),
      nisn: `01234567${String(students.length + 1).padStart(2, '0')}`,
      nama: '',
      jenisKelamin: 'L',
      kelas: selectedKelas !== 'SEMUA' ? selectedKelas : classes[0]?.namaKelas || 'Kelas I',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      nama: student.nama,
      jenisKelamin: student.jenisKelamin,
      kelas: student.kelas,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      onAddStudent({
        id: `S_${Date.now()}`,
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesKelas =
      selectedKelas === 'SEMUA' || s.kelas.toLowerCase() === selectedKelas.toLowerCase();
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    return matchesKelas && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-300" /> DATA MASTER SISWA PER KELAS
          </h2>
          <p className="text-xs text-blue-200">
            {schoolInfo.namaSekolah} — Filter Aktif: {selectedKelas === 'SEMUA' ? 'Semua Kelas' : selectedKelas}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa Baru
        </button>
      </div>

      {/* Class Categorization Bar */}
      <ClassFilterBar
        classes={classes}
        teachers={teachers}
        selectedKelas={selectedKelas}
        onSelectKelas={onSelectKelas}
        title="KATEGORI KELAS SISWA:"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama / NIS / NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 border-slate-300"
          />
        </div>

        <div className="text-xs font-bold text-slate-600">
          Terfilter: <span className="text-blue-800 font-extrabold">{filteredStudents.length} Siswa</span> (
          L: {filteredStudents.filter((s) => s.jenisKelamin === 'L').length} | P:{' '}
          {filteredStudents.filter((s) => s.jenisKelamin === 'P').length} )
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-24">NIS</th>
                <th className="py-3 px-3 w-32">NISN</th>
                <th className="py-3 px-3">Nama Lengkap</th>
                <th className="py-3 px-3 text-center w-20">L/P</th>
                <th className="py-3 px-3 text-center w-32">Kategori Kelas</th>
                <th className="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    Belum ada data siswa untuk kelas ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{s.nis}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{s.nisn}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.nama}</td>
                    <td className="py-2.5 px-3 text-center font-semibold">{s.jenisKelamin}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-950 font-black px-2.5 py-1 rounded border border-emerald-300 text-[11px]">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${s.nama}?`)) {
                              onDeleteStudent(s.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />{' '}
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: AHMAD FADILLAH"
                  className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) =>
                      setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 font-bold text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.namaKelas}>
                        {c.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold flex items-center gap-1 shadow"
                >
                  <Check className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

