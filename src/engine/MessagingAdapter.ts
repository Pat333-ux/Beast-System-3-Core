/**
 * MessagingAdapter (MA‑S)
 * -----------------------
 * Abstract messaging + event transport interface for Beast System 3.0.
 *
 * Every subsystem (Identity, Governance, Predictive, Wellbeing, Registry)
 * interacts with messaging ONLY through this interface.
 *
 * Concrete implementations may include:
 *  - LocalEventBusAdapter
 *  - RedisPubSubAdapter
 *  - NATSAdapter
 *  - KafkaAdapter
 *  - WebSocketAdapter
 *  - HTTPWebhookAdapter
 */

export interface MessageEnvelope<T = any> {
  message_id: string;
  timestamp: string;
  channel: string;
  payload: T;
  metadata?: Record<string, any>;
}

export abstract class MessagingAdapter {
  /**
   * Initialize the messaging backend.
   */
  abstract init(): Promise<void>;

  /**
   * Publish a message to a channel.
   */
  abstract publish<T = any>(
    channel: string,
    message: MessageEnvelope<T>
  ): Promise<void>;

  /**
   * Subscribe to a channel.
   * The callback receives the message envelope.
   */
  abstract subscribe<T = any>(
    channel: string,
    handler: (message: MessageEnvelope<T>) => void
  ): Promise<void>;

  /**
   * Unsubscribe from a channel.
   */
  abstract unsubscribe(channel: string): Promise<void>;

  /**
   * List all active subscriptions (optional).
   */
  abstract listSubscriptions(): Promise<string[]>;
}
