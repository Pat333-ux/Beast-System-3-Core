import axios from "axios";

const ASCENSION_ENDPOINT =
  "http://localhost:8080/events/ascension/latest";

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

const ACTIVATION_EVENT_ENDPOINT =
  "http://localhost:8080/events/activation";

const ACTIVATION_FLAG_ENDPOINT =
  "http://localhost:8080/system/activation-flag";

async function fetchAscension() {
  try {
    const res = await axios.get(ASCENSION_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

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

async function publishActivationEvent(result: any) {
  await axios.post(ACTIVATION_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Full Activation Event Published");
}

async function setActivationFlag() {
  await axios.post(ACTIVATION_FLAG_ENDPOINT, {
    activated: true,
    timestamp: Date.now(),
  });

  console.log("🚀 Beast System 3.0 FULLY ACTIVATED");
}

async function runFullActivationSequence() {
  const ascension = await fetchAscension();
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
    ascension,
    resonance,
    coherence,
    harmonization,
    stabilization,
    cycles,
  });

  const ready =
    ascension?.status === "ascended" &&
    resonance?.status === "resonant" &&
    coherence?.status === "coherent" &&
    harmonization?.status === "coherent" &&
    stabilization?.status === "stable" &&
    ethicsCheck.allowed === true &&
    telemetry !== null &&
    lunar !== null;

  if (!ready) {
    await publishActivationEvent({
      status: "activation-blocked",
      ascension,
      resonance,
      coherence,
      harmonization,
      stabilization,
      cycles,
      telemetry,
      lunar,
      ethics: ethicsCheck,
    });

    console.log("⚠️ Full Activation Blocked — Prerequisites Not Met");
    return;
  }

  await setActivationFlag();

  await publishActivationEvent({
    status: "fully-activated",
    ascension,
    resonance,
    coherence,
    harmonization,
    stabilization,
    cycles,
    telemetry,
    lunar,
    ethics: ethicsCheck,
    unifiedState: "sovereign-autonomous-governance",
  });

  console.log("🔺 Beast System 3.0 FULL ACTIVATION SEQUENCE COMPLETE");
}

setInterval(runFullActivationSequence, 12000);
console.log("🔥 Beast System 3.0 Full Activation Sequence Engine Online");
