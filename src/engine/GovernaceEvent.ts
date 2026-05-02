import { v4 as uuid } from "uuid";

/**
 * GovernanceEvent
 * ----------------
 * Canonical SAIA‑Class S event object emitted by the Governance Kernel.
 * Mirrors governance-event.json exactly.
 */

export interface GovernanceEvent {
  eventId: string;
  eventType: string;
  timestamp: string;

  actor?: Record<string, any>;
  case?: Record<string, any>;
  environment?: Record<string, any>;

  payload?: Record<string, any>;

  relatedDecisionId?: string;
  relatedPolicyId?: string;
  relatedIdentityId?: string;

  metadata?: Record<string, any>;
}

/**
 * Factory for creating governance events.
 */
export class GovernanceEventFactory {
  /**
   * Create a new governance event.
   */
  static create(params: {
    eventType: string;
    actor?: Record<string, any>;
    case?: Record<string, any>;
    environment?: Record<string, any>;
    payload?: Record<string, any>;
    relatedDecisionId?: string;
    relatedPolicyId?: string;
    relatedIdentityId?: string;
    metadata?: Record<string, any>;
  }): GovernanceEvent {
    return {
      eventId: uuid(),
      eventType: params.eventType,
      timestamp: new Date().toISOString(),

      actor: params.actor ?? {},
      case: params.case ?? {},
      environment: params.environment ?? {},

      payload: params.payload ?? {},

      relatedDecisionId: params.relatedDecisionId,
      relatedPolicyId: params.relatedPolicyId,
      relatedIdentityId: params.relatedIdentityId,

      metadata: params.metadata ?? {}
    };
  }
}
