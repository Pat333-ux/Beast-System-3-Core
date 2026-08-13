import axios from "axios";

const IGNITION_ENDPOINT =
  "http://localhost:8080/system/ignition";

const TELEMETRY_ENDPOINT =
  "http://localhost:8080/telemetry/municipal";

const LUNAR_ENDPOINT =
  "http://localhost:8080/oracle/lunar-phase";

const ETHICS_ENDPOINT =
  "http://localhost:8080/ethics/evaluate";

const GOVERNANCE_ENDPOINT =
  "http://localhost:8080/governance/cycle";

const CYCLE_EVENT_ENDPOINT =
  "http://localhost:8080/events/governance-cycle";

async function fetchIgnitionState() {
  try {
    const res = await axios.get(IGNITION_ENDPOINT);
    return res.data;
  } catch {
    return { ignited: false };
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

async function runGovernanceCycle(input: any) {
  try {
    const res = await axios.post(GOVERNANCE_ENDPOINT, input);
    return res.data;
  } catch {
    return { decision: "error" };
  }
}

async function publishCycleEvent(result: any) {
  await axios.post(CYCLE_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Governance cycle event published");
}

async function runCycle() {
  const ignition = await fetchIgnitionState();
  if (!ignition.ignited) {
    console.log("⏳ Waiting for ignition");
    return;
  }

  const telemetry = await fetchTelemetry();
  const lunar = await fetchLunarPhase();

  const ethicsCheck = await evaluateEthics({
    telemetry,
    lunar,
  });

  if (!ethicsCheck.allowed) {
    console.log("⚠️ Governance cycle blocked by ethics kernel");
    return;
  }

  const decision = await runGovernanceCycle({
    telemetry,
    lunar,
    ethics: ethicsCheck,
  });

  await publishCycleEvent(decision);

  console.log("🔁 Autonomous Governance Cycle Complete:", decision);
}

setInterval(runCycle, 8000);
console.log("🔥 Beast System 3.0 Autonomous Governance Cycle Engine Online");
