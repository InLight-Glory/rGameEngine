import React, { useState, useEffect } from 'react';
import { Hierarchy } from './components/Hierarchy';
import { Inspector } from './components/Inspector';
import { Viewport } from './components/Viewport';
import { Toolbar } from './components/Toolbar';
import { DEFAULT_VIEW_CONFIGS, SPLIT_VIEW_CONFIGS, createEntity, API_ENDPOINT, DEFAULT_LEVEL } from './constants';
import { Level, Entity } from './types';
import { Loader2, WifiOff } from 'lucide-react';

export default function App() {
  const [level, setLevel] = useState<Level | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Load Level from PHP Server on Mount
  useEffect(() => {
    fetch(API_ENDPOINT)
        .then(async res => {
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`Server Error (${res.status}): ${text.substring(0, 50)}`);
            }
            const text = await res.text();
            if (!text || text.trim() === '') throw new Error("Empty response from server");
            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error("Invalid JSON received from server");
            }
        })
        .then(data => {
            setLevel(data);
            setIsOffline(false);
        })
        .catch(err => {
            console.warn("Backend connection failed, falling back to local mode:", err);
            // Fallback to local default level if server is missing/broken
            setLevel(DEFAULT_LEVEL);
            setIsOffline(true);
        });
  }, []);

  const handleEntitySelect = (id: string | null) => {
    setSelectedId(id);
  };

  const handleEntityUpdate = (updatedEntity: Entity) => {
    if (!level) return;
    setLevel(prev => prev ? ({
      ...prev,
      entities: prev.entities.map(e => e.id === updatedEntity.id ? updatedEntity : e)
    }) : null);
  };

  const handleAddEntity = () => {
    if (!level) return;
    const newEnt = createEntity(`Object ${level.entities.length + 1}`);
    setLevel(prev => prev ? ({
        ...prev,
        entities: [...prev.entities, newEnt]
    }) : null);
    setSelectedId(newEnt.id);
  };

  const handleSave = async () => {
      if (!level) return;
      setIsSaving(true);
      try {
          const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(level)
          });
          
          if (response.ok) {
              const result = await response.json().catch(() => ({}));
              console.log("Server Response:", result);
              alert("Level Saved Successfully!");
          } else {
              // If we are in offline mode or server fails
              throw new Error("Server not reachable");
          }
      } catch (e) {
          console.error(e);
          alert("Cannot save: Backend is offline. (Check console)");
      } finally {
          setIsSaving(false);
      }
  };

  if (!level) {
      return (
          <div className="h-screen w-screen bg-black flex items-center justify-center text-blue-500 font-mono gap-2">
              <Loader2 className="animate-spin" />
              <span>Connecting to Nebula Server...</span>
          </div>
      );
  }

  const selectedEntity = level.entities.find(e => e.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white">
      <Toolbar 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
        onSave={handleSave}
        onToggleView={() => setIsSplitView(!isSplitView)}
        isSplitView={isSplitView}
      />
      
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-orange-900/50 border-b border-orange-800/50 text-orange-200 text-xs px-4 py-1 flex items-center justify-center gap-2">
            <WifiOff size={12} />
            <span>Offline Mode: Backend not detected. Changes will not be persisted to disk.</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Hierarchy */}
        <div className="w-64 flex-shrink-0 z-10">
          <Hierarchy 
            entities={level.entities} 
            selectedId={selectedId} 
            onSelect={handleEntitySelect} 
            onAdd={handleAddEntity}
          />
        </div>

        {/* Center: Viewport */}
        <div className="flex-1 relative bg-gray-950">
          <Viewport 
            level={level} 
            isPlaying={isPlaying} 
            viewConfig={isSplitView ? SPLIT_VIEW_CONFIGS : DEFAULT_VIEW_CONFIGS}
            onSelectEntity={handleEntitySelect}
          />
        </div>

        {/* Right Panel: Inspector */}
        <div className="w-80 flex-shrink-0 z-10">
          <Inspector 
            entity={selectedEntity} 
            onChange={handleEntityUpdate} 
          />
        </div>
      </div>
      
      {isSaving && (
          <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-xs font-bold animate-pulse">
              SAVING TO SERVER...
          </div>
      )}
    </div>
  );
}