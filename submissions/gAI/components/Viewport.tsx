import React, { useEffect, useRef } from 'react';
import { BabylonManager } from '../engine/BabylonManager';
import { Level } from '../types';

interface ViewportProps {
  level: Level;
  onMount: (manager: BabylonManager) => void;
}

export const Viewport: React.FC<ViewportProps> = ({ level, onMount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<BabylonManager | null>(null);

  useEffect(() => {
    if (canvasRef.current && !managerRef.current) {
      managerRef.current = new BabylonManager(canvasRef.current);
      onMount(managerRef.current);
    }
    
    return () => {
      // Typically we dispose on unmount, but for hot-reload dev we might want to be careful
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

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block outline-none touch-none"
    />
  );
};