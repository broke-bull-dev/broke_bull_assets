'use client';

import { SensingFrame } from './useRuView';
import { useRef, useEffect } from 'react';

interface Props {
  frame: SensingFrame;
}

function Gauge({ value, min, max, label, unit, color, invert = false }: {
  value: number; min: number; max: number; label: string; unit: string; color: string; invert?: boolean;
}) {
  const pct = invert
    ? 1 - Math.min(1, Math.max(0, (value - min) / (max - min)))
    : Math.min(1, Math.max(0, (value - min) / (max - min)));

  const angle = -120 + pct * 240;
  const quality = pct > 0.7 ? 'text-green-400' : pct > 0.4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-14 overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Background arc */}
          <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
          {/* Value arc */}
          <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${pct * 140} 140`} />
          {/* Needle */}
          <line
            x1="50" y1="55"
            x2={50 + 30 * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={55 + 30 * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke="white" strokeWidth="2" strokeLinecap="round"
            style={{ transition: 'all 0.5s ease' }}
          />
          <circle cx="50" cy="55" r="3" fill="white" />
        </svg>
      </div>
      <p className={`text-sm font-bold ${quality}`}>{value} <span className="text-xs font-normal text-gray-400">{unit}</span></p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

interface HistoryEntry { value: number; t: number }

function MotionSparkline({ motionLevel }: { motionLevel: number }) {
  const historyRef = useRef<HistoryEntry[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    historyRef.current.push({ value: motionLevel, t: Date.now() });
    if (historyRef.current.length > 60) historyRef.current.shift();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const data = historyRef.current;
    if (data.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    data.forEach((pt, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (pt.value / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.fill();
  }, [motionLevel]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Motion Level</span>
        <span className="text-amber-400 font-medium">{Math.round(motionLevel)}%</span>
      </div>
      <canvas ref={canvasRef} width={300} height={50} className="w-full h-12 rounded-lg bg-gray-700/30" />
    </div>
  );
}

export default function SignalCard({ frame }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        WiFi Signal & Motion
      </h3>

      <div className="flex justify-around mb-5">
        <Gauge value={frame.rssi} min={-90} max={-30} label="Signal (RSSI)" unit="dBm" color="#06b6d4" invert />
        <Gauge value={frame.signalQuality} min={0} max={100} label="Quality" unit="%" color="#10b981" />
      </div>

      <MotionSparkline motionLevel={frame.motionLevel} />

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">Zone</span>
        <span className="text-cyan-400 font-medium">{frame.roomZone}</span>
      </div>
    </div>
  );
}
