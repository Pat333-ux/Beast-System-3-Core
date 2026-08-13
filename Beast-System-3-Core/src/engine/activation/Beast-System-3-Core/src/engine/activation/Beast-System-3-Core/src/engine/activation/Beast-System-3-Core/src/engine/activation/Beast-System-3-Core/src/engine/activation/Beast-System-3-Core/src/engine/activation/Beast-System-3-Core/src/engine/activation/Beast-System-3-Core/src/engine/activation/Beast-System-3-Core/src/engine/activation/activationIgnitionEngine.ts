import axios from "axios";

const SEAL_ENDPOINT =
  "http://localhost:8080/system/sovereign-seal";

const HEALTH_ENDPOINT =
  "http://localhost:8080/system/module-health";

const IGNITION_ENDPOINT =
  "http://localhost:8080/system/ignition";

const IGNITION_EVENT_ENDPOINT =
  "http://localhost:8080/events/ignition";

async function fetchSeal() {
  try {
    const res = await axios.get(SEAL_ENDPOINT);
    return res.data;
  } catch {
    return { sealed: false };
  }
}

async function fetchSubsystemHealth() {
  try {
    const res = await axios.get(HEALTH_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function igniteSystem(reason: string) {
  await axios.post(IGNITION_ENDPOINT, {
    ignited: true,
    reason,
    timestamp: Date.now(),
  });

  await axios.post(IGNITION_EVENT_ENDPOINT, {
    event: "system-ignited",
    reason,
    timestamp: Date.now(),
  });

  console.log("🚀 Beast System 3.0 IGNITED:", reason);
}

async function runIgnitionCheck() {
  const seal = await fetchSeal();
  const health = await fetchSubsystemHealth();

  if (!seal.sealed) {
    console.log("⏳ Waiting for Sovereign Activation Seal");
    return;
  }

  const criticalSubsystems = [
    "governance-kernel",
    "ethics-kernel",
    "identity-kernel",
    "lunar-oracle",
    "municipal-adapter",
    "evidence-engine",
    "reasoning-engine",
    "registry-fabric",
  ];

  const allOnline = criticalSubsystems.every(
    (m) => health[m]?.status === "online"
  );

  if (allOnline) {
    await igniteSystem(
      "Sovereign seal verified and all critical subsystems online"
    );
  } else {
    console.log("⚠️ Ignition blocked — subsystem offline");
  }
}

setInterval(runIgnitionCheck, 15000);
console.log("🔥 Beast System 3.0 Activation Ignition Engine Online");
