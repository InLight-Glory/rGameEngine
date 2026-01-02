import { Component, ComponentSchema } from '../core/Component';

export class LogicComponent extends Component {
    public readonly name = 'Logic';
    public code: string = "";
    public script?: (entity: any, dt: number) => void;

    public deserialize(data: ComponentSchema): void {
        if (data.code) {
            this.code = data.code;
        }
    }

    public serialize(): ComponentSchema {
        return {
            code: this.code
        };
    }
}
