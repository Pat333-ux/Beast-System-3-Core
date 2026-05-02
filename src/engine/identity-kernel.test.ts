import { IdentityKernel } from "../IdentityKernel";
import { IdentityEventFactory } from "../IdentityEvent";
import { UUID } from "../../../util/UUID";

describe("IdentityKernel (SAIA‑Class S)", () => {
  let kernel: IdentityKernel;

  beforeEach(() => {
    kernel = new IdentityKernel();
  });

  const baseRecord = {
    identity_id: "id-123",
    identity_type: "person",
    attributes: {
      name: "Test User",
      role: "citizen"
    },
    lineage: [],
    credentials: []
  };

  test("creates a new identity record", async () => {
    const result = await kernel.createIdentity({
      identity_type: "person",
      attributes: { name: "Alice", role: "member" }
    });

    expect(result).toHaveProperty("identity_id");
    expect(result).toHaveProperty("attributes");
    expect(result.attributes.name).toBe("Alice");
    expect(result.attributes.role).toBe("member");
  });

  test("updates identity attributes", async () => {
    await kernel.storeRecord(baseRecord);

    const updated = await kernel.updateAttributes("id-123", {
      role: "admin"
    });

    expect(updated.attributes.role).toBe("admin");
  });

  test("issues a credential to an identity", async () => {
    await kernel.storeRecord(baseRecord);

    const credential = {
      credential_id: UUID.v4(),
      type: "membership",
      issuer: "system",
      issued_at: new Date().toISOString()
    };

    const updated = await kernel.issueCredential("id-123", credential);

    expect(updated.credentials.length).toBe(1);
    expect(updated.credentials[0].type).toBe("membership");
  });

  test("adds lineage links", async () => {
    await kernel.storeRecord(baseRecord);

    const updated = await kernel.addLineage("id-123", {
      parent_id: "id-parent",
      relationship: "derived_from"
    });

    expect(updated.lineage.length).toBe(1);
    expect(updated.lineage[0].parent_id).toBe("id-parent");
  });

  test("verifies identity authority", async () => {
    await kernel.storeRecord(baseRecord);

    const result = await kernel.verifyAuthority("id-123", {
      required_role: "citizen"
    });

    expect(result.authorized).toBe(true);
  });

  test("denies authority when role mismatch", async () => {
    await kernel.storeRecord(baseRecord);

    const result = await kernel.verifyAuthority("id-123", {
      required_role: "admin"
    });

    expect(result.authorized).toBe(false);
  });

  test("emits identity events on creation", async () => {
    const spy = jest.spyOn(kernel["events"], "emit");

    await kernel.createIdentity({
      identity_type: "person",
      attributes: { name: "Bob" }
    });

    expect(spy).toHaveBeenCalled();
    const event = spy.mock.calls[0][0];

    expect(event.event_type).toBe("identity_created");

    spy.mockRestore();
  });

  test("emits identity events on attribute update", async () => {
    await kernel.storeRecord(baseRecord);

    const spy = jest.spyOn(kernel["events"], "emit");

    await kernel.updateAttributes("id-123", { role: "admin" });

    expect(spy).toHaveBeenCalled();
    const event = spy.mock.calls[0][0];

    expect(event.event_type).toBe("identity_updated");

    spy.mockRestore();
  });

  test("identity events include signatures", async () => {
    const event = IdentityEventFactory.create({
      event_type: "identity_test",
      identity: { identity_id: "id-123" },
      payload: { test: true }
    });

    expect(event.signature).toBeDefined();
    expect(event.signature.algorithm).toBe("SHA-3");
  });

  test("record retrieval returns stored identity", async () => {
    await kernel.storeRecord(baseRecord);

    const record = await kernel.getRecord("id-123");

    expect(record.identity_id).toBe("id-123");
    expect(record.attributes.name).toBe("Test User");
  });

  test("deterministic behavior for identical updates", async () => {
    await kernel.storeRecord(baseRecord);

    const r1 = await kernel.updateAttributes("id-123", { role: "citizen" });
    const r2 = await kernel.updateAttributes("id-123", { role: "citizen" });

    expect(r1.attributes.role).toBe(r2.attributes.role);
  });

  test("throws error when updating nonexistent identity", async () => {
    await expect(
      kernel.updateAttributes("missing-id", { role: "ghost" })
    ).rejects.toThrow();
  });
});
