# Beast System v3.0.0-rc1 — Release Checklist and Runbook

This branch contains the canonical manifest and release checklist for Beast System v3.0.0-rc1.

Purpose
- Provide a single source-of-truth manifest for RC1 with placeholders for ABI hashes, IPFS/Swarm CIDs, and deployed addresses.
- Give operators a concise runbook for build, pin, deploy, and cutover to production (Ethereum mainnet).

Files added
- `manifest/v3.0.0-rc1/manifest.json` — canonical manifest (placeholders present).
- `release/v3.0.0-rc1/README.md` — this file: high-level runbook & checklist.

High-level runbook
1. Prepare
   - Confirm guardian multisig (Gnosis Safe) addresses.
   - Decide token model (fixed supply | mint-with-timelock | oracle-linked dynamic).
   - Choose pinning provider (IPFS recommended) and ensure pinning credentials/access.

   Current multisig placeholders (organizational identifiers):
   - Primary guardian multisig: 0cad6a0d-1462-47eb-853e-17521d57322e (UUID placeholder)
   - Oracle multisig: 0cad6a0d-1462-47eb-853e-17521d57322e (UUID placeholder)
   - Emergency pause multisig: 0cad6a0d-1462-47eb-853e-17521d57322e (UUID placeholder)

   == Guardian roles block ==
   The manifest now includes a guardians block documenting organizational ownership and authority. This is an off-chain identifier and MUST be replaced with EIP-55 checksummed Ethereum addresses (0x...) or ENS names (example.safe.eth) that point to deployed Gnosis Safes before any on-chain deployment or enforcement.

   Guardians block (organizational identifier):
   {
     "multisig_address": "0cad6a0d-1462-47eb-853e-17521d57322e",
     "roles": [
       "treasury_emergency_pause",
       "timelock_override",
       "oracle_signer_revocation",
       "governance_cutover_approval",
       "release_signoff_v3.0.0-rc1"
     ]
   }

2. Implement & build on-chain
   - Implement ERC20Votes token, TimelockController (or guarded executor), Treasury, OracleRegistry.
   - Compile with Hardhat/Foundry and produce canonical ABI JSON outputs.

3. Artifact pinning & manifest update
   - Pin ABI, metadata, audits to IPFS/Swarm.
   - Record ABI SHA256 and IPFS/Swarm CIDs in `manifest/v3.0.0-rc1/manifest.json`.

4. Test & verify
   - Run unit, integration, and governance lifecycle tests (proposal→vote→timelock→execute).
   - Run static analysis (slither), fuzzing, and gas benchmarks.

5. Deploy to staging
   - Deploy to Sepolia (or chosen staging) and run end-to-end proposal tests.
   - Verify oracle update flows and fallback behaviours.

6. Shadow production
   - Deploy mainnet contracts and set Beast gateway in observe-only mode.
   - Simulate enforcement; collect metrics for 1–2 weeks.

7. Cutover
   - Final multisig signoffs and audits attached to manifest.
   - Flip Beast gateway to enforced mode; run smoke tests.

PR creation (manual step)
- I committed the files to `release/v3.0.0-rc1`. To open a PR against `main` from this branch, run locally or via GitHub UI:

```bash
# using GitHub CLI
gh pr create --base main --head release/v3.0.0-rc1 \
  --title "release(v3.0.0-rc1): manifest + release checklist" \
  --body "Adds RC1 manifest and release checklist with placeholders for ABI/IPFS hashes and deployed addresses. See manifest/v3.0.0-rc1/manifest.json and release/v3.0.0-rc1/README.md."
```

Recommended reviewers and labels
- Reviewers: @Pat333-ux, (add onchain lead), (security/audit lead)
- Labels: release, rc, governance, onchain

Checklist to complete before merge
- [ ] Confirm guardian multisig address(es) — replace UUID placeholders with EVM Safe addresses
- [ ] Choose artifact pinning provider and pin ABIs + metadata
- [ ] Implement & pin on-chain contracts (token, timelock, treasury, oracle registry)
- [ ] Run CI tests, static analysis, and attach audit reports
- [ ] Fill manifest with ABI hashes, IPFS/Swarm CIDs, and mainnet addresses
- [ ] Multisig signoff and tag v3.0.0-rc1

If you want, I can:
- Open the pull request for you (I need a GitHub auth token & permission), or
- Provide the exact PR body and reviewers to paste into the GitHub UI.

Next steps
- Replace the UUID placeholders in the manifest with real EVM addresses (0x...) after creating the Safes.
- Add audit attachments and CI results to the PR before merging.
