// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityTests
// Purpose: Automated test suite for the Identity Layer. Covers identity creation,
// DID validation, badge issuance, artifact anchoring, event bus, storage, and API.

import { describe, it, expect, beforeEach } from "vitest";

import { bootstrapIdentitySubsystem } from "./identity-bootstrap";
import { createInMemoryStorage } from "./identity-storage";
import { IdentityService } from "./identity-service";
import { IdentityAPI } from "./identity-api";

describe("Identity Layer — Beast System 3.0", () => {
  let subsystem: ReturnType<typeof bootstrapIdentitySubsystem>;
  let storage: ReturnType<typeof createInMemoryStorage>;
  let service: IdentityService;
  let api: IdentityAPI;

  beforeEach(() => {
    subsystem = bootstrapIdentitySubsystem({
      autoDidGeneration: true,
      autoGovernanceMetadata: true,
      autoWalletNormalization: true,
    });

    storage = createInMemoryStorage();
    service = new IdentityService(subsystem, storage);
    api = new IdentityAPI(subsystem);
  });

  // ------------------------------------------------------------
  // Identity Creation
  // ------------------------------------------------------------
  describe("Identity Creation", () => {
    it("creates a governed identity", async () => {
      const identity = await service.createIdentity("0x1234567890abcdef1234567890abcdef12345678");

      expect(identity.did).toMatch(/^did:nwo:beast:/);
      expect(identity.metadata.governanceVersion).toBe("3.0");
      expect(identity.metadata.provenance).toBe("New World Order DAO");
    });
  });

  // ------------------------------------------------------------
  // DID + Wallet Validation
  // ------------------------------------------------------------
  describe("DID + Wallet Validation", () => {
    it("rejects mismatched DID/wallet pairs", async () => {
      const identity = await service.createIdentity("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

      const ctx = {
        did: identity.did,
        wallet: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        signature: "0x123",
        message: "test",
        nonce: "1",
      };

      const result = await api.verifyWallet({ ctx });

      expect(result.ok).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // Badge Issuance
  // ------------------------------------------------------------
  describe("Badge Issuance", () => {
    it("issues a badge to an identity", async () => {
      const identity = await service.createIdentity("0x1111111111111111111111111111111111111111");

      const badge = await service.issueBadge(identity.did, "GOV-001");

      expect(badge.code).toBe("GOV-001");
      expect(identity.badges.length).toBe(1);
    });
  });

  // ------------------------------------------------------------
  // Artifact Anchoring
  // ------------------------------------------------------------
  describe("Artifact Anchoring", () => {
    it("anchors a civic artifact", async () => {
      const identity = await service.createIdentity("0x2222222222222222222222222222222222222222");

      const artifact = await service.anchorArtifact(
        identity.did,
        identity.wallet,
        "Test Artifact",
        "Description",
        "Content",
        "nonce",
        "signature"
      );

      expect(artifact.title).toBe("Test Artifact");
      expect(artifact.anchoredBy).toBe(identity.did);
    });
  });

  // ------------------------------------------------------------
  // Event Bus
  // ------------------------------------------------------------
  describe("Event Bus", () => {
    it("records identity.created events", async () => {
      await service.createIdentity("0x3333333333333333333333333333333333333333");

      const events = subsystem.events.getHistory();
      expect(events.some((e) => e.type === "identity.created")).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // Storage Adapter
  // ------------------------------------------------------------
  describe("Storage Adapter", () => {
    it("persists identities", async () => {
      const identity = await service.createIdentity("0x4444444444444444444444444444444444444444");

      const loaded = await storage.loadIdentity(identity.did);
      expect(loaded?.did).toBe(identity.did);
    });
  });

  // ------------------------------------------------------------
  // API Tests
  // ------------------------------------------------------------
  describe("Identity API", () => {
    it("creates identity via API", async () => {
      const result = await api.createIdentity("0x5555555555555555555555555555555555555555");

      expect(result.ok).toBe(true);
      expect(result.data?.did).toMatch(/^did:nwo:beast:/);
    });

    it("retrieves identity via API", async () => {
      const created = await api.createIdentity("0x6666666666666666666666666666666666666666");

      const result = await api.getIdentity(created.data!.did);
      expect(result.ok).toBe(true);
    });
  });
});
