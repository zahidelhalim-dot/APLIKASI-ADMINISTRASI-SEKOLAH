import { Student, Teacher } from '../types';

/**
 * Utility to parse CSV line respecting quotes and custom delimiters
 */
export function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Detect delimiter (comma or semicolon) from text header
 */
function detectDelimiter(headerLine: string): string {
  const countSemicolon = (headerLine.match(/;/g) || []).length;
  const countComma = (headerLine.match(/,/g) || []).length;
  return countSemicolon > countComma ? ';' : ',';
}

/**
 * DOWNLOAD TEMPLATE SISWA (CSV with UTF-8 BOM for Excel)
 */
export function downloadStudentTemplate() {
  const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Kelas'];
  const sampleRows = [
    ['1001', '0123456701', 'Ahmad Rizky Pratama', 'L', 'Kelas I'],
    ['1002', '0123456702', 'Siti Nur Aisyah', 'P', 'Kelas I'],
    ['1003', '0123456703', 'Muhammad Fikri', 'L', 'Kelas II'],
    ['1004', '0123456704', 'Zahra Amelia', 'P', 'Kelas III'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((val) => `"${val}"`).join(',')),
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens accents and columns properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Data_Siswa.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * DOWNLOAD TEMPLATE GURU (CSV with UTF-8 BOM for Excel)
 */
export function downloadTeacherTemplate() {
  const headers = [
    'NIP',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Jabatan',
    'Status PTK',
    'Hari Wajib Masuk',
    'Jam Wajib Masuk',
    'Keterangan Jadwal',
  ];
  const sampleRows = [
    [
      '19880101 201501 1 001',
      'Sri Rahayu, S.Pd',
      'P',
      'Guru Kelas',
      'PNS',
      'Senin, Selasa, Rabu, Kamis, Sabtu, Ahad',
      '07:15',
      'Wajib 6 Hari',
    ],
    [
      '19920315 201902 2 002',
      'Nurul Hidayah, S.Pd',
      'P',
      'Guru Kelas',
      'PPPK',
      'Senin, Selasa, Rabu, Kamis, Sabtu, Ahad',
      '07:15',
      'Wajib 6 Hari',
    ],
    [
      '19850610 201001 1 003',
      'M. Zaini, S.Pd.I',
      'L',
      'Guru PAI & BP',
      'PNS',
      'Senin, Selasa, Rabu, Kamis, Sabtu, Ahad',
      '07:15',
      'Wajib 6 Hari',
    ],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((val) => `"${val}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Data_Guru.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * PARSE CSV/JSON FILE TO STUDENT OBJECTS
 */
export function parseStudentsFile(fileContent: string, fileName: string): Student[] {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: item.id || `S_IMP_${Date.now()}_${index}`,
        nis: String(item.nis || ''),
        nisn: String(item.nisn || ''),
        nama: String(item.nama || item.name || 'Tanpa Nama'),
        jenisKelamin: item.jenisKelamin?.toUpperCase().startsWith('P') ? 'P' : 'L',
        kelas: String(item.kelas || 'Kelas I'),
      }));
    }
    return [];
  }

  // Parse CSV
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().trim().replace(/['"]/g, '')
  );

  const nisIdx = headers.findIndex((h) => h.includes('nis') && !h.includes('nisn'));
  const nisnIdx = headers.findIndex((h) => h.includes('nisn'));
  const namaIdx = headers.findIndex((h) => h.includes('nama'));
  const jkIdx = headers.findIndex(
    (h) => h.includes('jenis') || h.includes('kelamin') || h.includes('jk') || h.includes('l/p')
  );
  const kelasIdx = headers.findIndex((h) => h.includes('kelas') || h.includes('kategori'));

  const parsedStudents: Student[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length === 0 || cols.every((c) => c === '')) continue;

    const nis = nisIdx !== -1 ? cols[nisIdx]?.replace(/['"]/g, '') || '' : String(1000 + i);
    const nisn = nisnIdx !== -1 ? cols[nisnIdx]?.replace(/['"]/g, '') || '' : '';
    const nama = namaIdx !== -1 ? cols[namaIdx]?.replace(/['"]/g, '') || '' : '';
    const jkRaw = jkIdx !== -1 ? cols[jkIdx]?.replace(/['"]/g, '').toUpperCase() || 'L' : 'L';
    const kelas = kelasIdx !== -1 ? cols[kelasIdx]?.replace(/['"]/g, '') || 'Kelas I' : 'Kelas I';

    if (nama.trim().length > 0) {
      parsedStudents.push({
        id: `S_IMP_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        nis: nis || String(1000 + i),
        nisn: nisn || `-`,
        nama: nama.trim(),
        jenisKelamin: jkRaw.startsWith('P') || jkRaw.startsWith('W') ? 'P' : 'L',
        kelas: kelas.trim() || 'Kelas I',
      });
    }
  }

  return parsedStudents;
}

