import { RegistryService } from "../RegistryService";
import { RegistryEventFactory } from "../../registry/RegistryEvent";
import { UUID } from "../../../util/UUID";
import { Timestamp } from "../../../util/Timestamp";

describe("RegistryEngine / RegistryService (SAIA‑Class S)", () => {
  let registry: RegistryService;

  beforeEach(async () => {
    registry = new RegistryService();
    await registry.init();
  });

  const baseEvent = () =>
    RegistryEventFactory.create({
      event_type: "test_event",
      actor: { actor_type: "governance_kernel", actor_id: "actor-1" },
      payload: { value: 42 },
      severity: "info",
      context: { case_id: "case-123" }
    });

  test("writes an event as a registry entry", async () => {
    const event = baseEvent();
    const entry = await registry.recordEvent(event);

    expect(entry).to
