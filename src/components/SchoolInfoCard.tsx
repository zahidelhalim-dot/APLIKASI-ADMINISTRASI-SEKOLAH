import React, { useState } from 'react';
import { SchoolInfo, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { getSignatoryDetails, getTempatDanTanggalTtd } from '../utils/signatureHelper';
import {
  Edit3,
  Check,
  X,
  School,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Upload,
  UserCheck,
  Settings,
  Sparkles,
  School2,
  FileImage,
  KeyRound,
} from 'lucide-react';

interface SchoolInfoCardProps {
  schoolInfo: SchoolInfo;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  classicTheme: boolean;
  currentUser?: UserAccount | null;
  onOpenLogin?: () => void;
}

const DASHBOARD_PRESET_IMAGES = [
  {
    title: 'Gedung Sekolah Dasar',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Ruang Kelas Modern',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Halaman & Lapangan',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Perpustakaan Sekolah',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({
  schoolInfo,
  onUpdateSchoolInfo,
  classicTheme,
  currentUser,
  onOpenLogin,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'identitas' | 'pengguna' | 'gambar'>('identitas');
  const [formData, setFormData] = useState<SchoolInfo>(schoolInfo);
  const [newYearInput, setNewYearInput] = useState('');
  const [showAddYearInput, setShowAddYearInput] = useState(false);

  const handleAddYear = () => {
    if (!newYearInput.trim()) return;
    const currentList = formData.daftarTahunPelajaran || ['2023 / 2024', '2024 / 2025', '2025 / 2026', '2026 / 2027', '2027 / 2028'];
    const formatted = newYearInput.trim();
    if (!currentList.includes(formatted)) {
      const updatedList = [...currentList, formatted];
      setFormData((prev) => ({
        ...prev,
        tahunPelajaran: formatted,
        daftarTahunPelajaran: updatedList,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tahunPelajaran: formatted,
      }));
    }
    setNewYearInput('');
    setShowAddYearInput(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(formData);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logoUrl' | 'dashboardBannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [targetField]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      id="school-info-card"
      className={`relative rounded-xl border-4 shadow-xl transition-all overflow-hidden ${
        classicTheme
          ? 'border-[#338148] bg-amber-100/95 text-amber-950 font-sans shadow-amber-900/20'
          : 'border-emerald-600 bg-white text-slate-800 shadow-slate-200'
      }`}
    >
      {/* Dashboard Banner Image Display Header */}
      {schoolInfo.dashboardBannerUrl && (
        <div className="relative h-28 sm:h-36 w-full overflow-hidden border-b-2 border-amber-300">
          <img
            src={schoolInfo.dashboardBannerUrl}
            alt="Header Dashboard Sekolah"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
            <div className="flex items-center gap-3 text-white">
              {schoolInfo.logoUrl ? (
                <img
                  src={schoolInfo.logoUrl}
                  alt="Logo Sekolah"
                  className="w-12 h-12 rounded-lg bg-white p-1 border-2 border-amber-300 shadow-md object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black border border-white shadow">
                  <School className="w-6 h-6 text-emerald-950" />
                </div>
              )}
              <div>
                <h3 className="font-black text-sm sm:text-base text-amber-200 tracking-wide uppercase drop-shadow">
                  {schoolInfo.namaSekolah}
                </h3>
                <p className="text-[11px] text-slate-200 font-semibold drop-shadow line-clamp-1">
                  {schoolInfo.alamat}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData(schoolInfo);
              setActiveTab('gambar');
              setIsEditing(true);
            }}
            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-400/50 flex items-center gap-1 shadow"
          >
            <ImageIcon className="w-3 h-3" /> Ganti Gambar
          </button>
        </div>
      )}

      {/* Card Header Bar */}
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2 border-amber-300/60 dark:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-700 text-white rounded-lg shadow-sm shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-950 dark:text-emerald-900">
                PERATURAN IDENTITAS SEKOLAH & PENGGUNA APLIKASI
              </h2>
              <p className="text-[11px] font-bold text-emerald-800">
                Pengaturan Profil Sekolah, Hak Akses Pengguna & Gambar Dasbor
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFormData(schoolInfo);
              setActiveTab('identitas');
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-emerald-950 bg-amber-300 hover:bg-amber-400 border border-amber-500 rounded-md shadow transition-all shrink-0"
            title="Edit Peraturan Identitas & Pengguna"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Data</span>
          </button>
        </div>

        {/* Info Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {/* Column 1: School Identity */}
          <div className="space-y-1.5">
            <div className="bg-amber-50/90 p-2 rounded border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase block border-b border-amber-200 pb-0.5">
                IDENTITAS SEKOLAH
              </span>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">NAMA SEKOLAH</span>
                <span className="col-span-2 font-black text-emerald-950 uppercase">
                  : {schoolInfo.namaSekolah}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">NPSN</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">
                  : {schoolInfo.npsn}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">ALAMAT</span>
                <span className="col-span-2 font-semibold text-slate-900 truncate">
                  : {schoolInfo.alamat}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">KEC / KAB / PROV</span>
                <span className="col-span-2 font-semibold text-slate-900 truncate">
                  : {schoolInfo.kecamatan ? `Kec. ${schoolInfo.kecamatan}, ` : ''}{schoolInfo.kabupatenKota}{schoolInfo.provinsi ? `, ${schoolInfo.provinsi}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">MOTTO SEKOLAH</span>
                <span className="col-span-2 font-bold text-emerald-950 uppercase truncate">
                  : {schoolInfo.mottoSekolah || 'BERAKHLAK MULIA, CERDAS & BERPRESTASI'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">BERLAKU KARTU</span>
                <span className="col-span-2 font-semibold text-slate-900 truncate">
                  : Siswa ({schoolInfo.masaBerlakuSiswa || 'selama menjadi siswa/i'}) | Guru ({schoolInfo.masaBerlakuGuru || 'selama menjadi PTK'})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">SEMESTER / THN</span>
                <span className="col-span-2 font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  : {schoolInfo.semester} (
                  <select
                    value={schoolInfo.tahunPelajaran}
                    onChange={(e) => {
                      onUpdateSchoolInfo({
                        ...schoolInfo,
                        tahunPelajaran: e.target.value,
                      });
                    }}
                    className="bg-amber-200/80 hover:bg-amber-300 text-emerald-950 font-black px-2 py-0.5 rounded border border-amber-400 cursor-pointer text-xs"
                    title="Ganti Tahun Pelajaran Aktif"
                  >
                    {(schoolInfo.daftarTahunPelajaran || ['2023 / 2024', '2024 / 2025', '2025 / 2026', '2026 / 2027', '2027 / 2028']).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  )
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Signatures & User Rules */}
          <div className="space-y-1.5">
            <div className="bg-emerald-100/90 p-2 rounded border border-emerald-300/80 space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-950 uppercase block border-b border-emerald-300 pb-0.5 flex items-center justify-between">
                <span>PENANDATANGAN & DOKUMEN</span>
                <span className="text-[9px] font-mono text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                  {schoolInfo.opsiWaktuTtd === 'custom' || schoolInfo.opsiTempatTtd === 'custom' ? 'KUSTOM' : 'REALTIME'}
                </span>
              </span>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-emerald-900 uppercase">{getSignatoryDetails(schoolInfo).jabatan}</span>
                <span className="col-span-2 font-black text-emerald-950 uppercase">
                  : {getSignatoryDetails(schoolInfo).nama}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-emerald-900">NIP PENANDATANGAN</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">
                  : {getSignatoryDetails(schoolInfo).nip}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-bold text-slate-700">WAKTU & TEMPAT TTD</span>
                <span className="col-span-2 font-bold text-amber-900 uppercase">
                  : {getTempatDanTanggalTtd(schoolInfo)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-0.5 border-t border-emerald-200/60">
                <span className="font-bold text-slate-700">GURU / WALI KELAS</span>
                <span className="col-span-2 font-bold text-slate-900 uppercase">
                  : {schoolInfo.namaGuruKelas} ({schoolInfo.nipGuruKelas || '-'})
                </span>
              </div>
            </div>

            {/* Quick Active User Status Box */}
            <div className="bg-slate-900 text-white p-2 rounded border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] font-bold text-slate-300 block">PENGGUNA AKTIF:</span>
                  <span className="font-extrabold text-amber-200 text-[11px]">
                    {currentUser ? `${currentUser.name} (${currentUser.role === 'admin' ? 'ADMIN' : currentUser.assignedKelas})` : 'Belum Login'}
                  </span>
                </div>
              </div>
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black rounded transition-all shadow"
                >
                  Kelola Akun
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Settings (Identitas, Pengguna & Gambar) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-700 animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    PENGATURAN IDENTITAS SEKOLAH & PENGGUNA APLIKASI
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    Ubah Peraturan Identitas, Pengguna (User/Wali Kelas) & Tampilan Gambar Dasbor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switches */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('identitas')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'identitas'
                    ? 'bg-white border-b-2 border-emerald-700 text-emerald-950 font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <School className="w-4 h-4 text-emerald-700" />
                <span>Identitas Sekolah</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pengguna')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'pengguna'
                    ? 'bg-white border-b-2 border-emerald-700 text-emerald-950 font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-blue-700" />
                <span>Pengguna Aplikasi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gambar')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'gambar'
                    ? 'bg-white border-b-2 border-emerald-700 text-emerald-950 font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <span>Setting Gambar Dasbor</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* TAB 1: IDENTITAS SEKOLAH */}
              {activeTab === 'identitas' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Sekolah</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
                        value={formData.namaSekolah}
                        onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NPSN</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                        value={formData.npsn}
                        onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Alamat Sekolah</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Motto Sekolah</label>
                      <input
                        type="text"
                        placeholder="Contoh: BERAKHLAK MULIA, CERDAS & BERPRESTASI"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                        value={formData.mottoSekolah || ''}
                        onChange={(e) => setFormData({ ...formData, mottoSekolah: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Masa Berlaku Kartu Siswa</label>
                      <input
                        type="text"
                        placeholder="Contoh: selama menjadi siswa/i"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                        value={formData.masaBerlakuSiswa || ''}
                        onChange={(e) => setFormData({ ...formData, masaBerlakuSiswa: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Masa Berlaku Kartu Guru/PTK</label>
                      <input
                        type="text"
                        placeholder="Contoh: selama menjadi PTK"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                        value={formData.masaBerlakuGuru || ''}
                        onChange={(e) => setFormData({ ...formData, masaBerlakuGuru: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kelurahan / Desa</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        value={formData.kelurahan}
                        onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        value={formData.kecamatan}
                        onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                        value={formData.kabupatenKota}
                        onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        value={formData.provinsi}
                        onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Semester</label>
                      <select
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      >
                        <option value="I (SATU)">I (SATU)</option>
                        <option value="II (DUA)">II (DUA)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">Tahun Pelajaran</label>
                        <button
                          type="button"
                          onClick={() => setShowAddYearInput(!showAddYearInput)}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                        >
                          {showAddYearInput ? 'Batal' : '+ Tambah Tahun'}
                        </button>
                      </div>

                      {showAddYearInput ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="e.g. 2026 / 2027"
                            className="flex-1 p-2 border rounded-lg border-emerald-400 font-bold text-xs"
                            value={newYearInput}
                            onChange={(e) => setNewYearInput(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleAddYear}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                          >
                            Tambah
                          </button>
                        </div>
                      ) : (
                        <select
                          className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                          value={formData.tahunPelajaran}
                          onChange={(e) => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                        >
                          {(formData.daftarTahunPelajaran || ['2023 / 2024', '2024 / 2025', '2025 / 2026', '2026 / 2027', '2027 / 2028']).map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 font-extrabold text-emerald-900 uppercase text-xs flex items-center justify-between">
                    <span>Pengaturan Penanda Tangan, Waktu & Tempat TTD</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded border border-amber-300">
                      Berlaku untuk Laporan, Cetak Kartu & Ekspor
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">
                        Jabatan Penandatangan Utama
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {['Kepala Sekolah', 'Plt. Kepala Sekolah', 'Plh. Kepala Sekolah', 'Wali Kelas', 'Ketua Panitia'].map((j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setFormData({ ...formData, jabatanPenandatangan: j })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              (formData.jabatanPenandatangan || 'Kepala Sekolah') === j
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {j}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Atau ketik jabatan kustom..."
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                        value={formData.jabatanPenandatangan || 'Kepala Sekolah'}
                        onChange={(e) => setFormData({ ...formData, jabatanPenandatangan: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Pejabat / Kepala Sekolah</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                        value={formData.namaKepalaSekolah}
                        onChange={(e) => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NIP Pejabat / Kepala Sekolah</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                        value={formData.nipKepalaSekolah}
                        onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                      />
                    </div>

                    {/* Opsi Tempat TTD */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        OPSI TEMPAT TTD:
                      </label>
                      <div className="flex items-center gap-3 mb-1.5 text-xs font-bold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="opsiTempatTtd"
                            checked={(formData.opsiTempatTtd || 'realtime') === 'realtime'}
                            onChange={() => setFormData({ ...formData, opsiTempatTtd: 'realtime' })}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className="text-emerald-950">Realtime (Kota Sekolah)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="opsiTempatTtd"
                            checked={formData.opsiTempatTtd === 'custom'}
                            onChange={() => setFormData({ ...formData, opsiTempatTtd: 'custom' })}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className="text-purple-950">Sesuaikan (Kustom)</span>
                        </label>
                      </div>
                      {formData.opsiTempatTtd === 'custom' && (
                        <input
                          type="text"
                          placeholder="Masukkan nama tempat (misal: Pangkalan Bun)"
                          className="w-full p-1.5 border rounded border-purple-300 bg-purple-50/50 font-bold text-xs"
                          value={formData.tempatTtdCustom || ''}
                          onChange={(e) => setFormData({ ...formData, tempatTtdCustom: e.target.value })}
                        />
                      )}
                    </div>

                    {/* Opsi Waktu TTD */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        OPSI WAKTU / TANGGAL TTD:
                      </label>
                      <div className="flex items-center gap-3 mb-1.5 text-xs font-bold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="opsiWaktuTtd"
                            checked={(formData.opsiWaktuTtd || 'realtime') === 'realtime'}
                            onChange={() => setFormData({ ...formData, opsiWaktuTtd: 'realtime' })}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className="text-emerald-950">Realtime (Tgl Hari Ini)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="opsiWaktuTtd"
                            checked={formData.opsiWaktuTtd === 'custom'}
                            onChange={() => setFormData({ ...formData, opsiWaktuTtd: 'custom' })}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className="text-purple-950">Sesuaikan (Kustom)</span>
                        </label>
                      </div>
                      {formData.opsiWaktuTtd === 'custom' && (
                        <input
                          type="text"
                          placeholder="Masukkan tanggal (misal: 17 Agustus 2026)"
                          className="w-full p-1.5 border rounded border-purple-300 bg-purple-50/50 font-bold text-xs"
                          value={formData.tanggalTtdCustom || ''}
                          onChange={(e) => setFormData({ ...formData, tanggalTtdCustom: e.target.value })}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Guru / Wali Kelas</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                        value={formData.namaGuruKelas}
                        onChange={(e) => setFormData({ ...formData, namaGuruKelas: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NIP Guru / Wali Kelas</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                        value={formData.nipGuruKelas}
                        onChange={(e) => setFormData({ ...formData, nipGuruKelas: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PENGGUNA APLIKASI */}
              {activeTab === 'pengguna' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1 text-slate-800">
                    <h4 className="font-black text-blue-950 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" /> PERATURAN HAK AKSES PENGGUNA (ROLE PRIVILEGES)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Sistem mendukung 2 jenis role pengguna: <strong>Administrator (Kepala Sekolah)</strong> dan <strong>Wali Kelas (Kelas I s/d VI)</strong>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-extrabold text-slate-800 uppercase block text-xs">
                      Daftar Akun Pengguna Terdaftar Dalam Sistem:
                    </span>

                    <div className="divide-y border rounded-xl overflow-hidden bg-white">
                      {INITIAL_USERS.map((user) => (
                        <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${
                              user.role === 'admin' ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}>
                              {user.role === 'admin' ? 'A' : 'WK'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{user.name}</span>
                                <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                                  user.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {user.role === 'admin' ? 'Administrator' : user.assignedKelas}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Username: <strong>{user.username}</strong> | Pass Default: <strong>123456 / admin123</strong>
                              </span>
                            </div>
                          </div>

                          {onOpenLogin && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                onOpenLogin();
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] rounded flex items-center gap-1 shadow-xs"
                            >
                              <KeyRound className="w-3 h-3 text-amber-400" /> Switch Login
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTING GAMBAR DASBOR */}
              {activeTab === 'gambar' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                    <h4 className="font-black text-amber-950 uppercase flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-700" /> ATUR GAMBAR HEADER & LOGO DASHBOARD
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Upload foto gedung sekolah Anda, gunakan gambar dari internet (URL), atau pilih galeri instan di bawah ini.
                    </p>
                  </div>

                  {/* Header Banner Settings */}
                  <div className="space-y-2 border p-3 rounded-xl bg-slate-50">
                    <label className="block font-black text-slate-800 uppercase text-xs">
                      Gambar Hero / Banner Dasbor (Tampilan Atas)
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan URL Gambar (https://...)"
                        className="flex-1 p-2 border rounded-lg border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                        value={formData.dashboardBannerUrl || ''}
                        onChange={(e) => setFormData({ ...formData, dashboardBannerUrl: e.target.value })}
                      />
                      <label className="cursor-pointer px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shrink-0">
                        <Upload className="w-4 h-4" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'dashboardBannerUrl')}
                        />
                      </label>
                    </div>

                    {/* Preset Banner Images */}
                    <div className="pt-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">
                        Pilihan Gambar Instan (Klik Untuk Menggunakan):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {DASHBOARD_PRESET_IMAGES.map((preset, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setFormData({ ...formData, dashboardBannerUrl: preset.url })}
                            className={`relative rounded-lg overflow-hidden border-2 text-left group transition-all h-20 ${
                              formData.dashboardBannerUrl === preset.url
                                ? 'border-emerald-600 ring-2 ring-emerald-400'
                                : 'border-slate-300 hover:border-emerald-500'
                            }`}
                          >
                            <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/50 p-1.5 flex items-end">
                              <span className="text-[9px] font-bold text-white leading-tight">
                                {preset.title}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* School Logo Settings */}
                  <div className="space-y-2 border p-3 rounded-xl bg-slate-50">
                    <label className="block font-black text-slate-800 uppercase text-xs">
                      Logo Sekolah / Logo Yayasan
                    </label>

                    <div className="flex items-center gap-3">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-300 object-contain shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                          No Logo
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          placeholder="URL Logo (https://...)"
                          className="w-full p-2 border rounded-lg border-slate-300 font-mono text-xs"
                          value={formData.logoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                      </div>

                      <label className="cursor-pointer px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1 shrink-0">
                        <Upload className="w-4 h-4" /> Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Bottom Action Bar */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
