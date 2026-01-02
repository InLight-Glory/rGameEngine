import { Component, ComponentSchema } from '../core/Component';

export class LogicComponent extends Component {
    public readonly name = 'Logic';
    public script?: (entity: any, dt: number) => void;

    public deserialize(data: ComponentSchema): void {
        // In a real engine, we might load a script file or parse a string.
        // For this demo, we can assign logic manually after creation or ignore serialization for code.
    }

    public serialize(): ComponentSchema {
        return {};
    }
}
