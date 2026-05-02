import { v4 as uuid } from "uuid";
import {
  PredictionInput,
  PredictionOutput,
  RiskScan,
  ForecastOutput,
  PreventiveAction
} from "./PredictiveModel";

/**
 * PredictiveEngine (PGE‑9)
 * ------------------------
 * Reads structured context and produces:
 *  - risk scan
 *  - forecast
 *  - preventive actions
 *
 * Design goals:
 *  - deterministic
 *  - non‑punitive
 *  - stability‑first
 *  - governance‑kernel compatible
 */
export class PredictiveEngine {
  /**
   * Main entry point.
   */
  async evaluate(input: PredictionInput): Promise<PredictionOutput> {
    const timestamp = new Date().toISOString();

    const riskScan = this.computeRiskScan(input);
    const forecast = this.computeForecast(input, riskScan);
    const preventiveActions = this.computePreventiveActions(input, riskScan, forecast);

    const severity = this.deriveSeverity(riskScan);

    return {
      prediction_id: uuid(),
      timestamp,
      input_reference_id: input.input_id,
      risk_scan: riskScan,
      forecast,
      preventive_actions: preventiveActions,
      severity,
      signature: {
        algorithm: "SHA-3",
        value: uuid()
      }
    };
  }

  /**
   * Compute a simple, explainable risk scan.
   */
  private computeRiskScan(input: PredictionInput): RiskScan {
    // Example heuristic: treat instability indicators as additive risk.
    const base = 0.1;
    const instability = input.signals?.instability_score ?? 0;
    const conflict = input.signals?.conflict_score ?? 0;
    const stress = input.signals?.stress_score ?? 0;

    const emotional = this.clamp(base + stress * 0.5);
    const social = this.clamp(base + conflict * 0.5);
    const systemic = this.clamp(base + instability * 0.7);

    const overall = this.clamp((emotional + social + systemic) / 3);

    return {
      emotional,
      social,
      systemic,
      overall
    };
  }

  /**
   * Produce a forecast object from risk scan + context.
   */
  private computeForecast(input: PredictionInput, risk: RiskScan): ForecastOutput {
    let trajectory: ForecastOutput["trajectory"] = "stable";

    if (risk.overall > 0.7) {
      trajectory = "deteriorating";
    } else if (risk.overall > 0.4) {
      trajectory = "fragile";
    }

    return {
      horizon: input.horizon ?? "short_term",
      trajectory,
      confidence: this.clamp(0.5 + risk.overall * 0.4),
      notes: input.notes ?? ""
    };
  }

  /**
   * Recommend non‑punitive, stability‑first preventive actions.
   */
  private computePreventiveActions(
    input: PredictionInput,
    risk: RiskScan,
    forecast: ForecastOutput
  ): PreventiveAction[] {
    const actions: PreventiveAction[] = [];

    if (risk.emotional > 0.5) {
      actions.push({
        action_id: uuid(),
        action_type: "emotional_support",
        description: "Offer emotional support and de‑escalation resources.",
        expected_outcome: "Reduced emotional volatility and increased sense of safety."
      });
    }

    if (risk.social > 0.5) {
      actions.push({
        action_id: uuid(),
        action_type: "community_support",
        description: "Engage supportive community or peer network.",
        expected_outcome: "Improved social cohesion and reduced isolation."
      });
    }

    if (risk.systemic > 0.5) {
      actions.push({
        action_id: uuid(),
        action_type: "environmental_adjustment",
        description: "Adjust environmental or structural factors contributing to instability.",
        expected_outcome: "Increased structural stability and reduced systemic pressure."
      });
    }

    if (forecast.trajectory === "deteriorating") {
      actions.push({
        action_id: uuid(),
        action_type: "stability_planning",
        description: "Create a proactive stability plan with clear, supportive steps.",
        expected_outcome: "Clear path to restore stability without punitive measures."
      });
    }

    return actions;
  }

  /**
   * Derive a simple severity label from overall risk.
   */
  private deriveSeverity(risk: RiskScan): PredictionOutput["severity"] {
    if (risk.overall >= 0.8) return "critical";
    if (risk.overall >= 0.6) return "high";
    if (risk.overall >= 0.3) return "moderate";
    return "low";
  }

  private clamp(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }
}
