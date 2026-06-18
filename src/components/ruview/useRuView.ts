'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Person {
  id: number;
  pose: { x: number; y: number; confidence: number }[];
  activity: string;
  zone: string;
}

export interface VitalSigns {
  heartRate: number;
  breathingRate: number;
  heartRateVariability: number;
  breathingDepth: number;
}

export interface SensingFrame {
  timestamp: number;
  presenceDetected: boolean;
  personCount: number;
  persons: Person[];
  vitalSigns: VitalSigns;
  motionLevel: number;
  fallDetected: boolean;
  rssi: number;
  roomZone: string;
  signalQuality: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'simulated' | 'error';

interface RuViewConfig {
  host: string;
  restPort: number;
  wsPort: number;
}

const DEFAULT_CONFIG: RuViewConfig = {
  host: 'localhost',
  restPort: 3000,
  wsPort: 3001,
};

function generateSimulatedFrame(tick: number): SensingFrame {
  const presenceDetected = true;
  const personCount = tick % 30 < 5 ? 2 : 1;
  const hrBase = 72 + Math.sin(tick * 0.1) * 8;
  const brBase = 15 + Math.sin(tick * 0.05) * 3;

  const activities = ['Standing', 'Sitting', 'Walking', 'Resting'];
  const zones = ['Living Room', 'Kitchen', 'Bedroom', 'Office'];

  const persons: Person[] = Array.from({ length: personCount }, (_, i) => ({
    id: i + 1,
    pose: Array.from({ length: 17 }, (_, j) => ({
      x: 0.3 + i * 0.4 + Math.sin(tick * 0.05 + j) * 0.05,
      y: 0.2 + j * 0.04 + Math.cos(tick * 0.03 + j) * 0.02,
      confidence: 0.75 + Math.random() * 0.2,
    })),
    activity: activities[Math.floor((tick * 0.1 + i * 3) % activities.length)],
    zone: zones[i % zones.length],
  }));

  return {
    timestamp: Date.now(),
    presenceDetected,
    personCount,
    persons,
    vitalSigns: {
      heartRate: Math.round(hrBase + Math.random() * 2),
      breathingRate: Math.round(brBase + Math.random()),
      heartRateVariability: Math.round(45 + Math.sin(tick * 0.07) * 15),
      breathingDepth: Math.round(70 + Math.sin(tick * 0.04) * 20),
    },
    motionLevel: Math.max(0, Math.min(100, 30 + Math.sin(tick * 0.15) * 25 + Math.random() * 10)),
    fallDetected: false,
    rssi: Math.round(-55 + Math.sin(tick * 0.03) * 10),
    roomZone: zones[Math.floor(tick * 0.02) % zones.length],
    signalQuality: Math.round(85 + Math.sin(tick * 0.02) * 10),
  };
}

export function useRuView(config: RuViewConfig = DEFAULT_CONFIG) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [frame, setFrame] = useState<SensingFrame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);

  const stopSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    setIsSimulated(true);
    setStatus('simulated');
    stopSimulation();
    simIntervalRef.current = setInterval(() => {
      tickRef.current += 1;
      setFrame(generateSimulatedFrame(tickRef.current));
    }, 200);
  }, [stopSimulation]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopSimulation();
    setStatus('disconnected');
    setFrame(null);
    setIsSimulated(false);
  }, [stopSimulation]);

  const connect = useCallback(async () => {
    disconnect();
    setStatus('connecting');
    setError(null);

    // Try REST health check first
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch(`http://${config.host}:${config.restPort}/health`, {
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error('Health check failed');
    } catch {
      // Server not available — fall back to simulation
      startSimulation();
      return;
    }

    // Connect WebSocket
    const wsUrl = `ws://${config.host}:${config.wsPort}/ws/sensing`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setIsSimulated(false);
      };
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data) as SensingFrame;
          setFrame(data);
        } catch {
          // ignore parse errors
        }
      };
      ws.onerror = () => {
        setError('WebSocket error');
        startSimulation();
      };
      ws.onclose = () => {
        if (status === 'connected') setStatus('disconnected');
      };
    } catch {
      startSimulation();
    }
  }, [config, disconnect, startSimulation, status]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { status, frame, error, isSimulated, connect, disconnect };
}
