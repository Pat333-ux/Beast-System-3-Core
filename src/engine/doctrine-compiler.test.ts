import { DoctrineCompiler } from "../DoctrineCompiler";
import { DoctrineSource } from "../DoctrineModel";

describe("DoctrineCompiler (SAIA‑Class S)", () => {
  let compiler: DoctrineCompiler;

  beforeEach(() => {
    compiler = new DoctrineCompiler();
  });

  const baseSource: DoctrineSource = {
    source_id: "test-source",
    source_type: "text",
    version: "1.0.0",
    tags: ["test"],
    text: `
      1. All actions must be safe.
      2. Identity must be verified.
      - Wellbeing must be protected.
      - No action may cause harm.
    `
  };

  test("compiles doctrine without errors", () => {
    const result = compiler.compile(baseSource);

    expect(result).toHaveProperty("rules");
    expect(result).toHaveProperty("validation");
    expect(result.rules.length).toBeGreaterThan(0);
    expect(result.validation).toBeDefined();
  });

  test("extracts numbered and bullet rules", () => {
    const result = compiler.compile(baseSource);

    const ruleTexts = result.rules.map(r => r.text.toLowerCase());

    expect(ruleTexts).toContain("all actions must be safe.");
    expect(ruleTexts).toContain("identity must be verified.");
    expect(ruleTexts).toContain("wellbeing must be protected.");
    expect(ruleTexts).toContain("no action may cause harm.");
  });

  test("assign
