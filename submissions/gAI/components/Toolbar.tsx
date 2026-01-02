import React from 'react';
import { Play, Square, Save, Layout, LayoutDashboard } from 'lucide-react';

interface ToolbarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSave: () => void;
  onToggleView: () => void;
  isSplitView: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ isPlaying, onTogglePlay, onSave, onToggleView, isSplitView }) => {
  return (
    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center font-bold text-white text-xs">
                N
            </div>
            <span className="font-bold text-gray-200 tracking-tight">Nebula Engine</span>
        </div>
        
        <div className="h-6 w-px bg-gray-800 mx-2"></div>

        <button 
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${
                isPlaying 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
            }`}
        >
            {isPlaying ? <><Square size={12} fill="currentColor" /> STOP</> : <><Play size={12} fill="currentColor" /> PLAY</>}
        </button>
      </div>

      <div className="flex items-center gap-2">
         <button 
            onClick={onToggleView}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 text-gray-400 text-xs border border-transparent hover:border-gray-700 transition-colors"
            title="Toggle Split View"
        >
            {isSplitView ? <LayoutDashboard size={14} /> : <Layout size={14} />}
            <span>{isSplitView ? 'Dual View' : 'Single View'}</span>
        </button>

        <button 
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-800 text-gray-400 text-xs border border-transparent hover:border-gray-700 transition-colors"
        >
            <Save size={14} />
            <span>Save JSON</span>
        </button>
      </div>
    </div>
  );
};
