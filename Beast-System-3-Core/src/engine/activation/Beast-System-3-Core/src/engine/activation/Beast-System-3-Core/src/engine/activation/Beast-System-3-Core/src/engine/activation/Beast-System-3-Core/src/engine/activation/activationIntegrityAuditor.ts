import axios from "axios";

const LEDGER_ENDPOINT =
  "http://localhost:8080/system/activation-ledger";

const SUBSYSTEM_ENDPOINT =
  "http://localhost:8080/system/module-health";

const GOVERNANCE_DOC_ENDPOINT =
  "http://localhost:8080/governance/documents";

const AUDIT_EVENT_ENDPOINT =
  "http://localhost:8080/events/audit";

async function fetchLedger() {
  try {
    const res = await axios.get(LEDGER_ENDPOINT);
    return res.data;
  } catch {
    return [];
  }
}

async function fetchSubsystemHealth() {
  try {
    const res = await axios.get(SUBSYSTEM_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchGovernanceDocs() {
  try {
    const res = await axios.get(GOVERNANCE_DOC_ENDPOINT);
    return res.data;
  } catch {
    return [];
  }
}

async function publishAuditEvent(result: any) {
  await axios.post(AUDIT_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Audit event published");
}

async function runIntegrityAudit() {
  const ledger = await fetchLedger();
  const health = await fetchSubsystemHealth();
  const docs = await fetchGovernanceDocs();

  const doc84 = docs.find((d: any) => d.id === 84);

  const auditResult = {
    ledgerEntries: ledger.length,
    criticalSubsystemsOnline: [
      "governance-kernel",
      "ethics-kernel",
      "identity-kernel",
      "lunar-oracle",
      "municipal-adapter",
      "evidence-engine",
      "reasoning-engine",
      "registry-fabric",
    ].every((m) => health[m]?.status === "online"),
    document84Activated: doc84?.activated === true,
    timestamp: Date.now(),
  };

  await publishAuditEvent(auditResult);

  console.log("🧾 Activation Integrity Audit Complete:", auditResult);
}

setInterval(runIntegrityAudit, 9000);
console.log("🔥 Beast System 3.0 Activation Integrity Auditor Online");
