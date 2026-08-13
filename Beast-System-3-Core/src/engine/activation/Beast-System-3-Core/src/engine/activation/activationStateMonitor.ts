import axios from "axios";

const ACTIVATION_STATE_ENDPOINT =
  "http://localhost:8080/system/activation-state";

const MODULE_HEALTH_ENDPOINT =
  "http://localhost:8080/system/module-health";

const SAFE_MODE_ENDPOINT =
  "http://localhost:8080/system/safe-mode";

async function getActivationState() {
  try {
    const res = await axios.get(ACTIVATION_STATE_ENDPOINT);
    return res.data;
  } catch {
    return { activated: false };
  }
}

async function getModuleHealth() {
  try {
    const res = await axios.get(MODULE_HEALTH_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function triggerSafeMode(reason: string) {
  await axios.post(SAFE_MODE_ENDPOINT, {
    reason,
    timestamp: Date.now(),
  });

  console.log("⚠️ SAFE MODE TRIGGERED:", reason);
}

async function runActivationMonitor() {
  const activation = await getActivationState();
  const health = await getModuleHealth();

  if (!activation.activated) {
    console.log("⏳ System not activated — monitor idle");
    return;
  }

  if (!health) {
    await triggerSafeMode("Module health unavailable");
    return;
  }

  const criticalModules = [
    "governance-kernel",
    "ethics-kernel",
    "identity-kernel",
    "lunar-oracle",
    "municipal-adapter",
    "evidence-engine",
    "reasoning-engine",
    "registry-fabric",
  ];

  const failures = criticalModules.filter(
    (m) => health[m]?.status !== "online"
  );

  if (failures.length > 0) {
    await triggerSafeMode(
      `Critical subsystem failure: ${failures.join(", ")}`
    );
    return;
  }

  console.log("🟢 Activation State Stable — All Systems Online");
}

setInterval(runActivationMonitor, 5000);
console.log("🔥 Beast System 3.0 Activation-State Monitor Online");
