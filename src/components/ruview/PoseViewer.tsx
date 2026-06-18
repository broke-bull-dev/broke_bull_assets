'use client';

import { Person } from './useRuView';
import { useRef, useEffect } from 'react';

interface Props {
  persons: Person[];
}

// 17 COCO keypoints pairs for skeleton
const SKELETON_PAIRS = [
  [0, 1], [0, 2], [1, 3], [2, 4],   // head
  [5, 6],                              // shoulders
  [5, 7], [7, 9],                     // left arm
  [6, 8], [8, 10],                    // right arm
  [5, 11], [6, 12],                   // torso sides
  [11, 12],                           // hips
  [11, 13], [13, 15],                 // left leg
  [12, 14], [14, 16],                 // right leg
];

const PERSON_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export default function PoseViewer({ persons }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid background
    ctx.strokeStyle = 'rgba(55,65,81,0.5)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    persons.forEach((person, pi) => {
      const color = PERSON_COLORS[pi % PERSON_COLORS.length];
      const kps = person.pose.map((kp) => ({ x: kp.x * w, y: kp.y * h, conf: kp.confidence }));

      // Draw skeleton
      SKELETON_PAIRS.forEach(([a, b]) => {
        if (!kps[a] || !kps[b]) return;
        if (kps[a].conf < 0.3 || kps[b].conf < 0.3) return;
        ctx.beginPath();
        ctx.moveTo(kps[a].x, kps[a].y);
        ctx.lineTo(kps[b].x, kps[b].y);
        ctx.strokeStyle = color + '99';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw keypoints
      kps.forEach((kp) => {
        if (kp.conf < 0.3) return;
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Label
      if (kps[0]) {
        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`P${person.id} – ${person.activity}`, kps[0].x + 6, kps[0].y - 6);
      }
    });

    if (persons.length === 0) {
      ctx.fillStyle = '#4b5563';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No persons detected', w / 2, h / 2);
    }
  }, [persons]);

  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        Pose Estimation (17-Keypoint)
      </h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full rounded-xl bg-gray-900"
      />
      <div className="mt-3 flex gap-3 flex-wrap">
        {persons.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PERSON_COLORS[i % PERSON_COLORS.length] }} />
            <span className="text-gray-300">Person {p.id}</span>
            <span className="text-gray-500">— {p.activity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
