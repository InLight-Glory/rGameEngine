import React, { useEffect, useRef, useState } from 'react';
import { BabylonManager } from '../engine/BabylonManager';
import { Level } from '../types';
import { Move, RotateCw, Scaling } from 'lucide-react';

interface ViewportProps {
  level: Level;
  onMount: (manager: BabylonManager) => void;
}

export const Viewport: React.FC<ViewportProps> = ({ level, onMount }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<BabylonManager | null>(null);
  const [gizmoMode, setGizmoMode] = useState<'position' | 'rotation' | 'scale'>('position');

  useEffect(() => {
    // Initialize Engine
    if (canvasRef.current && !managerRef.current) {
      managerRef.current = new BabylonManager(canvasRef.current);
      onMount(managerRef.current);
    }
    
    // Watch for container resize
    const resizeObserver = new ResizeObserver(() => {
      if (managerRef.current) {
        managerRef.current.resize();
      }
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, [onMount]);

  // Sync level changes to engine
  useEffect(() => {
    if (managerRef.current && level) {
      managerRef.current.loadLevel(level);
    }
  }, [level]);

  // Handle Gizmo Mode Switch
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setGizmoMode(gizmoMode);
    }
  }, [gizmoMode]);

  return (
    <div ref={parentRef} className="w-full h-full overflow-hidden relative group">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block outline-none touch-none"
      />
      
      {/* Gizmo Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-[#252526] p-1 rounded-lg border border-black shadow-lg">
        <button 
          onClick={() => setGizmoMode('position')}
          className={`p-1.5 rounded hover:bg-[#3e3e42] ${gizmoMode === 'position' ? 'bg-[#007acc] text-white' : 'text-gray-400'}`}
          title="Move (W)"
        >
          <Move size={16} />
        </button>
        <button 
          onClick={() => setGizmoMode('rotation')}
          className={`p-1.5 rounded hover:bg-[#3e3e42] ${gizmoMode === 'rotation' ? 'bg-[#007acc] text-white' : 'text-gray-400'}`}
          title="Rotate (E)"
        >
          <RotateCw size={16} />
        </button>
        <button 
          onClick={() => setGizmoMode('scale')}
          className={`p-1.5 rounded hover:bg-[#3e3e42] ${gizmoMode === 'scale' ? 'bg-[#007acc] text-white' : 'text-gray-400'}`}
          title="Scale (R)"
        >
          <Scaling size={16} />
        </button>
      </div>

      <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-black/50 backdrop-blur text-xs px-2 py-1 rounded border border-white/10 text-gray-300">
            Perspective
          </div>
      </div>
    </div>
  );
};