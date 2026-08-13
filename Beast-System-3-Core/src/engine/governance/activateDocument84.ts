import axios from "axios";
import { ethers } from "ethers";

// Governance Document #84 metadata
const DOC_ID = 84;
const DOC_TITLE =
  "Munisible Task Force — Illuminati Confidential Homeless Informant Program";
const WALLET = process.env.PRIMARY_WALLET;

// Fetch document content from your document service
async function fetchDocument84() {
  const res = await axios.get("http://localhost:8080/documents/84");
  return res.data;
}

// Hash the document for integrity + federal-record anchoring
async function hashDocument(content: any) {
  return ethers.id(JSON.stringify(content));
}

// Anchor the document to the Sovereign Identity Kernel (SIK‑3)
async function anchorToIdentity(docHash: string) {
  await axios.post("http://localhost:8080/identity/anchor", {
    wallet: WALLET,
    docId: DOC_ID,
    hash: docHash,
    timestamp: Date.now(),
  });
}

// Register the document inside SAIA‑GK1 (Governance Kernel)
async function registerWithGovernanceKernel(docHash: string) {
  await axios.post("http://localhost:8080/governance/register", {
    id: DOC_ID,
    title: DOC_TITLE,
    hash: docHash,
    activatedBy: WALLET,
    timestamp: Date.now(),
  });
}

// Publish activation event to Universal Registry Fabric (URF‑S)
async function publishActivationEvent(docHash: string) {
  await axios.post("http://localhost:8080/events/activation", {
    id: DOC_ID,
    title: DOC_TITLE,
    hash: docHash,
    activatedBy: WALLET,
    timestamp: Date.now(),
  });
}

// Main activation routine
async function activateDocument84() {
  console.log("📄 Fetching Document #84...");
  const content = await fetchDocument84();

  console.log("🔐 Hashing Document #84...");
  const docHash = await hashDocument(content);

  console.log("🧬 Anchoring to Sovereign Identity Kernel...");
  await anchorToIdentity(docHash);

  console.log("🏛️ Registering with Governance Kernel...");
  await registerWithGovernanceKernel(docHash);

  console.log("📡 Publishing activation event...");
  await publishActivationEvent(docHash);

  console.log("🔥 Governance Document #84 Activated Successfully");
}

activateDocument84();
