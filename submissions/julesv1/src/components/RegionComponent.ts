import { Component, ComponentSchema } from '../core/Component';
import { BlendMode } from '../core/Constants';

export interface Modifier {
    property: string; // e.g., "gravity", "hue"
    value: any;
    blendMode: BlendMode;
}

export class RegionComponent extends Component {
    public readonly name = 'Region';
    public priority: number = 0;
    public modifiers: Modifier[] = [];
    // Volume dimensions (assuming box for simplicity)
    public size: { x: number, y: number, z: number } = { x: 10, y: 10, z: 10 };

    public deserialize(data: ComponentSchema): void {
        if (data.priority !== undefined) this.priority = data.priority;
        if (data.modifiers) this.modifiers = data.modifiers;
        if (data.size) this.size = data.size;
    }

    public serialize(): ComponentSchema {
        return {
            priority: this.priority,
            modifiers: this.modifiers,
            size: this.size
        };
    }
}
