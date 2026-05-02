import { v4 as uuid } from "uuid";

/**
 * WellbeingEvent
 * --------------
 * Canonical SAIA‑Class S event object emitted by the Wellbeing Engine.
 * Mirrors the structure of registry-event.json but scoped to wellbeing.
 */

export interface WellbeingEvent {
  event_id: string;
  event_type: string;
  timestamp: string;

  actor: {
    actor_id?: string;
    actor_type: "wellbeing_engine" | "predictive_engine" | "governance_kernel" | "identity_kernel";
  };

  context?: {
    case_id?: string;
    environment?: string;
    related_signal_id?: string;
    related_assessment_id?: string;
    related_pathway_id?: string;
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
 * WellbeingEventFactory
 * ---------------------
 * Creates fully‑formed, schema‑compliant wellbeing events.
 */
export class WellbeingEventFactory {
  static create(params: {
    event_type: string;
    actor: WellbeingEvent["actor"];
    payload: Record<string, any>;
    severity?: WellbeingEvent["severity"];
    context?: WellbeingEvent["context"];
    lineage?: WellbeingEvent["lineage"];
  }): WellbeingEvent {
    return {
      event_id: uuid(),
      event_type: params.event_type,
      timestamp: new Date().toISOString(),

      actor: params.actor,

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
