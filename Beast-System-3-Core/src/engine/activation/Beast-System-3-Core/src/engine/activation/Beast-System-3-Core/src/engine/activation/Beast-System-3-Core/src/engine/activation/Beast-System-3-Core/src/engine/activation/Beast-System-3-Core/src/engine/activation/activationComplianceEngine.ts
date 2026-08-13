import axios from "axios";

const LEDGER_ENDPOINT =
  "http://localhost:8080/system/activation-ledger";

const AUDIT_ENDPOINT =
  "http://localhost:8080/events/audit/latest";

const HEALTH_ENDPOINT =
  "http://localhost:8080/system/module-health";

const COMPLIANCE_EVENT_ENDPOINT =
  "http://localhost:8080/events/compliance";

async function fetchLedger() {
  try {
    const res = await axios.get(LEDGER_ENDPOINT);
    return res.data;
  } catch {
    return [];
  }
}

async function fetchLatestAudit() {
  try {
    const res = await axios.get(AUDIT_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchSubsystemHealth() {
  try {
    const res = await axios.get(HEALTH_ENDPOINT);
    return res.data;
  } catch {
    return null;
  }
}

async function publishComplianceEvent(result: any) {
  await axios.post(COMPLIANCE_EVENT_ENDPOINT, {
    result,
    timestamp: Date.now(),
  });

  console.log("📡 Compliance event published");
}

async function enforceCompliance() {
  const ledger = await fetchLedger();
  const audit = await fetchLatestAudit();
  const health = await fetchSubsystemHealth();

  const violations: string[] = [];

  if (!audit?.criticalSubsystemsOnline) {
    violations.push("Critical subsystem offline");
  }

  if (!audit?.document84Activated) {
    violations.push("Governance Document #84 not activated");
  }

  if (ledger.length < 1) {
    violations.push("Ledger missing activation entries");
  }

  if (violations.length > 0) {
    await publishComplianceEvent({
      status: "non-compliant",
      violations,
      health,
      audit,
    });

    console.log("⚠️ Compliance violations detected:", violations);
    return;
  }

  await publishComplianceEvent({
    status: "compliant",
    health,
    audit,
  });

  console.log("🟢 Activation Compliance Verified");
}

setInterval(enforceCompliance, 11000);
console.log("🔥 Beast System 3.0 Activation Compliance Engine Online");
