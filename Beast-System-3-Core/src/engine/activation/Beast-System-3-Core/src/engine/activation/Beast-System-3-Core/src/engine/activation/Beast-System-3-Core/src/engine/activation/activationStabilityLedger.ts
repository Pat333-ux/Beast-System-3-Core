import axios from "axios";

const LEDGER_ENDPOINT =
  "http://localhost:8080/system/activation-ledger";

export async function appendLedgerEntry(event: string, details: any = {}) {
  try {
    await axios.post(LEDGER_ENDPOINT, {
      event,
      details,
      timestamp: Date.now(),
    });

    console.log(`📘 Ledger entry recorded: ${event}`);
  } catch (err) {
    console.error("Ledger append failed:", err);
  }
}

async function runLedgerSync() {
  // Pull activation state
  const activation = await axios
    .get("http://localhost:8080/system/activation-state")
    .then((r) => r.data)
    .catch(() => ({ activated: false }));

  // Pull watchdog status
  const watchdog = await axios
    .get("http://localhost:8080/system/watchdog-status")
    .then((r) => r.data)
    .catch(() => ({ running: false }));

  // Pull monitor status
  const monitor = await axios
    .get("http://localhost:8080/system/monitor-health")
    .then((r) => r.data)
    .catch(() => ({ running: false }));

  await appendLedgerEntry("activation-sync", {
    activationState: activation,
    watchdogStatus: watchdog,
    monitorStatus: monitor,
  });
}

setInterval(runLedgerSync, 7000);
console.log("🔥 Beast System 3.0 Activation Stability Ledger Online");
