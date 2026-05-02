/**
 * SAIA‑Class S — Decision Context Model
 * Defines the full contextual state required for sovereign governance decisions.
 *
 * This context is consumed by:
 * - Governance Kernel
 * - Predictive Governance Engine
 * - Wellbeing Engine
 * - Identity Kernel
 */

export interface ActorContext {
  /** Identity ID of the actor requesting or triggering the decision */
  identityId: string;

  /** Roles assigned to the actor (from Identity Kernel) */
  roles: string[];

  /** Authority codes (e.g., "SOVEREIGN", "DELEGATE", "OBSERVER") */
  authorities: string[];
}

export interface CaseContext {
  /** Optional case or event ID */
  caseId?: string;

  /** Category of the case (e.g., "wellbeing", "governance", "identity") */
  category?: string;

  /** Arbitrary metadata for domain-specific use */
  metadata?: Record<string, unknown>;
}

export interface EnvironmentContext {
  /** Timestamp of the decision request */
  timestamp: Date;

  /** Optional jurisdiction label */
  jurisdiction?: string;

  /** Optional channel (API, UI, automated, etc.) */
  channel?: string;
}

export interface DecisionContext {
  /** Actor making or triggering the decision */
  actor: ActorContext;

  /** Case or scenario being evaluated */
  case: CaseContext;

  /** Environmental and situational metadata */
  environment: EnvironmentContext;

  /** Arbitrary inputs (payload) for the decision */
  inputs: Record<string, unknown>;
}

export interface GovernanceDecision {
  /** Unique ID for the decision */
  decisionId: string;

  /** Whether the action is allowed */
  allowed: boolean;

  /** Human-readable reasons for the decision */
  reasons: string[];

  /** Policies applied during evaluation */
  appliedPolicies: string[];

  /** Timestamp of decision creation */
  createdAt: Date;
}
