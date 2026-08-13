import axios from "axios";

const CYCLE_HISTORY_ENDPOINT =
  "http://localhost:8080/events/governance-cycle/history";

const ETHICS_ENDPOINT =
  "http://localhost:8080/ethics/evaluate";

const TELEMETRY_ENDPOINT =
  "http://localhost:8080/telemetry/municipal";

const LUNAR_ENDPOINT =
  "http://localhost:8080/oracle/lunar-phase";

const HARMONIZATION_EVENT_ENDPOINT =
  "http://localhost:8080/events/harmonization";

async function fetchCycleHistory() {
  try {
    const res = await axios.get(CYCLE_HISTORY_ENDPOINT);
    return res.data;
  } catch {
    return [];
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

async function publishHarmonizationEvent(result: any) {
  await axios.post(HARMONIZATION_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Harmonization event published");
}

async function runHarmonizer() {
  const cycles = await fetchCycleHistory();
  if (!cycles || cycles.length === 0) {
    console.log("⏳ Waiting for governance cycle history");
    return;
  }

  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
    cycles,
  });

  const conflictingDecisions = cycles
    .map((c: any) => c.result?.decision)
    .filter((d: any) => d !== undefined);

  const uniqueDecisions = new Set(conflictingDecisions);

  const conflictDetected = uniqueDecisions.size > 1 || ethicsCheck.allowed === false;

  if (conflictDetected) {
    await publishHarmonizationEvent({
      status: "harmonized",
      conflictDetected: true,
      cycles,
      telemetry,
      lunar,
      ethics: ethicsCheck,
      unifiedDecision: "harmonized-resolution",
    });

    console.log("⚠️ Conflicting governance cycles detected — harmonization applied");
    return;
  }

  await publishHarmonizationEvent({
    status: "coherent",
    conflictDetected: false,
    cycles,
    telemetry,
    lunar,
    ethics: ethicsCheck,
    unifiedDecision: conflictingDecisions[0],
  });

  console.log("🟢 Governance cycles coherent — harmonization stable");
}

setInterval(runHarmonizer, 7000);
console.log("🔥 Beast System 3.0 Governance Cycle Harmonizer Online");
