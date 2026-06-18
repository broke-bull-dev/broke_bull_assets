'use client';

import { ConnectionStatus } from './useRuView';
import { useState } from 'react';

interface Props {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  isSimulated: boolean;
}

const STATUS_STYLES: Record<ConnectionStatus, { dot: string; label: string; badge: string }> = {
  disconnected: { dot: 'bg-gray-500', label: 'Disconnected', badge: 'bg-gray-700 text-gray-300' },
  connecting:   { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting…', badge: 'bg-yellow-900/60 text-yellow-300' },
  connected:    { dot: 'bg-green-400 animate-pulse', label: 'Live', badge: 'bg-green-900/60 text-green-300' },
  simulated:    { dot: 'bg-blue-400 animate-pulse', label: 'Simulated', badge: 'bg-blue-900/60 text-blue-300' },
  error:        { dot: 'bg-red-400', label: 'Error', badge: 'bg-red-900/60 text-red-300' },
};

export default function ConnectionPanel({ status, onConnect, onDisconnect, isSimulated }: Props) {
  const [host, setHost] = useState('localhost');
  const [restPort, setRestPort] = useState('3000');

  const s = STATUS_STYLES[status];

  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">📡</div>
          <div>
            <h2 className="text-white font-semibold text-sm">RuView Connection</h2>
            <p className="text-gray-400 text-xs">WiFi-based spatial intelligence</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${s.badge}`}>
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          {s.label}
          {isSimulated && <span className="ml-1 text-[10px] opacity-70">(demo mode)</span>}
        </div>
      </div>

      {status === 'disconnected' || status === 'error' ? (
        <div className="mt-4 flex gap-2 flex-wrap">
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Host (e.g. localhost)"
            className="flex-1 min-w-32 bg-gray-700 text-white text-xs rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={restPort}
            onChange={(e) => setRestPort(e.target.value)}
            placeholder="REST port"
            className="w-24 bg-gray-700 text-white text-xs rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={onConnect}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Connect
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {isSimulated
              ? 'No RuView server found — running with generated demo data. Connect an ESP32 node to go live.'
              : `Streaming from ws://${host}:${parseInt(restPort) + 1}/ws/sensing`}
          </p>
          <button
            onClick={onDisconnect}
            className="ml-4 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
