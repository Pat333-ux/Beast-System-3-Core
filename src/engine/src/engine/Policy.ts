/**
 * SAIA‑Class S — Policy Model
 * Defines the structure of governance policies used by the Governance Kernel.
 *
 * Policies are NOT doctrine.
 * Policies are operational rules that can be enabled, disabled, or revised
 * without altering sovereign doctrine itself.
 */

export interface Policy {
  /** Unique identifier for the policy */
  id: string;

  /** Human-readable name */
  name: string;

  /** Optional description or annotation */
  description?: string;

  /** Version label (semantic, date-based, or sovereign revision code) */
  version: string;

  /** Whether this policy is currently active */
  enabled: boolean;

  /**
   * Optional tags for grouping, filtering, or classification.
   * Examples: ["safety", "wellbeing", "identity", "audit"]
   */
  tags?: string[];
}
