import {
  DoctrineSource,
  DoctrineCompilationResult,
  CompiledDoctrineRule
} from "./DoctrineModel";

import { v4 as uuid } from "uuid";

/**
 * DoctrineCompiler (DC‑X)
 * -----------------------
 * Converts raw doctrinal text + metadata into:
 *  - structured rules
 *  - normalized constraints
 *  - validation map
 *  - cross‑engine compatible compiled doctrine
 *
 * This is the constitutional backbone of Beast System 3.0.
 */
export class DoctrineCompiler {
  /**
   * Main entry point.
   * Accepts a DoctrineSource and returns a fully compiled doctrine object.
   */
  compile(source: DoctrineSource): DoctrineCompilationResult {
    const rules = this.extractRules(source.text);
    const normalized = this.normalizeRules(rules);
    const validation = this.generateValidationMap(normal