/**
 * PARSE CSV/JSON FILE TO TEACHER OBJECTS
 */
export function parseTeachersFile(fileContent: string, fileName: string): Teacher[] {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: item.id || `T_IMP_${Date.now()}_${index}`,
        nip: String(item.nip || '-'),
        nama: String(item.nama || item.name || 'Tanpa Nama'),
        jenisKelamin: item.jenisKelamin?.toUpperCase().startsWith('P') ? 'P' : 'L',
        jabatan: String(item.jabatan || 'Guru Kelas'),
        statusPtk: (item.statusPtk || item.status || 'PNS') as any,
        hariWajib: Array.isArray(item.hariWajib)
          ? item.hariWajib
          : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'],
        jamWajibMasuk: item.jamWajibMasuk || '07:15',
        keteranganJadwal: item.keteranganJadwal || 'Wajib 6 Hari',
      }));
    }
    return [];
  }

  // Parse CSV
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().trim().replace(/['"]/g, '')
  );

  const nipIdx = headers.findIndex((h) => h.includes('nip'));
  const namaIdx = headers.findIndex((h) => h.includes('nama'));
  const jkIdx = headers.findIndex(
    (h) => h.includes('jenis') || h.includes('kelamin') || h.includes('jk') || h.includes('l/p')
  );
  const jabatanIdx = headers.findIndex((h) => h.includes('jabatan'));
  const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('ptk'));
  const hariIdx = headers.findIndex((h) => h.includes('hari'));
  const jamIdx = headers.findIndex((h) => h.includes('jam'));
  const ketIdx = headers.findIndex((h) => h.includes('keterangan') || h.includes('jadwal'));

  const parsedTeachers: Teacher[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length === 0 || cols.every((c) => c === '')) continue;

    const nip = nipIdx !== -1 ? cols[nipIdx]?.replace(/['"]/g, '') || '-' : '-';
    const nama = namaIdx !== -1 ? cols[namaIdx]?.replace(/['"]/g, '') || '' : '';
    const jkRaw = jkIdx !== -1 ? cols[jkIdx]?.replace(/['"]/g, '').toUpperCase() || 'L' : 'L';
    const jabatan = jabatanIdx !== -1 ? cols[jabatanIdx]?.replace(/['"]/g, '') || 'Guru Kelas' : 'Guru Kelas';
    const statusPtk = statusIdx !== -1 ? cols[statusIdx]?.replace(/['"]/g, '') || 'PNS' : 'PNS';
    const hariRaw = hariIdx !== -1 ? cols[hariIdx]?.replace(/['"]/g, '') || '' : '';
    const jamWajibMasuk = jamIdx !== -1 ? cols[jamIdx]?.replace(/['"]/g, '') || '07:15' : '07:15';
    const keteranganJadwal = ketIdx !== -1 ? cols[ketIdx]?.replace(/['"]/g, '') || 'Wajib 6 Hari' : 'Wajib 6 Hari';

    let hariWajib: string[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];
    if (hariRaw.trim().length > 0) {
      const splitDays = hariRaw
        .split(/[,;|]/)
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
      if (splitDays.length > 0) {
        hariWajib = splitDays;
      }
    }

    if (nama.trim().length > 0) {
      parsedTeachers.push({
        id: `T_IMP_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        nip: nip || '-',
        nama: nama.trim(),
        jenisKelamin: jkRaw.startsWith('P') || jkRaw.startsWith('W') ? 'P' : 'L',
        jabatan: jabatan || 'Guru Kelas',
        statusPtk: (statusPtk as any) || 'PNS',
        hariWajib,
        jamWajibMasuk: jamWajibMasuk || '07:15',
        keteranganJadwal: keteranganJadwal || 'Wajib 6 Hari',
      });
    }
  }

  return parsedTeachers;
}

/**
 * EXPORT EXISTING STUDENTS TO CSV
 */
export function exportStudentsToCSV(students: Student[], filename: string = 'Data_Siswa.csv') {
  const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Kelas'];
  const rows = students.map((s) => [s.nis, s.nisn, s.nama, s.jenisKelamin, s.kelas]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * EXPORT EXISTING TEACHERS TO CSV
 */
export function exportTeachersToCSV(teachers: Teacher[], filename: string = 'Data_Guru.csv') {
  const headers = [
    'NIP',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Jabatan',
    'Status PTK',
    'Hari Wajib Masuk',
    'Jam Wajib Masuk',
    'Keterangan Jadwal',
  ];
  const rows = teachers.map((t) => [
    t.nip,
    t.nama,
    t.jenisKelamin,
    t.jabatan,
    t.statusPtk,
    (t.hariWajib || []).join(', '),
    t.jamWajibMasuk || '07:15',
    t.keteranganJadwal || 'Wajib 6 Hari',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
