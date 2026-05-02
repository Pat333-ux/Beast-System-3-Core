/**
 * CryptoAdapter (CA‑S)
 * --------------------
 * Abstract cryptographic interface for Beast System 3.0.
 *
 * Every subsystem (Identity, Governance, Predictive, Wellbeing, Registry)
 * interacts with cryptography ONLY through this interface.
 *
 * Concrete implementations may include:
 *  - NodeCryptoAdapter
 *  - WebCryptoAdapter
 *  - EthereumCryptoAdapter
 *  - Ed25519CryptoAdapter
 *  - HybridChainCryptoAdapter
 */

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export abstract class CryptoAdapter {
  /**
   * Initialize crypto backend (load keys, providers, etc.)
   */
  abstract init(): Promise<void>;

  /**
   * Generate a new asymmetric keypair.
   */
  abstract generateKeyPair(algorithm?: string): Promise<KeyPair>;

  /**
   * Hash arbitrary data using a specified algorithm.
   */
  abstract hash(data: string | Buffer, algorithm?: string): Promise<string>;

  /**
   * Sign data with a private key.
   */
  abstract sign(
    data: string | Buffer,
    privateKey: string,
    algorithm?: string
  ): Promise<string>;

  /**
   * Verify a signature using a public key.
   */
  abstract verify(
    data: string | Buffer,
    signature:
