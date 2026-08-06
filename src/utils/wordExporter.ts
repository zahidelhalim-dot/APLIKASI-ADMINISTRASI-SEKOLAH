import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { SchoolInfo, Student, Teacher, AttendanceRecord } from '../types';

interface WordExportOptions {
  schoolInfo: SchoolInfo;
  title: string;
  subtitle: string;
  targetType: 'siswa' | 'guru';
  students?: Student[];
  teachers?: Teacher[];
  attendanceRecords: AttendanceRecord[];
  periodLabel?: string;
}

export async function exportIndividualWord({
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
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Kop Surat
  const kopParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'YAYASAN AL-HUSAINI',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: schoolInfo.namaSekolah.toUpperCase(),
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${schoolInfo.alamat}, ${schoolInfo.kelurahan}, ${schoolInfo.kecamatan}, ${schoolInfo.kabupatenKota}`,
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `NPSN: ${schoolInfo.npsn} | Email: info@${schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
          size: 18,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '_________________________________________________________________________________', bold: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
  ];

  // Profile Header
  const profileParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24,
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subtitle,
          size: 20,
          italics: true,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Nama Lengkap : ${person.nama.toUpperCase()}\t\t\t\t\t\tTingkat/Jabatan : ${person.kelasOrJabatan}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${targetType === 'siswa' ? 'NIS / NISN' : 'NIP'} : ${person.nisOrNip}${person.nisn ? ' / ' + person.nisn : ''}\t\t\t\t\t\tPeriode : ${periodLabel}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Jenis Kelamin : ${person.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}\t\t\t\t\t\tSemester : ${schoolInfo.semester}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // Attendance Table Rows
  const tableHeaders = ['Tanggal', 'Hari', 'Status Absensi', 'Keterangan / Jam Masuk'];
  const headerRow = new TableRow({
    tableHeader: true,
    children: tableHeaders.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: header, bold: true, size: 18, color: 'FFFFFF' })],
            }),
          ],
          shading: { fill: '22703E' },
          width: { size: 25, type: WidthType.PERCENTAGE },
        })
    ),
  });

  const sortedRecords = [...attendanceRecords].sort((x, y) => x.date.localeCompare(y.date));
  const dataRows: TableRow[] = sortedRecords.map((r) => {
    const d = new Date(r.date);
    const dateFormatted = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });

    let statusLabel = 'Hadir (H)';
    if (r.status === 'S') statusLabel = 'Sakit (S)';
    if (r.status === 'I') statusLabel = 'Izin (I)';
    if (r.status === 'A') statusLabel = 'Alpa (A)';
    if (r.status === 'TL') statusLabel = 'Tugas Luar (TL)';

    const note = r.jamMasuk ? `Masuk ${r.jamMasuk} ${r.keterangan ? '- ' + r.keterangan : ''}` : r.keterangan || '-';

    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: dateFormatted, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: dayName, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: statusLabel, bold: true, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: note, size: 18 })] })] }),
      ],
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });

  // Signature Block
  const signatureParagraphs = [
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Mengetahui,\t\t\t\t\t\t\t\t\t\t${schoolInfo.kelurahan || 'Sekolah'}, ${todayStr}`, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Guru Kelas / Pengelola\t\t\t\t\t\t\t\t\tKepala Sekolah`, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `${schoolInfo.namaGuruKelas}\t\t\t\t\t\t\t\t${schoolInfo.namaKepalaSekolah}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `NIP. ${schoolInfo.nipGuruKelas}\t\t\t\t\t\t\t\tNIP. ${schoolInfo.nipKepalaSekolah}`, size: 20 }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [...kopParagraphs, ...profileParagraphs, table, ...signatureParagraphs],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Raport_Absensi_Individu_${person.nama.replace(/\s+/g, '_')}_${Date.now()}.docx`;
  saveAs(blob, filename);
}

