import { v4 as uuid } from "uuid";

/**
 * PredictiveEvent
 * ---------------
 * Canonical SAIA‑Class S event object emitted by the Predictive Engine (PGE‑9).
 * Mirrors the structure of registry-event.json but scoped to predictive forecasting.
 */

export interface PredictiveEvent {
  event_id: string;
  event_type: string;
  timestamp: string;

  actor: {
    actor_id?: string;
    actor_type: "predictive_engine" | "wellbeing_engine" | "governance_kernel";
  };

  context?: {
    case_id?: string;
    environment?: string;
    related_prediction_id?: string;
    related_risk_scan_id?: string;
    related_forecast_id?: string;
    related_preventive_action_id?: string;
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
 * PredictiveEventFactory
 * ----------------------
 * Creates fully‑formed, schema‑compliant predictive events.
 */
export class PredictiveEventFactory {
  static create(params: {
    event_type: string;
    actor: PredictiveEvent["actor"];
    payload: Record<string, any>;
    severity?: PredictiveEvent["severity"];
    context?: PredictiveEvent["context"];
    lineage?: PredictiveEvent["lineage"];
  }): PredictiveEvent {
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
