import React from 'react';
import { Level, Entity } from '../types';
import { Cuboid, Lightbulb, BoxSelect } from 'lucide-react';

interface HierarchyProps {
  level: Level;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddEntity: () => void;
}

export const Hierarchy: React.FC<HierarchyProps> = ({ level, selectedId, onSelect, onAddEntity }) => {
  
  const getIcon = (entity: Entity) => {
    if (entity.components.some(c => c.type === 'LIGHT')) return <Lightbulb size={16} className="text-yellow-400" />;
    if (entity.components.some(c => c.type === 'REGION')) return <BoxSelect size={16} className="text-teal-400" />;
    return <Cuboid size={16} className="text-blue-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-black">
      <div className="p-2 bg-[#333333] font-bold text-xs uppercase tracking-wider border-b border-black flex justify-between items-center">
        <span>Hierarchy</span>
        <button 
          onClick={onAddEntity}
          className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-xs"
        >
          + Add
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {level.entities.map(entity => (
          <div
            key={entity.id}
            onClick={() => onSelect(entity.id)}
            className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-sm ${
              selectedId === entity.id 
                ? 'bg-[#37373d] text-white border-l-2 border-blue-500' 
                : 'text-gray-400 hover:bg-[#2a2d2e]'
            }`}
          >
            {getIcon(entity)}
            <span>{entity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};