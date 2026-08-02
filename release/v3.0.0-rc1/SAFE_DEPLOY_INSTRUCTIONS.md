# SAFE_DEPLOY: Instructions & Template

This folder contains a recommended safe-config and a deploy script template for creating Gnosis Safes programmatically. The script is a template using the Safe Core SDK and must be run by an operator with a funded deployer key in a secure environment.

Files added
- `safe-configs.json` — recommended safe configurations (placeholders) for primary_guardian, oracle_signer, and emergency_pause.
- `deploy-safe-template.js` — a Node.js template script that reads `safe-configs.json` and deploys Safes using the Safe Core SDK. Review and test before running in production.

Important notes
- The `safe-configs.json` contains `TO_FILL:` placeholders for owner addresses. Replace these with EIP-55 checksummed 0x... addresses or ENS names before running the script.
- Deploying Safes requires gas. Use a funded deployer account (recommended a single operator or a short-lived deployer key with tightly controlled access).
- This script is a template. Confirm dependencies, test on Sepolia (or a local fork) and review the Safe Core SDK docs before using in production.

Prerequisites
- Node 18+ (or current LTS)
- Install deps:

  npm install ethers @safe-global/safe-core-sdk @safe-global/safe-ethers-lib

Environment variables
- RPC_URL — Ethereum JSON-RPC URL (e.g., Alchemy/Infura mainnet or Sepolia)
- PRIVATE_KEY — private key for the deployer account (must have ETH to pay deployment gas)

Usage (test on Sepolia/local fork first)

  RPC_URL=https://sepolia.infura.io/v3/<KEY> \ 
  PRIVATE_KEY="0x..." \ 
  node deploy-safe-template.js

Security
- Do not run the deploy script from an internet-facing workstation. Use a hardened deploy host or ephemeral environment.
- Consider using a multisig factory service or the Safe web app for higher-assurance deployments if you cannot secure the deploy environment.

---

Template deploy script: `deploy-safe-template.js`

NOTE: This is a best-effort template based on the Safe Core SDK. Confirm versions and APIs in your environment before running.
