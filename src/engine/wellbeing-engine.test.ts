import { WellbeingEngine } from "../WellbeingEngine";

describe("WellbeingEngine (SAIA‑Class S)", () => {
  let engine: WellbeingEngine;

  beforeEach(() => {
    engine = new WellbeingEngine();
  });

  const baseInput = {
    scan_id: "scan-1",
    identity_id: "id-123",
    environment: { location: "test" },
    domains: {
      housing: 1,
      food: 1,
      health: 1,
      safety: 1,
      dignity: 1,
      economic: 1,
      community: 1
    }
  };

  test("produces a valid wellbeing assessment structure", async () => {
    const result = await engine.evaluate(baseInput);

    expect(result).toHaveProperty("assessment_id");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("scan_reference_id", "scan-1");
    expect(result).toHaveProperty("scores");
    expect(result).toHaveProperty("overall_score");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("harm_prevention");
    expect(result).toHaveProperty("support_pathways");
    expect(result).toHaveProperty("signature");
  });

  test("computes low risk when all domains are stable", async () => {
    const result = await engine.evaluate(baseInput);

    expect(result.overall_score).toBeGreaterThan(0.6);
    expect(result.status).toBe("stable");
  });

  test("detects harm‑prevention triggers when safety is low", async () => {
    const result = await engine.evaluate({
      ...baseInput,
      domains: {
        ...baseInput.domains,
        safety: 0
      }
    });

    expect(result.harm_prevention.triggered).toBe(true);
    expect(result.harm_prevention.reasons).toContain("safety_risk");
  });

  test("detects harm‑prevention triggers when dignity is low", async () => {
    const result = await engine.evaluate({
      ...base
