/**
 * UUID.ts (UUID‑S)
 * ----------------
 * Sovereign UUID generator for Beast System 3.0.
 *
 * Provides:
 *  - cryptographically secure UUID v4
 *  - fallback polyfill when crypto is unavailable
 *  - deterministic interface for all engines
 */

export class UUID {
  /**
   * Generate a cryptographically secure UUID v4.
   */
  static v4(): string {
    // Prefer WebCrypto if available
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Node.js crypto fallback
    try {
      const { randomBytes } = require("crypto");
      const bytes = randomBytes(16);

      // Per RFC 4122
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

      const hex = [...bytes].map(b => b.toString(16
