import axios from "axios";

const ACTIVATION_STATE_ENDPOINT =
  "http://localhost:8080/system/activation-state";

const MONITOR_HEALTH_ENDPOINT =
  "http://localhost:8080/system/monitor-health";

const WATCHDOG_EVENT_ENDPOINT =
  "http://localhost:8080/events/watchdog";

async function getActivationState() {
  try {
    const res = await axios.get(ACTIVATION_STATE_ENDPOINT);
    return res.data;
  } catch {
    return { activated: false };
  }
}

async function getMonitorHealth() {
  try {
    const res = await axios.get(MONITOR_HEALTH_ENDPOINT);
    return res.data;
  } catch {
    return { running: false };
  }
}

async function publishWatchdogEvent(reason: string) {
  await axios.post(WATCHDOG_EVENT_ENDPOINT, {
    reason,
    timestamp: Date.now(),
  });

  console.log("⚠️ WATCHDOG EVENT:", reason);
}

async function runWatchdog() {
  const activation = await getActivationState();
  const monitor = await getMonitorHealth();

  if (!activation.activated) {
    await publishWatchdogEvent("Activation flag dropped unexpectedly");
    return;
  }

  if (!monitor.running) {
    await publishWatchdogEvent("Activation-State Monitor not running");
    return;
  }

  console.log("🟢 Watchdog Stable — Activation & Monitor Healthy");
}

setInterval(runWatchdog, 4000);
console.log("🔥 Beast System 3.0 Activation Watchdog Online");
