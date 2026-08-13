import axios from "axios";

const HARMONIZATION_ENDPOINT =
  "http://localhost:8080/events/harmonization/latest";

const STABILIZATION_ENDPOINT =
  "http://localhost:8080/events/stabilization/latest";

const CYCLE_HISTORY_ENDPOINT =
  "http://localhost:8080/events/governance-cycle/history";

const ETHICS_ENDPOINT =
  "http://localhost:8080/ethics/evaluate";

const TELEMETRY_ENDPOINT =
  "http://localhost:8080/telemetry/municipal";

const LUNAR_ENDPOINT =
  "http://localhost:8080/oracle/lunar-phase";

const COHERENCE_EVENT_ENDPOINT =
  "http://localhost:8080/events/coherence";

async function fetchHarmonization() {
  try {
    const res = await axios.get(HARMONIZATION_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchStabilization() {
  try {
    const res = await axios.get(STABILIZATION_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

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

async function publishCoherenceEvent(result: any) {
  await axios.post(COHERENCE_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Coherence event published");
}

async function runCoherenceEngine() {
  const harmonization = await fetchHarmonization();
  const stabilization = await fetchStabilization();
  const cycles = await fetchCycleHistory();
  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
    harmonization,
    stabilization,
    cycles,
  });

  const incoherent =
    harmonization?.status !== "coherent" ||
    stabilization?.status !== "stable" ||
    ethicsCheck.allowed === false ||
    telemetry === null ||
    lunar === null;

  if (incoherent) {
    await publishCoherenceEvent({
      status: "incoherent",
      harmonization,
      stabilization,
      cycles,
      telemetry,
      lunar,
      ethics: ethicsCheck,
      unifiedState: "coherence-restored",
    });

    console.log("⚠️ Governance incoherence detected — coherence restoration applied");
    return;
  }

  await publishCoherenceEvent({
    status: "coherent",
    harmonization,
    stabilization,
    cycles,
    telemetry,
    lunar,
    ethics: ethicsCheck,
    unifiedState: "coherent-governance",
  });

  console.log("🟢 Governance fully coherent");
}

setInterval(runCoherenceEngine, 9000);
console.log("🔥 Beast System 3.0 Governance Coherence Engine Online");
