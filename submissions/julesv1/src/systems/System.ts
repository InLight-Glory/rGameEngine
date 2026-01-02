import { Level } from '../core/Level';

export abstract class System {
    protected level: Level;

    constructor(level: Level) {
        this.level = level;
    }

    public abstract update(dt: number): void;
}
