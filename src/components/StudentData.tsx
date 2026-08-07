import React, { useState } from 'react';
import { Student, SchoolInfo, ClassCategory, Teacher, UserAccount } from '../types';
import { ClassFilterBar } from './ClassFilterBar';
import { Plus, Edit2, Trash2, Search, Users, Check, X, Download, Upload, FileSpreadsheet, FileText, AlertCircle, Eye, Phone, MapPin, User, Calendar, Hash, ArrowUpRight, GraduationCap, CheckSquare, Square, Layers, Zap, ArrowRight } from 'lucide-react';
import { downloadStudentTemplate, parseStudentsFile, exportStudentsToCSV } from '../utils/templateImporterExporter';

interface StudentDataProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassCategory[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onImportStudents?: (newStudents: Student[], replaceExisting?: boolean) => void;
  schoolInfo: SchoolInfo;
  selectedKelas: string;
  onSelectKelas: (kelas: string) => void;
  currentUser?: UserAccount | null;
}

export const StudentData: React.FC<StudentDataProps> = ({
  students,
  teachers,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
  schoolInfo,
  selectedKelas,
  onSelectKelas,
  currentUser,
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingDetailStudent, setViewingDetailStudent] = useState<Student | null>(null);

  // Quick Move Class Modal State
  const [moveClassStudent, setMoveClassStudent] = useState<Student | null>(null);
  const [targetMoveClass, setTargetMoveClass] = useState<string>(classes[0]?.namaKelas || 'Kelas I');

  // Bulk Selection & General Action State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState<boolean>(false);
  const [bulkTargetClass, setBulkTargetClass] = useState<string>(classes[1]?.namaKelas || classes[0]?.namaKelas || 'Kelas II');

  // Toggle single student selection
  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle select all filtered students
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  // Execute bulk move/migration
  const handleExecuteBulkMove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      const student = students.find((s) => s.id === id);
      if (student) {
        onUpdateStudent({ ...student, kelas: bulkTargetClass });
      }
    });
    alert(`Berhasil memindahkan ${selectedIds.length} siswa ke ${bulkTargetClass}!`);
    setSelectedIds([]);
    setIsBulkMoveModalOpen(false);
  };

  // Execute bulk deletion (admin only)
  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!isAdmin) {
      alert('Hanya Administrator yang berhak menghapus data siswa.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`)) {
      selectedIds.forEach((id) => onDeleteStudent(id));
      setSelectedIds([]);
    }
  };

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Student[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nis: '',
    nisn: '',
    nik: '',
    nama: '',
    jenisKelamin: 'L',
    kelas: selectedKelas !== 'SEMUA' ? selectedKelas : classes[0]?.namaKelas || 'Kelas I',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    namaOrangTua: '',
    noHpOrtu: '',
    agama: 'Islam',
  });

  const handleOpenAdd = () => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator yang berhak menambah siswa baru.');
      return;
    }
    setEditingStudent(null);
    setFormData({
      nis: String(1000 + students.length + 1),
      nisn: `01234567${String(students.length + 1).padStart(2, '0')}`,
      nik: '',
      nama: '',
      jenisKelamin: 'L',
      kelas: selectedKelas !== 'SEMUA' ? selectedKelas : classes[0]?.namaKelas || 'Kelas I',
      tempatLahir: '',
      tanggalLahir: '',
      alamat: '',
      namaOrangTua: '',
      noHpOrtu: '',
      agama: 'Islam',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator yang berhak mengedit data siswa.');
      return;
    }
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      nik: student.nik || '',
      nama: student.nama,
      jenisKelamin: student.jenisKelamin,
      kelas: student.kelas,
      tempatLahir: student.tempatLahir || '',
      tanggalLahir: student.tanggalLahir || '',
      alamat: student.alamat || '',
      namaOrangTua: student.namaOrangTua || '',
      noHpOrtu: student.noHpOrtu || '',
      agama: student.agama || 'Islam',
    });
    setIsModalOpen(true);
  };

  const handleQuickMoveClass = () => {
    if (!moveClassStudent) return;
    onUpdateStudent({
      ...moveClassStudent,
      kelas: targetMoveClass,
    });
    setMoveClassStudent(null);
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
        const parsed = parseStudentsFile(content, file.name);
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
    if (onImportStudents) {
      onImportStudents(importedPreview, replaceExisting);
      setImportSuccessMsg(
        `Berhasil mengimpor ${importedPreview.length} data siswa (${replaceExisting ? 'Menggantikan data lama' : 'Menambahkan ke data ada'}).`
      );
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportedPreview([]);
        setImportFileName('');
        setImportSuccessMsg('');
      }, 1500);
    }
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 border border-blue-700/50">
        <div>
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-300" /> DATA MASTER SISWA PER KELAS
          </h2>
          <p className="text-xs text-blue-200">
            {schoolInfo.namaSekolah} — Filter Aktif: {selectedKelas === 'SEMUA' ? 'Semua Kelas' : selectedKelas}
          </p>
        </div>

        {/* Action Buttons: Add, Download Template, Import Template */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadStudentTemplate()}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all border border-emerald-500"
            title="Download file template Excel/CSV untuk diisi data siswa"
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
                title="Upload/Import data siswa dari file CSV/JSON"
              >
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Import Template / CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all border border-blue-400"
              >
                <Plus className="w-4 h-4" /> Tambah Siswa
              </button>
            </>
          ) : (
            <span className="bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs font-bold px-3 py-2 rounded-lg">
              Mode Lihat Saja (Role: Guru / Wali)
            </span>
          )}
        </div>
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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span>
            Terfilter: <span className="text-blue-800 font-extrabold">{filteredStudents.length} Siswa</span> (
            L: {filteredStudents.filter((s) => s.jenisKelamin === 'L').length} | P:{' '}
            {filteredStudents.filter((s) => s.jenisKelamin === 'P').length} )
          </span>

          <button
            onClick={() => exportStudentsToCSV(filteredStudents, `Data_Siswa_${selectedKelas.replace(/\s+/g, '_')}.csv`)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            title="Ekspor daftar siswa saat ini ke file CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Ekspor CSV
          </button>
        </div>
      </div>

      {/* General / Bulk Action Bar (When 1+ Selected OR for general quick migration) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-xl shadow-md border border-purple-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-purple-600 cursor-pointer"
          >
            {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-amber-300" /> Batal Pilih Semua ({filteredStudents.length})
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-purple-300" /> Pilih Semua ({filteredStudents.length} Siswa)
              </>
            )}
          </button>

          <span className="text-xs font-mono font-extrabold text-amber-300">
            Terpilih: {selectedIds.length} Siswa
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setIsBulkMoveModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow border border-amber-200 cursor-pointer animate-pulse"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>AKSI GENERAL: Pindah / Migrasikan {selectedIds.length} Siswa Terpilih</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow border border-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Massal ({selectedIds.length})
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedIds(filteredStudents.map((s) => s.id));
                setIsBulkMoveModalOpen(true);
              }}
              disabled={filteredStudents.length === 0}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow border transition-all ${
                filteredStudents.length > 0
                  ? 'bg-purple-800 hover:bg-purple-700 text-amber-300 border-purple-500 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pindah / Migrasikan SEMUA Siswa Terfilter ({filteredStudents.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    title="Pilih / Batal Pilih Semua"
                  />
                </th>
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-28">NIS / NISN</th>
                <th className="py-3 px-3">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 text-center w-12">L/P</th>
                <th className="py-3 px-3 w-28 text-center">Kategori Kelas</th>
                <th className="py-3 px-3 w-48">Orang Tua & No. HP</th>
                <th className="py-3 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500">
                    Belum ada data siswa untuk kelas ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-purple-50/90 hover:bg-purple-100/90' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(s.id)}
                          className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="text-blue-900 font-bold">{s.nis}</div>
                        <div className="text-[10px] text-slate-500">{s.nisn}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{s.nama}</div>
                        {(s.tempatLahir || s.tanggalLahir) && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{s.tempatLahir ? `${s.tempatLahir}, ` : ''}{s.tanggalLahir || '-'}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{s.jenisKelamin}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-950 font-black px-2.5 py-1 rounded border border-emerald-300 text-[11px]">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{s.namaOrangTua || '-'}</div>
                        {s.noHpOrtu && (
                          <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" /> {s.noHpOrtu}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingDetailStudent(s)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200"
                            title="Lihat Detail Lengkap Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setMoveClassStudent(s);
                                  setTargetMoveClass(classes.find((c) => c.namaKelas !== s.kelas)?.namaKelas || classes[0]?.namaKelas || 'Kelas I');
                                }}
                                className="p-1.5 text-purple-700 hover:bg-purple-50 rounded border border-purple-200"
                                title="Pindah / Migrasi Ke Kelas Lain"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
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

      {/* Detail View Modal */}
      {viewingDetailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <User className="w-5 h-5 text-blue-300" /> Detail Lengkap Data Siswa
              </h3>
              <button
                onClick={() => setViewingDetailStudent(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-blue-950">{viewingDetailStudent.nama}</h4>
                  <p className="text-slate-600 font-medium text-[11px] mt-0.5">
                    NIS: <span className="font-mono font-bold text-blue-900">{viewingDetailStudent.nis}</span> | NISN: <span className="font-mono font-bold text-blue-900">{viewingDetailStudent.nisn}</span>
                  </p>
                </div>
                <span className="bg-blue-900 text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow">
                  {viewingDetailStudent.kelas}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-800">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NIK (Nomor Induk Kependudukan)</span>
                  <p className="font-mono font-extrabold text-slate-900">{viewingDetailStudent.nik || '-'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Jenis Kelamin / Agama</span>
                  <p className="font-bold text-slate-900">
                    {viewingDetailStudent.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'} — {viewingDetailStudent.agama || 'Islam'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tempat & Tanggal Lahir</span>
                  <p className="font-bold text-slate-900">
                    {viewingDetailStudent.tempatLahir ? `${viewingDetailStudent.tempatLahir}, ` : ''}{viewingDetailStudent.tanggalLahir || '-'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">No. HP / WA Orang Tua</span>
                  <p className="font-mono font-extrabold text-emerald-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> {viewingDetailStudent.noHpOrtu || '-'}
                  </p>
                </div>

                <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Nama Orang Tua / Wali</span>
                  <p className="font-extrabold text-slate-900">{viewingDetailStudent.namaOrangTua || '-'}</p>
                </div>

                <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Alamat Tempat Tinggal</span>
                  <p className="font-bold text-slate-900 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{viewingDetailStudent.alamat || '-'}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    const studentToEdit = viewingDetailStudent;
                    setViewingDetailStudent(null);
                    handleOpenEdit(studentToEdit);
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Edit2 className="w-4 h-4" /> Edit Data Ini
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDetailStudent(null)}
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
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />{' '}
                {editingStudent ? 'Edit Data Detail Siswa' : 'Tambah Siswa Baru dengan Detail'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Bagian 1: Informasi Utama */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-blue-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  1. Informasi Identitas Utama
                </span>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: AHMAD FADILLAH"
                    className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIS *</label>
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK (KTP/KK)</label>
                    <input
                      type="text"
                      value={formData.nik || ''}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="63110..."
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
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
                      className="w-full p-2 border rounded-lg border-slate-300 font-semibold text-slate-900"
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
                      className="w-full p-2 border rounded-lg border-slate-300 font-bold text-slate-900"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.namaKelas}>
                          {c.namaKelas}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Tempat Tanggal Lahir & Agama */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-blue-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  2. Kelahiran & Agama
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      placeholder="Contoh: Balangan"
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
                </div>
              </div>

              {/* Bagian 3: Alamat & Orang Tua */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-blue-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                  3. Alamat & Kontak Orang Tua / Wali
                </span>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Contoh: Jl. Bhayangkara Komp. Pendidikan Terpadu RT 02"
                    className="w-full p-2 border rounded-lg border-slate-300 text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={formData.namaOrangTua || ''}
                      onChange={(e) => setFormData({ ...formData, namaOrangTua: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full p-2 border rounded-lg border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp Ortual</label>
                    <input
                      type="text"
                      value={formData.noHpOrtu || ''}
                      onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full p-2 border rounded-lg border-slate-300 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-black flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" /> Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Data Siswa */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-950" /> Import Data Siswa dari CSV / Excel / JSON
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
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" /> Petunjuk Import:
                </p>
                <ol className="list-decimal pl-5 space-y-0.5 text-[11px] text-slate-700">
                  <li>Unduh file template CSV dengan menekan tombol <strong>Download Template</strong>.</li>
                  <li>Isi kolom <strong>NIS, NISN, Nama Lengkap, Jenis Kelamin (L/P), dan Kelas</strong>.</li>
                  <li>Pilih file CSV yang sudah diisi di bawah ini untuk mengimpor otomatis.</li>
                </ol>
              </div>

              {/* Upload Input Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-amber-500 bg-slate-50 transition-all">
                <input
                  type="file"
                  accept=".csv, .json, .txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-student-upload"
                />
                <label
                  htmlFor="file-student-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-8 h-8 text-amber-600" />
                  <span className="font-bold text-slate-800">
                    {importFileName ? `File Terpilih: ${importFileName}` : 'Klik untuk Pilih File CSV / JSON'}
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
                      Pratinjau Data Impor ({importedPreview.length} Siswa)
                    </span>
                    <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Gantikan seluruh data siswa yang ada</span>
                    </label>
                  </div>

                  <div className="max-h-48 overflow-y-auto border rounded-xl border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-extrabold text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2 border-b">No</th>
                          <th className="p-2 border-b">NIS</th>
                          <th className="p-2 border-b">Nama Lengkap</th>
                          <th className="p-2 border-b">L/P</th>
                          <th className="p-2 border-b">Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedPreview.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-blue-900">{s.nis}</td>
                            <td className="p-2 font-bold text-slate-900">{s.nama}</td>
                            <td className="p-2 font-bold">{s.jenisKelamin}</td>
                            <td className="p-2">{s.kelas}</td>
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
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" /> Format Kolom Excel / CSV Template:
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Setiap elemen data siswa menempati kolom terpisah di Excel/CSV:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] font-mono font-bold text-slate-800 bg-white/80 p-2 rounded border border-amber-300/60">
                  <div>1. NIS</div>
                  <div>2. NISN</div>
                  <div>3. Nama Lengkap</div>
                  <div>4. Jenis Kelamin (L/P)</div>
                  <div>5. Kelas</div>
                  <div>6. NIK</div>
                  <div>7. Tempat Lahir</div>
                  <div>8. Tanggal Lahir</div>
                  <div>9. Alamat</div>
                  <div>10. Nama Orang Tua</div>
                  <div>11. No HP Ortua</div>
                  <div>12. Agama</div>
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
                  <Check className="w-4 h-4" /> Impor {importedPreview.length} Data Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Move / Pindah Kelas Modal */}
      {moveClassStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-300" /> Pindah / Mutasi Kelas Siswa
              </h3>
              <button
                onClick={() => setMoveClassStudent(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-purple-800">Siswa Yang Dipindahkan:</div>
                <div className="text-sm font-black text-slate-900">{moveClassStudent.nama}</div>
                <div className="text-slate-600">
                  NIS: <span className="font-mono font-bold text-purple-900">{moveClassStudent.nis}</span> • Kelas Asal:{' '}
                  <span className="font-bold bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded">{moveClassStudent.kelas}</span>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Pilih Kelas Tujuan Baru:
                </label>
                <select
                  value={targetMoveClass}
                  onChange={(e) => setTargetMoveClass(e.target.value)}
                  className="w-full p-2.5 border-2 border-purple-400 rounded-xl font-bold text-sm bg-white focus:ring-2 focus:ring-purple-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.namaKelas}>
                      {cls.namaKelas} {cls.namaKelas === moveClassStudent.kelas ? '(Kelas Sekarang)' : ''}
                    </option>
                  ))}
                  <option value="Lulus / Alumni">Lulus / Alumni (Tamat Sekolah)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setMoveClassStudent(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleQuickMoveClass}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" /> Konfirmasi Pindah Kelas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk / General Move Modal */}
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" /> AKSI GENERAL: PINDAH / MIGRASI MASSAL SISWA
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl space-y-1.5 text-slate-800">
                <p className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-5 h-5 text-amber-700 shrink-0" /> Konfirmasi Pindah Kelas Massal
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Tindakan ini akan memindahkan <strong className="text-purple-950 font-black text-sm">{selectedIds.length} siswa terpilih</strong> ke kelas tujuan baru sekaligus.
                </p>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5 text-xs">
                  PILIH KELAS TUJUAN MASUKAN SISWA:
                </label>
                <select
                  value={bulkTargetClass}
                  onChange={(e) => setBulkTargetClass(e.target.value)}
                  className="w-full p-3 border-2 border-purple-500 rounded-xl font-black text-sm text-slate-900 bg-purple-50/50 focus:ring-2 focus:ring-purple-600"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.namaKelas}>
                      {cls.namaKelas}
                    </option>
                  ))}
                  <option value="Lulus / Alumni">Lulus / Alumni (Tamat / Alumni Sekolah)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1">
                <span className="font-extrabold text-slate-500 text-[10px] uppercase block">
                  Daftar Siswa Yang Akan Dipindahkan ({selectedIds.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedIds.map((id) => {
                    const st = students.find((s) => s.id === id);
                    if (!st) return null;
                    return (
                      <span key={id} className="bg-white px-2 py-0.5 rounded border text-[10px] font-bold text-slate-800">
                        {st.nama} ({st.kelas})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBulkMoveModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkMove}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-slate-950" /> Pindahkan {selectedIds.length} Siswa Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

