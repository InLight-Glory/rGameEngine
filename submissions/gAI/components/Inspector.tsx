import React, { useCallback } from 'react';
import { Entity, ComponentType, TransformComponent, MeshComponent, LightComponent, RegionComponent, ComponentData } from '../types';

interface InspectorProps {
  entity: Entity | null;
  onUpdateEntity: (id: string, updates: Partial<Entity>) => void;
  onUpdateComponent: (entityId: string, componentId: string, data: Partial<ComponentData>) => void;
  onAddComponent: (entityId: string, type: ComponentType) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ entity, onUpdateEntity, onUpdateComponent, onAddComponent }) => {
  if (!entity) {
    return (
      <div className="h-full bg-[#252526] p-4 text-gray-500 text-sm text-center italic border-l border-black">
        Select an object to inspect
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateEntity(entity.id, { name: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-l border-black overflow-y-auto">
      <div className="p-2 bg-[#333333] font-bold text-xs uppercase tracking-wider border-b border-black">
        Inspector
      </div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="checkbox" 
            checked={entity.isActive} 
            onChange={(e) => onUpdateEntity(entity.id, { isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-[#1e1e1e]"
          />
          <input
            type="text"
            value={entity.name}
            onChange={handleNameChange}
            className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-xs text-gray-500 font-mono">{entity.id}</div>
      </div>

      {/* Components List */}
      <div className="p-2 space-y-2">
        {entity.components.map(comp => (
          <ComponentEditor 
            key={comp.id} 
            component={comp} 
            onChange={(data) => onUpdateComponent(entity.id, comp.id, data)} 
          />
        ))}
      </div>

      {/* Add Component Button */}
      <div className="p-4 mt-auto border-t border-[#3e3e42]">
        <select 
          className="w-full bg-[#3e3e42] text-white text-sm p-2 rounded"
          onChange={(e) => {
            if (e.target.value) {
              onAddComponent(entity.id, e.target.value as ComponentType);
              e.target.value = "";
            }
          }}
          value=""
        >
          <option value="" disabled>+ Add Component</option>
          <option value={ComponentType.MESH}>Mesh</option>
          <option value={ComponentType.LIGHT}>Light</option>
          <option value={ComponentType.REGION}>Region</option>
          <option value={ComponentType.PHYSICS}>Physics</option>
        </select>
      </div>
    </div>
  );
};

// --- Sub-Editors ---

const ComponentEditor: React.FC<{ component: ComponentData; onChange: (d: any) => void }> = ({ component, onChange }) => {
  return (
    <div className="bg-[#1e1e1e] rounded border border-[#3e3e42] overflow-hidden">
      <div className="bg-[#2d2d30] px-3 py-1 text-xs font-bold text-gray-300 border-b border-[#3e3e42] flex justify-between">
        <span>{component.type}</span>
      </div>
      <div className="p-3 space-y-2">
        {renderFields(component, onChange)}
      </div>
    </div>
  );
};

function renderFields(component: ComponentData, onChange: (d: any) => void) {
  switch (component.type) {
    case ComponentType.TRANSFORM:
      return (
        <>
          <Vector3Input label="Position" value={component.position} onChange={(v) => onChange({ ...component, position: v })} />
          <Vector3Input label="Rotation" value={component.rotation} onChange={(v) => onChange({ ...component, rotation: v })} />
          <Vector3Input label="Scale" value={component.scale} onChange={(v) => onChange({ ...component, scale: v })} />
        </>
      );
    case ComponentType.MESH:
      return (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Type</label>
            <select 
              value={component.meshType} 
              onChange={(e) => onChange({ ...component, meshType: e.target.value })}
              className="bg-[#333] text-white text-xs p-1 rounded border border-[#444]"
            >
              <option value="box">Box</option>
              <option value="sphere">Sphere</option>
              <option value="plane">Plane</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-400">Color</label>
             <input type="color" value={component.color} onChange={(e) => onChange({...component, color: e.target.value})} className="w-full h-6 bg-transparent" />
          </div>
        </>
      );
    case ComponentType.LIGHT:
      return (
        <>
           <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-400">Intensity</label>
             <input 
              type="number" step="0.1" 
              value={component.intensity} 
              onChange={(e) => onChange({ ...component, intensity: parseFloat(e.target.value) })}
              className="bg-[#333] text-white text-xs p-1 rounded border border-[#444] w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-400">Color</label>
             <input type="color" value={component.color} onChange={(e) => onChange({...component, color: e.target.value})} className="w-full h-6 bg-transparent" />
          </div>
        </>
      );
    case ComponentType.REGION:
      return (
        <>
           <Vector3Input label="Size" value={component.size} onChange={(v) => onChange({ ...component, size: v })} />
           <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Effect</label>
            <select 
              value={component.effect} 
              onChange={(e) => onChange({ ...component, effect: e.target.value })}
              className="bg-[#333] text-white text-xs p-1 rounded border border-[#444]"
            >
              <option value="gravity_override">Gravity Override</option>
              <option value="color_tint">Color Tint</option>
              <option value="speed_boost">Speed Boost</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-400">Priority</label>
             <input 
              type="number" step="1" 
              value={component.priority} 
              onChange={(e) => onChange({ ...component, priority: parseInt(e.target.value) })}
              className="bg-[#333] text-white text-xs p-1 rounded border border-[#444] w-full"
            />
          </div>
        </>
      );
    default:
      return <div className="text-xs text-red-400">Unknown Component</div>;
  }
}

const Vector3Input: React.FC<{ label: string; value: { x: number; y: number; z: number }; onChange: (v: any) => void }> = ({ label, value, onChange }) => {
  const handleChange = (axis: 'x' | 'y' | 'z', val: string) => {
    onChange({ ...value, [axis]: parseFloat(val) || 0 });
  };
  
  return (
    <div className="flex flex-col gap-1 mb-1">
      <label className="text-[10px] text-gray-500 uppercase">{label}</label>
      <div className="flex gap-1">
        <input 
          type="number" step="0.1" value={value.x} 
          onChange={(e) => handleChange('x', e.target.value)}
          className="w-1/3 bg-[#333] text-red-400 text-xs p-1 rounded border border-transparent focus:border-red-500 outline-none"
        />
        <input 
          type="number" step="0.1" value={value.y} 
          onChange={(e) => handleChange('y', e.target.value)}
          className="w-1/3 bg-[#333] text-green-400 text-xs p-1 rounded border border-transparent focus:border-green-500 outline-none"
        />
        <input 
          type="number" step="0.1" value={value.z} 
          onChange={(e) => handleChange('z', e.target.value)}
          className="w-1/3 bg-[#333] text-blue-400 text-xs p-1 rounded border border-transparent focus:border-blue-500 outline-none"
        />
      </div>
    </div>
  );
};