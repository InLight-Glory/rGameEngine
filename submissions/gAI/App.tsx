import React, { useState, useEffect } from 'react';
import { DEFAULT_LEVEL, Level, Entity, ComponentType, ComponentData, Vector3 } from './types';
import { Hierarchy } from './components/Hierarchy';
import { Inspector } from './components/Inspector';
import { Viewport } from './components/Viewport';
import { Play, Square, Save, FolderOpen } from 'lucide-react';
import { BabylonManager } from './engine/BabylonManager';

export default function App() {
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [babylonManager, setBabylonManager] = useState<BabylonManager | null>(null);

  const selectedEntity = level.entities.find(e => e.id === selectedId) || null;

  const handleUpdateEntity = (id: string, updates: Partial<Entity>) => {
    setLevel(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const handleUpdateComponent = (entityId: string, componentId: string, data: Partial<ComponentData>) => {
    setLevel(prev => ({
      ...prev,
      entities: prev.entities.map(e => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          components: e.components.map(c => c.id === componentId ? { ...c, ...data } : c) as ComponentData[]
        };
      })
    }));
  };

  const handleAddEntity = () => {
    const newEntity: Entity = {
      id: `entity_${Date.now()}`,
      name: 'New Entity',
      isActive: true,
      components: [
        {
          id: `c_trans_${Date.now()}`,
          type: ComponentType.TRANSFORM,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        }
      ]
    };
    setLevel(prev => ({ ...prev, entities: [...prev.entities, newEntity] }));
    setSelectedId(newEntity.id);
  };

  const handleAddComponent = (entityId: string, type: ComponentType) => {
    let newComp: ComponentData;
    const id = `c_${type.toLowerCase()}_${Date.now()}`;
    
    switch (type) {
      case ComponentType.MESH:
        newComp = { id, type, meshType: 'box', color: '#ffffff' };
        break;
      case ComponentType.LIGHT:
        newComp = { id, type, intensity: 1, color: '#ffffff' };
        break;
      case ComponentType.REGION:
        newComp = { id, type, priority: 0, size: {x: 5, y: 5, z: 5}, effect: 'color_tint', effectValue: '#ff0000' };
        break;
      default:
        return;
    }

    setLevel(prev => ({
      ...prev,
      entities: prev.entities.map(e => {
        if (e.id !== entityId) return e;
        return { ...e, components: [...e.components, newComp] };
      })
    }));
  };

  const handleSave = () => {
    const json = JSON.stringify(level, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${level.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target?.result as string) as Level;
        setLevel(loaded);
      } catch (err) {
        alert("Invalid Level JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-[#333333] border-b border-black flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
           <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
             OmniEngine <span className="text-xs text-gray-400 font-normal">v1.1</span>
           </h1>
           <div className="h-6 w-px bg-gray-600 mx-2"></div>
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 text-xs hover:bg-[#444] px-2 py-1 rounded transition-colors"
           >
             <Save size={14} /> Save JSON
           </button>
           <label className="flex items-center gap-2 text-xs hover:bg-[#444] px-2 py-1 rounded transition-colors cursor-pointer">
             <FolderOpen size={14} /> Load JSON
             <input type="file" className="hidden" accept=".json" onChange={handleLoad} />
           </label>
        </div>
        
        <div className="flex items-center gap-2 bg-[#252526] p-1 rounded-lg border border-black shadow-inner">
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className={`p-1.5 rounded ${isPlaying ? 'bg-red-900 text-red-200' : 'hover:bg-[#3e3e42] text-green-400'}`}
           >
             {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
           </button>
           <div className="text-[10px] font-mono text-gray-500 uppercase px-2">
             {isPlaying ? 'Running' : 'Editor Mode'}
           </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Hierarchy */}
        <div className="w-64 flex flex-col min-w-[200px]">
          <Hierarchy 
            level={level} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            onAddEntity={handleAddEntity}
          />
        </div>

        {/* Center Panel: Viewport */}
        <div className="flex-1 bg-black relative">
          <Viewport level={level} onMount={setBabylonManager} />
          
          {/* Viewport Overlay UI */}
          <div className="absolute top-4 left-4 flex gap-2">
             <div className="bg-black/50 backdrop-blur text-xs px-2 py-1 rounded border border-white/10">
               Perspective
             </div>
             <div className="bg-black/50 backdrop-blur text-xs px-2 py-1 rounded border border-white/10">
               Lit
             </div>
          </div>
        </div>

        {/* Right Panel: Inspector */}
        <div className="w-80 flex flex-col min-w-[250px]">
          <Inspector 
            entity={selectedEntity} 
            onUpdateEntity={handleUpdateEntity} 
            onUpdateComponent={handleUpdateComponent}
            onAddComponent={handleAddComponent}
          />
        </div>
      </div>
      
      {/* Bottom Bar: Status */}
      <div className="h-6 bg-[#007acc] text-white flex items-center px-4 text-xs justify-between">
         <div className="flex gap-4">
           <span>Ready</span>
           <span>Entities: {level.entities.length}</span>
         </div>
         <div className="flex gap-4">
           <span>React 18</span>
           <span>Babylon.js</span>
         </div>
      </div>
    </div>
  );
}