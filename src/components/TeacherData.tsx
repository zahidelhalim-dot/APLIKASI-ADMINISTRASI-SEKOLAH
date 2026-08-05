import React, { useState } from 'react';
import { Teacher, SchoolInfo, ClassCategory } from '../types';
import { Plus, Edit2, Trash2, Search, UserCheck, Check, X, Award, Clock, CalendarDays, CheckSquare } from 'lucide-react';

interface TeacherDataProps {
  teachers: Teacher[];
  classes?: ClassCategory[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  schoolInfo: SchoolInfo;
}

const ALL_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];

export const TeacherData: React.FC<TeacherDataProps> = ({
  teachers,
  classes = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  schoolInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    nip: '',
    nama: '',
    jenisKelamin: 'L',
    jabatan: 'Guru Kelas',
    statusPtk: 'PNS',
    hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'],
    jamWajibMasuk: '07:15',
    keteranganJadwal: 'Wajib 6 Hari',
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nip: '19880101 201501 1 001',
      nama: '',
      jenisKelamin: 'L',
      jabatan: 'Guru Kelas',
      statusPtk: 'PNS',
      hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      jamWajibMasuk: '07:15',
      keteranganJadwal: 'Wajib 6 Hari',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      nama: teacher.nama,
      jenisKelamin: teacher.jenisKelamin,
      jabatan: teacher.jabatan,
      statusPtk: teacher.statusPtk,
      hariWajib: teacher.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      jamWajibMasuk: teacher.jamWajibMasuk || '07:15',
      keteranganJadwal: teacher.keteranganJadwal || `${teacher.hariWajib?.length || 6} Hari / Minggu`,
    });
    setIsModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    const current = formData.hariWajib || [];
    let updated: string[];
    if (current.includes(day)) {
      updated = current.filter((d) => d !== day);
    } else {
      updated = [...current, day];
    }
    setFormData({
      ...formData,
      hariWajib: updated,
      keteranganJadwal: `${updated.length} Hari (${updated.join(', ')})`,
    });
  };

  const handleSetPreset = (days: string[], label: string) => {
    setFormData({
      ...formData,
      hariWajib: days,
      keteranganJadwal: label,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        ...formData,
      });
    } else {
      onAddTeacher({
        id: `T_${Date.now()}`,
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-300" /> DATA MASTER GURU & WALI KELAS
          </h2>
          <p className="text-xs text-emerald-200">
            Daftar Tenaga Pendidik, Pengaturan Hari Wajib Masuk, & Penugasan Wali Kelas — {schoolInfo.namaSekolah}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Guru Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama / NIP / jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500 border-slate-300"
          />
        </div>

        <div className="text-xs font-bold text-slate-600">
          Total: <span className="text-emerald-800 font-extrabold">{teachers.length} PTK</span> (
          PNS: {teachers.filter((t) => t.statusPtk === 'PNS').length} | PPPK:{' '}
          {teachers.filter((t) => t.statusPtk === 'PPPK').length} | Honorer:{' '}
          {teachers.filter((t) => t.statusPtk === 'GTT' || t.statusPtk === 'Honor').length} )
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-36">NIP</th>
                <th className="py-3 px-3">Nama Lengkap & Gelar</th>
                <th className="py-3 px-3 text-center w-12">L/P</th>
                <th className="py-3 px-3 w-36">Jabatan</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-3 w-52 bg-emerald-950/80 text-amber-300">Hari & Jam Wajib Masuk</th>
                <th className="py-3 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500">
                    Belum ada data guru.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, index) => {
                  const assignedClass = classes.find((c) => c.waliKelasId === t.id);
                  const hariWajibList = t.hariWajib || ALL_DAYS;
                  const isFullTime = hariWajibList.length >= 6;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{t.nip}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {t.nama}
                        {assignedClass && (
                          <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-300">
                            <Award className="w-3 h-3 text-amber-700" /> Wali {assignedClass.namaKelas}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{t.jenisKelamin}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">{t.jabatan}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          {t.statusPtk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 bg-emerald-50/40 border-l border-emerald-100">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-black text-[11px] inline-flex items-center gap-1 ${
                            isFullTime ? 'text-emerald-900' : 'text-blue-900'
                          }`}>
                            <CalendarDays className="w-3 h-3 text-emerald-700" />
                            {hariWajibList.length} Hari/Mgg ({hariWajibList.join(', ')})
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Wajib Masuk: <strong>{t.jamWajibMasuk || '07:15'} WITA</strong>
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Data & Jadwal Wajib"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data guru ${t.nama}?`)) {
                                onDeleteTeacher(t.id);
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4" />{' '}
                {editingTeacher ? 'Edit Data & Jadwal Wajib Guru' : 'Tambah Guru / PTK Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: AHMAD ZAHID, M.Pd"
                  className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 uppercase font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP / NIPPPK (Gunakan '-' jika belum ada)</label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300 font-mono text-slate-900"
                />
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
                  <label className="block font-bold text-slate-700 mb-1">Status PTK</label>
                  <select
                    value={formData.statusPtk}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusPtk: e.target.value as 'PNS' | 'PPPK' | 'GTT' | 'Honor',
                      })
                    }
                    className="w-full p-2 border rounded border-slate-300 font-semibold text-slate-900"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT">GTT / Honorer Sekolah</option>
                    <option value="Honor">Tenaga Kependidikan Honor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Tugas Pengajar</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Guru Kelas IV, Guru PAI & BP, Guru PJOK"
                  className="w-full p-2 border rounded border-slate-300 font-semibold text-slate-900"
                />
              </div>

              {/* Pengaturan Jam & Hari Wajib Masuk */}
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 uppercase text-[11px]">
                    <CalendarDays className="w-4 h-4 text-emerald-700" />
                    PENGATURAN HARI & JAM WAJIB MASUK
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded border border-amber-300">
                    {formData.hariWajib?.length || 0} Hari / Minggu
                  </span>
                </div>

                {/* Preset Options */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-600 block w-full">Pilih Template Cepat:</span>
                  <button
                    type="button"
                    onClick={() => handleSetPreset(ALL_DAYS, 'Wajib 6 Hari (Full)')}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded text-[10px]"
                  >
                    Full 6 Hari (Senin - Ahad)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Ahad'], 'Wajib 5 Hari (Senin - Kamis & Ahad)')}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded text-[10px]"
                  >
                    5 Hari (Senin - Kamis & Ahad)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset(['Senin', 'Rabu', 'Ahad'], 'Wajib 3 Hari (Senin, Rabu, Ahad)')}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded text-[10px]"
                  >
                    3 Hari (Senin, Rabu, Ahad)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset(['Selasa', 'Kamis'], 'Wajib 2 Hari (Selasa & Kamis)')}
                    className="px-2 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-black rounded text-[10px]"
                  >
                    2 Hari (Selasa & Kamis)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset(['Senin', 'Rabu'], 'Wajib 2 Hari (Senin & Rabu)')}
                    className="px-2 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-black rounded text-[10px]"
                  >
                    2 Hari (Senin & Rabu)
                  </button>
                </div>

                {/* Day Checkboxes */}
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Pilih Hari Wajib Mengajar:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ALL_DAYS.map((day) => {
                      const isChecked = (formData.hariWajib || []).includes(day);
                      return (
                        <label
                          key={day}
                          onClick={() => handleToggleDay(day)}
                          className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer font-bold text-xs select-none transition-all ${
                            isChecked
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <CheckSquare className={`w-3.5 h-3.5 ${isChecked ? 'text-amber-300' : 'text-slate-400'}`} />
                          {day}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Jam Wajib Masuk */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Jam Wajib Masuk (WITA)</label>
                    <input
                      type="text"
                      value={formData.jamWajibMasuk || '07:15'}
                      onChange={(e) => setFormData({ ...formData, jamWajibMasuk: e.target.value })}
                      placeholder="Contoh: 07:15 / 07:30"
                      className="w-full p-1.5 border rounded border-slate-300 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Keterangan Beban Hari</label>
                    <input
                      type="text"
                      value={formData.keteranganJadwal || ''}
                      onChange={(e) => setFormData({ ...formData, keteranganJadwal: e.target.value })}
                      placeholder="Contoh: 2 Hari / Minggu"
                      className="w-full p-1.5 border rounded border-slate-300 font-medium text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-emerald-900 italic font-medium">
                  💡 <strong>Catatan:</strong> Hari yang tidak dicentang bersifat opsional/tidak wajib mengajar, sehingga tidak akan memotong atau mengurangi persentase rekapitulasi kehadiran bulanan guru.
                </p>
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
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold flex items-center gap-1 shadow"
                >
                  <Check className="w-4 h-4" /> Simpan Data & Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
