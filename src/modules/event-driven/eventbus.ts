import { DomainEvent, EventHandler } from './event.entity.js';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(type: string, handler: EventHandler): void;
}
