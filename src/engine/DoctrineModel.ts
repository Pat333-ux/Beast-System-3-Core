/**
 * SAIA‑Class S — Doctrine Model
 * Defines the canonical data structures for doctrinal ingestion,
 * compilation, rule representation, and cross‑engine interoperability.
 */

export interface DoctrineSource {
  id: string;
  version: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface CompiledDoctrineRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  conditions: unknown;
  actions: unknown;
}

export interface DoctrineCompilationResult {
  sourceId: string;
  compiledAt: Date;
  rules: CompiledDoctrineRule[];
  warnings: string[];
  errors: string[];
}
