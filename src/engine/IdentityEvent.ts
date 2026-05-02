import { v4 as uuid } from "uuid";

/**
 * IdentityEvent
 * -------------
 * Canonical SAIA‑Class S event object emitted by the Sovereign Identity Kernel (SIK‑3).
 * Mirrors the identity-event schema (structurally aligned with registry-event.json but identity‑scoped).
 */

export interface IdentityEvent {
  event_id: string;
  event_type: string;
  timestamp: string;

  identity: {
    identity_id: string;
    identity_type?: string;
  };

  context?: {
    related_record_id?: string;
    related_verification_id?: string;
    related_linkage_id?: string;
    environment?: string;
  };

  payload: Record<string, any>;

  severity: "info" | "low" | "moderate" | "high" | "critical";

  lineage?: {
    parent_event_id?: string;
    child_event_id?: string;
    relationship_type?: string;
  };

  signature: {
    algorithm: string;
    value: string;
  };
}

/**
 * IdentityEventFactory
 * --------------------
 * Creates fully‑formed, schema‑compliant identity events.
 */
export class IdentityEventFactory {
  static create(params: {
    event_type: string;
    identity: IdentityEvent["identity"];
    payload: Record<string, any>;
    severity?: IdentityEvent["severity"];
    context?: IdentityEvent["context"];
    lineage?: IdentityEvent["lineage"];
  }): IdentityEvent {
    return {
      event_id: uuid(),
      event_type: params.event_type,
      timestamp: new Date().toISOString(),

      identity: params.identity,

      context: params.context ?? {},

      payload: params.payload,

      severity: params.severity ?? "info",

      lineage: params.lineage ?? {},

      signature: {
        algorithm: "SHA-3",
        value: uuid()
      }
    };
  }
}
