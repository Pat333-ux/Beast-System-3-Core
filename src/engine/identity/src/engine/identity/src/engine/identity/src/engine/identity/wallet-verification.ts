// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: WalletVerification
// Purpose: Cryptographic wallet validation, signature verification, replay protection,
// DID binding enforcement, and governance-aligned identity constraints.

import { ethers } from "ethers";
import { IdentityError, WalletAddress, Did } from "./identity-manager";

export interface VerificationResult {
  wallet: WalletAddress;
  did?: Did;
  valid: boolean;
  reason?: string;
}

export interface WalletVerificationConfig {
  enforceChecksum: boolean;
  enforceDidBinding: boolean;
  replayProtectionWindowMs: number;
}

export class WalletVerification {
  private readonly config: WalletVerificationConfig;
  private readonly recentNonces = new Set<string>(); // replay protection

  constructor(config?: Partial<WalletVerificationConfig>) {
    this.config = {
      enforceChecksum: true,
      enforceDidBinding: true,
      replayProtectionWindowMs: 60_000, // 1 minute default
      ...config,
    };
  }

  /**
   * Validate an EVM wallet address.
   */
  validateWalletAddress(wallet: WalletAddress): boolean {
    if (!wallet || typeof wallet !== "string") {
      throw new IdentityError("INVALID_WALLET", "Wallet address must be a string.", { wallet });
    }

    if (!ethers.isAddress(wallet)) {
      throw new IdentityError("INVALID_WALLET_FORMAT", "Wallet address is not a valid EVM address.", { wallet });
    }

    if (this.config.enforceChecksum) {
      const checksum = ethers.getAddress(wallet);
      if (checksum !== wallet) {
        throw new IdentityError(
          "INVALID_CHECKSUM",
          "Wallet address checksum mismatch.",
          { provided: wallet, expected: checksum }
        );
      }
    }

    return true;
  }

  /**
   * Verify a signed message from MetaMask or any EVM wallet.
   */
  async verifySignature(
    message: string,
    signature: string,
    expectedWallet?: WalletAddress
  ): Promise<VerificationResult> {
    try {
      const recovered = ethers.verifyMessage(message, signature);

      this.validateWalletAddress(recovered);

      if (expectedWallet && recovered.toLowerCase() !== expectedWallet.toLowerCase()) {
        return {
          wallet: recovered,
          valid: false,
          reason: "Recovered wallet does not match expected wallet.",
        };
      }

      return {
        wallet: recovered,
        valid: true,
      };
    } catch (err: any) {
      return {
        wallet: expectedWallet ?? "unknown",
        valid: false,
        reason: err?.message ?? "Signature verification failed.",
      };
    }
  }

  /**
   * Verify DID binding to wallet.
   */
  verifyDidBinding(did: Did, wallet: WalletAddress): VerificationResult {
    if (!this.config.enforceDidBinding) {
      return { wallet, did, valid: true };
    }

    if (!did.startsWith("did:")) {
      throw new IdentityError("INVALID_DID", "DID must start with 'did:'.", { did });
    }

    // Example DID format: did:nwo:beast:<wallet>
    const parts = did.split(":");
    const embeddedWallet = parts[3];

    if (!embeddedWallet) {
      throw new IdentityError("INVALID_DID_FORMAT", "DID does not embed a wallet address.", { did });
    }

    if (embeddedWallet.toLowerCase() !== wallet.toLowerCase()) {
      return {
        wallet,
        did,
        valid: false,
        reason: "DID is not bound to this wallet.",
      };
    }

    return { wallet, did, valid: true };
  }

  /**
   * Replay protection using nonce tracking.
   */
  verifyNonce(nonce: string): boolean {
    if (!nonce || typeof nonce !== "string") {
      throw new IdentityError("INVALID_NONCE", "Nonce must be a string.", { nonce });
    }

    if (this.recentNonces.has(nonce)) {
      throw new IdentityError(
        "REPLAY_ATTACK_DETECTED",
        "Nonce has already been used.",
        { nonce }
      );
    }

    this.recentNonces.add(nonce);

    // Remove nonce after window expires
    setTimeout(() => {
      this.recentNonces.delete(nonce);
    }, this.config.replayProtectionWindowMs);

    return true;
  }

  /**
   * Full verification pipeline:
   * - wallet format
   * - signature validity
   * - DID binding
   * - replay protection
   */
  async verifyAll(
    message: string,
    signature: string,
    did: Did,
    nonce: string
  ): Promise<VerificationResult> {
    this.verifyNonce(nonce);

    const sig = await this.verifySignature(message, signature);

    if (!sig.valid) {
      return sig;
    }

    const didCheck = this.verifyDidBinding(did, sig.wallet);

    if (!didCheck.valid) {
      return didCheck;
    }

    return {
      wallet: sig.wallet,
      did,
      valid: true,
    };
  }
}

/**
 * Factory for default WalletVerification instance.
 */
export function createWalletVerification(): WalletVerification {
  return new WalletVerification();
}
