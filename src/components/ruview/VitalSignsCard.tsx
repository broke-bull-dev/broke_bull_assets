'use client';

import { VitalSigns } from './useRuView';

interface Props {
  vitals: VitalSigns;
}

function Ring({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const pct = Math.min(1, value / max);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
          <circle cx="35" cy="35" r={r} fill="none" stroke="#1f2937" strokeWidth="7" />
          <circle
            cx="35" cy="35" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{value}</span>
          <span className="text-[9px] text-gray-400 leading-none">{unit}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function Bar({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value} {unit}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function VitalSignsCard({ vitals }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Vital Signs
      </h3>

      <div className="flex justify-around mb-5">
        <Ring value={vitals.heartRate} max={180} label="Heart Rate" unit="BPM" color="#ef4444" />
        <Ring value={vitals.breathingRate} max={40} label="Breathing" unit="BPM" color="#3b82f6" />
      </div>

      <div className="flex flex-col gap-3">
        <Bar value={vitals.heartRateVariability} max={100} label="HRV" unit="ms" color="#a855f7" />
        <Bar value={vitals.breathingDepth} max={100} label="Breath Depth" unit="%" color="#06b6d4" />
      </div>
    </div>
  );
}
