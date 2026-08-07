import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toJpeg, toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import {
  Student,
  Teacher,
  SchoolInfo,
  ClassCategory,
  AttendanceRecord,
  UserAccount,
} from '../types';
import { ClassFilterBar } from './ClassFilterBar';
import {
  QrCode,
  Printer,
  Camera,
  Search,
  CheckCircle2,
  Award,
  UserCheck,
  CreditCard,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  Zap,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trash2,
  FileCheck2,
  Download,
  Sliders,
  Settings,
  Check,
  DownloadCloud,
  Layers,
} from 'lucide-react';

interface StudentCardViewProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassCategory[];
  schoolInfo: SchoolInfo;
  selectedKelas: string;
  onSelectKelas: (kelas: string) => void;
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  onUpdateStudent: (student: Student) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  currentUser?: UserAccount | null;
}

export const StudentCardView: React.FC<StudentCardViewProps> = ({
  students,
  teachers,
  classes,
  schoolInfo,
  selectedKelas,
  onSelectKelas,
  attendanceRecords,
  onSaveAttendance,
  onUpdateStudent,
  onUpdateTeacher,
  onUpdateSchoolInfo,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'cetak' | 'scanner'>('cetak');
  const [cardTarget, setCardTarget] = useState<'siswa' | 'guru'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardTheme, setCardTheme] = useState<'amber' | 'emerald' | 'blue' | 'purple'>('amber');

  // Single Card Print state
  const [singlePrintItem, setSinglePrintItem] = useState<{
    type: 'siswa' | 'guru';
    data: Student | Teacher;
  } | null>(null);

  // Custom JPG Export state
  const [jpgModalOpen, setJpgModalOpen] = useState(false);
  const [selectedJpgItem, setSelectedJpgItem] = useState<{
    type: 'siswa' | 'guru';
    data: Student | Teacher;
  } | null>(null);
  const [jpgExportScope, setJpgExportScope] = useState<'single' | 'batch'>('single');
  const [jpgPreset, setJpgPreset] = useState<'cr80' | 'medium' | 'hd' | 'ultrahd' | 'custom'>('cr80');
  const [unitMode, setUnitMode] = useState<'cm' | 'mm' | 'px'>('cm');
  const [customWidth, setCustomWidth] = useState<number>(8.56);
  const [customHeight, setCustomHeight] = useState<number>(5.4);
  const [jpgQuality, setJpgQuality] = useState<number>(98);
  const [jpgScaleRatio, setJpgScaleRatio] = useState<number>(2);
  const [exportFormat, setExportFormat] = useState<'jpg' | 'png'>('jpg');
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [exportCurrentItem, setExportCurrentItem] = useState<{
    type: 'siswa' | 'guru';
    data: Student | Teacher;
  } | null>(null);

  const hiddenExportRef = useRef<HTMLDivElement | null>(null);

  const handlePresetChange = (preset: 'cr80' | 'medium' | 'hd' | 'ultrahd' | 'custom') => {
    setJpgPreset(preset);
    if (preset === 'cr80') {
      if (unitMode === 'cm') {
        setCustomWidth(8.56);
        setCustomHeight(5.4);
      } else if (unitMode === 'mm') {
        setCustomWidth(85.6);
        setCustomHeight(54.0);
      } else {
        setCustomWidth(1011);
        setCustomHeight(638);
      }
    } else if (preset === 'medium') {
      if (unitMode === 'cm') {
        setCustomWidth(10.16);
        setCustomHeight(6.35);
      } else if (unitMode === 'mm') {
        setCustomWidth(101.6);
        setCustomHeight(63.5);
      } else {
        setCustomWidth(1200);
        setCustomHeight(750);
      }
    } else if (preset === 'hd') {
      if (unitMode === 'cm') {
        setCustomWidth(16.25);
        setCustomHeight(10.16);
      } else if (unitMode === 'mm') {
        setCustomWidth(162.5);
        setCustomHeight(101.6);
      } else {
        setCustomWidth(1920);
        setCustomHeight(1200);
      }
    } else if (preset === 'ultrahd') {
      if (unitMode === 'cm') {
        setCustomWidth(32.51);
        setCustomHeight(20.32);
      } else if (unitMode === 'mm') {
        setCustomWidth(325.1);
        setCustomHeight(203.2);
      } else {
        setCustomWidth(3840);
        setCustomHeight(2400);
      }
    }
  };

  const handleUnitModeToggle = (mode: 'cm' | 'mm' | 'px') => {
    if (mode === unitMode) return;
    
    // Calculate base width & height in mm
    let wMm = customWidth;
    let hMm = customHeight;
    if (unitMode === 'cm') {
      wMm = customWidth * 10;
      hMm = customHeight * 10;
    } else if (unitMode === 'px') {
      wMm = customWidth / 11.811;
      hMm = customHeight / 11.811;
    }

    if (mode === 'cm') {
      setCustomWidth(parseFloat((wMm / 10).toFixed(2)));
      setCustomHeight(parseFloat((hMm / 10).toFixed(2)));
    } else if (mode === 'mm') {
      setCustomWidth(parseFloat(wMm.toFixed(1)));
      setCustomHeight(parseFloat(hMm.toFixed(1)));
    } else {
      setCustomWidth(Math.round(wMm * 11.811));
      setCustomHeight(Math.round(hMm * 11.811));
    }
    setUnitMode(mode);
  };

  const handleOpenJpgModal = (item?: { type: 'siswa' | 'guru'; data: Student | Teacher } | null) => {
    if (item) {
      setSelectedJpgItem(item);
      setExportCurrentItem(item);
      setJpgExportScope('single');
    } else {
      const firstItem =
        cardTarget === 'siswa' && displayStudents.length > 0
          ? { type: 'siswa' as const, data: displayStudents[0] }
          : cardTarget === 'guru' && displayTeachers.length > 0
          ? { type: 'guru' as const, data: displayTeachers[0] }
          : null;
      setSelectedJpgItem(firstItem);
      setExportCurrentItem(firstItem);
      setJpgExportScope('batch');
    }
    setJpgModalOpen(true);
  };

  const executeJpgExport = async () => {
    setIsExportingJpg(true);
    setExportProgress('Mempersiapkan canvas render...');

    try {
      let finalWidthPx = Math.max(100, Math.round(customWidth));
      let finalHeightPx = Math.max(100, Math.round(customHeight));
      if (unitMode === 'cm') {
        finalWidthPx = Math.max(100, Math.round(customWidth * 118.11));
        finalHeightPx = Math.max(100, Math.round(customHeight * 118.11));
      } else if (unitMode === 'mm') {
        finalWidthPx = Math.max(100, Math.round(customWidth * 11.811));
        finalHeightPx = Math.max(100, Math.round(customHeight * 11.811));
      }

      const itemsToProcess: { type: 'siswa' | 'guru'; data: Student | Teacher }[] = [];
      if (jpgExportScope === 'single' && selectedJpgItem) {
        itemsToProcess.push(selectedJpgItem);
      } else {
        const list = cardTarget === 'siswa' ? displayStudents : displayTeachers;
        list.forEach((item) => {
          itemsToProcess.push({ type: cardTarget, data: item });
        });
      }

      if (itemsToProcess.length === 0) {
        alert('Tidak ada kartu untuk diunduh.');
        setIsExportingJpg(false);
        return;
      }

      for (let i = 0; i < itemsToProcess.length; i++) {
        const current = itemsToProcess[i];
        setExportCurrentItem(current);
        setExportProgress(`Memproses gambar ${i + 1} dari ${itemsToProcess.length}: ${current.data.nama}`);

        await new Promise((res) => setTimeout(res, 200));

        const node = hiddenExportRef.current;
        if (!node) continue;

        const baseWidthPx = 480;
        const baseHeightPx = 303;
        const computedPixelRatio = (finalWidthPx / baseWidthPx) * jpgScaleRatio;

        const renderOptions = {
          quality: jpgQuality / 100,
          pixelRatio: computedPixelRatio,
          canvasWidth: finalWidthPx,
          canvasHeight: finalHeightPx,
          width: baseWidthPx,
          height: baseHeightPx,
          style: {
            width: `${baseWidthPx}px`,
            height: `${baseHeightPx}px`,
            transform: 'none',
            margin: '0',
            padding: '0',
          },
          filter: (el: HTMLElement) => {
            if (el.classList && el.classList.contains('no-print')) {
              return false;
            }
            return true;
          },
        };

        let dataUrl = '';
        if (exportFormat === 'png') {
          dataUrl = await toPng(node, renderOptions);
        } else {
          dataUrl = await toJpeg(node, { ...renderOptions, backgroundColor: '#ffffff' });
        }

        const safeNama = current.data.nama.replace(/[^a-zA-Z0-9_-]/g, '_');
        const dimStr = unitMode === 'cm' ? `${customWidth}x${customHeight}cm` : unitMode === 'mm' ? `${customWidth}x${customHeight}mm` : `${finalWidthPx}x${finalHeightPx}px`;
        const filename = `Kartu_${current.type === 'siswa' ? 'Siswa' : 'Guru'}_${safeNama}_${dimStr}`;

        saveAs(dataUrl, `${filename}.${exportFormat === 'png' ? 'png' : 'jpg'}`);

        if (itemsToProcess.length > 1) {
          await new Promise((res) => setTimeout(res, 300));
        }
      }

      setExportProgress('Selesai mengunduh gambar!');
      setTimeout(() => {
        setIsExportingJpg(false);
        setJpgModalOpen(false);
      }, 600);
    } catch (err) {
      console.error('Export JPG error:', err);
      alert('Gagal mengekspor gambar kartu. Silakan periksa ukuran dan dicoba kembali.');
      setIsExportingJpg(false);
    }
  };

  // QR Code URL maps
  const [studentQrUrls, setStudentQrUrls] = useState<{ [id: string]: string }>({});
  const [teacherQrUrls, setTeacherQrUrls] = useState<{ [id: string]: string }>({});

  // File upload hidden refs
  const studentPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const teacherPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTargetForPhoto, setSelectedTargetForPhoto] = useState<{
    type: 'siswa' | 'guru';
    id: string;
  } | null>(null);

  // Scanner states
  const [scanInput, setScanInput] = useState('');
  const [scanDate, setScanDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lastScannedResult, setLastScannedResult] = useState<{
    type: 'siswa' | 'guru';
    name: string;
    code: string;
    detail: string;
    time: string;
    status: string;
    gender: 'L' | 'P';
    photoUrl?: string;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<
    {
      id: string;
      type: 'siswa' | 'guru';
      name: string;
      detail: string;
      time: string;
      date: string;
    }[]
  >([]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate QR Code Data URLs for all students
  useEffect(() => {
    const generateStudentQRs = async () => {
      const urls: { [id: string]: string } = {};
      for (const s of students) {
        try {
          const payload = JSON.stringify({
            type: 'siswa',
            id: s.id,
            nis: s.nis,
            nisn: s.nisn,
            nama: s.nama,
            kelas: s.kelas,
          });
          urls[s.id] = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 180,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (err) {
          console.error('Error generating QR for student', s.nama, err);
        }
      }
      setStudentQrUrls(urls);
    };
    generateStudentQRs();
  }, [students]);

  // Generate QR Code Data URLs for all teachers
  useEffect(() => {
    const generateTeacherQRs = async () => {
      const urls: { [id: string]: string } = {};
      for (const t of teachers) {
        try {
          const payload = JSON.stringify({
            type: 'guru',
            id: t.id,
            nip: t.nip,
            nama: t.nama,
            jabatan: t.jabatan,
          });
          urls[t.id] = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 180,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (err) {
          console.error('Error generating QR for teacher', t.nama, err);
        }
      }
      setTeacherQrUrls(urls);
    };
    generateTeacherQRs();
  }, [teachers]);

  // Audio Beep generator using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  };

  // Filter students
  const displayStudents = students.filter((s) => {
    const matchesKelas =
      selectedKelas === 'SEMUA' ||
      s.kelas.toLowerCase() === selectedKelas.toLowerCase();
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);
    return matchesKelas && matchesSearch;
  });

  // Filter teachers
  const displayTeachers = teachers.filter((t) => {
    return (
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle Photo File Select
  const handlePhotoFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'siswa' | 'guru',
    id: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'siswa') {
        const student = students.find((s) => s.id === id);
        if (student) {
          onUpdateStudent({ ...student, fotoUrl: result });
        }
      } else {
        const teacher = teachers.find((t) => t.id === id);
        if (teacher) {
          onUpdateTeacher({ ...teacher, fotoUrl: result });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Logo Upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran logo maksimal 2 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdateSchoolInfo({ ...schoolInfo, logoUrl: result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trigger Photo Upload for specific ID
  const triggerPhotoUpload = (type: 'siswa' | 'guru', id: string) => {
    setSelectedTargetForPhoto({ type, id });
    if (type === 'siswa' && studentPhotoInputRef.current) {
      studentPhotoInputRef.current.click();
    } else if (type === 'guru' && teacherPhotoInputRef.current) {
      teacherPhotoInputRef.current.click();
    }
  };

  // Remove photo
  const handleRemovePhoto = (type: 'siswa' | 'guru', id: string) => {
    if (type === 'siswa') {
      const student = students.find((s) => s.id === id);
      if (student) {
        onUpdateStudent({ ...student, fotoUrl: undefined });
      }
    } else {
      const teacher = teachers.find((t) => t.id === id);
      if (teacher) {
        onUpdateTeacher({ ...teacher, fotoUrl: undefined });
      }
    }
  };

  // Process Scan Code (QR payload or manual code)
  const processScan = (rawCode: string) => {
    if (!rawCode.trim()) return;
    const cleanCode = rawCode.trim();

    let scanType: 'siswa' | 'guru' | null = null;
    let codeId = cleanCode;

    // Try parsing JSON QR Payload
    try {
      const parsed = JSON.parse(cleanCode);
      if (parsed.type === 'siswa' || parsed.type === 'guru') {
        scanType = parsed.type;
        codeId = parsed.nis || parsed.nip || parsed.id || cleanCode;
      }
    } catch {
      // Plain text code
    }

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Match student
    const matchedStudent = students.find(
      (s) =>
        s.nis.toLowerCase() === codeId.toLowerCase() ||
        s.nisn.toLowerCase() === codeId.toLowerCase() ||
        s.nama.toLowerCase().includes(codeId.toLowerCase())
    );

    // Match teacher
    const matchedTeacher = teachers.find(
      (t) =>
        t.nip.toLowerCase() === codeId.toLowerCase() ||
        t.nama.toLowerCase().includes(codeId.toLowerCase())
    );

    if (scanType === 'guru' || (!matchedStudent && matchedTeacher)) {
      if (matchedTeacher) {
        const newRecord: AttendanceRecord = {
          id: `att_tch_${matchedTeacher.id}_${scanDate}`,
          date: scanDate,
          targetType: 'guru',
          targetId: matchedTeacher.id,
          status: 'H',
          jamMasuk: nowTime,
          keterangan: `Hadir Scan QR Kartu (${nowTime} WIB)`,
        };

        onSaveAttendance([newRecord]);
        playBeep();

        setLastScannedResult({
          type: 'guru',
          name: matchedTeacher.nama,
          code: `NIP: ${matchedTeacher.nip}`,
          detail: matchedTeacher.jabatan,
          time: nowTime,
          status: 'HADIR (H)',
          gender: matchedTeacher.jenisKelamin,
          photoUrl: matchedTeacher.fotoUrl,
        });

        setScanHistory((prev) => [
          {
            id: `tch_${matchedTeacher.id}_${Date.now()}`,
            type: 'guru',
            name: matchedTeacher.nama,
            detail: matchedTeacher.jabatan,
            time: nowTime,
            date: scanDate,
          },
          ...prev,
        ]);

        setScanInput('');
        return;
      }
    }

    if (matchedStudent) {
      const newRecord: AttendanceRecord = {
        id: `att_std_${matchedStudent.id}_${scanDate}`,
        date: scanDate,
        targetType: 'siswa',
        targetId: matchedStudent.id,
        status: 'H',
        keterangan: `Hadir Scan QR Kartu (${nowTime} WIB)`,
      };

      onSaveAttendance([newRecord]);
      playBeep();

      setLastScannedResult({
        type: 'siswa',
        name: matchedStudent.nama,
        code: `NIS: ${matchedStudent.nis} • NISN: ${matchedStudent.nisn}`,
        detail: `Kelas ${matchedStudent.kelas}`,
        time: nowTime,
        status: 'HADIR (H)',
        gender: matchedStudent.jenisKelamin,
        photoUrl: matchedStudent.fotoUrl,
      });

      setScanHistory((prev) => [
        {
          id: `std_${matchedStudent.id}_${Date.now()}`,
          type: 'siswa',
          name: matchedStudent.nama,
          detail: matchedStudent.kelas,
          time: nowTime,
          date: scanDate,
        },
        ...prev,
      ]);

      setScanInput('');
      return;
    }

    alert(`Kode "${cleanCode}" tidak ditemukan dalam database Siswa maupun Guru!`);
  };

  // Camera toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        alert('Gagal membuka kamera. Pastikan telah memberi izin kamera pada browser.');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Print all currently displayed cards
  const handlePrintAllCards = () => {
    setSinglePrintItem(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print single specific card
  const handlePrintSingleCard = (type: 'siswa' | 'guru', data: Student | Teacher) => {
    setSinglePrintItem({ type, data });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Inputs for photo & logo upload */}
      <input
        type="file"
        ref={studentPhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          selectedTargetForPhoto &&
          handlePhotoFileChange(e, 'siswa', selectedTargetForPhoto.id)
        }
      />
      <input
        type="file"
        ref={teacherPhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          selectedTargetForPhoto &&
          handlePhotoFileChange(e, 'guru', selectedTargetForPhoto.id)
        }
      />
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoFileChange}
      />

      {/* PRINT STYLES FOR ALL CARDS AND SINGLE CARD */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print, nav, header, footer, aside, button, input {
            display: none !important;
          }
          div, main, section {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          ${
            singlePrintItem
              ? `
              #printable-cards-section {
                display: none !important;
              }
              #printable-single-card {
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                max-width: 420px !important;
                margin: 0 auto !important;
                padding-top: 10px !important;
              }
              #printable-single-card * {
                visibility: visible !important;
              }
              `
              : `
              #printable-single-card {
                display: none !important;
              }
              #printable-cards-section {
                display: block !important;
                visibility: visible !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #printable-cards-section * {
                visibility: visible !important;
              }
              `
          }
          .card-grid-print {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .card-item-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 8px !important;
          }
        }
      `}</style>

      {/* HEADER BANNER WITH LOGO CHANGER */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-amber-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-amber-500/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-lg border border-amber-200 shrink-0 overflow-hidden">
              {schoolInfo.logoUrl ? (
                <img
                  src={schoolInfo.logoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <CreditCard className="w-7 h-7 text-slate-950" />
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-300 p-1 rounded-full border border-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-colors shadow"
              title="Ganti Logo Sekolah"
            >
              <Upload className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                SISTEM KARTU ANGGOTA DIGITAL
              </span>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 px-2 py-0.5 rounded-md border border-amber-400/40 font-bold transition-all flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" /> Ubah Logo
              </button>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              KARTU DIGITAL SISWA & GURU (SCANNER ABSEN)
            </h2>
            <p className="text-xs text-amber-100/80">
              Cetak Kartu Siswa & Guru, Unggah Foto Resmi, dan Pemindai Presensi QR Code
            </p>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-amber-500/40">
          <button
            onClick={() => setActiveTab('cetak')}
            className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'cetak'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" /> Cetak Kartu Digital
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'scanner'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" /> Scanner QR Absensi
          </button>
        </div>
      </div>

      {/* TAB 1: CETAK KARTU DIGITAL */}
      {activeTab === 'cetak' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="no-print bg-white p-4 rounded-2xl shadow-md border border-slate-200 space-y-3">
            {/* Target Type Selector: Siswa vs Guru */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  onClick={() => setCardTarget('siswa')}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all ${
                    cardTarget === 'siswa'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Kartu Siswa ({students.length})
                </button>
                <button
                  onClick={() => setCardTarget('guru')}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all ${
                    cardTarget === 'guru'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Kartu Guru & PTK ({teachers.length})
                </button>
              </div>

              {/* Theme Color Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-extrabold text-slate-700">Warna Kartu:</span>
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: 'amber', name: 'Emas Klasik', bg: 'bg-amber-500' },
                      { id: 'emerald', name: 'Hijau Toska', bg: 'bg-emerald-600' },
                      { id: 'blue', name: 'Biru Edukasi', bg: 'bg-blue-600' },
                      { id: 'purple', name: 'Ungu Modern', bg: 'bg-purple-600' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCardTheme(t.id)}
                      className={`w-6 h-6 rounded-full ${t.bg} border-2 transition-transform ${
                        cardTheme === t.id
                          ? 'scale-125 border-slate-900 shadow-md'
                          : 'border-white opacity-80 hover:opacity-100'
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Class filter (if cardTarget === 'siswa') */}
            {cardTarget === 'siswa' && (
              <ClassFilterBar
                classes={classes}
                teachers={[]}
                selectedKelas={selectedKelas}
                onSelectKelas={onSelectKelas}
                title="PILIH KELAS UNTUK CETAK KARTU SISWA:"
              />
            )}

            {/* Search Input & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    cardTarget === 'siswa'
                      ? 'Cari NIS / NISN / Nama Siswa...'
                      : 'Cari NIP / Nama / Jabatan Guru...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenJpgModal(null)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:from-blue-700 hover:to-indigo-800 font-black text-xs rounded-xl shadow-lg border border-blue-300 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Download Kartu dalam Format JPG dengan Ukuran & Resolusi Kustom"
                >
                  <Download className="w-4 h-4" /> Download JPG Custom (
                  {cardTarget === 'siswa'
                    ? displayStudents.length
                    : displayTeachers.length}
                  )
                </button>
                <button
                  onClick={handlePrintAllCards}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 hover:from-amber-600 hover:to-amber-800 font-black text-xs rounded-xl shadow-lg border border-amber-300 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak / Download PDF Semua Kartu (
                  {cardTarget === 'siswa'
                    ? displayStudents.length
                    : displayTeachers.length}
                  )
                </button>
              </div>
            </div>
          </div>

          {/* SINGLE PRINT MODAL DISPLAY & PREVIEW */}
          {singlePrintItem && (
            <>
              {/* Screen Modal Preview for 1 Card */}
              <div className="no-print fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl border-2 border-amber-500 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">
                        PRATINJAU CETAK 1 KARTU ANGGOTA
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {singlePrintItem.data.nama}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSinglePrintItem(null)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold transition-colors"
                      title="Tutup Modal Pratinjau"
                    >
                      Tutup ✕
                    </button>
                  </div>

                  <div className="py-2 flex justify-center w-full">
                    <CardWrapper
                      type={singlePrintItem.type}
                      data={singlePrintItem.data}
                      schoolInfo={schoolInfo}
                      cardTheme={cardTheme}
                      qrUrl={
                        singlePrintItem.type === 'siswa'
                          ? studentQrUrls[singlePrintItem.data.id]
                          : teacherQrUrls[singlePrintItem.data.id]
                      }
                      onTriggerPhotoUpload={() =>
                        triggerPhotoUpload(
                          singlePrintItem.type,
                          singlePrintItem.data.id
                        )
                      }
                      onRemovePhoto={() =>
                        handleRemovePhoto(
                          singlePrintItem.type,
                          singlePrintItem.data.id
                        )
                      }
                      onPrintSingle={() => window.print()}
                      onDownloadJpgCustom={() => handleOpenJpgModal(singlePrintItem)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <button
                      onClick={() => setSinglePrintItem(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleOpenJpgModal(singlePrintItem)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow border border-blue-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download JPG
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Cetak Sekarang (PDF)
                    </button>
                  </div>
                </div>
              </div>

              {/* Printable Single Card Container */}
              <div id="printable-single-card" className="hidden print:block">
                <div className="p-4 bg-white max-w-md mx-auto">
                  <CardItem
                    type={singlePrintItem.type}
                    data={singlePrintItem.data}
                    schoolInfo={schoolInfo}
                    cardTheme={cardTheme}
                    qrUrl={
                      singlePrintItem.type === 'siswa'
                        ? studentQrUrls[singlePrintItem.data.id]
                        : teacherQrUrls[singlePrintItem.data.id]
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* PRINTABLE ALL CARDS GRID CONTAINER */}
          <div id="printable-cards-section" className="space-y-4">
            <div className="no-print flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>
                Menampilkan{' '}
                {cardTarget === 'siswa'
                  ? displayStudents.length
                  : displayTeachers.length}{' '}
                Kartu {cardTarget === 'siswa' ? 'Siswa' : 'Guru'} Siap Cetak
              </span>
              <span className="text-amber-700 font-mono">
                *Klik tombol "🖨️ Cetak" pada setiap kartu untuk cetak per individu
              </span>
            </div>

            {/* IF SISWA */}
            {cardTarget === 'siswa' && (
              <>
                {displayStudents.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border-2 border-dashed border-slate-300 text-slate-500 font-bold">
                    Tidak ada siswa yang sesuai dengan filter kelas / pencarian.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 card-grid-print">
                    {displayStudents.map((s) => (
                      <div key={s.id} className="card-item-container flex justify-center">
                        <CardWrapper
                          type="siswa"
                          data={s}
                          schoolInfo={schoolInfo}
                          cardTheme={cardTheme}
                          qrUrl={studentQrUrls[s.id]}
                          onTriggerPhotoUpload={() =>
                            triggerPhotoUpload('siswa', s.id)
                          }
                          onRemovePhoto={() => handleRemovePhoto('siswa', s.id)}
                          onPrintSingle={() => handlePrintSingleCard('siswa', s)}
                          onDownloadJpgCustom={() => handleOpenJpgModal({ type: 'siswa', data: s })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* IF GURU */}
            {cardTarget === 'guru' && (
              <>
                {displayTeachers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border-2 border-dashed border-slate-300 text-slate-500 font-bold">
                    Tidak ada data guru yang sesuai dengan pencarian.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 card-grid-print">
                    {displayTeachers.map((t) => (
                      <div key={t.id} className="card-item-container flex justify-center">
                        <CardWrapper
                          type="guru"
                          data={t}
                          schoolInfo={schoolInfo}
                          cardTheme={cardTheme}
                          qrUrl={teacherQrUrls[t.id]}
                          onTriggerPhotoUpload={() =>
                            triggerPhotoUpload('guru', t.id)
                          }
                          onRemovePhoto={() => handleRemovePhoto('guru', t.id)}
                          onPrintSingle={() => handlePrintSingleCard('guru', t)}
                          onDownloadJpgCustom={() => handleOpenJpgModal({ type: 'guru', data: t })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCANNER ABSENSI QR CODE */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Live Camera / Manual Input Scanner (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border-2 border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-black shadow">
                    <QrCode className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                      PEMINDAI QR ABSENSI SISWA & GURU
                    </h3>
                    <p className="text-xs text-slate-400">
                      Pindai QR Code pada Kartu Siswa / Kartu Guru & PTK
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                    soundEnabled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Suara Beep"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{soundEnabled ? 'Suara On' : 'Suara Off'}</span>
                </button>
              </div>

              {/* Date Picker for Scan Attendance */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" /> Tanggal
                  Presensi:
                </span>
                <input
                  type="date"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                  className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700 font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Camera Scanner View Box */}
              <div className="relative bg-slate-950 rounded-2xl border-2 border-dashed border-amber-500/50 overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-3">
                {isCameraActive ? (
                  <div className="relative w-full h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scanner Target Box Animation */}
                    <div className="absolute inset-0 border-2 border-amber-400/80 rounded-xl flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-44 border-2 border-amber-400 rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded">
                          ARAHKAN QR CODE KARTU SISWA / GURU
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-6">
                    <div className="w-16 h-16 bg-slate-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-700 shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        Kamera Belum Aktif
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        Aktifkan kamera device untuk memindai QR Code Kartu
                        Siswa / Guru secara langsung.
                      </p>
                    </div>
                    <button
                      onClick={toggleCamera}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-amber-200 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4 text-slate-950" /> Buka
                      Kamera Device
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Input Code / Barcode USB Reader Input */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Mode Pindai Manual /
                  USB Barcode Scanner:
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processScan(scanInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan atau ketik NIS / NIP / Nama siswa atau guru..."
                    className="flex-1 bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer"
                  >
                    Presensi
                  </button>
                </form>
                <p className="text-[10px] text-slate-400">
                  *Sistem otomatis membedakan apakah kode milik Siswa atau Guru
                  & PTK.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Scan Result Alert & History Log (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* LAST SCANNED RESULT POPUP CARD */}
            {lastScannedResult ? (
              <div
                className={`p-5 rounded-2xl border-2 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200 text-white ${
                  lastScannedResult.type === 'guru'
                    ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-indigo-500'
                    : 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span
                    className={`font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow ${
                      lastScannedResult.type === 'guru'
                        ? 'bg-indigo-400 text-slate-950'
                        : 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> ABSEN{' '}
                    {lastScannedResult.type === 'guru' ? 'GURU' : 'SISWA'}{' '}
                    BERHASIL
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {lastScannedResult.time}{' '}
                    WIB
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white text-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-amber-300 shadow overflow-hidden shrink-0">
                    {lastScannedResult.photoUrl ? (
                      <img
                        src={lastScannedResult.photoUrl}
                        alt="Foto Scan"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {lastScannedResult.gender === 'L' ? '👦' : '👧'}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase block">
                      {lastScannedResult.detail}
                    </span>
                    <h3 className="font-black text-lg text-white uppercase tracking-wide">
                      {lastScannedResult.name}
                    </h3>
                    <p className="text-xs text-slate-200 font-mono">
                      {lastScannedResult.code}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/20 text-xs flex justify-between items-center">
                  <span className="text-slate-300 font-bold">
                    Status Presensi:
                  </span>
                  <span className="font-black text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-500">
                    {lastScannedResult.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl border-2 border-slate-800 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-200">
                  Belum Ada Data Dipindai
                </h4>
                <p className="text-xs text-slate-400">
                  Silakan scan QR code kartu siswa / guru untuk mencatat kehadiran.
                </p>
              </div>
            )}

            {/* LIVE SCAN HISTORY LOG */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Riwayat
                  Presensi Pindai Hari Ini
                </h4>
                <span className="bg-slate-100 text-slate-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border">
                  {scanHistory.length} Anggota
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {scanHistory.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4 font-bold">
                    Riwayat scan hari ini masih kosong.
                  </p>
                ) : (
                  scanHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            item.type === 'guru'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type === 'guru' ? '👨‍🏫' : '👦'}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </h5>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.type === 'guru' ? 'GURU' : 'SISWA'} •{' '}
                            {item.detail}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-[9px] px-2 py-0.5 rounded uppercase block ${
                            item.type === 'guru'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          HADIR
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {item.time} WIB
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOWNLOAD KARTU JPG UKURAN CUSTOM */}
      {jpgModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-blue-500 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-4 border-b border-blue-500 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-500/30 text-blue-300 rounded-xl flex items-center justify-center border border-blue-400/50 shadow-inner">
                  <ImageIcon className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider block">
                    DOWNLOAD GAMBAR KARTU
                  </span>
                  <h3 className="font-extrabold text-base text-white">
                    Ukuran & Resolusi Custom (JPG / PNG)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setJpgModalOpen(false)}
                disabled={isExportingJpg}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-black transition-colors disabled:opacity-50"
              >
                Tutup ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-slate-800 text-xs">
              {/* 1. Scope Selection */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> Target Kartu Yang Diunduh:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJpgExportScope('single');
                      if (!selectedJpgItem) {
                        const first =
                          cardTarget === 'siswa' && displayStudents.length > 0
                            ? { type: 'siswa' as const, data: displayStudents[0] }
                            : cardTarget === 'guru' && displayTeachers.length > 0
                            ? { type: 'guru' as const, data: displayTeachers[0] }
                            : null;
                        setSelectedJpgItem(first);
                        setExportCurrentItem(first);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 font-extrabold text-left transition-all ${
                      jpgExportScope === 'single'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">1 Kartu Terpilih</span>
                      {jpgExportScope === 'single' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal line-clamp-1">
                      {selectedJpgItem ? selectedJpgItem.data.nama : 'Pilih kartu anggota'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJpgExportScope('batch')}
                    className={`p-3 rounded-xl border-2 font-extrabold text-left transition-all ${
                      jpgExportScope === 'batch'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Semua Kartu Filtered</span>
                      {jpgExportScope === 'batch' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      Unduh masal {cardTarget === 'siswa' ? displayStudents.length : displayTeachers.length} kartu {cardTarget}
                    </p>
                  </button>
                </div>
              </div>

              {/* Dropdown if scope is single */}
              {jpgExportScope === 'single' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700">
                    Pilih Kartu {cardTarget === 'siswa' ? 'Siswa' : 'Guru'}:
                  </label>
                  <select
                    value={selectedJpgItem?.data.id || ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (cardTarget === 'siswa') {
                        const s = students.find((st) => st.id === id);
                        if (s) {
                          const item = { type: 'siswa' as const, data: s };
                          setSelectedJpgItem(item);
                          setExportCurrentItem(item);
                        }
                      } else {
                        const t = teachers.find((tc) => tc.id === id);
                        if (t) {
                          const item = { type: 'guru' as const, data: t };
                          setSelectedJpgItem(item);
                          setExportCurrentItem(item);
                        }
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {cardTarget === 'siswa'
                      ? displayStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama} ({s.kelas} - NIS: {s.nis})
                          </option>
                        ))
                      : displayTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} ({t.jabatan})
                          </option>
                        ))}
                  </select>
                </div>
              )}

              {/* 2. Preset Dimensions */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" /> Preset Ukuran Kartu:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cr80', name: 'Standard ID-1 / CR80', desc: '8.56 × 5.4 cm (85.6 × 54 mm)' },
                    { id: 'medium', name: 'Sedang (Medium)', desc: '10.16 × 6.35 cm (1200 × 750 px)' },
                    { id: 'hd', name: 'Tinggi (Full HD)', desc: '16.25 × 10.16 cm (1920 × 1200 px)' },
                    { id: 'ultrahd', name: 'Super Tajam (4K)', desc: '32.51 × 20.32 cm (3840 × 2400 px)' },
                    { id: 'custom', name: 'Ukuran Custom', desc: 'Bebas atur Lebar & Tinggi' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetChange(p.id as any)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        jpgPreset === p.id
                          ? 'border-blue-600 bg-blue-50 font-black text-blue-900 shadow-sm'
                          : 'border-slate-200 bg-white font-bold text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-[11px] leading-tight">{p.name}</div>
                      <div className="text-[9px] text-slate-500 font-normal mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Custom Inputs & Unit Switcher */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-[11px]">
                    Dimensi Canvas Gambar:
                  </span>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleUnitModeToggle('cm')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        unitMode === 'cm' ? 'bg-blue-600 text-white font-black shadow' : 'text-slate-600'
                      }`}
                    >
                      Centimeter (cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitModeToggle('mm')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        unitMode === 'mm' ? 'bg-blue-600 text-white font-black shadow' : 'text-slate-600'
                      }`}
                    >
                      Milimeter (mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitModeToggle('px')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        unitMode === 'px' ? 'bg-blue-600 text-white font-black shadow' : 'text-slate-600'
                      }`}
                    >
                      Pixel (px)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-600 block mb-1">
                      Lebar ({unitMode}):
                    </label>
                    <input
                      type="number"
                      step={unitMode === 'cm' ? '0.01' : unitMode === 'mm' ? '0.1' : '1'}
                      value={customWidth}
                      onChange={(e) => {
                        setCustomWidth(Math.max(0.1, parseFloat(e.target.value) || 0));
                        setJpgPreset('custom');
                      }}
                      min={0.1}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-600 block mb-1">
                      Tinggi ({unitMode}):
                    </label>
                    <input
                      type="number"
                      step={unitMode === 'cm' ? '0.01' : unitMode === 'mm' ? '0.1' : '1'}
                      value={customHeight}
                      onChange={(e) => {
                        setCustomHeight(Math.max(0.1, parseFloat(e.target.value) || 0));
                        setJpgPreset('custom');
                      }}
                      min={0.1}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 font-mono">
                  <span>
                    Output Size:{' '}
                    <strong>
                      {unitMode === 'cm'
                        ? `${customWidth} × ${customHeight} cm (${Math.round(customWidth * 118.11)} × ${Math.round(customHeight * 118.11)} px)`
                        : unitMode === 'mm'
                        ? `${customWidth} × ${customHeight} mm (${Math.round(customWidth * 11.811)} × ${Math.round(customHeight * 11.811)} px)`
                        : `${customWidth} × ${customHeight} px`}
                    </strong>
                  </span>
                  <span>
                    Rasio: {(customWidth / (customHeight || 1)).toFixed(2)}:1
                  </span>
                </div>
              </div>

              {/* 4. Format & Quality Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 block mb-1">
                    Format File:
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="jpg">JPG / JPEG (Kualitas Tinggi)</option>
                    <option value="png">PNG (HQ Lossless)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 block mb-1">
                    Kerapatan DPI / Multiplier:
                  </label>
                  <select
                    value={jpgScaleRatio}
                    onChange={(e) => setJpgScaleRatio(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1x (Standard / 96 DPI)</option>
                    <option value={2}>2x (Sangat Tajam / 300 DPI - Rekomendasi)</option>
                    <option value={3}>3x (Ultra Sharp / 600 DPI)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-700 block mb-1">
                    Kualitas Kompresi JPG ({jpgQuality}%):
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={jpgQuality}
                    disabled={exportFormat === 'png'}
                    onChange={(e) => setJpgQuality(Number(e.target.value))}
                    className="w-full accent-blue-600 mt-1"
                  />
                </div>
              </div>

              {/* 5. Live Card Preview Box */}
              {exportCurrentItem && (
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-900 text-[11px] uppercase block">
                    Pratinjau Hasil Render Kartu:
                  </label>
                  <div className="bg-slate-900 p-4 rounded-2xl flex justify-center items-center overflow-hidden border border-slate-800 shadow-inner">
                    <div className="transform scale-90 sm:scale-100 transition-transform">
                      <CardItem
                        type={exportCurrentItem.type}
                        data={exportCurrentItem.data}
                        schoolInfo={schoolInfo}
                        cardTheme={cardTheme}
                        qrUrl={
                          exportCurrentItem.type === 'siswa'
                            ? studentQrUrls[exportCurrentItem.data.id]
                            : teacherQrUrls[exportCurrentItem.data.id]
                        }
                        onTriggerPhotoUpload={() => {}}
                        onRemovePhoto={() => {}}
                        onPrintSingle={() => {}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar when Exporting */}
              {isExportingJpg && (
                <div className="bg-blue-50 border-2 border-blue-400 p-3 rounded-xl space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-black text-blue-900">
                    <span className="flex items-center gap-2">
                      <DownloadCloud className="w-4 h-4 text-blue-600 animate-bounce" />
                      Mengekspor Gambar Kartu...
                    </span>
                    <span className="font-mono text-[11px]">{exportProgress}</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                *File akan diunduh langsung dengan ekstensi .{exportFormat}
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setJpgModalOpen(false)}
                  disabled={isExportingJpg}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeJpgExport}
                  disabled={isExportingJpg}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-lg border border-blue-300 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Unduh Gambar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN RENDER CONTAINER FOR EXACT CUSTOM SIZE CANVAS RENDERING */}
      {exportCurrentItem && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            zIndex: -9999,
            pointerEvents: 'none',
            opacity: 0,
          }}
        >
          <div
            ref={hiddenExportRef}
            style={{
              width: '480px',
              height: '303px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}
            className="bg-white"
          >
            <CardItem
              type={exportCurrentItem.type}
              data={exportCurrentItem.data}
              schoolInfo={schoolInfo}
              cardTheme={cardTheme}
              qrUrl={
                exportCurrentItem.type === 'siswa'
                  ? studentQrUrls[exportCurrentItem.data.id]
                  : teacherQrUrls[exportCurrentItem.data.id]
              }
              onTriggerPhotoUpload={() => {}}
              onRemovePhoto={() => {}}
              onPrintSingle={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENT: CARD ITEM (Pure Card Artwork Rendering)
interface CardItemProps {
  type: 'siswa' | 'guru';
  data: Student | Teacher;
  schoolInfo: SchoolInfo;
  cardTheme: 'amber' | 'emerald' | 'blue' | 'purple';
  qrUrl?: string;
  onTriggerPhotoUpload?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({
  type,
  data,
  schoolInfo,
  cardTheme,
  qrUrl,
  onTriggerPhotoUpload,
}) => {
  const isStudent = type === 'siswa';
  const student = isStudent ? (data as Student) : null;
  const teacher = !isStudent ? (data as Teacher) : null;

  // Dynamic Card Theme Classes
  let headerGradient = 'from-amber-600 via-amber-700 to-amber-800 border-amber-400/60';
  let borderClass = 'border-amber-600';
  let subTitleColor = 'text-amber-300';

  if (cardTheme === 'emerald') {
    headerGradient = 'from-emerald-700 via-teal-800 to-emerald-950 border-emerald-400/60';
    borderClass = 'border-emerald-600';
    subTitleColor = 'text-emerald-300';
  } else if (cardTheme === 'blue') {
    headerGradient = 'from-blue-800 via-indigo-900 to-slate-950 border-blue-400/60';
    borderClass = 'border-blue-600';
    subTitleColor = 'text-blue-300';
  } else if (cardTheme === 'purple') {
    headerGradient = 'from-purple-800 via-indigo-900 to-slate-950 border-purple-400/60';
    borderClass = 'border-purple-600';
    subTitleColor = 'text-purple-300';
  }

  const fotoUrl = isStudent ? student?.fotoUrl : teacher?.fotoUrl;

  return (
    <div
      className={`relative w-full aspect-[480/303] bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${borderClass} flex flex-col justify-between text-slate-900 select-none box-border shrink-0`}
    >
      {/* Top Card Header */}
      <div
        className={`bg-gradient-to-r ${headerGradient} text-white px-3.5 py-2 flex items-center justify-between border-b-2 gap-2 shadow-inner shrink-0 h-[64px]`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 bg-white text-slate-950 rounded-xl p-0.5 flex items-center justify-center shrink-0 border border-amber-300 shadow-sm overflow-hidden">
            {schoolInfo.logoUrl ? (
              <img
                src={schoolInfo.logoUrl}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
              />
            ) : (
              <Award className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`text-[8.5px] font-black tracking-widest ${subTitleColor} uppercase block leading-none truncate`}
            >
              KARTU ANGGOTA {isStudent ? 'SISWA' : 'GURU & PTK'}
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-white leading-tight truncate">
              {schoolInfo.namaSekolah}
            </h3>
            <span className="text-[8px] text-amber-100/90 font-medium block leading-tight truncate">
              NPSN: {schoolInfo.npsn} • {schoolInfo.kabupatenKota}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="px-3.5 py-2 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 grid grid-cols-12 gap-2.5 items-center flex-1 overflow-hidden">
        {/* Photo Box */}
        <div className="col-span-3 flex flex-col items-center justify-center relative group">
          <div
            onClick={onTriggerPhotoUpload}
            className={`w-[84px] h-[112px] sm:w-[92px] sm:h-[120px] bg-slate-200 border-2 border-slate-300 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-100 to-slate-300 ${
              onTriggerPhotoUpload ? 'cursor-pointer hover:border-amber-500' : ''
            }`}
            title={onTriggerPhotoUpload ? 'Klik untuk mengunggah / mengganti foto' : ''}
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={data.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-1">
                <div className="w-9 h-9 bg-amber-400/30 text-slate-800 rounded-full flex items-center justify-center mx-auto border border-amber-400/50">
                  <span className="font-black text-sm">
                    {data.jenisKelamin === 'L' ? '👦' : '👧'}
                  </span>
                </div>
                <span className="text-[7.5px] font-extrabold text-slate-600 uppercase block mt-1">
                  TANPA FOTO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Biodata Section */}
        <div className="col-span-6 space-y-1 text-slate-900 min-w-0 overflow-hidden">
          <div>
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider block leading-none">
              NAMA LENGKAP {isStudent ? 'SISWA' : 'GURU'}
            </span>
            <h4 className="font-black text-xs sm:text-sm text-amber-950 uppercase truncate leading-tight mt-0.5">
              {data.nama}
            </h4>
          </div>

          <div className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/90 text-[9.5px]">
            {isStudent ? (
              <div className="grid grid-cols-2 gap-1">
                <div className="min-w-0">
                  <span className="text-[7.5px] font-bold text-slate-500 block leading-none">
                    NIS
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 text-[10px] block truncate">
                    {student?.nis || '-'}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[7.5px] font-bold text-slate-500 block leading-none">
                    NISN
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 text-[10px] block truncate">
                    {student?.nisn || '-'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <span className="text-[7.5px] font-bold text-slate-500 block leading-none">
                  NIP / NUPTK
                </span>
                <span className="font-mono font-extrabold text-slate-900 text-[10px] block truncate">
                  {teacher?.nip || '-'}
                </span>
              </div>
            )}
          </div>

          <div className="text-[8.5px] text-slate-700 font-medium space-y-0.5 pt-0.5">
            <p className="truncate">
              <strong className="text-slate-900 font-extrabold">Alamat:</strong>{' '}
              {schoolInfo.alamat || schoolInfo.kabupatenKota}
            </p>
            <p className="truncate">
              <strong className="text-slate-900 font-extrabold">Berlaku:</strong>{' '}
              {isStudent ? 'selama menjadi siswa/i' : 'selama menjadi PTK'}
            </p>
          </div>
        </div>

        {/* QR Code Box */}
        <div className="col-span-3 flex flex-col items-center justify-center border-l border-slate-200/80 pl-2">
          <div className="w-[78px] h-[78px] sm:w-[86px] sm:h-[86px] bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <span className="text-[7.5px] font-mono font-black text-slate-600 mt-1 uppercase text-center tracking-wider">
            SCAN ABSENSI
          </span>
        </div>
      </div>

      {/* Card Footer Signature */}
      <div className="bg-slate-950 text-white text-[8.5px] px-3.5 py-1.5 flex items-center justify-between border-t border-slate-800 shrink-0 h-[30px]">
        <span className="font-mono font-bold text-amber-400 uppercase truncate">
          {schoolInfo.kabupatenKota}, 2026
        </span>
        <span className="font-extrabold text-white uppercase tracking-tight truncate ml-2">
          KEPALA SEKOLAH: {schoolInfo.namaKepalaSekolah}
        </span>
      </div>
    </div>
  );
};

// COMPONENT: CARD WRAPPER (Renders CardItem + Screen Action Toolbar)
interface CardWrapperProps {
  type: 'siswa' | 'guru';
  data: Student | Teacher;
  schoolInfo: SchoolInfo;
  cardTheme: 'amber' | 'emerald' | 'blue' | 'purple';
  qrUrl?: string;
  onTriggerPhotoUpload: () => void;
  onRemovePhoto: () => void;
  onPrintSingle: () => void;
  onDownloadJpgCustom: () => void;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  type,
  data,
  schoolInfo,
  cardTheme,
  qrUrl,
  onTriggerPhotoUpload,
  onRemovePhoto,
  onPrintSingle,
  onDownloadJpgCustom,
}) => {
  const isStudent = type === 'siswa';
  const fotoUrl = isStudent ? (data as Student).fotoUrl : (data as Teacher).fotoUrl;

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-md mx-auto">
      <CardItem
        type={type}
        data={data}
        schoolInfo={schoolInfo}
        cardTheme={cardTheme}
        qrUrl={qrUrl}
        onTriggerPhotoUpload={onTriggerPhotoUpload}
      />

      {/* Action Toolbar underneath Card */}
      <div className="no-print w-full flex items-center justify-between gap-1.5 bg-slate-900/90 text-white p-2 rounded-xl shadow-md border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={onTriggerPhotoUpload}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            title="Unggah Foto Resmi"
          >
            <Upload className="w-3 h-3" />
            {fotoUrl ? 'Ganti Foto' : '+ Upload Foto'}
          </button>
          {fotoUrl && (
            <button
              onClick={onRemovePhoto}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              title="Hapus Foto"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onDownloadJpgCustom}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            title="Download Gambar JPG Ukuran Custom"
          >
            <Download className="w-3 h-3" /> JPG Custom
          </button>
          <button
            onClick={onPrintSingle}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            title="Cetak / PDF Kartu Ini"
          >
            <Printer className="w-3 h-3" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
};
