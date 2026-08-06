import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolInfo, Student, Teacher, AttendanceRecord } from '../types';

interface PDFExportOptions {
  schoolInfo: SchoolInfo;
  title: string;
  subtitle: string;
  targetType: 'siswa' | 'guru';
  students?: Student[];
  teachers?: Teacher[];
  attendanceRecords: AttendanceRecord[];
  monthLabel?: string;
  periodLabel?: string;
}

export function exportIndividualPDF({
  schoolInfo,
  title,
  subtitle,
  targetType,
  person,
  attendanceRecords,
  periodLabel = 'Bulan / Semester Berjalan',
}: {
  schoolInfo: SchoolInfo;
  title: string;
  subtitle: string;
  targetType: 'siswa' | 'guru';
  person: {
    id: string;
    nama: string;
    nisOrNip: string;
    nisn?: string;
    jenisKelamin: 'L' | 'P';
    kelasOrJabatan: string;
  };
  attendanceRecords: AttendanceRecord[];
  periodLabel?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Kop Surat Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('YAYASAN AL-HUSAINI', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(15);
  doc.text(schoolInfo.namaSekolah.toUpperCase(), pageWidth / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `${schoolInfo.alamat}, ${schoolInfo.kelurahan}, ${schoolInfo.kecamatan}, ${schoolInfo.kabupatenKota}`,
    pageWidth / 2,
    23,
    { align: 'center' }
  );
  doc.text(
    `NPSN: ${schoolInfo.npsn} | Email: info@${schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
    pageWidth / 2,
    27,
    { align: 'center' }
  );

  // Divider Line
  doc.setLineWidth(0.8);
  doc.line(14, 30, pageWidth - 14, 30);
  doc.setLineWidth(0.2);
  doc.line(14, 31, pageWidth - 14, 31);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), pageWidth / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(subtitle, pageWidth / 2, 43, { align: 'center' });

  // Student / Teacher Profile Box
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 48, pageWidth - 28, 26, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 48, pageWidth - 28, 26, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`NAMA LENGKAP : ${person.nama.toUpperCase()}`, 18, 54);
  doc.text(`${targetType === 'siswa' ? 'NIS / NISN' : 'NIP'} : ${person.nisOrNip}${person.nisn ? ' / ' + person.nisn : ''}`, 18, 60);
  doc.text(`JENIS KELAMIN : ${person.jenisKelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}`, 18, 66);

  doc.text(`${targetType === 'siswa' ? 'KELAS' : 'JABATAN'} : ${person.kelasOrJabatan}`, pageWidth / 2 + 10, 54);
  doc.text(`SEMESTER : ${schoolInfo.semester}`, pageWidth / 2 + 10, 60);
  doc.text(`PERIODE : ${periodLabel}`, pageWidth / 2 + 10, 66);

  // Attendance Summary Badges Box
  const h = attendanceRecords.filter((r) => r.status === 'H').length;
  const s = attendanceRecords.filter((r) => r.status === 'S').length;
  const i = attendanceRecords.filter((r) => r.status === 'I').length;
  const a = attendanceRecords.filter((r) => r.status === 'A').length;
  const tl = attendanceRecords.filter((r) => r.status === 'TL').length;
  const total = attendanceRecords.length || 1;
  const pct = Math.round(((h + tl) / total) * 100);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('REKAPITULASI HARI & PERSENTASE KEHADIRAN:', 14, 80);

  const tableHeaders = ['Tanggal', 'Hari', 'Status Absensi', 'Jam Masuk / Keterangan'];
  
  // Sort attendance records by date
  const sortedRecords = [...attendanceRecords].sort((x, y) => x.date.localeCompare(y.date));

  const tableRows = sortedRecords.map((r) => {
    const d = new Date(r.date);
    const dateFormatted = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });

    let statusLabel = 'Hadir (H)';
    if (r.status === 'S') statusLabel = 'Sakit (S)';
    if (r.status === 'I') statusLabel = 'Izin (I)';
    if (r.status === 'A') statusLabel = 'Alpa (A)';
    if (r.status === 'TL') statusLabel = 'Tugas Luar (TL)';

    return [dateFormatted, dayName, statusLabel, r.jamMasuk ? `Masuk ${r.jamMasuk} ${r.keterangan ? '- ' + r.keterangan : ''}` : r.keterangan || '-'];
  });

  autoTable(doc, {
    startY: 84,
    head: [tableHeaders],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'Belum ada catatan absensi', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [34, 112, 62],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
    },
    styles: { cellPadding: 2 },
  });

  // Summary box below table
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL HARI: ${attendanceRecords.length} Hari  |  HADIR: ${h}  |  SAKIT: ${s}  |  IZIN: ${i}  |  ALPA: ${a}${targetType === 'guru' ? `  |  TL: ${tl}` : ''}  |  PERSENTASE: ${pct}%`, 14, finalY);

  // Signatures
  const sigY = finalY + 14;
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 20, sigY);
  doc.text('Wali Kelas / Pengelola', 20, sigY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.namaGuruKelas, 20, sigY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${schoolInfo.nipGuruKelas}`, 20, sigY + 28);

  doc.text(`${schoolInfo.kelurahan || 'Sekolah'}, ${todayStr}`, pageWidth - 70, sigY);
  doc.text('Kepala Sekolah,', pageWidth - 70, sigY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.namaKepalaSekolah, pageWidth - 70, sigY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${schoolInfo.nipKepalaSekolah}`, pageWidth - 70, sigY + 28);

  // Save PDF
  const filename = `Raport_Absensi_Individu_${person.nama.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}

export function exportToPDF({
  schoolInfo,
  title,
  subtitle,
  targetType,
  students = [],
  teachers = [],
  attendanceRecords,
  periodLabel = 'Bulan / Semester Berjalan',
}: PDFExportOptions) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Kop Surat Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('YAYASAN AL-HUSAINI', pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(schoolInfo.namaSekolah.toUpperCase(), pageWidth / 2, 19, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${schoolInfo.alamat}, ${schoolInfo.kelurahan}, ${schoolInfo.kecamatan}, ${schoolInfo.kabupatenKota}`, pageWidth / 2, 24, { align: 'center' });
  doc.text(`NPSN: ${schoolInfo.npsn} | Email: info@${schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`, pageWidth / 2, 28, { align: 'center' });

  // Divider Line
  doc.setLineWidth(0.8);
  doc.line(14, 31, pageWidth - 14, 31);
  doc.setLineWidth(0.2);
  doc.line(14, 32, pageWidth - 14, 32);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), pageWidth / 2, 39, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, pageWidth / 2, 44, { align: 'center' });

  // Metadata Table Info
  doc.setFontSize(9);
  doc.text(`Kelas / Tingkat : ${schoolInfo.kelas}`, 14, 51);
  doc.text(`Semester        : ${schoolInfo.semester}`, 14, 55);
  doc.text(`Tahun Pelajaran : ${schoolInfo.tahunPelajaran}`, 14, 59);

  doc.text(`Periode Laporan  : ${periodLabel}`, pageWidth - 14, 51, { align: 'right' });
  doc.text(`Tanggal Cetak    : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 14, 55, { align: 'right' });

  // Build Table Data
  let tableHeaders: string[] = [];
  let tableRows: (string | number)[][] = [];

  if (targetType === 'siswa') {
    tableHeaders = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Total', '% Kehadiran'];
    
    tableRows = students.map((s, idx) => {
      const studentAtt = attendanceRecords.filter((r) => r.targetType === 'siswa' && r.targetId === s.id);
      const h = studentAtt.filter((r) => r.status === 'H').length;
      const sakit = studentAtt.filter((r) => r.status === 'S').length;
      const i = studentAtt.filter((r) => r.status === 'I').length;
      const a = studentAtt.filter((r) => r.status === 'A').length;
      const totalDays = studentAtt.length || 1;
      const pct = Math.round((h / totalDays) * 100);

      return [
        idx + 1,
        s.nis,
        s.nisn,
        s.nama,
        s.jenisKelamin,
        h,
        sakit,
        i,
        a,
        studentAtt.length,
        `${pct}%`,
      ];
    });
  } else {
    tableHeaders = ['No', 'NIP', 'Nama Guru / PTK', 'L/P', 'Jabatan', 'Status', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'TL', '% Kehadiran'];
    
    tableRows = teachers.map((t, idx) => {
      const teacherAtt = attendanceRecords.filter((r) => r.targetType === 'guru' && r.targetId === t.id);
      const hariWajibList = t.hariWajib || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu', 'Ahad'];
      const DAY_NAMES_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      const h = teacherAtt.filter((r) => r.status === 'H').length;
      const sakit = teacherAtt.filter((r) => r.status === 'S').length;
      const i = teacherAtt.filter((r) => r.status === 'I').length;
      const tl = teacherAtt.filter((r) => r.status === 'TL').length;

      // Alpa only on mandatory days
      const a = teacherAtt.filter((r) => {
        if (r.status !== 'A') return false;
        const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
        return hariWajibList.includes(dayName);
      }).length;

      const totalRelevant = teacherAtt.filter((r) => {
        if (r.status !== 'A') return true;
        const dayName = DAY_NAMES_ID[new Date(r.date).getDay()];
        return hariWajibList.includes(dayName);
      }).length;

      const totalDays = totalRelevant || 1;
      const pct = Math.round(((h + tl) / totalDays) * 100);

      return [
        idx + 1,
        t.nip,
        t.nama,
        t.jenisKelamin,
        t.jabatan,
        t.statusPtk,
        h,
        sakit,
        i,
        a,
        tl,
        `${pct}%`,
      ];
    });
  }

  // Build Footer Total Row
  let tableFooter: (string | number)[][] = [];
  if (targetType === 'siswa') {
    let pdfH = 0, pdfS = 0, pdfI = 0, pdfA = 0, pdfTotal = 0;
    students.forEach((s) => {
      const studentAtt = attendanceRecords.filter((r) => r.targetType === 'siswa' && r.targetId === s.id);
      pdfH += studentAtt.filter((r) => r.status === 'H').length;
      pdfS += studentAtt.filter((r) => r.status === 'S').length;
      pdfI += studentAtt.filter((r) => r.status === 'I').length;
      pdfA += studentAtt.filter((r) => r.status === 'A').length;
      pdfTotal += studentAtt.length;
    });
    const pdfPct = pdfTotal > 0 ? Math.round((pdfH / pdfTotal) * 100) : 0;
    tableFooter = [
      ['', '', '', 'TOTAL KESELURUHAN', '', pdfH, pdfS, pdfI, pdfA, pdfTotal, `${pdfPct}%`]
    ];
  } else {
    let pdfH = 0, pdfS = 0, pdfI = 0, pdfA = 0, pdfTL = 0, pdfTotal = 0;
    teachers.forEach((t) => {
      const teacherAtt = attendanceRecords.filter((r) => r.targetType === 'guru' && r.targetId === t.id);
      pdfH += teacherAtt.filter((r) => r.status === 'H').length;
      pdfS += teacherAtt.filter((r) => r.status === 'S').length;
      pdfI += teacherAtt.filter((r) => r.status === 'I').length;
      pdfA += teacherAtt.filter((r) => r.status === 'A').length;
      pdfTL += teacherAtt.filter((r) => r.status === 'TL').length;
      pdfTotal += teacherAtt.length;
    });
    const pdfPct = pdfTotal > 0 ? Math.round(((pdfH + pdfTL) / pdfTotal) * 100) : 0;
    tableFooter = [
      ['', '', '', '', 'TOTAL KESELURUHAN', '', pdfH, pdfS, pdfI, pdfA, pdfTL, `${pdfPct}%`]
    ];
  }

  // Draw Table
  autoTable(doc, {
    startY: 64,
    head: [tableHeaders],
    body: tableRows,
    foot: tableFooter,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 112, 62],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    footStyles: {
      fillColor: [18, 53, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center' },
      9: { halign: 'center' },
      10: { halign: 'center', fontStyle: 'bold' },
    },
    styles: {
      cellPadding: 2,
    },
  });

  // Tanda Tangan Section
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const pageHeight = doc.internal.pageSize.getHeight();

  // If table went too low, add a new page for signatures
  if (finalY + 35 > pageHeight) {
    doc.addPage();
  }

  const sigY = finalY + 35 > pageHeight ? 25 : finalY;

  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const locationStr = schoolInfo.kelurahan ? `${schoolInfo.kelurahan.toUpperCase()}, ${todayStr}` : todayStr;

  // Left side signature: Guru Kelas
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 25, sigY);
  doc.text('Guru Kelas / Pengelola', 25, sigY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.namaGuruKelas, 25, sigY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${schoolInfo.nipGuruKelas}`, 25, sigY + 33);

  // Right side signature: Kepala Sekolah
  doc.text(locationStr, pageWidth - 80, sigY);
  doc.text('Kepala Sekolah,', pageWidth - 80, sigY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.namaKepalaSekolah, pageWidth - 80, sigY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${schoolInfo.nipKepalaSekolah}`, pageWidth - 80, sigY + 33);

  // Save PDF
  const filename = `Laporan_Absensi_${targetType.toUpperCase()}_${schoolInfo.namaSekolah.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
