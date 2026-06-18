'use client';

import { SensingFrame } from './useRuView';

interface Props {
  frame: SensingFrame;
  fps: number;
}

function Stat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-white font-bold text-lg leading-none">{value}</p>
        <p className="text-gray-400 text-xs">{label}</p>
        {sub && <p className="text-gray-500 text-[10px]">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatsBar({ frame, fps }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat icon="👥" label="Persons" value={String(frame.personCount)} sub="detected now" />
      <Stat icon="❤️" label="Heart Rate" value={`${frame.vitalSigns.heartRate} BPM`} sub="avg across persons" />
      <Stat icon="🌬️" label="Breathing" value={`${frame.vitalSigns.breathingRate} BPM`} sub="respiratory rate" />
      <Stat icon="📶" label="FPS" value={String(fps)} sub={`RSSI ${frame.rssi} dBm`} />
    </div>
  );
}
