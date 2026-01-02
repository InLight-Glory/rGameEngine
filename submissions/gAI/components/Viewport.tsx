import React, { useRef, useEffect, useState } from 'react';
import { EngineService } from '../services/EngineService';
import { Level, ViewConfig } from '../types';

interface ViewportProps {
  level: Level;
  isPlaying: boolean;
  viewConfig: ViewConfig[];
  onSelectEntity: (id: string | null) => void;
}

export const Viewport: React.FC<ViewportProps> = ({ level, isPlaying, viewConfig, onSelectEntity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineServiceRef = useRef<EngineService | null>(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Engine
    const service = new EngineService(canvasRef.current);
    engineServiceRef.current = service;
    service.onUpdateStats = (f) => setFps(Math.round(f));

    return () => {
      service.dispose();
      engineServiceRef.current = null;
    };
  }, []);

  // Sync Level Data
  useEffect(() => {
    if (engineServiceRef.current) {
        engineServiceRef.current.syncLevel(level, isPlaying);
    }
  }, [level, isPlaying]);

  // Sync View Config
  useEffect(() => {
      if (engineServiceRef.current) {
          engineServiceRef.current.setViews(viewConfig);
      }
  }, [viewConfig]);

  const handlePointerDown = (e: React.PointerEvent) => {
      if(engineServiceRef.current && !isPlaying) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if(rect) {
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const id = engineServiceRef.current.pickEntity(x, y);
              onSelectEntity(id);
          }
      }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full outline-none touch-none"
        onPointerDown={handlePointerDown}
      />
      
      {/* HUD / Overlay */}
      <div className="absolute top-2 left-2 pointer-events-none flex gap-2">
        <div className="bg-black/50 text-xs text-green-400 px-2 py-1 rounded backdrop-blur-sm border border-green-900/30 font-mono">
            FPS: {fps}
        </div>
        <div className="bg-black/50 text-xs text-blue-400 px-2 py-1 rounded backdrop-blur-sm border border-blue-900/30 font-mono">
            Mode: {isPlaying ? 'RUNNING' : 'EDITOR'}
        </div>
      </div>

      {/* View Labels Overlay */}
      {viewConfig.length > 1 && viewConfig.map(v => (
          <div key={v.id} 
               className="absolute text-white/30 text-xs font-bold uppercase tracking-widest pointer-events-none border border-white/10 p-2"
               style={{
                   left: `${v.x * 100}%`,
                   top: `${v.y * 100}%`,
                   width: `${v.w * 100}%`,
                   height: `${v.h * 100}%`,
               }}>
              {v.label}
          </div>
      ))}
    </div>
  );
};
