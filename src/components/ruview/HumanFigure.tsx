'use client';

import { Person, VitalSigns } from './useRuView';
import { useEffect, useRef } from 'react';

interface Props {
  person: Person;
  vitals: VitalSigns;
  color: string;
  index: number;
}

const POSES: Record<string, string> = {
  Standing: 'standing',
  Sitting: 'sitting',
  Walking: 'walking',
  Resting: 'resting',
};

function Heartbeat({ bpm, color }: { bpm: number; color: string }) {
  const duration = 60 / bpm;
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ animation: `heartbeat ${duration}s ease-in-out infinite` }}>
        <path
          d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
          fill={color}
        />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{bpm} BPM</span>
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          56% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function BreathingLungs({ bpm, color }: { bpm: number; color: string }) {
  const duration = 60 / bpm;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: color,
          animation: `breathe ${duration}s ease-in-out infinite`,
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{bpm} BPM</span>
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StandingSVG({ color, animate }: { color: string; animate: boolean }) {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full">
      {/* Head */}
      <circle cx="50" cy="25" r="18" fill={color} opacity="0.9" />
      {/* Neck */}
      <rect x="44" y="42" width="12" height="10" fill={color} opacity="0.8" rx="3" />
      {/* Body */}
      <ellipse cx="50" cy="90" rx="22" ry="35" fill={color} opacity="0.85" />
      {/* Left arm */}
      <path
        d={animate ? 'M 30 65 Q 10 90 15 120' : 'M 30 65 Q 15 95 20 120'}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8"
        style={{ transition: 'all 0.8s ease-in-out' }}
      />
      {/* Right arm */}
      <path
        d={animate ? 'M 70 65 Q 90 90 85 120' : 'M 70 65 Q 85 95 80 120'}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8"
        style={{ transition: 'all 0.8s ease-in-out' }}
      />
      {/* Left leg */}
      <path d="M 40 122 Q 35 155 32 185" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85" />
      {/* Right leg */}
      <path d="M 60 122 Q 65 155 68 185" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

function SittingSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 200" className="w-full h-full">
      {/* Head */}
      <circle cx="50" cy="30" r="18" fill={color} opacity="0.9" />
      {/* Neck */}
      <rect x="44" y="47" width="12" height="8" fill={color} opacity="0.8" rx="3" />
      {/* Body slightly leaned */}
      <ellipse cx="50" cy="90" rx="22" ry="32" fill={color} opacity="0.85" />
      {/* Left arm resting */}
      <path d="M 30 68 Q 18 95 22 112" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      {/* Right arm resting */}
      <path d="M 70 68 Q 82 95 78 112" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      {/* Left leg bent */}
      <path d="M 38 120 Q 30 140 25 145 Q 50 145 80 145" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85" />
      {/* Right leg bent */}
      <path d="M 62 120 Q 70 140 75 145" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85" />
      {/* Chair seat */}
      <rect x="10" y="143" width="90" height="8" fill={color} opacity="0.3" rx="4" />
      {/* Chair back */}
      <rect x="85" y="90" width="8" height="65" fill={color} opacity="0.2" rx="4" />
    </svg>
  );
}

function WalkingSVG({ color, tick }: { color: string; tick: number }) {
  const phase = (tick % 60) / 60;
  const legAngle = Math.sin(phase * Math.PI * 2) * 25;
  const armAngle = Math.sin(phase * Math.PI * 2 + Math.PI) * 20;

  return (
    <svg viewBox="0 0 100 200" className="w-full h-full">
      {/* Head with slight bob */}
      <circle cx="50" cy={25 + Math.sin(phase * Math.PI * 4) * 2} r="18" fill={color} opacity="0.9" />
      {/* Body */}
      <ellipse cx="50" cy={90 + Math.sin(phase * Math.PI * 4)} rx="21" ry="33" fill={color} opacity="0.85" />
      {/* Left arm swinging */}
      <path
        d={`M 30 68 Q ${20 + armAngle * 0.5} 95 ${22 + armAngle} 118`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8"
      />
      {/* Right arm swinging */}
      <path
        d={`M 70 68 Q ${80 - armAngle * 0.5} 95 ${78 - armAngle} 118`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.8"
      />
      {/* Left leg */}
      <path
        d={`M 40 120 Q ${35 + legAngle} 150 ${33 + legAngle * 1.2} 180`}
        fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85"
      />
      {/* Right leg */}
      <path
        d={`M 60 120 Q ${65 - legAngle} 150 ${67 - legAngle * 1.2} 180`}
        fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.85"
      />
    </svg>
  );
}

function RestingSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 220 100" className="w-full h-full">
      {/* Head */}
      <circle cx="185" cy="35" r="18" fill={color} opacity="0.9" />
      {/* Body horizontal */}
      <ellipse cx="110" cy="62" rx="70" ry="18" fill={color} opacity="0.85" />
      {/* Arms */}
      <path d="M 150 55 Q 160 45 170 50" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" opacity="0.8" />
      <path d="M 70 58 Q 50 50 35 55" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" opacity="0.8" />
      {/* Legs */}
      <path d="M 45 68 Q 20 72 10 70" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" opacity="0.85" />
      <path d="M 45 72 Q 20 80 10 78" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" opacity="0.85" />
      {/* Bed/floor */}
      <rect x="5" y="82" width="210" height="6" fill={color} opacity="0.2" rx="3" />
    </svg>
  );
}

export default function HumanFigure({ person, vitals, color, index }: Props) {
  const tickRef = useRef(0);
  const rafRef = useRef<number>(0);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tick = 0;
    const loop = () => {
      tick += 1;
      tickRef.current = tick;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pose = POSES[person.activity] ?? 'standing';
  const isWalking = pose === 'walking';

  return (
    <div
      className="flex flex-col items-center rounded-2xl p-4 border"
      style={{ borderColor: color + '40', backgroundColor: color + '08' }}
    >
      {/* Name badge */}
      <div className="flex items-center gap-2 mb-3 self-start">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-bold text-white">Persona {person.id}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: color + '25', color }}
        >
          {person.activity}
        </span>
        <span className="text-xs text-gray-500 ml-1">{person.zone}</span>
      </div>

      {/* Figure */}
      <div className="w-32 h-48 flex items-center justify-center mb-3">
        {pose === 'standing' && <StandingSVG color={color} animate={false} />}
        {pose === 'sitting' && <SittingSVG color={color} />}
        {pose === 'walking' && <WalkingSVG color={color} tick={tickRef.current} />}
        {pose === 'resting' && <RestingSVG color={color} />}
      </div>

      {/* Vitals */}
      <div className="flex flex-col gap-2 w-full">
        <Heartbeat bpm={vitals.heartRate} color="#ef4444" />
        <BreathingLungs bpm={vitals.breathingRate} color="#3b82f6" />
      </div>
    </div>
  );
}
