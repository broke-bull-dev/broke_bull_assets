'use client';

import { useEffect, useRef, useState } from 'react';
import { useRuView } from '@/components/ruview/useRuView';
import ConnectionPanel from '@/components/ruview/ConnectionPanel';
import StatsBar from '@/components/ruview/StatsBar';
import PresenceCard from '@/components/ruview/PresenceCard';
import VitalSignsCard from '@/components/ruview/VitalSignsCard';
import SignalCard from '@/components/ruview/SignalCard';
import PoseViewer from '@/components/ruview/PoseViewer';
import HumanFigure from '@/components/ruview/HumanFigure';
import RoomView from '@/components/ruview/RoomView';

export default function RuViewDashboard() {
  const { status, frame, isSimulated, connect, disconnect } = useRuView();
  const [fps, setFps] = useState(0);
  const fpsCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  useEffect(() => {
    if (frame) {
      fpsCountRef.current += 1;
      const now = Date.now();
      const elapsed = now - lastFrameTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((fpsCountRef.current * 1000) / elapsed));
        fpsCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
    }
  }, [frame]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📡</span>
            <div>
              <h1 className="text-white font-bold text-base leading-none">RuView Dashboard</h1>
              <p className="text-gray-400 text-xs">WiFi Spatial Intelligence — No cameras needed</p>
            </div>
          </div>
          <a
            href="https://github.com/ruvnet/RuView"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            ruvnet/RuView
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Connection */}
        <ConnectionPanel
          status={status}
          onConnect={connect}
          onDisconnect={disconnect}
          isSimulated={isSimulated}
        />

        {/* Empty state */}
        {!frame && (status === 'disconnected' || status === 'connecting') && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready to sense</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Connect to your RuView server or click Connect to start demo mode with simulated WiFi sensing data.
            </p>
            <button
              onClick={connect}
              className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Start Demo
            </button>
          </div>
        )}

        {/* Live dashboard */}
        {frame && (
          <>
            <StatsBar frame={frame} fps={fps} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <PresenceCard frame={frame} />
              <VitalSignsCard vitals={frame.vitalSigns} />
              <SignalCard frame={frame} />
            </div>

            {/* Room view + human figures */}
            <RoomView frame={frame} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {frame.persons.map((person, i) => (
                <HumanFigure
                  key={person.id}
                  person={person}
                  vitals={frame.vitalSigns}
                  color={['#3b82f6', '#f59e0b', '#10b981', '#ef4444'][i % 4]}
                  index={i}
                />
              ))}
              {frame.personCount === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-gray-500">
                  <span className="text-4xl mb-2">🏠</span>
                  <p className="text-sm">Sin personas detectadas en el cuarto</p>
                </div>
              )}
            </div>

            <PoseViewer persons={frame.persons} />

            {/* Raw data accordion */}
            <details className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-sm text-gray-400 hover:text-white select-none">
                Raw JSON frame
              </summary>
              <pre className="px-5 pb-4 text-xs text-green-400 overflow-auto max-h-64 bg-gray-900 m-0">
                {JSON.stringify(frame, null, 2)}
              </pre>
            </details>
          </>
        )}
      </main>

      <footer className="border-t border-gray-700/50 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-500">
          <span>Powered by <a href="https://github.com/ruvnet/RuView" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400">RuView</a> — WiFi spatial intelligence without video</span>
          <span>No cameras. No wearables. Just WiFi.</span>
        </div>
      </footer>
    </div>
  );
}
