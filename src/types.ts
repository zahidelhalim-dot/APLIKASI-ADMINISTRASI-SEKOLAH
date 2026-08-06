export type AttendanceStatus = 'H' | 'S' | 'I' | 'A' | 'TL'; // Hadir, Sakit, Izin, Alpa, Tugas Luar

export interface SchoolInfo {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kelas: string;
  semester: string; // '1 (SATU)' | '2 (DUA)'
  tahunPelajaran: string; // e.g. '2024 / 2025'
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuruKelas: string;
  nipGuruKelas: string;
  logoUrl?: string;
  dashboardBannerUrl?: string;
}

export interface ClassCategory {
  id: string;
  namaKelas: string; // e.g. "Kelas I", "Kelas II", "Kelas III", "Kelas IV", "Kelas V", "Kelas VI"
  waliKelasId: string; // Teacher ID
  keterangan?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  fotoUrl?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  jabatan: string; // e.g. "Guru Kelas IV A", "Guru Agama", "Kepala Sekolah"
  statusPtk: 'PNS' | 'PPPK' | 'GTT' | 'Honor';
  hariWajib?: string[]; // e.g. ['Senin', 'Rabu'] or ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  jamWajibMasuk?: string; // e.g. '07:15'
  keteranganJadwal?: string; // e.g. '2 Hari / Minggu'
  fotoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  targetType: 'siswa' | 'guru';
  targetId: string; // student id or teacher id
  status: AttendanceStatus;
  keterangan?: string;
  jamMasuk?: string; // for teachers
}

export interface MonthlyStats {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  tugasLuar: number;
  totalHari: number;
  persentase: number;
}

export type ViewMode = 
  | 'dashboard'
  | 'absen_siswa'
  | 'absen_guru'
  | 'kartu_siswa'
  | 'data_siswa'
  | 'data_guru'
  | 'kategori_kelas'
  | 'rekap'
  | 'grafik'
  | 'kalender'
  | 'laporan';

export type UserRole = 'admin' | 'walikelas' | 'guru';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  assignedKelas?: string; // e.g., "Kelas IV" or "SEMUA" for admin
  teacherId?: string; // Links to teacher ID if wali kelas
}

export interface MonthOption {
  key: string;
  label: string;
  monthIndex: number; // 0-11
}
