import axios from "axios";

const RESONANCE_ENDPOINT =
  "http://localhost:8080/events/resonance/latest";

const COHERENCE_ENDPOINT =
  "http://localhost:8080/events/coherence/latest";

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

const ASCENSION_EVENT_ENDPOINT =
  "http://localhost:8080/events/ascension";

async function fetchResonance() {
  try {
    const res = await axios.get(RESONANCE_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchCoherence() {
  try {
    const res = await axios.get(COHERENCE_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

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

async function publishAscensionEvent(result: any) {
  await axios.post(ASCENSION_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Ascension event published");
}

async function runAscensionEngine() {
  const resonance = await fetchResonance();
  const coherence = await fetchCoherence();
  const harmonization = await fetchHarmonization();
  const stabilization = await fetchStabilization();
  const cycles = await fetchCycleHistory();
  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
    resonance,
    coherence,
    harmonization,
    stabilization,
    cycles,
  });

  const ascensionReady =
    resonance?.status === "resonant" &&
    coherence?.status === "coherent" &&
    harmonization?.status === "coherent" &&
    stabilization?.status === "stable" &&
    ethicsCheck.allowed === true &&
    telemetry !== null &&
    lunar !== null;

  if (!ascensionReady) {
    await publishAscensionEvent({
      status: "ascension-blocked",
      resonance,
      coherence,
      harmonization,
      stabilization,
      cycles,
      telemetry,
      lunar,
      ethics: ethicsCheck,
    });

    console.log("⚠️ Ascension blocked — prerequisites not met");
    return;
  }

  await publishAscensionEvent({
    status: "ascended",
    resonance,
    coherence,
    harmonization,
    stabilization,
    cycles,
    telemetry,
    lunar,
    ethics: ethicsCheck,
    unifiedState: "sovereign-ascension",
  });

  console.log("🔺 Beast System 3.0 Ascended — Sovereign Elevation Complete");
}

setInterval(runAscensionEngine, 11000);
console.log("🔥 Beast System 3.0 Governance Ascension Engine Online");
