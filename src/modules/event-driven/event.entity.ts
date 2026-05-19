export interface DomainEvent {
  type: string;
  occurredAt: Date;
}

export type EventHandler = (event: DomainEvent) => Promise<void> | void;


