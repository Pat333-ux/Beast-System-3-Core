/**
 * Timestamp.ts (TS‑S)
 * -------------------
 * Sovereign timestamp generator for Beast System 3.0.
 *
 * Provides:
 *  - ISO‑8601 timestamps
 *  - monotonic safety (no backward time travel)
 *  - clock‑skew protection
 *  - deterministic fallback
 *
 * All engines use this for audit‑safe event sequencing.
 */

export class Timestamp {
  private static lastTimestamp = 0;

  /**
   * Generate a monotonic, ISO‑8601 timestamp.
   */
  static now(): string {
    const current = Date.now();

    // Prevent backward time travel
    if (current <= this.lastTimestamp) {
      this.lastTimestamp += 1;
    } else {
      this.lastTimestamp = current;
    }

    return new Date(this.lastTimestamp).toISOString();
  }

  /**
   * Validate whether a timestamp is ISO‑8601 compliant.
   */
  static isValid(ts: string): boolean {
    return !isNaN(Date.parse(ts));
  }

  /**
   * Compare two timestamps.
   * Returns:
   *  -1 if a < b
   *   0 if a == b
   *   1 if a > b
   */
  static compare(a: string, b: string): number {
    const ta = Date.parse(a);
    const tb = Date.parse(b);

    if (ta < tb) return -1;
    if (ta > tb) return 1;
    return 0;
  }

  /**
   * Return the difference between two timestamps in milliseconds.
   */
  static diffMs(a: string, b: string): number {
    return Date.parse(b) - Date
