import React from 'react';
import { Entity, ComponentType, TransformComponent, MeshComponent, PhysicsComponent, RegionComponent, Vector3, RegionBlendMode } from '../types';
import { Layers, Move, Box, Zap, Map } from 'lucide-react';

interface InspectorProps {
  entity: Entity | null;
  onChange: (updatedEntity: Entity) => void;
}

const InputRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-1">
        <label className="text-xs text-gray-500 w-24">{label}</label>
        <div className="flex-1">{children}</div>
    </div>
);

const Vec3Input = ({ value, onChange }: { value: Vector3, onChange: (v: Vector3) => void }) => {
    const handleChange = (axis: keyof Vector3, num: number) => {
        onChange({ ...value, [axis]: isNaN(num) ? 0 : num });
    };
    return (
        <div className="flex gap-1">
            {['x', 'y', 'z'].map(axis => (
                <div key={axis} className="flex items-center bg-gray-800 rounded px-1 flex-1 border border-gray-700 focus-within:border-blue-500">
                    <span className="text-[10px] text-gray-500 uppercase mr-1 w-2">{axis}</span>
                    <input 
                        type="number" 
                        step="0.1"
                        value={value[axis as keyof Vector3]}
                        onChange={(e) => handleChange(axis as keyof Vector3, parseFloat(e.target.value))}
                        className="w-full bg-transparent text-xs text-gray-200 outline-none py-1"
                    />
                </div>
            ))}
        </div>
    );
};

export const Inspector: React.FC<InspectorProps> = ({ entity, onChange }) => {
  if (!entity) {
    return (
      <div className="h-full bg-gray-900 border-l border-gray-800 flex items-center justify-center text-gray-600 text-sm italic p-8 text-center">
        Select an object to inspect properties
      </div>
    );
  }

  const updateComponent = (compIndex: number, newData: any) => {
      const newComponents = [...entity.components];
      newComponents[compIndex] = { ...newComponents[compIndex], ...newData };
      onChange({ ...entity, components: newComponents });
  };

  const updateName = (name: string) => onChange({ ...entity, name });

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-80">
      <div className="p-3 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-blue-500"/>
            <span className="text-xs font-bold text-gray-400 uppercase">Properties</span>
          </div>
          <input 
            type="text" 
            value={entity.name} 
            onChange={(e) => updateName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
          />
          <div className="text-[10px] text-gray-600 mt-1 font-mono">{entity.id}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {entity.components.map((comp, idx) => {
            switch (comp.type) {
                case ComponentType.TRANSFORM:
                    const t = comp as TransformComponent;
                    return (
                        <div key={comp.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 pb-1 border-b border-gray-800">
                                <Move size={12} /> TRANSFORM
                            </div>
                            <InputRow label="Position">
                                <Vec3Input value={t.position} onChange={v => updateComponent(idx, { position: v })} />
                            </InputRow>
                            <InputRow label="Rotation">
                                <Vec3Input value={t.rotation} onChange={v => updateComponent(idx, { rotation: v })} />
                            </InputRow>
                            <InputRow label="Scale">
                                <Vec3Input value={t.scale} onChange={v => updateComponent(idx, { scale: v })} />
                            </InputRow>
                        </div>
                    );
                case ComponentType.MESH:
                    const m = comp as MeshComponent;
                    return (
                        <div key={comp.id} className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-300 pb-1 border-b border-gray-800">
                                <Box size={12} /> MESH
                            </div>
                            <InputRow label="Shape">
                                <select 
                                    value={m.shape} 
                                    onChange={(e) => updateComponent(idx, { shape: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded p-1 outline-none"
                                >
                                    <option value="box">Box</option>
                                    <option value="sphere">Sphere</option>
                                    <option value="plane">Plane</option>
                                </select>
                            </InputRow>
                            <InputRow label="Color">
                                <div className="flex gap-2">
                                    <input type="color" value={m.color} onChange={e => updateComponent(idx, { color: e.target.value })} className="h-6 w-8 bg-transparent border-0 p-0 cursor-pointer" />
                                    <span className="text-xs text-gray-400 self-center font-mono">{m.color}</span>
                                </div>
                            </InputRow>
                            <InputRow label="Visible">
                                <input type="checkbox" checked={m.visible} onChange={e => updateComponent(idx, { visible: e.target.checked })} />
                            </InputRow>
                        </div>
                    );
                case ComponentType.PHYSICS:
                    const p = comp as PhysicsComponent;
                    return (
                        <div key={comp.id} className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-300 pb-1 border-b border-gray-800">
                                <Zap size={12} /> PHYSICS
                            </div>
                            <InputRow label="Mass">
                                <input type="number" value={p.mass} onChange={e => updateComponent(idx, { mass: parseFloat(e.target.value) })} className="w-full bg-gray-800 text-xs p-1 rounded border border-gray-700" />
                            </InputRow>
                            <InputRow label="Static">
                                <input type="checkbox" checked={p.isStatic} onChange={e => updateComponent(idx, { isStatic: e.target.checked })} />
                            </InputRow>
                             <InputRow label="Gravity">
                                <input type="checkbox" checked={p.useGravity} onChange={e => updateComponent(idx, { useGravity: e.target.checked })} />
                            </InputRow>
                        </div>
                    );
                case ComponentType.REGION:
                    const r = comp as RegionComponent;
                    return (
                        <div key={comp.id} className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-300 pb-1 border-b border-gray-800">
                                <Map size={12} /> REGION
                            </div>
                            <InputRow label="Priority">
                                <input type="number" value={r.priority} onChange={e => updateComponent(idx, { priority: parseInt(e.target.value) })} className="w-full bg-gray-800 text-xs p-1 rounded border border-gray-700" />
                            </InputRow>
                            <InputRow label="Blend">
                                 <select 
                                    value={r.blendMode} 
                                    onChange={(e) => updateComponent(idx, { blendMode: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-xs text-gray-200 rounded p-1 outline-none"
                                >
                                    <option value={RegionBlendMode.OVERRIDE}>Override</option>
                                    <option value={RegionBlendMode.ADD}>Add</option>
                                    <option value={RegionBlendMode.MULTIPLY}>Multiply</option>
                                </select>
                            </InputRow>
                            <InputRow label="Gravity Mod">
                                <input type="number" step="0.1" value={r.modifiers.gravityScale ?? 1} onChange={e => updateComponent(idx, { modifiers: {...r.modifiers, gravityScale: parseFloat(e.target.value)} })} className="w-full bg-gray-800 text-xs p-1 rounded border border-gray-700" />
                            </InputRow>
                             <InputRow label="Size (Bounds)">
                                <Vec3Input value={r.size} onChange={v => updateComponent(idx, { size: v })} />
                            </InputRow>
                        </div>
                    );
                default:
                    return null;
            }
        })}
      </div>
    </div>
  );
};
