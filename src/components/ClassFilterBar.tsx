import React from 'react';
import { ClassCategory, Teacher } from '../types';
import { Filter, UserCheck, Layers, BookOpen } from 'lucide-react';

interface ClassFilterBarProps {
  classes: ClassCategory[];
  teachers: Teacher[];
  selectedKelas: string;
  onSelectKelas: (kelas: string) => void;
  title?: string;
}

export const ClassFilterBar: React.FC<ClassFilterBarProps> = ({
  classes,
  teachers,
  selectedKelas,
  onSelectKelas,
  title = 'KATEGORI KELAS:',
}) => {
  // Find current assigned Wali Kelas if a specific class is selected
  const currentClassObj = classes.find(
    (c) => c.namaKelas.toLowerCase() === selectedKelas.toLowerCase()
  );
  const currentWali = currentClassObj
    ? teachers.find((t) => t.id === currentClassObj.waliKelasId)
    : null;

  return (
    <div className="bg-amber-100/90 border-2 border-amber-300 p-3 rounded-xl space-y-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wide">
          <Filter className="w-4 h-4 text-emerald-800" />
          <span>{title}</span>
        </div>

        {/* Selected Class & Wali Kelas Badge */}
        {selectedKelas !== 'SEMUA' && currentWali ? (
          <div className="flex items-center gap-2 bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>
              Wali Kelas {selectedKelas}: <strong className="text-amber-200">{currentWali.nama}</strong>
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
              NIP. {currentWali.nip}
            </span>
          </div>
        ) : selectedKelas !== 'SEMUA' ? (
          <div className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded text-xs font-bold">
            Wali Kelas belum ditentukan
          </div>
        ) : (
          <div className="bg-blue-900 text-blue-100 px-2.5 py-0.5 rounded text-xs font-bold">
            Menampilkan Semua Kelas (I - VI)
          </div>
        )}
      </div>

      {/* Pill Buttons for Classes */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onSelectKelas('SEMUA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm ${
            selectedKelas === 'SEMUA'
              ? 'bg-slate-900 text-white border-black ring-2 ring-slate-400'
              : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-200'
          }`}
        >
          Semua Kelas
        </button>

        {classes.map((c) => {
          const isSelected = selectedKelas.toLowerCase() === c.namaKelas.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onSelectKelas(c.namaKelas)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm flex items-center gap-1 ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-900 ring-2 ring-emerald-300 shadow'
                  : 'bg-gradient-to-b from-amber-50 to-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <BookOpen className="w-3 h-3 text-emerald-900" />
              <span>{c.namaKelas}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
