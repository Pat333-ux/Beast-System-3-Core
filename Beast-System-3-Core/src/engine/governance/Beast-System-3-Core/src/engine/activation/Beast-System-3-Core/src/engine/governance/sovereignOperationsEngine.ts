import axios from "axios";

const ACTIVATION_ENDPOINT =
  "http://localhost:8080/system/activation-flag";

const ASCENSION_ENDPOINT =
  "http://localhost:8080/events/ascension/latest";

const CYCLE_EVENT_ENDPOINT =
  "http://localhost:8080/events/governance-cycle/latest";

const ETHICS_ENDPOINT =
  "http://localhost:8080/ethics/evaluate";

const TELEMETRY_ENDPOINT =
  "http://localhost:8080/telemetry/municipal";

const LUNAR_ENDPOINT =
  "http://localhost:8080/oracle/lunar-phase";

const REGISTRY_ENDPOINT =
  "http://localhost:8080/registry/state";

const OPERATIONS_EVENT_ENDPOINT =
  "http://localhost:8080/events/operations";

async function fetchActivation() {
  try {
    const res = await axios.get(ACTIVATION_ENDPOINT);
    return res.data;
  } catch {
    return { activated: false };
  }
}

async function fetchAscension() {
  try {
    const res = await axios.get(ASCENSION_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchCycle() {
  try {
    const res = await axios.get(CYCLE_EVENT_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchTelemetry() {
  try {
    const res = await axios.get(TELEMETRY_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchLunarPhase() {
  try {
    const res = await axios.get(LUNAR_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchRegistryState() {
  try {
    const res = await axios.get(REGISTRY_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function evaluateEthics(input: any) {
  try {
    const res = await axios.post(ETHICS_ENDPOINT, input);
    return res.data;
  } catch {
    return { allowed: false };
  }
}

async function publishOperationsEvent(result: any) {
  await axios.post(OPERATIONS_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Sovereign Operations Event Published");
}

async function runOperationsEngine() {
  const activation = await fetchActivation();
  const ascension = await fetchAscension();
  const cycle = await fetchCycle();
  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();
  const registry = await fetchRegistryState();

  if (!activation.activated || ascension?.status !== "ascended") {
    console.log("⏳ Waiting for full activation + ascension");
    return;
  }

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
    cycle,
    registry,
  });

  if (!ethicsCheck.allowed) {
    await publishOperationsEvent({
      status: "blocked",
      reason: "ethics-kernel",
      cycle,
      telemetry,
      lunar,
      registry,
      ethics: ethicsCheck,
    });

    console.log("⚠️ Sovereign operation blocked by ethics kernel");
    return;
  }

  const directive = {
    status: "operational",
    cycle,
    telemetry,
    lunar,
    registry,
    ethics: ethicsCheck,
    directive: "sovereign-governance-directive",
  };

  await publishOperationsEvent(directive);

  console.log("🟢 Sovereign Operation Executed:", directive.directive);
}

setInterval(runOperationsEngine, 7000);
console.log("🔥 Beast System 3.0 Sovereign Operations Engine Online");
