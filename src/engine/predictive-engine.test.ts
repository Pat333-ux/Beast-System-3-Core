import { PredictiveEngine } from "../PredictiveEngine";

describe("PredictiveEngine (SAIA‑Class S)", () => {
  let engine: PredictiveEngine;

  beforeEach(() => {
    engine = new PredictiveEngine();
  });

  const baseInput = {
    input_id: "test-input",
    horizon: "short_term",
    notes: "test",
    signals: {
      instability_score: 0,
      conflict_score: 0,
      stress_score: 0
    }
  };

  test("produces a valid prediction output structure", async () => {
    const result = await engine.evaluate(baseInput);

    expect(result).toHaveProperty("prediction_id");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("input_reference_id", "test-input");
    expect(result).toHaveProperty("risk_scan");
    expect(result).toHaveProperty("forecast");
    expect(result).toHaveProperty("preventive_actions");
    expect(result).toHaveProperty("severity");
    expect(result).toHaveProperty("signature");
  });

  test("computes low risk when all signals are zero", async () => {
    const result = await engine.evaluate(baseInput);

    expect(result.risk_scan.overall).toBeLessThanOrEqual(0.2);
    expect(result.severity).toBe("low");
  });

  test("computes high systemic risk when instability is high", async () => {
    const result = await engine.evaluate({
      ...baseInput,
      signals: {
