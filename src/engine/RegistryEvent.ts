import { v4 as uuid } from "uuid";

/**
 * RegistryEvent
 * -------------
 * Canonical SAIA‑Class S event object for the Universal Registry Fabric (URF‑S).
 * Mirrors registry-event.json exactly.
 */

export interface RegistryEvent {
  event_id: string;
  event_type: string;
  timestamp: string;

  actor: {
    actor_id?: string;
    actor_type:
      | "identity"
      | "governance_kernel"
      | "predictive_engine"
      | "wellbeing_engine"
      | "identity_kernel"
      | "doctrine_compiler"
      | "registry_service"
      | "audit_layer";
  };

  context?: {
    case_id?: string;
    environment?: string;
    related_entry_id?: string;
    related_chain_id?: string;
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
 * RegistryEventFactory
 * --------------------
 * Creates fully‑formed, schema‑compliant registry events.
 */
export class RegistryEventFactory {
  static create(params: {
    event_type: string;
    actor: Registry
