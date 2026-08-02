/*
  deploy-safe-template.js

  Template deploy script for Gnosis Safes using the Safe Core SDK and ethers.
  Review, test, and run in a secure environment. This script deploys each Safe defined in release/v3.0.0-rc1/safe-configs.json

  Prereqs:
    npm install ethers @safe-global/safe-core-sdk @safe-global/safe-ethers-lib

  Run (example):
    RPC_URL=https://sepolia.infura.io/v3/<key> PRIVATE_KEY="0x..." node deploy-safe-template.js

  This script is a template. Confirm API compatibility with installed package versions before running.
*/

import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import Safe, { SafeFactory } from '@safe-global/safe-core-sdk';
import EthersAdapter from '@safe-global/safe-ethers-lib';

const CONFIG_PATH = path.join(process.cwd(), 'release', 'v3.0.0-rc1', 'safe-configs.json');

async function loadConfigs() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function normalizeOwners(owners) {
  // Expand placeholders and trim entries. Do not deploy if any owners still contain TO_FILL
  const cleaned = owners.map(o => o.trim());
  const placeholders = cleaned.filter(o => o.startsWith('TO_FILL:'));
  if (placeholders.length > 0) {
    throw new Error('safe-configs.json contains TO_FILL placeholders. Replace them with real EVM addresses or ENS names before running. Missing entries: ' + placeholders.join(', '));
  }
  return cleaned;
}

async function deploySafe(config, provider, signer) {
  // Setup eth adapter
  const ethAdapter = new EthersAdapter({ ethers, signer });
  // Create Safe factory
  const safeFactory = await SafeFactory.create({ ethAdapter });

  const owners = normalizeOwners(config.owners);
  const threshold = config.threshold || 1;

  const safeAccountConfig = {
    owners,
    threshold
  };

  console.log(`Deploying safe: ${config.name} with owners=${owners.join(', ')} threshold=${threshold}`);

  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
  const newSafeAddress = await safeSdk.getAddress();
  console.log(`Safe deployed: ${config.name} -> ${newSafeAddress}`);
  return newSafeAddress;
}

async function main() {
  const rpc = process.env.RPC_URL;
  const key = process.env.PRIVATE_KEY;
  if (!rpc || !key) {
    console.error('RPC_URL and PRIVATE_KEY must be set in the environment.');
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(key, provider);

  const configs = await loadConfigs();

  // Order of creation: emergency_pause (fast), oracle_signer, primary_guardian
  const order = ['emergency_pause', 'oracle_signer', 'primary_guardian'];
  const results = {};
  for (const name of order) {
    if (!configs[name]) continue;
    try {
      const address = await deploySafe(configs[name], provider, signer);
      results[name] = address;
    } catch (err) {
      console.error(`Failed to deploy ${name}:`, err.message || err);
      process.exitCode = 2;
    }
  }

  // Print results for manual copy into manifest
  console.log('\nDEPLOY RESULTS (paste into manifest/v3.0.0-rc1/manifest.json under registry):');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
