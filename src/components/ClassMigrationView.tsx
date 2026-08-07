import React, { useState } from 'react';
import { Student, ClassCategory, SchoolInfo } from '../types';
import {
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Award,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface ClassMigrationViewProps {
  students: Student[];
  classes: ClassCategory[];
  schoolInfo: SchoolInfo;
  onMigrateStudents: (updatedStudents: Student[]) => void;
  onUpdateSchoolInfo?: (info: SchoolInfo) => void;
}

export const ClassMigrationView: React.FC<ClassMigrationViewProps> = ({
  students,
  classes,
  schoolInfo,
  onMigrateStudents,
  onUpdateSchoolInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'massal' | 'manual'>('massal');

  // Manual Migration States
  const [sourceClass, setSourceClass] = useState<string>(classes[0]?.namaKelas || 'Kelas I');
  const [targetClass, setTargetClass] = useState<string>(classes[1]?.namaKelas || 'Kelas II');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // New Academic Year Modal State
  const [targetYear, setTargetYear] = useState<string>('2025 / 2026');
  const [isConfirmMassalOpen, setIsConfirmMassalOpen] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Helper to determine next logical class
  const getNextClass = (currentClassName: string): string => {
    const idx = classes.findIndex((c) => c.namaKelas.toLowerCase() === currentClassName.toLowerCase());
    if (idx !== -1 && idx < classes.length - 1) {
      return classes[idx + 1].namaKelas;
    }
    return 'Lulus / Alumni';
  };

  // Filter students for manual migration source
  const sourceStudents = students.filter(
    (s) => s.kelas.toLowerCase() === sourceClass.toLowerCase()
  );

  const filteredSourceStudents = sourceStudents.filter((s) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.includes(searchQuery) ||
    s.nisn.includes(searchQuery)
  );

  // Toggle selection for individual student
  const toggleStudentSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all / deselect all
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredSourceStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredSourceStudents.map((s) => s.id));
    }
  };

  // Execute manual migration for selected students
  const handleExecuteManualMigration = () => {
    if (selectedStudentIds.length === 0) return;
    if (sourceClass === targetClass) {
      alert('Kelas Asal dan Kelas Tujuan tidak boleh sama!');
      return;
    }

    const updated = students.map((s) => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, kelas: targetClass };
      }
      return s;
    });

    onMigrateStudents(updated);
    triggerToast(
      `Berhasil memindahkan ${selectedStudentIds.length} siswa dari ${sourceClass} ke ${targetClass}!`
    );
    setSelectedStudentIds([]);
  };

  // Execute General / Bulk Migration for ALL students in source class
  const handleMoveAllSourceStudents = () => {
    if (sourceStudents.length === 0) {
      alert(`Tidak ada siswa terdaftar di ${sourceClass}`);
      return;
    }
    if (sourceClass === targetClass) {
      alert('Kelas Asal dan Kelas Tujuan tidak boleh sama!');
      return;
    }
    if (confirm(`Aksi General: Apakah Anda yakin ingin memindahkan SELURUH ${sourceStudents.length} siswa dari ${sourceClass} ke ${targetClass}?`)) {
      const sourceIds = sourceStudents.map((s) => s.id);
      const updated = students.map((s) => {
        if (sourceIds.includes(s.id)) {
          return { ...s, kelas: targetClass };
        }
        return s;
      });
      onMigrateStudents(updated);
      triggerToast(`Berhasil memindahkan SELURUH (${sourceStudents.length}) siswa dari ${sourceClass} ke ${targetClass}!`);
      setSelectedStudentIds([]);
    }
  };

  // Execute Bulk Automatic Sequential Promotion
  const handleExecuteMassalPromotion = () => {
    // Perform sequential promotion
    const updated = students.map((s) => {
      const nextCls = getNextClass(s.kelas);
      return { ...s, kelas: nextCls };
    });

    onMigrateStudents(updated);

    // Optionally update active school info academic year
    if (onUpdateSchoolInfo && targetYear) {
      const updatedDaftar = Array.from(
        new Set([...(schoolInfo.daftarTahunPelajaran || ['2023 / 2024', '2024 / 2025', '2025 / 2026']), targetYear])
      );
      onUpdateSchoolInfo({
        ...schoolInfo,
        tahunPelajaran: targetYear,
        daftarTahunPelajaran: updatedDaftar,
      });
    }

    setIsConfirmMassalOpen(false);
    triggerToast(
      `Kenaikan Kelas Massal Berhasil! Seluruh siswa telah dinaikkan tingkat & Tahun Ajaran diset ke ${targetYear}.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-xl shadow-lg border border-purple-700/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
              FITUR MANAJEMEN TINGKAT
            </span>
            <span className="bg-purple-800 text-purple-200 border border-purple-600 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              TA : {schoolInfo.tahunPelajaran}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase mt-1 flex items-center gap-2 text-purple-100">
            <GraduationCap className="w-6 h-6 text-amber-300" /> MIGRASI & KENAIKAN KELAS SISWA
          </h2>
          <p className="text-xs text-purple-200 mt-0.5">
            Kelola kenaikan tingkat berjenjang tahun ajaran baru atau migrasikan siswa dari kelas asal ke kelas tujuan secara cepat dan presisi.
          </p>
        </div>

        {/* Tab Switch Buttons */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-purple-800/80 gap-1 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('massal')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'massal'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-900" /> Kenaikan Kelas Massal
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
            }`}
          >
            <Users className="w-4 h-4 text-amber-900" /> Migrasi Antar Kelas
          </button>
        </div>
      </div>

      {/* TAB 1: KENAIKAN KELAS MASSAL (AUTOMATED) */}
      {activeTab === 'massal' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl space-y-2 text-slate-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-amber-950 text-sm">
                  Bagaimana Cara Kerja Kenaikan Kelas Massal?
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Fitur ini secara otomatis menaikkan jenjang seluruh siswa ke tingkat berikutnya dalam satu kali klik saat memasuki tahun ajaran baru.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  {classes.map((c, idx) => (
                    <span key={c.id} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-amber-900">
                      {c.namaKelas} <ArrowRight className="w-3 h-3 text-amber-600" /> {idx < classes.length - 1 ? classes[idx + 1].namaKelas : 'Lulus / Alumni'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Migration Preview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((c) => {
              const count = students.filter(
                (s) => s.kelas.toLowerCase() === c.namaKelas.toLowerCase()
              ).length;
              const nextClass = getNextClass(c.namaKelas);

              return (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      Rombel Tingkat Asal
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-600">
                      {count} Siswa
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-center flex-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">DARI</span>
                      <span className="text-sm font-black text-slate-900">{c.namaKelas}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center shrink-0 border border-purple-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="text-center flex-1">
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase block">MENJADI</span>
                      <span className="text-sm font-black text-emerald-900">{nextClass}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    {count > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready: {count} siswa akan dipromosikan
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Tidak ada siswa terdaftar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button Section */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-amber-300 uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" /> Eksekusi Kenaikan Kelas Massal
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Total <strong className="text-white font-mono">{students.length} siswa</strong> akan dinaikkan tingkatnya secara serentak.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmMassalOpen(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wide rounded-xl shadow-lg transition-all border border-amber-200 flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950" /> Jalankan Kenaikan Kelas Massal Now
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MIGRASI ANTAR KELAS (MANUAL & SELECTIVE) */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          {/* Class Selectors Bar */}
          <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Source Class */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                1. KELAS ASAL (SUMBER SISWA):
              </label>
              <select
                value={sourceClass}
                onChange={(e) => {
                  setSourceClass(e.target.value);
                  setSelectedStudentIds([]);
                }}
                className="w-full bg-slate-50 border-2 border-purple-200 rounded-lg p-2 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.namaKelas}>
                    {c.namaKelas} ({students.filter((s) => s.kelas.toLowerCase() === c.namaKelas.toLowerCase()).length} Siswa)
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow Indicator */}
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-950 border-2 border-amber-300 flex items-center justify-center font-black shadow">
                <ArrowRight className="w-5 h-5 text-amber-900" />
              </div>
            </div>

            {/* Target Class */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-black uppercase text-emerald-900">
                2. KELAS TUJUAN (PINDAH KE):
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-lg p-2 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.namaKelas}>
                    {c.namaKelas}
                  </option>
                ))}
                <option value="Lulus / Alumni">Lulus / Alumni (Tamatan)</option>
              </select>
            </div>
          </div>

          {/* Student Selector Toolbar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa di kelas ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 border-slate-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {selectedStudentIds.length === filteredSourceStudents.length && filteredSourceStudents.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-purple-700" /> Batal Pilih
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-500" /> Pilih Semua
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={sourceStudents.length === 0}
                onClick={handleMoveAllSourceStudents}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow transition-all ${
                  sourceStudents.length > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={`Pindahkan SEMUA ${sourceStudents.length} siswa di ${sourceClass} ke ${targetClass}`}
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>⚡ Aksi General: Pindah SEMUA Siswa ({sourceStudents.length})</span>
              </button>

              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleExecuteManualMigration}
                className={`px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow transition-all ${
                  selectedStudentIds.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Migrasikan {selectedStudentIds.length} Terpilih ➔ {targetClass}</span>
              </button>
            </div>
          </div>

          {/* Student Selection List */}
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-800 text-white font-extrabold text-xs flex justify-between items-center">
              <span>DAFTAR SISWA KELAS: {sourceClass} ({filteredSourceStudents.length} SISWA)</span>
              <span>Terpilih: {selectedStudentIds.length} Siswa</span>
            </div>

            <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {filteredSourceStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tidak ditemukan siswa di {sourceClass}.
                </div>
              ) : (
                filteredSourceStudents.map((s, index) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStudentSelect(s.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50 hover:bg-purple-100/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-500 text-xs w-6">{index + 1}.</span>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{s.nama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            NIS: {s.nis} | NISN: {s.nisn} | L/P: {s.jenisKelamin}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-purple-100 text-purple-900 font-black px-2 py-0.5 rounded border border-purple-200">
                          {s.kelas}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-300">
                            Pindah ke {targetClass}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Massal */}
      {isConfirmMassalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" /> Konfirmasi Kenaikan Kelas Massal
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmMassalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl space-y-1 text-slate-800">
                <p className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" /> Perhatian Sebelum Melanjutkan!
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Tindakan ini akan memindahkan <strong className="text-slate-950 font-mono">{students.length} siswa</strong> dari kelas saat ini ke tingkat kelas berikutnya.
                </p>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Atur Tahun Ajaran Baru Yang Akan Diaktifkan:
                </label>
                <input
                  type="text"
                  required
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  placeholder="Contoh: 2025 / 2026"
                  className="w-full p-2.5 border-2 rounded-xl border-purple-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsConfirmMassalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMassalPromotion}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> Ya, Jalankan Kenaikan Kelas!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-amber-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-extrabold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
