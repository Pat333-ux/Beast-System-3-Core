/**
 * Validation.ts (VL‑S)
 * --------------------
 * Universal validation engine for Beast System 3.0.
 *
 * Provides:
 *  - schema validation
 *  - structural validation
 *  - field-level validation
 *  - rule-based validation
 *  - custom validator pipelines
 *
 * All engines (Identity, Governance, Predictive, Wellbeing, Registry)
 * use this adapter to ensure deterministic, audit-safe validation.
 */

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: "low" | "moderate" | "high" | "critical";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export type ValidatorFn<T = any> = (data: T) => ValidationIssue[] | Promise<ValidationIssue[]>;

export class Validation {
  private validators: Map<string, ValidatorFn[]> = new Map();

  /**
   * Register a validator for a specific type or schema key.
   */
  register(type: string, validator: ValidatorFn): void {
    if (!this.validators.has(type)) {
      this.validators.set(type, []);
    }
    this.validators.get(type)!.push(validator);
  }

  /**
   * Validate data against all validators registered
