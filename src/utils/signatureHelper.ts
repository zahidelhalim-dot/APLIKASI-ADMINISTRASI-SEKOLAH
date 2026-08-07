import { SchoolInfo } from '../types';

export interface SignatoryDetails {
  jabatan: string;
  nama: string;
  nip: string;
}

/**
 * Returns the active signatory details based on schoolInfo settings.
 */
export const getSignatoryDetails = (schoolInfo: SchoolInfo): SignatoryDetails => {
  const jabatan = schoolInfo.jabatanPenandatangan?.trim() || 'Kepala Sekolah';
  const nama =
    schoolInfo.namaPenandatanganCustom?.trim() ||
    schoolInfo.namaKepalaSekolah?.trim() ||
    'Kepala Sekolah';
  const nip =
    schoolInfo.nipPenandatanganCustom?.trim() ||
    schoolInfo.nipKepalaSekolah?.trim() ||
    '-';

  return { jabatan, nama, nip };
};

/**
 * Returns formatted place (tempat) based on schoolInfo settings (Realtime vs Custom).
 */
export const getTempatTtd = (schoolInfo: SchoolInfo): string => {
  if (schoolInfo.opsiTempatTtd === 'custom' && schoolInfo.tempatTtdCustom?.trim()) {
    return schoolInfo.tempatTtdCustom.trim();
  }
  return schoolInfo.kabupatenKota || schoolInfo.kelurahan || 'Sekolah';
};

/**
 * Returns formatted Indonesian date string based on schoolInfo settings (Realtime vs Custom).
 */
export const getTanggalTtd = (schoolInfo: SchoolInfo): string => {
  if (schoolInfo.opsiWaktuTtd === 'custom' && schoolInfo.tanggalTtdCustom?.trim()) {
    return schoolInfo.tanggalTtdCustom.trim();
  }

  // Realtime Current Date
  const today = new Date();
  const monthsIndo = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${today.getDate()} ${monthsIndo[today.getMonth()]} ${today.getFullYear()}`;
};

/**
 * Returns combined "Tempat, Tanggal" string (e.g., "KAB. BALANGAN, 7 Agustus 2026").
 */
export const getTempatDanTanggalTtd = (schoolInfo: SchoolInfo): string => {
  const tempat = getTempatTtd(schoolInfo);
  const tanggal = getTanggalTtd(schoolInfo);
  return `${tempat}, ${tanggal}`;
};
