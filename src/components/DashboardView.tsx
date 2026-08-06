import React, { useState } from 'react';
import { SchoolInfo, ViewMode, MonthOption, UserAccount, ClassCategory, Student, Teacher } from '../types';
import { SchoolInfoCard } from './SchoolInfoCard';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  Sparkles,
  School,
  Users,
  UserCheck,
  Layers,
  Award,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Activity,
  ChevronRight,
  Sparkle,
} from 'lucide-react';

interface DashboardViewProps {
  schoolInfo: SchoolInfo;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  classicTheme: boolean;
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  classes: ClassCategory[];
  students: Student[];
  teachers: Teacher[];
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  selectedMonth: MonthOption | null;
  onSelectMonth: (month: MonthOption) => void;
}

const DEFAULT_BANNER_PRESETS = [
  {
    id: 'preset1',
    name: 'Gedung Sekolah Modern',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset2',
    name: 'Ruang Kelas Pembelajaran',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset3',
    name: 'Kegiatan Belajar Siswa',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset4',
    name: 'Pengajar & Pendidik',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset5',
    name: 'Perpustakaan & Literasi',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  schoolInfo,
  onUpdateSchoolInfo,
  classicTheme,
  currentUser,
  onOpenLogin,
  classes,
  students,
  teachers,
  activeView,
  onSelectView,
  selectedMonth,
  onSelectMonth,
}) => {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerInputType, setBannerInputType] = useState<'upload' | 'url' | 'preset'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewBannerUrl, setPreviewBannerUrl] = useState(
    schoolInfo.dashboardBannerUrl || DEFAULT_BANNER_PRESETS[0].url
  );
  const [uploadError, setUploadError] = useState('');

  // Current Active Banner URL
  const activeBanner = schoolInfo.dashboardBannerUrl || DEFAULT_BANNER_PRESETS[0].url;

  // Handle Local File Upload for Banner
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setPreviewBannerUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = () => {
    let finalUrl = previewBannerUrl;
    if (bannerInputType === 'url' && customUrlInput.trim()) {
      finalUrl = customUrlInput.trim();
    }

    onUpdateSchoolInfo({
      ...schoolInfo,
      dashboardBannerUrl: finalUrl,
    });
    setIsBannerModalOpen(false);
  };

  const handleResetBanner = () => {
    onUpdateSchoolInfo({
      ...schoolInfo,
      dashboardBannerUrl: DEFAULT_BANNER_PRESETS[0].url,
    });
    setPreviewBannerUrl(DEFAULT_BANNER_PRESETS[0].url);
    setIsBannerModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. CUSTOM DASHBOARD HERO IMAGE BANNER */}
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-slate-900 transition-all duration-300">
        {/* Banner Background Image */}
        <div className="relative h-52 sm:h-72 lg:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={activeBanner}
            alt="Dashboard Banner Sekolah"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
            onError={(e) => {
              // Fallback image if custom URL fails to load
              (e.target as HTMLImageElement).src = DEFAULT_BANNER_PRESETS[0].url;
            }}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        </div>

        {/* Banner Top Badge & Custom Image Action Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
            PANEL UTAMA ABSENSI DIGITAL
          </span>

          <button
            onClick={() => {
              setPreviewBannerUrl(activeBanner);
              setIsBannerModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900/85 hover:bg-amber-400 text-white hover:text-slate-950 rounded-xl text-xs font-extrabold shadow-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sesuaikan & ganti gambar banner dashboard"
          >
            <ImageIcon className="w-4 h-4 text-amber-300 group-hover:text-slate-950" />
            <span>Ganti / Custom Gambar Banner</span>
          </button>
        </div>

        {/* Banner Bottom Content Title */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-md border border-amber-200 shrink-0">
              <Award className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest">
                SISTEM INFORMASI ABSENSI GURU & SISWA
              </p>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-white drop-shadow-md">
                {schoolInfo.namaSekolah}
              </h1>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 pl-12">
            {schoolInfo.alamat}, KEL. {schoolInfo.kelurahan}, KEC. {schoolInfo.kecamatan},{' '}
            {schoolInfo.kabupatenKota}
          </p>
        </div>
      </div>

      {/* 2. QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl border-2 border-blue-600/50 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider block">
              TOTAL SISWA
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{students.length}</span>
            <span className="text-[10px] text-blue-300 block font-medium">Terdaftar di Sistem</span>
          </div>
          <div className="w-10 h-10 bg-blue-500/30 text-blue-200 rounded-xl flex items-center justify-center shrink-0 border border-blue-400/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-3.5 rounded-2xl border-2 border-emerald-600/50 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-200 tracking-wider block">
              GURU & PTK
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{teachers.length}</span>
            <span className="text-[10px] text-emerald-300 block font-medium">Tenaga Pendidik</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/30 text-emerald-200 rounded-xl flex items-center justify-center shrink-0 border border-emerald-400/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900 via-yellow-900 to-slate-900 text-white p-3.5 rounded-2xl border-2 border-amber-600/50 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider block">
              ROMBEL / KELAS
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{classes.length}</span>
            <span className="text-[10px] text-amber-300 block font-medium">Kategori Kelas</span>
          </div>
          <div className="w-10 h-10 bg-amber-500/30 text-amber-200 rounded-xl flex items-center justify-center shrink-0 border border-amber-400/30">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 text-white p-3.5 rounded-2xl border-2 border-purple-600/50 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-200 tracking-wider block">
              TAHUN / SEMESTER
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 truncate block">
              {schoolInfo.tahunPelajaran}
            </span>
            <span className="text-[10px] text-purple-300 block font-medium">
              Sem. {schoolInfo.semester}
            </span>
          </div>
          <div className="w-10 h-10 bg-purple-500/30 text-purple-200 rounded-xl flex items-center justify-center shrink-0 border border-purple-400/30">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. DASHBOARD MAIN AREA: SCHOOL PROFILE & SYSTEM HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: School Profile Card (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <SchoolInfoCard
            schoolInfo={schoolInfo}
            onUpdateSchoolInfo={onUpdateSchoolInfo}
            classicTheme={classicTheme}
            currentUser={currentUser}
            onOpenLogin={onOpenLogin}
          />
        </div>

        {/* Right Column: Quick Status & Sidebar Navigation Guidance (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide text-amber-300">
                    Sistem Navigasi Sidebar
                  </h3>
                  <p className="text-[11px] text-slate-400">Pilih menu di sidebar sebelah kiri</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AKTIF
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Silakan gunakan <strong>Sidebar / Navigation Drawer</strong> di sebelah kiri layar untuk mengakses seluruh fitur absensi harian, kelola data master, rekapitulasi bulanan, grafik, dan cetak laporan.
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block">
                Akses Cepat Pintasan Sidebar:
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onSelectView('absen_siswa')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-700/80 group"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> Absen Siswa
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  onClick={() => onSelectView('absen_guru')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-700/80 group"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" /> Absen Guru
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  onClick={() => onSelectView('rekap')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-700/80 group"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-400" /> Rekap Bulanan
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                <button
                  onClick={() => onSelectView('laporan')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-700/80 group"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Cetak Laporan
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT DASHBOARD BANNER IMAGE */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-slate-950 p-4 flex items-center justify-between border-b border-amber-500">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-950" /> Custom / Ganti Gambar Banner Dashboard
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 text-slate-950/80 hover:text-slate-950 font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Tab Option Selection */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBannerInputType('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    bannerInputType === 'upload'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Foto Device
                </button>

                <button
                  type="button"
                  onClick={() => setBannerInputType('preset')}
                  className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    bannerInputType === 'preset'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Pilih Template Pre-set
                </button>

                <button
                  type="button"
                  onClick={() => setBannerInputType('url')}
                  className={`flex-1 py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    bannerInputType === 'url'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" /> URL Link Gambar
                </button>
              </div>

              {/* Upload Input Area */}
              {bannerInputType === 'upload' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Pilih File Foto / Gambar dari HP atau Komputer Anda:
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-5 text-center bg-slate-50 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="dashboard-banner-file"
                    />
                    <label
                      htmlFor="dashboard-banner-file"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-amber-600" />
                      <span className="font-extrabold text-slate-800">
                        Klik untuk Memilih File Foto Baru
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Format disarankan: JPG, PNG, WEBP (Max 5MB)
                      </span>
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-xs text-rose-600 font-bold">{uploadError}</p>
                  )}
                </div>
              )}

              {/* Preset Picker */}
              {bannerInputType === 'preset' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Pilih Tema Gambar Banner Sekolah Pilihan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {DEFAULT_BANNER_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setPreviewBannerUrl(preset.url)}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          previewBannerUrl === preset.url
                            ? 'border-amber-500 ring-2 ring-amber-300'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-1.5 bg-slate-900/90 text-white text-[10px] font-bold flex items-center justify-between">
                          <span className="truncate">{preset.name}</span>
                          {previewBannerUrl === preset.url && (
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom URL Input */}
              {bannerInputType === 'url' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Masukkan Link URL Direct Gambar (https://...):
                  </label>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => {
                      setCustomUrlInput(e.target.value);
                      if (e.target.value.trim()) {
                        setPreviewBannerUrl(e.target.value.trim());
                      }
                    }}
                    placeholder="https://domain.com/foto-sekolah.jpg"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-500">
                    Pastikan URL diawali dengan http:// atau https://
                  </p>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <span className="font-extrabold text-slate-800 block text-[11px]">
                  Pratinjau Hasil Banner:
                </span>
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner">
                  <img
                    src={previewBannerUrl}
                    alt="Preview Dashboard Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_BANNER_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-black drop-shadow">
                      {schoolInfo.namaSekolah}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetBanner}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Kembalikan ke gambar awal"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" /> Reset Default
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBanner}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Check className="w-4 h-4" /> Simpan Gambar Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
