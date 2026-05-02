import { GovernanceKernel } from "../GovernanceKernel";
import { DoctrineSource } from "../../doctrine-compiler/DoctrineModel";
import { Policy } from "../GovernanceKernelModel";

describe("GovernanceKernel (SAIA‑Class S)", () => {
  let kernel: GovernanceKernel;

  beforeEach(() => {
    kernel = new GovernanceKernel();
  });

  const mockDoctrine: DoctrineSource = {
    source_id: "test-doctrine",
    source_type: "text",
    version: "1.0.0",
    tags: ["test"],
    text: `
      1. all actions must be safe
      2. identity must be verified
      - wellbeing must be protected
    `
  };

  const baseInput = {
    actor_identity_id: "identity-123",
    action_type: "test_action",
    environment: { location: "test" },
    metadata: {},
    doctrine_source: mockDoctrine,
    predictive_input: {
      input_id: "pred-1",
      signals: {
        instability_score: 0,
        conflict_score: 0,
        stress_score: 0
      }
    }
  };

  test("approves action when all checks pass", async () => {
    const result = await kernel.evaluate(baseInput);

    expect(result.decision.status).toBe("approved");
    expect(result.decision.reason).toBe("all_checks_passed");
    expect(result.wellbeing.status).not.toBe("blocked");
    expect(result.predictive.severity).toBe("low");
  });

  test("denies action when identity is unauthorized", async () => {
    const spy = jest
      .spyOn(kernel["identity"], "verifyAuthority")
      .mockResolvedValue({ authorized: false });

    const result = await kernel.evaluate(baseInput);

    expect(result.decision.status).toBe("denied");
    expect(result.decision.reason).toBe("identity_not_authorized");

    spy.mockRestore();
  });

  test("denies action when wellbeing engine blocks it", async () => {
    const spy = jest
      .spyOn(kernel["wellbeing"], "evaluate")
      .mockResolvedValue({
        status: "blocked",
        required_safeguards: ["safety_protocol"]
      });

    const result = await kernel.evaluate(baseInput);

    expect(result.decision.status).toBe("denied");
    expect(result.decision.reason).toBe("wellbeing_block");

    spy.mockRestore();
  });

  test("returns conditional decision when predictive risk is critical", async () => {
    const spy = jest
      .spyOn(kernel["predictive"], "evaluate")
      .mockResolvedValue({
        prediction_id: "p1",
        timestamp: new Date().toISOString(),
        input_reference_id: "pred-1",
        risk_scan: { emotional: 1, social: 1, systemic: 1, overall: 1 },
        forecast: { horizon: "short_term", trajectory: "deteriorating", confidence: 0.9 },
        preventive_actions: [],
        severity: "critical
