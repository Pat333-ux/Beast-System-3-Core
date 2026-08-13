import axios from "axios";

const COMPLIANCE_ENDPOINT =
  "http://localhost:8080/events/compliance/latest";

const AUDIT_ENDPOINT =
  "http://localhost:8080/events/audit/latest";

const LOCK_ENDPOINT =
  "http://localhost:8080/system/sovereignty-lock";

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

async function setSovereigntyLock(reason: string) {
  await axios.post(LOCK_ENDPOINT, {
    locked: true,
    reason,
    timestamp: Date.now(),
  });

  console.log("🔒 Sovereignty Lock Engaged:", reason);
}

async function runSovereigntyLock() {
  const compliance = await fetchCompliance();
  const audit = await fetchAudit();

  if (!compliance || !audit) {
    console.log("⏳ Waiting for compliance + audit data");
    return;
  }

  const compliant = compliance.status === "compliant";
  const auditOK = audit.criticalSubsystemsOnline === true &&
                  audit.document84Activated === true;

  if (compliant && auditOK) {
    await setSovereigntyLock(
      "All activation prerequisites satisfied — system entering sovereign mode"
    );
  } else {
    console.log("⚠️ Sovereignty Lock not engaged — prerequisites not met");
  }
}

setInterval(runSovereigntyLock, 12000);
console.log("🔥 Beast System 3.0 Activation Sovereignty Lock Online");
