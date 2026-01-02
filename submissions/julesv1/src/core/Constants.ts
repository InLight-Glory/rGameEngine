export enum LifecycleState {
  CREATED = 'Created',
  INITIALIZED = 'Initialized',
  ACTIVE = 'Active',
  DISABLED = 'Disabled',
  UNLOADED = 'Unloaded',
  DESTROYED = 'Destroyed'
}

export enum BlendMode {
  OVERRIDE = 'override',
  ADD = 'add',
  MULTIPLY = 'multiply'
}

export interface VariableStore {
  [key: string]: any;
}