export async function exportToWord({
  schoolInfo,
  title,
  subtitle,
  targetType,
  students = [],
  teachers = [],
  attendanceRecords,
  periodLabel = 'Bulan / Semester Berjalan',
}: WordExportOptions) {
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Kop Surat
  const kopParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'YAYASAN AL-HUSAINI',
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: schoolInfo.namaSekolah.toUpperCase(),
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${schoolInfo.alamat}, ${schoolInfo.kelurahan}, ${schoolInfo.kecamatan}, ${schoolInfo.kabupatenKota}`,
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `NPSN: ${schoolInfo.npsn} | Email: info@${schoolInfo.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '')}.sch.id`,
          size: 18,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: '_________________________________________________________________________________', bold: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }), // spacing
  ];

  // 2. Title & Meta
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24,
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subtitle,
          size: 20,
          italics: true,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Kelas / Tingkat : ${schoolInfo.kelas}\t\t\t\t\t\tPeriode : ${periodLabel}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Semester        : ${schoolInfo.semester}\t\t\t\t\t\tTanggal : ${todayStr}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Tahun Pelajaran : ${schoolInfo.tahunPelajaran}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // 3. Table Rows
  let tableHeaders: string[] = [];
  if (targetType === 'siswa') {
    tableHeaders = ['No', 'NIS', 'Nama Siswa', 'L/P', 'H', 'S', 'I', 'A', 'Total', '% Kehadiran'];
  } else {
    tableHeaders = ['No', 'NIP', 'Nama Guru / PTK', 'Jabatan', 'H', 'S', 'I', 'A', 'TL', '% Kehadiran'];
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: tableHeaders.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: header, bold: true, size: 18, color: 'FFFFFF' })],
            }),
          ],
          shading: { fill: '22703E' },
          width: { size: 10, type: WidthType.PERCENTAGE },
        })
    ),
  });

  const dataRows: TableRow[] = [];

  if (targetType === 'siswa') {
    students.forEach((s, idx) => {
      const studentAtt = attendanceRecords.filter((r) => r.targetType === 'siswa' && r.targetId === s.id);
      const h = studentAtt.filter((r) => r.status === 'H').length;
      const sakit = studentAtt.filter((r) => r.status === 'S').length;
      const i = studentAtt.filter((r) => r.status === 'I').length;
      const a = studentAtt.filter((r) => r.status === 'A').length;
      const totalDays = studentAtt.length || 1;
      const pct = Math.round((h / totalDays) * 100);

      const cellTexts = [
        String(idx + 1),
        s.nis,
        s.nama,
        s.jenisKelamin,
        String(h),
        String(sakit),
        String(i),
        String(a),
        String(studentAtt.length),
        `${pct}%`,
      ];

      dataRows.push(
        new TableRow({
          children: cellTexts.map(
            (txt, cellIdx) =>
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: cellIdx === 2 ? AlignmentType.LEFT : AlignmentType.CENTER,
                    children: [new TextRun({ text: txt, size: 18 })],
                  }),
                ],
              })
          ),
        })
      );
    });
  } else {
    teachers.forEach((t, idx) => {
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

      const cellTexts = [
        String(idx + 1),
        t.nip,
        t.nama,
        t.jabatan,
        String(h),
        String(sakit),
        String(i),
        String(a),
        String(tl),
        `${pct}%`,
      ];

      dataRows.push(
        new TableRow({
          children: cellTexts.map(
            (txt, cellIdx) =>
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: cellIdx === 2 || cellIdx === 3 ? AlignmentType.LEFT : AlignmentType.CENTER,
                    children: [new TextRun({ text: txt, size: 18 })],
                  }),
                ],
              })
          ),
        })
      );
    });
  }

  // 3.1 Calculate Footer Totals
  let footerRow: TableRow;
  if (targetType === 'siswa') {
    let wH = 0, wS = 0, wI = 0, wA = 0, wTotal = 0;
    students.forEach((s) => {
      const studentAtt = attendanceRecords.filter((r) => r.targetType === 'siswa' && r.targetId === s.id);
      wH += studentAtt.filter((r) => r.status === 'H').length;
      wS += studentAtt.filter((r) => r.status === 'S').length;
      wI += studentAtt.filter((r) => r.status === 'I').length;
      wA += studentAtt.filter((r) => r.status === 'A').length;
      wTotal += studentAtt.length;
    });
    const wPct = wTotal > 0 ? Math.round((wH / wTotal) * 100) : 0;
    const footerTexts = ['TOTAL', '', 'TOTAL KESELURUHAN', '', String(wH), String(wS), String(wI), String(wA), String(wTotal), `${wPct}%`];
    footerRow = new TableRow({
      children: footerTexts.map((txt) => new TableCell({
        shading: { fill: '12351E' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: txt, bold: true, color: 'FFFFFF', size: 18 })] })]
      }))
    });
  } else {
    let wH = 0, wS = 0, wI = 0, wA = 0, wTL = 0, wTotal = 0;
    teachers.forEach((t) => {
      const teacherAtt = attendanceRecords.filter((r) => r.targetType === 'guru' && r.targetId === t.id);
      wH += teacherAtt.filter((r) => r.status === 'H').length;
      wS += teacherAtt.filter((r) => r.status === 'S').length;
      wI += teacherAtt.filter((r) => r.status === 'I').length;
      wA += teacherAtt.filter((r) => r.status === 'A').length;
      wTL += teacherAtt.filter((r) => r.status === 'TL').length;
      wTotal += teacherAtt.length;
    });
    const wPct = wTotal > 0 ? Math.round(((wH + wTL) / wTotal) * 100) : 0;
    const footerTexts = ['TOTAL', '', 'TOTAL KESELURUHAN', '', String(wH), String(wS), String(wI), String(wA), String(wTL), `${wPct}%`];
    footerRow = new TableRow({
      children: footerTexts.map((txt) => new TableCell({
        shading: { fill: '12351E' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: txt, bold: true, color: 'FFFFFF', size: 18 })] })]
      }))
    });
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows, footerRow],
  });

  // 4. Signature Block
  const signatureParagraphs = [
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `Mengetahui,\t\t\t\t\t\t\t\t\t\t${schoolInfo.kelurahan || 'Sekolah'}, ${todayStr}`, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Guru Kelas / Pengelola\t\t\t\t\t\t\t\t\tKepala Sekolah`, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({ text: `${schoolInfo.namaGuruKelas}\t\t\t\t\t\t\t\t${schoolInfo.namaKepalaSekolah}`, bold: true, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `NIP. ${schoolInfo.nipGuruKelas}\t\t\t\t\t\t\t\tNIP. ${schoolInfo.nipKepalaSekolah}`, size: 20 }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [...kopParagraphs, ...titleParagraphs, table, ...signatureParagraphs],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Laporan_Absensi_${targetType.toUpperCase()}_${schoolInfo.namaSekolah.replace(/\s+/g, '_')}_${Date.now()}.docx`;
  saveAs(blob, filename);
}
