import { SchoolInfo, Student, Teacher, AttendanceRecord, ClassCategory, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'U0',
    username: 'admin',
    name: 'Administrator Kepala Sekolah',
    role: 'admin',
    assignedKelas: 'SEMUA',
  },
  {
    id: 'U1',
    username: 'walikelas1',
    name: 'Sri Rahayu, S.Pd (Wali Kelas I)',
    role: 'walikelas',
    assignedKelas: 'Kelas I',
    teacherId: 'T3',
  },
  {
    id: 'U2',
    username: 'walikelas2',
    name: 'Nurul Hidayah, S.Pd (Wali Kelas II)',
    role: 'walikelas',
    assignedKelas: 'Kelas II',
    teacherId: 'T4',
  },
  {
    id: 'U3',
    username: 'walikelas3',
    name: 'Heri Kurniawan, S.Pd (Wali Kelas III)',
    role: 'walikelas',
    assignedKelas: 'Kelas III',
    teacherId: 'T5',
  },
  {
    id: 'U4',
    username: 'walikelas4',
    name: 'Ahmad Saihani, S.Pd.SD (Wali Kelas IV)',
    role: 'walikelas',
    assignedKelas: 'Kelas IV',
    teacherId: 'T2',
  },
  {
    id: 'U5',
    username: 'walikelas5',
    name: 'Marlina, S.Pd (Wali Kelas V)',
    role: 'walikelas',
    assignedKelas: 'Kelas V',
    teacherId: 'T6',
  },
  {
    id: 'U6',
    username: 'walikelas6',
    name: 'Bambang Hermanto, S.Pd (Wali Kelas VI)',
    role: 'walikelas',
    assignedKelas: 'Kelas VI',
    teacherId: 'T7',
  },
  {
    id: 'U7',
    username: 'gurupai',
    name: 'M. Zaini, S.Pd.I (Guru PAI & BP)',
    role: 'guru',
    assignedKelas: 'SEMUA',
    teacherId: 'T8',
  },
  {
    id: 'U8',
    username: 'gurupjok',
    name: 'Rizky Pratama, S.Pd (Guru PJOK)',
    role: 'guru',
    assignedKelas: 'SEMUA',
    teacherId: 'T9',
  },
];

export const DEFAULT_PASSWORDS: { [username: string]: string } = {
  admin: 'admin123',
  walikelas1: '123456',
  walikelas2: '123456',
  walikelas3: '123456',
  walikelas4: '123456',
  walikelas5: '123456',
  walikelas6: '123456',
  gurupai: '123456',
  gurupjok: '123456',
};

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  namaSekolah: 'MADRASAH DINIYAH ALHUSAINI PUNGGUR BESAR',
  npsn: '30302145',
  alamat: 'JL. BHAYANGKARA KOMP. PENDIDIKAN TERPADU',
  kelurahan: 'BATU PIRING',
  kecamatan: 'PARINGIN SELATAN',
  kabupatenKota: 'KAB. BALANGAN',
  provinsi: 'KALIMANTAN SELATAN',
  kelas: 'IV (EMPAT)',
  semester: 'I (SATU)',
  tahunPelajaran: '2024 / 2025',
  namaKepalaSekolah: 'MUHAMMAD SURIADIE, S.Pd',
  nipKepalaSekolah: '19780512 200312 1 002',
  namaGuruKelas: 'AHMAD SAIHANI, S.Pd.SD',
  nipGuruKelas: '19820415 200801 1 005',
  logoUrl: '',
  dashboardBannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
};

