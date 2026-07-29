// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityFinal
// Purpose: Barrel export for the entire Identity Layer. Provides a single
// unified import surface for all identity modules, subsystems, services,
// APIs, middleware, storage adapters, integrations, docs, and tests.

// ------------------------------------------------------------
// Core Subsystem
// ------------------------------------------------------------
export * from "./identity-bootstrap";
export * from "./identity-manager";
export * from "./identity-registry";
export * from "./identity-events";
export * from "./identity-errors";
export * from "./identity-validators";
export * from "./identity-crypto";
export * from "./identity-metadata";
export * from "./identity-constants";

// ------------------------------------------------------------
// Badge + Artifact Engines
// ------------------------------------------------------------
export * from "./badge-engine";
export * from "./civic-artifact-anchor";

// ------------------------------------------------------------
// Storage Layer
// ------------------------------------------------------------
export * from "./identity-storage";

// ------------------------------------------------------------
// Middleware Layer
// ------------------------------------------------------------
export * from "./identity-middleware";

// ------------------------------------------------------------
// API Layer
// ------------------------------------------------------------
export * from "./identity-api";

// ------------------------------------------------------------
// Service Layer
// ------------------------------------------------------------
export * from "./identity-service";

// ------------------------------------------------------------
// HTTP + Server Layer
// ------------------------------------------------------------
export * from "./identity-router";
export * from "./identity-controller";
export * from "./identity-http";
export * from "./identity-server";
export * from "./identity-app";

// ------------------------------------------------------------
// Integrations Layer
// ------------------------------------------------------------
export * from "./identity-integrations";

// ------------------------------------------------------------
// Documentation Generator
// ------------------------------------------------------------
export * from "./identity-docs";

// ------------------------------------------------------------
// Test Suite
// ------------------------------------------------------------
export * from "./identity-tests";

// ------------------------------------------------------------
// Schema Exports
// ------------------------------------------------------------
export * from "./identity-schema";

// ------------------------------------------------------------
// Final Identity Layer Export
// ------------------------------------------------------------
export const IdentityLayer = {
  version: "3.0",
  description: "Beast System 3.0 — Sovereign Identity Kernel v3",
};
