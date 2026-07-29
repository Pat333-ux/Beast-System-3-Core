// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityCrypto
// Purpose: Cryptographic primitives for hashing, signing, verification,
// DID binding, artifact integrity, and chain-of-custody enforcement.

import crypto from "crypto";
import { ethers } from "ethers";
import { IdentityError } from "./identity-errors";
import { Did, WalletAddress } from "./identity-manager";

export interface HashResult {
  algorithm: string;
  digest: string;
}

export interface SignatureResult {
  message: string;
  signature: string;
  wallet: WalletAddress;
}

export interface VerificationResult {
  valid: boolean;
  wallet?: WalletAddress;
  reason?: string;
}

export class IdentityCrypto {
  /**
   * Compute SHA-256 hash.
   */
  sha256(content: string | Buffer): HashResult {
    const digest = crypto.createHash("sha256").update(content).digest("hex");
    return {
      algorithm: "sha256",
      digest,
    };
  }

  /**
   * Compute SHA-512 hash.
   */
  sha512(content: string | Buffer): HashResult {
    const digest = crypto.createHash("sha512").update(content).digest("hex");
    return {
      algorithm: "sha512",
      digest,
    };
  }

  /**
   * Compute HMAC-SHA256.
   */
  hmacSha256(secret: string, content: string | Buffer): HashResult {
    const digest = crypto.createHmac("sha256", secret).update(content).digest("hex");
    return {
      algorithm: "hmac-sha256",
      digest,
    };
  }

  /**
   * Sign a message using an EVM private key.
   * (Used for internal system signing, not user wallets.)
   */
  signMessage(privateKey: string, message: string): SignatureResult {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const signature = wallet.signMessage(message);

      return {
        message,
        signature,
        wallet: wallet.address,
      };
    } catch (err: any) {
      throw new IdentityError(
        "INTEGRITY_VIOLATION",
        "Failed to sign message.",
        { reason: err?.message }
      );
    }
  }

  /**
   * Verify a signature from MetaMask or any EVM wallet.
   */
  verifySignature(message: string, signature: string): VerificationResult {
    try {
      const recovered = ethers.verifyMessage(message, signature);

      if (!ethers.isAddress(recovered)) {
        return {
          valid: false,
          reason: "Recovered value is not a valid wallet address.",
        };
      }

      return {
        valid: true,
        wallet: recovered,
      };
    } catch (err: any) {
      return {
        valid: false,
        reason: err?.message ?? "Signature verification failed.",
      };
    }
  }

  /**
   * Verify DID ↔ wallet cryptographic binding.
   */
  verifyDidBinding(did: Did, wallet: WalletAddress): VerificationResult {
    if (!did.startsWith("did:")) {
      throw new IdentityError("INVALID_DID", "DID must start with 'did:'.", { did });
    }

    const parts = did.split(":");
    const embeddedWallet = parts[3];

    if (!embeddedWallet) {
      throw new IdentityError(
        "INVALID_DID_FORMAT",
        "DID does not embed a wallet address.",
        { did }
      );
    }

    if (embeddedWallet.toLowerCase() !== wallet.toLowerCase()) {
      return {
        valid: false,
        wallet,
        reason: "DID is not cryptographically bound to this wallet.",
      };
    }

    return {
      valid: true,
      wallet,
    };
  }

  /**
   * Compute chain-of-custody hash for identity objects.
   */
  chainOfCustodyHash(obj: Record<string, unknown>): HashResult {
    const json = JSON.stringify(obj, Object.keys(obj).sort());
    return this.sha256(json);
  }

  /**
   * Verify chain-of-custody integrity.
   */
  verifyChainOfCustody(
    obj: Record<string, unknown>,
    expectedHash: string
  ): VerificationResult {
    const actual = this.chainOfCustodyHash(obj).digest;

    if (actual !== expectedHash) {
      return {
        valid: false,
        reason: "Chain-of-custody hash mismatch.",
      };
    }

    return {
      valid: true,
    };
  }

  /**
   * Hash civic artifact content.
   */
  hashArtifact(content: string | Buffer): HashResult {
    return this.sha256(content);
  }
}

/**
 * Factory for default IdentityCrypto instance.
 */
export function createIdentityCrypto(): IdentityCrypto {
  return new IdentityCrypto();
}
