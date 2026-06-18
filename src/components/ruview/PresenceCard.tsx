'use client';

import { SensingFrame } from './useRuView';

interface Props {
  frame: SensingFrame;
}

const ACTIVITIES: Record<string, string> = {
  Standing: '🧍',
  Sitting: '🪑',
  Walking: '🚶',
  Resting: '😴',
};

export default function PresenceCard({ frame }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${frame.presenceDetected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        Presence Detection
      </h3>

      {/* Person count */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-4xl font-bold text-white">{frame.personCount}</p>
          <p className="text-xs text-gray-400">person{frame.personCount !== 1 ? 's' : ''} detected</p>
        </div>
        <div className="text-5xl">{frame.personCount === 0 ? '🏠' : frame.personCount === 1 ? '👤' : '👥'}</div>
      </div>

      {/* Fall alert */}
      {frame.fallDetected && (
        <div className="mb-4 bg-red-900/60 border border-red-500 rounded-xl p-3 flex items-center gap-2 animate-pulse">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-red-300 font-semibold text-sm">Fall Detected!</p>
            <p className="text-red-400 text-xs">Emergency alert triggered</p>
          </div>
        </div>
      )}

      {/* Per-person activity */}
      <div className="flex flex-col gap-2">
        {frame.persons.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-700/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ACTIVITIES[p.activity] ?? '👤'}</span>
              <div>
                <p className="text-white text-xs font-medium">Person {p.id}</p>
                <p className="text-gray-400 text-[10px]">{p.activity}</p>
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded-full">{p.zone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
