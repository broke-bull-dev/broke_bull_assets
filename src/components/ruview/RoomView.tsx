'use client';

import { SensingFrame } from './useRuView';
import { useEffect, useRef } from 'react';

interface Props {
  frame: SensingFrame;
}

const PERSON_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const ZONES: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {
  'Living Room': { x: 0.05, y: 0.05, w: 0.45, h: 0.55, label: 'Sala' },
  'Kitchen':     { x: 0.55, y: 0.05, w: 0.4,  h: 0.45, label: 'Cocina' },
  'Bedroom':     { x: 0.05, y: 0.65, w: 0.4,  h: 0.3,  label: 'Dormitorio' },
  'Office':      { x: 0.55, y: 0.55, w: 0.4,  h: 0.4,  label: 'Oficina' },
};

const FURNITURE: { type: string; x: number; y: number; w: number; h: number; zone: string }[] = [
  { type: 'sofa',  x: 0.08, y: 0.38, w: 0.25, h: 0.12, zone: 'Living Room' },
  { type: 'table', x: 0.58, y: 0.08, w: 0.18, h: 0.12, zone: 'Kitchen' },
  { type: 'bed',   x: 0.08, y: 0.68, w: 0.22, h: 0.2,  zone: 'Bedroom' },
  { type: 'desk',  x: 0.58, y: 0.58, w: 0.2,  h: 0.14, zone: 'Office' },
];

const FURNITURE_COLORS: Record<string, string> = {
  sofa: '#6366f1',
  table: '#d97706',
  bed: '#0891b2',
  desk: '#059669',
};

const FURNITURE_LABELS: Record<string, string> = {
  sofa: '🛋️',
  table: '🍽️',
  bed: '🛏️',
  desk: '💻',
};

export default function RoomView({ frame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const personPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    // Initialize positions for each person
    frame.persons.forEach((p, i) => {
      if (!personPositionsRef.current[i]) {
        const zone = ZONES[p.zone] ?? ZONES['Living Room'];
        personPositionsRef.current[i] = {
          x: zone.x + zone.w * 0.5,
          y: zone.y + zone.h * 0.5,
        };
      }
    });
  }, [frame.persons]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Floor background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(55,65,81,0.4)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Draw zones
      Object.entries(ZONES).forEach(([name, z]) => {
        const zx = z.x * W, zy = z.y * H, zw = z.w * W, zh = z.h * H;
        ctx.strokeStyle = 'rgba(156,163,175,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(zx, zy, zw, zh);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(156,163,175,0.06)';
        ctx.fillRect(zx, zy, zw, zh);

        ctx.fillStyle = 'rgba(156,163,175,0.5)';
        ctx.font = '10px sans-serif';
        ctx.fillText(z.label, zx + 6, zy + 14);
      });

      // Draw furniture
      FURNITURE.forEach((f) => {
        const fx = f.x * W, fy = f.y * H, fw = f.w * W, fh = f.h * H;
        ctx.fillStyle = FURNITURE_COLORS[f.type] + '22';
        ctx.strokeStyle = FURNITURE_COLORS[f.type] + '66';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(FURNITURE_LABELS[f.type], fx + fw / 2, fy + fh / 2 + 5);
        ctx.textAlign = 'left';
      });

      // WiFi signal rings from center
      const cx = W * 0.5, cy = H * 0.5;
      const waveProgress = (tick % 60) / 60;
      [0.2, 0.5, 0.8].forEach((offset) => {
        const progress = (waveProgress + offset) % 1;
        const radius = progress * Math.min(W, H) * 0.55;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,${0.12 * (1 - progress)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw persons
      frame.persons.forEach((person, i) => {
        const color = PERSON_COLORS[i % PERSON_COLORS.length];
        const zone = ZONES[person.zone] ?? ZONES['Living Room'];

        // Drift position slightly per tick
        const targetX = zone.x * W + zone.w * W * (0.4 + Math.sin(tick * 0.02 + i * 2) * 0.15);
        const targetY = zone.y * H + zone.h * H * (0.5 + Math.cos(tick * 0.015 + i * 1.5) * 0.2);

        if (!personPositionsRef.current[i]) {
          personPositionsRef.current[i] = { x: targetX, y: targetY };
        }
        // Smooth interpolation
        personPositionsRef.current[i].x += (targetX - personPositionsRef.current[i].x) * 0.03;
        personPositionsRef.current[i].y += (targetY - personPositionsRef.current[i].y) * 0.03;

        const px = personPositionsRef.current[i].x;
        const py = personPositionsRef.current[i].y;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(px, py + 18, 14, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // Pulse ring
        const pulse = 0.5 + Math.sin(tick * 0.1 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 22 + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Person dot — body
        ctx.beginPath();
        ctx.arc(px, py + 8, 10, 0, Math.PI * 2);
        ctx.fillStyle = color + 'cc';
        ctx.fill();

        // Person dot — head
        ctx.beginPath();
        ctx.arc(px, py - 4, 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Activity icon
        const icons: Record<string, string> = { Standing: '🧍', Sitting: '🪑', Walking: '🚶', Resting: '😴' };
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icons[person.activity] ?? '👤', px, py - 22);

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`P${person.id}`, px, py + 30);
        ctx.textAlign = 'left';
      });

      // No presence
      if (frame.personCount === 0) {
        ctx.fillStyle = 'rgba(75,85,99,0.8)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sin presencia detectada', W / 2, H / 2);
        ctx.textAlign = 'left';
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [frame]);

  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Vista de Habitación — Planta
      </h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full rounded-xl"
      />
      <div className="mt-3 flex gap-4 flex-wrap text-xs text-gray-500">
        <span>🛋️ Sala</span>
        <span>🍽️ Cocina</span>
        <span>🛏️ Dormitorio</span>
        <span>💻 Oficina</span>
        <span className="ml-auto text-cyan-600">〰️ señal WiFi</span>
      </div>
    </div>
  );
}
