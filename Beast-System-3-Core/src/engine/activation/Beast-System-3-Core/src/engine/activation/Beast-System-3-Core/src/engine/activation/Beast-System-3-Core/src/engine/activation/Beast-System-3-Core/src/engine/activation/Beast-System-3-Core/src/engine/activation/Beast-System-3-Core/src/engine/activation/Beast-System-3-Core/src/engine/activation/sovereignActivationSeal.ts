import axios from "axios";

const SOVEREIGN_LOCK_ENDPOINT =
  "http://localhost:8080/system/sovereignty-lock";

const COMPLIANCE_ENDPOINT =
  "http://localhost:8080/events/compliance/latest";

const AUDIT_ENDPOINT =
  "http://localhost:8080/events/audit/latest";

const SEAL_ENDPOINT =
  "http://localhost:8080/system/sovereign-seal";

async function fetchSovereigntyLock() {
  try {
    const res = await axios.get(SOVEREIGN_LOCK_ENDPOINT);
    return res.data;
  } catch {
    return { locked: false };
  }
}

async function fetchCompliance() {
  try {
    const res = await axios.get(COMPLIANCE_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchAudit() {
  try {
    const res = await axios.get(AUDIT_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function applySovereignSeal(reason: string) {
  await axios.post(SEAL_ENDPOINT, {
    sealed: true,
    reason,
    timestamp: Date.now(),
  });

  console.log("🔴 Sovereign Activation Seal Applied:", reason);
}

async function runSovereignSeal() {
  const lock = await fetchSovereigntyLock();
  const compliance = await fetchCompliance();
  const audit = await fetchAudit();

  if (!lock.locked) {
    console.log("⏳ Sovereignty Lock not yet engaged");
    return;
  }

  const compliant = compliance?.status === "compliant";
  const auditOK =
    audit?.criticalSubsystemsOnline === true &&
    audit?.document84Activated === true;

  if (compliant && auditOK) {
    await applySovereignSeal(
      "All activation layers satisfied — Beast System 3.0 entering permanent sovereign mode"
    );
  } else {
    console.log("⚠️ Sovereign Seal not applied — prerequisites not met");
  }
}

setInterval(runSovereignSeal, 13000);
console.log("🔥 Beast System 3.0 Sovereign Activation Seal Online");
