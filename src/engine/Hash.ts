/**
 * Has.ts (HAS‑S)
 * --------------
 * Safe property existence + type guard utility for Beast System 3.0.
 *
 * Provides:
 *  - has(obj, key)
 *  - hasAll(obj, keys)
 *  - hasAny(obj, keys)
 *  - hasPath(obj, path)
 *  - isDefined(value)
 *
 * All engines use this to avoid null/undefined traps and unsafe property access.
 */

export class Has {
  /**
   * Check if an object has a direct property (not inherited).
   */
  static prop<T extends object>(
    obj: T | null | undefined,
    key: keyof any
  ): boolean {
    if (obj === null || obj === undefined) return false;
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /**
   * Check if an object has ALL of the specified properties.
   */
  static all<T extends object>(
    obj: T | null | undefined,
    keys: (keyof any)[]
  ): boolean {
    if (obj ===