export const INITIAL_CLASSES: ClassCategory[] = [
  { id: 'C1', namaKelas: 'Kelas I', waliKelasId: 'T3', keterangan: 'Kelas 1 Sekolah Dasar (Wali: Sri Rahayu, S.Pd)' },
  { id: 'C2', namaKelas: 'Kelas II', waliKelasId: 'T4', keterangan: 'Kelas 2 Sekolah Dasar (Wali: Nurul Hidayah, S.Pd)' },
  { id: 'C3', namaKelas: 'Kelas III', waliKelasId: 'T5', keterangan: 'Kelas 3 Sekolah Dasar (Wali: Heri Kurniawan, S.Pd)' },
  { id: 'C4', namaKelas: 'Kelas IV', waliKelasId: 'T2', keterangan: 'Kelas 4 Sekolah Dasar (Wali: Ahmad Saihani, S.Pd.SD)' },
  { id: 'C5', namaKelas: 'Kelas V', waliKelasId: 'T6', keterangan: 'Kelas 5 Sekolah Dasar (Wali: Marlina, S.Pd)' },
  { id: 'C6', namaKelas: 'Kelas VI', waliKelasId: 'T7', keterangan: 'Kelas 6 Sekolah Dasar (Wali: Bambang Hermanto, S.Pd)' },
];

