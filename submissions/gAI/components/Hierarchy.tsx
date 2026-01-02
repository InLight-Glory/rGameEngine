import React from 'react';
import { Entity, ComponentType } from '../types';
import { Box, PlayCircle, Map as MapIcon, Video } from 'lucide-react';

interface HierarchyProps {
  entities: Entity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export const Hierarchy: React.FC<HierarchyProps> = ({ entities, selectedId, onSelect, onAdd }) => {
  const getIcon = (ent: Entity) => {
      if (ent.components.find(c => c.type === ComponentType.CAMERA)) return <Video size={14} className="text-purple-400" />;
      if (ent.components.find(c => c.type === ComponentType.REGION)) return <MapIcon size={14} className="text-blue-400" />;
      if (ent.components.find(c => c.type === ComponentType.PHYSICS)) return <PlayCircle size={14} className="text-green-400" />;
      return <Box size={14} className="text-orange-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="p-3 border-b border-gray-800 bg-gray-900 font-semibold text-xs text-gray-400 uppercase tracking-wider flex justify-between items-center">
        <span>Scene Hierarchy</span>
        <button onClick={onAdd} className="hover:bg-gray-700 p-1 rounded text-gray-200">+</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {entities.map(ent => (
          <div
            key={ent.id}
            onClick={() => onSelect(ent.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm select-none transition-colors
              ${selectedId === ent.id ? 'bg-blue-900/50 text-blue-100 border border-blue-800' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
            `}
          >
            {getIcon(ent)}
            <span className="truncate">{ent.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
