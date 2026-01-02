type EventHandler = (payload: any, source: any) => void;

export interface GameEvent {
  type: string;
  payload: any;
  source: any;
}

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  public on(type: string, handler: EventHandler): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(handler);
  }

  public off(type: string, handler: EventHandler): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public emit(type: string, payload: any, source: any): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
        // Spec: Event dispatch order MUST be deterministic.
        // We iterate in registration order (array behavior).
      handlers.forEach(h => h(payload, source));
    }
  }
}
