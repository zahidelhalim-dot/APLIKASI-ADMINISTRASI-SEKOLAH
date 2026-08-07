import React, { useState } from 'react';
import { Teacher, SchoolInfo, ClassCategory, UserAccount } from '../types';
import { Plus, Edit2, Trash2, Search, UserCheck, Check, X, Award, Clock, CalendarDays, CheckSquare, Download, Upload, FileSpreadsheet, AlertCircle, Eye, Phone, Mail, MapPin, GraduationCap, Calendar, Hash, User } from 'lucide-react';
import { downloadTeacherTemplate, parseTeachersFile, exportTeachersToCSV } from '../utils/templateImporterExporter';

interface TeacherDataProps {
  teachers: Teacher[];
  classes?: ClassCategory[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onImportTeachers?: (newTeachers: Teacher[], replaceExisting?: boolean) => void;
  schoolInfo: SchoolInfo;
  currentUser?: UserAccount | null;
}

const ALL_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];

export const TeacherData: React.FC<TeacherDataProps> = ({
  teachers,
  classes = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onImportTeachers,
  schoolInfo,
  currentUser,
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingDetailTeacher, setViewingDetailTeacher] = useState<Teacher | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Teacher[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    nip: '',
    nama: '',
    jenisKelamin: 'L',
    jabatan: 'Guru Kelas',
    statusPtk: 'PNS',
    nik: '',
    nuptk: '',
    alamat: '',
    tempatLahir: '',
    tanggalLahir: '',
    noHp: '',
    email: '',
    agama: 'Islam',
    pendidikanTerakhir: 'S1',
    hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'],
    jamWajibMasuk: '07:15',
    keteranganJadwal: 'Wajib 6 Hari',
  });

  const handleOpenAdd = () => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator yang berhak menambah guru baru.');
      return;
    }
    setEditingTeacher(null);
    setFormData({
      nip: '19880101 201501 1 001',
      nama: '',
      jenisKelamin: 'L',
      jabatan: 'Guru Kelas',
      statusPtk: 'PNS',
      nik: '',
      nuptk: '',
      alamat: '',
      tempatLahir: '',
      tanggalLahir: '',
      noHp: '',
      email: '',
      agama: 'Islam',
      pendidikanTerakhir: 'S1 PGSD',
      hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'],
      jamWajibMasuk: '07:15',
      keteranganJadwal: 'Wajib 6 Hari',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator yang berhak mengedit data guru.');
      return;
    }
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      nama: teacher.nama,
      jenisKelamin: teacher.jenisKelamin,
      jabatan: teacher.jabatan,
      statusPtk: teacher.statusPtk,
      nik: teacher.nik || '',
      nuptk: teacher.nuptk || '',
      alamat: teacher.alamat || '',
      tempatLahir: teacher.tempatLahir || '',
      tanggalLahir: teacher.tanggalLahir || '',
      noHp: teacher.noHp || '',
      email: teacher.email || '',
      agama: teacher.agama || 'Islam',
      pendidikanTerakhir: teacher.pendidikanTerakhir || 'S1',
      hariWajib: teacher.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'],
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

  // Handle File Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = parseTeachersFile(content, file.name);
        if (parsed.length === 0) {
          setImportError('File kosong atau format kolom tidak sesuai template!');
          setImportedPreview([]);
        } else {
          setImportedPreview(parsed);
        }
      } catch (err) {
        setImportError('Gagal membaca file. Pastikan format CSV / JSON valid.');
        setImportedPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;
    if (onImportTeachers) {
      onImportTeachers(importedPreview, replaceExisting);
      setImportSuccessMsg(
        `Berhasil mengimpor ${importedPreview.length} data guru (${replaceExisting ? 'Menggantikan data lama' : 'Menambahkan ke data ada'}).`
      );
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportedPreview([]);
        setImportFileName('');
        setImportSuccessMsg('');
      }, 1500);
    }
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
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 border border-teal-700/50">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-300" /> DATA MASTER GURU & WALI KELAS
          </h2>
          <p className="text-xs text-emerald-200">
            Daftar Tenaga Pendidik, Pengaturan Hari Wajib Masuk, & Penugasan Wali Kelas — {schoolInfo.namaSekolah}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadTeacherTemplate()}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all border border-emerald-500"
            title="Download file template CSV untuk data guru"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Download Template</span>
          </button>

          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setImportedPreview([]);
                  setImportFileName('');
                  setImportError('');
                  setImportSuccessMsg('');
                  setIsImportModalOpen(true);
                }}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition-all border border-amber-400"
                title="Import data guru dari file CSV/JSON"
              >
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Import Template / CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all border border-teal-400"
              >
                <Plus className="w-4 h-4" /> Tambah Guru
              </button>
            </>
          ) : (
            <span className="bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs font-bold px-3 py-2 rounded-lg">
              Mode Lihat Saja (Role: Guru / Wali)
            </span>
          )}
        </div>
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

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <span>
            Total: <span className="text-emerald-800 font-extrabold">{teachers.length} PTK</span> (
            PNS: {teachers.filter((t) => t.statusPtk === 'PNS').length} | PPPK:{' '}
            {teachers.filter((t) => t.statusPtk === 'PPPK').length} | Honorer:{' '}
            {teachers.filter((t) => t.statusPtk === 'GTT' || t.statusPtk === 'Honor').length} )
          </span>

          <button
            onClick={() => exportTeachersToCSV(filteredTeachers, 'Data_Guru_PTK.csv')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-[11px] font-bold flex items-center gap-1"
            title="Ekspor daftar guru ke CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Ekspor CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-36">NIP / NUPTK</th>
                <th className="py-3 px-3">Nama Lengkap & Gelar</th>
                <th className="py-3 px-3 text-center w-12">L/P</th>
                <th className="py-3 px-3 w-32">Jabatan</th>
                <th className="py-3 px-3 text-center w-20">Status</th>
                <th className="py-3 px-3 w-48 bg-emerald-950/80 text-amber-300">Hari & Jam Wajib Masuk</th>
                <th className="py-3 px-3 text-center w-28">Aksi</th>
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
                      <td className="py-2.5 px-3 font-mono">
                        <div className="text-emerald-900 font-bold">{t.nip || '-'}</div>
                        {t.nuptk && <div className="text-[10px] text-slate-500">NUPTK: {t.nuptk}</div>}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">
                          {t.nama}
                          {assignedClass && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-300">
                              <Award className="w-3 h-3 text-amber-700" /> Wali {assignedClass.namaKelas}
                            </span>
                          )}
                        </div>
                        {(t.noHp || t.email) && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            {t.noHp && <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{t.noHp}</span>}
                            {t.email && <span className="text-slate-600 truncate flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{t.email}</span>}
                          </div>
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
                            onClick={() => setViewingDetailTeacher(t)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200"
                            title="Lihat Detail Lengkap Guru"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(t)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
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
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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

      {/* Detail View Modal Guru */}
      {viewingDetailTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-300" /> Detail Lengkap Data Guru / PTK
              </h3>
              <button
                onClick={() => setViewingDetailTeacher(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-emerald-950">{viewingDetailTeacher.nama}</h4>
                  <p className="text-slate-600 font-medium text-[11px] mt-0.5">
                    NIP: <span className="font-mono font-bold text-emerald-900">{viewingDetailTeacher.nip || '-'}</span> | NUPTK: <span className="font-mono font-bold text-emerald-900">{viewingDetailTeacher.nuptk || '-'}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-emerald-800 text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow">
                    {viewingDetailTeacher.statusPtk}
                  </span>
                  <span className="text-[10px] text-emerald-900 font-bold">{viewingDetailTeacher.jabatan}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-800">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NIK (KTP)</span>
                  <p className="font-mono font-extrabold text-slate-900">{viewingDetailTeacher.nik || '-'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pendidikan Terakhir</span>
                  <p className="font-extrabold text-slate-900 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> {viewingDetailTeacher.pendidikanTerakhir || 'S1'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tempat & Tanggal Lahir</span>
                  <p className="font-bold text-slate-900">
                    {viewingDetailTeacher.tempatLahir ? `${viewingDetailTeacher.tempatLahir}, ` : ''}{viewingDetailTeacher.tanggalLahir || '-'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Jenis Kelamin & Agama</span>
                  <p className="font-bold text-slate-900">
                    {viewingDetailTeacher.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'} — {viewingDetailTeacher.agama || 'Islam'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">No. Telepon / WhatsApp</span>
                  <p className="font-mono font-extrabold text-emerald-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> {viewingDetailTeacher.noHp || '-'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Resmi / Pribadi</span>
                  <p className="font-bold text-slate-900 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> {viewingDetailTeacher.email || '-'}
                  </p>
                </div>

                <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Alamat Rumah</span>
                  <p className="font-bold text-slate-900 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{viewingDetailTeacher.alamat || '-'}</span>
                  </p>
                </div>

                <div className="col-span-2 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">Jadwal Wajib & Beban Kerja</span>
                  <p className="font-black text-emerald-950 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-emerald-700" />
                    {(viewingDetailTeacher.hariWajib || []).join(', ')} ({viewingDetailTeacher.hariWajib?.length || 6} Hari / Minggu)
                  </p>
                  <p className="text-slate-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Jam Wajib Masuk: {viewingDetailTeacher.jamWajibMasuk || '07:15'} WITA
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    const teacherToEdit = viewingDetailTeacher;
                    setViewingDetailTeacher(null);
                    handleOpenEdit(teacherToEdit);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Edit2 className="w-4 h-4" /> Edit Data Ini
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDetailTeacher(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-300" />{' '}
                {editingTeacher ? 'Edit Data Detail & Jadwal Guru' : 'Tambah Guru / PTK Baru dengan Detail'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {/* Bagian 1: Identitas Kepegawaian */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-emerald-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  1. Data Kepegawaian & Jabatan
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Contoh: AHMAD ZAHID, M.Pd"
                      className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 uppercase font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIP / NIPPPK (Gunakan '-' jika belum ada)</label>
                    <input
                      type="text"
                      required
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NUPTK</label>
                    <input
                      type="text"
                      value={formData.nuptk || ''}
                      onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                      placeholder="16 Digit NUPTK"
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
                    <input
                      type="text"
                      value={formData.nik || ''}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="63110..."
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
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
                      className="w-full p-2 border rounded-lg border-slate-300 font-bold text-slate-900"
                    >
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="GTT">GTT / Honorer Sekolah</option>
                      <option value="Honor">Tenaga Kependidikan Honor</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Jabatan / Tugas Pengajar</label>
                    <input
                      type="text"
                      required
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      placeholder="Contoh: Guru Kelas IV, Guru PAI & BP, Guru PJOK"
                      className="w-full p-2 border rounded-lg border-slate-300 font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Kelahiran, Agama & Pendidikan */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-emerald-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  2. Kelahiran, Agama & Pendidikan
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      placeholder="Contoh: Barabai"
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={formData.tanggalLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.jenisKelamin}
                      onChange={(e) =>
                        setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })
                      }
                      className="w-full p-2 border rounded-lg border-slate-300 font-semibold text-slate-900"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agama</label>
                    <select
                      value={formData.agama || 'Islam'}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 font-medium text-slate-900"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Khonghucu">Khonghucu</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={formData.pendidikanTerakhir || ''}
                      onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                      placeholder="Contoh: S1 PGSD / S1 Pendidikan Agama Islam"
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Kontak & Alamat */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-emerald-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  3. Kontak & Alamat Rumah
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.noHp || ''}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                      placeholder="Contoh: 081349876543"
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Contoh: guru@sekolah.sch.id"
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                    <textarea
                      rows={2}
                      value={formData.alamat || ''}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Contoh: Komp. Garatama Blok A No. 12 Paringin"
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 4: Pengaturan Jam & Hari Wajib Masuk */}
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 uppercase text-[11px]">
                    <CalendarDays className="w-4 h-4 text-emerald-700" />
                    4. PENGATURAN HARI & JAM WAJIB MASUK
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

      {/* Modal Import Data Guru */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-950" /> Import Data Guru & PTK dari CSV / Excel / JSON
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-950/80 hover:text-slate-950 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1 text-slate-800">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" /> Petunjuk Import Data Guru:
                </p>
                <ol className="list-decimal pl-5 space-y-0.5 text-[11px] text-slate-700">
                  <li>Unduh file template CSV dengan menekan tombol <strong>Download Template</strong>.</li>
                  <li>Isi kolom <strong>NIP, Nama Lengkap, Jenis Kelamin (L/P), Jabatan, dan Status PTK</strong>.</li>
                  <li>Pilih file CSV yang sudah diisi di bawah ini untuk impor otomatis.</li>
                </ol>
              </div>

              {/* Upload Input Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-amber-500 bg-slate-50 transition-all">
                <input
                  type="file"
                  accept=".csv, .json, .txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-teacher-upload"
                />
                <label
                  htmlFor="file-teacher-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-8 h-8 text-amber-600" />
                  <span className="font-bold text-slate-800">
                    {importFileName ? `File Terpilih: ${importFileName}` : 'Klik untuk Pilih File CSV / JSON Data Guru'}
                  </span>
                  <span className="text-[10px] text-slate-500">Format yang didukung: .csv (Excel CSV), .json</span>
                </label>
              </div>

              {importError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {importError}
                </div>
              )}

              {importSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {importSuccessMsg}
                </div>
              )}

              {/* Preview Table */}
              {importedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      Pratinjau Data Impor ({importedPreview.length} Guru)
                    </span>
                    <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Gantikan seluruh data guru yang ada</span>
                    </label>
                  </div>

                  <div className="max-h-48 overflow-y-auto border rounded-xl border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-extrabold text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2 border-b">No</th>
                          <th className="p-2 border-b">NIP</th>
                          <th className="p-2 border-b">Nama Lengkap</th>
                          <th className="p-2 border-b">L/P</th>
                          <th className="p-2 border-b">Jabatan</th>
                          <th className="p-2 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedPreview.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-teal-900">{t.nip}</td>
                            <td className="p-2 font-bold text-slate-900">{t.nama}</td>
                            <td className="p-2 font-bold">{t.jenisKelamin}</td>
                            <td className="p-2">{t.jabatan}</td>
                            <td className="p-2">{t.statusPtk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Column Structure Template Guide */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
                <span className="font-extrabold text-amber-950 flex items-center gap-1">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" /> Format Kolom Excel / CSV Template Guru:
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Setiap elemen data guru menempati kolom terpisah di Excel/CSV:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] font-mono font-bold text-slate-800 bg-white/80 p-2 rounded border border-amber-300/60">
                  <div>1. NIP</div>
                  <div>2. Nama Lengkap</div>
                  <div>3. JK (L/P)</div>
                  <div>4. Jabatan</div>
                  <div>5. Status PTK</div>
                  <div>6. NIK</div>
                  <div>7. NUPTK</div>
                  <div>8. Tempat Lahir</div>
                  <div>9. Tanggal Lahir</div>
                  <div>10. Alamat</div>
                  <div>11. No HP</div>
                  <div>12. Email</div>
                  <div>13. Agama</div>
                  <div>14. Pendidikan</div>
                  <div>15. Hari Wajib</div>
                  <div>16. Jam Wajib</div>
                  <div>17. Keterangan</div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importedPreview.length === 0}
                  className={`px-5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow transition-all ${
                    importedPreview.length > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" /> Impor {importedPreview.length} Data Guru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