export const INITIAL_STUDENTS: Student[] = [
  // Kelas I
  { id: 'S1', nis: '1001', nisn: '0123456701', nama: 'ACHMAD FADILLAH', jenisKelamin: 'L', kelas: 'Kelas I' },
  { id: 'S2', nis: '1002', nisn: '0123456702', nama: 'AULIA RAHMAH', jenisKelamin: 'P', kelas: 'Kelas I' },
  { id: 'S3', nis: '1003', nisn: '0123456703', nama: 'BAYU PRASETYO', jenisKelamin: 'L', kelas: 'Kelas I' },
  { id: 'S4', nis: '1004', nisn: '0123456704', nama: 'CINTA LAURA SAFITRI', jenisKelamin: 'P', kelas: 'Kelas I' },
  { id: 'S5', nis: '1005', nisn: '0123456705', nama: 'DICKY KURNIAWAN', jenisKelamin: 'L', kelas: 'Kelas I' },

  // Kelas II
  { id: 'S6', nis: '1006', nisn: '0123456706', nama: 'ELSA NUR HASANAH', jenisKelamin: 'P', kelas: 'Kelas II' },
  { id: 'S7', nis: '1007', nisn: '0123456707', nama: 'FAHRUL ROZI', jenisKelamin: 'L', kelas: 'Kelas II' },
  { id: 'S8', nis: '1008', nisn: '0123456708', nama: 'GILANG RAMADHAN', jenisKelamin: 'L', kelas: 'Kelas II' },
  { id: 'S9', nis: '1009', nisn: '0123456709', nama: 'INDRA WIJAYA', jenisKelamin: 'L', kelas: 'Kelas II' },
  { id: 'S10', nis: '1010', nisn: '0123456710', nama: 'KHAIRUNNISA', jenisKelamin: 'P', kelas: 'Kelas II' },

  // Kelas III
  { id: 'S11', nis: '1011', nisn: '0123456711', nama: 'M. ADITYA PRATAMA', jenisKelamin: 'L', kelas: 'Kelas III' },
  { id: 'S12', nis: '1012', nisn: '0123456712', nama: 'MAULIDA AZZAHRA', jenisKelamin: 'P', kelas: 'Kelas III' },
  { id: 'S13', nis: '1013', nisn: '0123456713', nama: 'NABILA CHAIRUNNISA', jenisKelamin: 'P', kelas: 'Kelas III' },
  { id: 'S14', nis: '1014', nisn: '0123456714', nama: 'OKTAVIA RAMADHANI', jenisKelamin: 'P', kelas: 'Kelas III' },
  { id: 'S15', nis: '1015', nisn: '0123456715', nama: 'PUTRA HIDAYAT', jenisKelamin: 'L', kelas: 'Kelas III' },

  // Kelas IV
  { id: 'S16', nis: '1016', nisn: '0123456716', nama: 'RAHMAD HIDAYATULLAH', jenisKelamin: 'L', kelas: 'Kelas IV' },
  { id: 'S17', nis: '1017', nisn: '0123456717', nama: 'SITI MAIMUNAH', jenisKelamin: 'P', kelas: 'Kelas IV' },
  { id: 'S18', nis: '1018', nisn: '0123456718', nama: 'TRI WAHYUNI', jenisKelamin: 'P', kelas: 'Kelas IV' },
  { id: 'S19', nis: '1019', nisn: '0123456719', nama: 'YUSUF ALVIN', jenisKelamin: 'L', kelas: 'Kelas IV' },
  { id: 'S20', nis: '1020', nisn: '0123456720', nama: 'ZAHRA AMALIA', jenisKelamin: 'P', kelas: 'Kelas IV' },

  // Kelas V
  { id: 'S21', nis: '1021', nisn: '0123456721', nama: 'AHMAD MAULANA', jenisKelamin: 'L', kelas: 'Kelas V' },
  { id: 'S22', nis: '1022', nisn: '0123456722', nama: 'BELLA SAFITRI', jenisKelamin: 'P', kelas: 'Kelas V' },
  { id: 'S23', nis: '1023', nisn: '0123456723', nama: 'CHANDRA WIJAYA', jenisKelamin: 'L', kelas: 'Kelas V' },
  { id: 'S24', nis: '1024', nisn: '0123456724', nama: 'DEWI LESTARI', jenisKelamin: 'P', kelas: 'Kelas V' },
  { id: 'S25', nis: '1025', nisn: '0123456725', nama: 'EKO PRASETYO', jenisKelamin: 'L', kelas: 'Kelas V' },

  // Kelas VI
  { id: 'S26', nis: '1026', nisn: '0123456726', nama: 'FADIL MUHAMMAD', jenisKelamin: 'L', kelas: 'Kelas VI' },
  { id: 'S27', nis: '1027', nisn: '0123456727', nama: 'GITA GUTAMA', jenisKelamin: 'P', kelas: 'Kelas VI' },
  { id: 'S28', nis: '1028', nisn: '0123456728', nama: 'HADI SAPUTRA', jenisKelamin: 'L', kelas: 'Kelas VI' },
  { id: 'S29', nis: '1029', nisn: '0123456729', nama: 'INTAN PERMATA', jenisKelamin: 'P', kelas: 'Kelas VI' },
  { id: 'S30', nis: '1030', nisn: '0123456730', nama: 'JOKO SUSILO', jenisKelamin: 'L', kelas: 'Kelas VI' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 'T1', nip: '19780512 200312 1 002', nama: 'MUHAMMAD SURIADIE, S.Pd', jenisKelamin: 'L', jabatan: 'Kepala Sekolah', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T2', nip: '19820415 200801 1 005', nama: 'AHMAD SAIHANI, S.Pd.SD', jenisKelamin: 'L', jabatan: 'Guru Kelas IV', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T3', nip: '19850110 201001 2 012', nama: 'SRI RAHAYU, S.Pd', jenisKelamin: 'P', jabatan: 'Guru Kelas I', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T4', nip: '19890322 201402 2 008', nama: 'NURUL HIDAYAH, S.Pd', jenisKelamin: 'P', jabatan: 'Guru Kelas II', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T5', nip: '19900718 201903 1 004', nama: 'HERI KURNIAWAN, S.Pd', jenisKelamin: 'L', jabatan: 'Guru Kelas III', statusPtk: 'PPPK', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T6', nip: '19871105 201101 2 015', nama: 'MARLINA, S.Pd', jenisKelamin: 'P', jabatan: 'Guru Kelas V', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T7', nip: '19830814 200902 1 003', nama: 'BAMBANG HERMANTO, S.Pd', jenisKelamin: 'L', jabatan: 'Guru Kelas VI', statusPtk: 'PNS', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'], jamWajibMasuk: '07:15', keteranganJadwal: 'Wajib 6 Hari' },
  { id: 'T8', nip: '19920501 202012 1 009', nama: 'M. ZAINI, S.Pd.I', jenisKelamin: 'L', jabatan: 'Guru PAI & BP', statusPtk: 'PPPK', hariWajib: ['Senin', 'Rabu', 'Ahad'], jamWajibMasuk: '07:30', keteranganJadwal: 'Wajib 3 Hari (Senin, Rabu, Ahad)' },
  { id: 'T9', nip: '19950912 202203 1 001', nama: 'RIZKY PRATAMA, S.Pd', jenisKelamin: 'L', jabatan: 'Guru PJOK', statusPtk: 'GTT', hariWajib: ['Selasa', 'Kamis'], jamWajibMasuk: '07:30', keteranganJadwal: 'Wajib 2 Hari (Selasa, Kamis)' },
  { id: 'T10', nip: '-', nama: 'DEWI ANGGRAENI, S.Kom', jenisKelamin: 'P', jabatan: 'Tenaga Perpustakaan / Admin', statusPtk: 'Honor', hariWajib: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Ahad'], jamWajibMasuk: '07:30', keteranganJadwal: 'Wajib 5 Hari (Senin - Kamis & Ahad)' },
];

export const MONTH_LIST = [
  { key: 'juli', label: 'JULI', monthIndex: 6 },
  { key: 'agustus', label: 'AGUSTUS', monthIndex: 7 },
  { key: 'september', label: 'SEPTEMBER', monthIndex: 8 },
  { key: 'oktober', label: 'OKTOBER', monthIndex: 9 },
  { key: 'november', label: 'NOVEMBER', monthIndex: 10 },
  { key: 'desember', label: 'DESEMBER', monthIndex: 11 },
  { key: 'januari', label: 'JANUARI', monthIndex: 0 },
  { key: 'februari', label: 'FEBRUARI', monthIndex: 1 },
  { key: 'maret', label: 'MARET', monthIndex: 2 },
  { key: 'april', label: 'APRIL', monthIndex: 3 },
  { key: 'mei', label: 'MEI', monthIndex: 4 },
  { key: 'juni', label: 'JUNI', monthIndex: 5 },
];

// Helper to generate seed attendance records for students and teachers across recent work days
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const year = 2024;
  
  // Months: July (6), August (7), September (8), October (9), November (10)
  const sampleMonths = [6, 7, 8, 9, 10];

  sampleMonths.forEach((mIdx) => {
    // Pick 8 representative days in each month
    const days = [2, 5, 8, 12, 15, 19, 22, 26];
    days.forEach((d) => {
      const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Student attendance seed
      INITIAL_STUDENTS.forEach((student, index) => {
        let status: 'H' | 'S' | 'I' | 'A' = 'H';
        let ket = '';

        const rand = (index + d + mIdx) % 25;
        if (rand === 3) {
          status = 'S';
          ket = 'Demam';
        } else if (rand === 7) {
          status = 'I';
          ket = 'Acara Keluarga';
        } else if (rand === 19) {
          status = 'A';
          ket = 'Tanpa Keterangan';
        }

        records.push({
          id: `att_std_${student.id}_${dateStr}`,
          date: dateStr,
          targetType: 'siswa',
          targetId: student.id,
          status,
          keterangan: ket,
        });
      });

      // Teacher attendance seed
      INITIAL_TEACHERS.forEach((teacher, tIdx) => {
        let status: 'H' | 'S' | 'I' | 'A' | 'TL' = 'H';
        let ket = '';
        let jamMasuk = '07:15';

        const rand = (tIdx * 3 + d + mIdx) % 30;
        if (rand === 5) {
          status = 'S';
          ket = 'Sakit Kepala';
          jamMasuk = '-';
        } else if (rand === 12) {
          status = 'I';
          ket = 'Urusan Dinas / Undangan';
          jamMasuk = '-';
        } else if (rand === 18) {
          status = 'TL';
          ket = 'Pendampingan Lomba';
          jamMasuk = '08:00';
        }

        records.push({
          id: `att_tch_${teacher.id}_${dateStr}`,
          date: dateStr,
          targetType: 'guru',
          targetId: teacher.id,
          status,
          keterangan: ket,
          jamMasuk,
        });
      });
    });
  });

  return records;
}
