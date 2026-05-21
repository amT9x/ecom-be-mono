import { DomainEvent, EventHandler } from './event.entity.js';
import { EventBus } from './eventbus.js';

export class InMemoryEventBus implements EventBus {
  private handlers: Record<string, EventHandler[]> = {};

  subscribe(type: string, handler: EventHandler) {
    this.handlers[type] ??= [];
    this.handlers[type].push(handler);
  }

  async publish(event: DomainEvent) {
    const handlers = this.handlers[event.type] ?? [];

    for (const h of handlers) {
      await h(event);
    }
  }
}
