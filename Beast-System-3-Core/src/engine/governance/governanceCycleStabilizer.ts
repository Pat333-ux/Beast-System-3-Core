import axios from "axios";

const CYCLE_EVENT_ENDPOINT =
  "http://localhost:8080/events/governance-cycle/latest";

const ETHICS_ENDPOINT =
  "http://localhost:8080/ethics/evaluate";

const TELEMETRY_ENDPOINT =
  "http://localhost:8080/telemetry/municipal";

const LUNAR_ENDPOINT =
  "http://localhost:8080/oracle/lunar-phase";

const STABILIZATION_EVENT_ENDPOINT =
  "http://localhost:8080/events/stabilization";

async function fetchLatestCycle() {
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

async function evaluateEthics(input: any) {
  try {
    const res = await axios.post(ETHICS_ENDPOINT, input);
    return res.data;
  } catch {
    return { allowed: false };
  }
}

async function publishStabilizationEvent(result: any) {
  await axios.post(STABILIZATION_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Stabilization event published");
}

async function runStabilizer() {
  const cycle = await fetchLatestCycle();
  if (!cycle) {
    console.log("⏳ Waiting for governance cycle data");
    return;
  }

  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
    cycle,
  });

  const unstable =
    cycle?.decision === "error" ||
    ethicsCheck.allowed === false ||
    telemetry === null ||
    lunar === null;

  if (unstable) {
    await publishStabilizationEvent({
      status: "unstable",
      cycle,
      telemetry,
      lunar,
      ethics: ethicsCheck,
    });

    console.log("⚠️ Governance cycle unstable — stabilization applied");
    return;
  }

  await publishStabilizationEvent({
    status: "stable",
    cycle,
    telemetry,
    lunar,
    ethics: ethicsCheck,
  });

  console.log("🟢 Governance cycle stable");
}

setInterval(runStabilizer, 6000);
console.log("🔥 Beast System 3.0 Governance Cycle Stabilizer Online");
