/**
 * StorageAdapter (SA‑X)
 * ---------------------
 * Abstract persistence layer for Beast System 3.0.
 *
 * Every subsystem (Identity, Governance, Predictive, Wellbeing, Registry)
 * interacts with storage ONLY through this interface.
 *
 * Concrete implementations may include:
 *  - FileStorageAdapter
 *  - MemoryStorageAdapter
 *  - PostgresStorageAdapter
 *  - MongoStorageAdapter
 *  - RedisStorageAdapter
 *  - IPFSStorageAdapter
 *  - HybridChainStorageAdapter
 */

export interface StorageRecord<T = any> {
  id: string;
  created_at: string;
  updated_at: string;
  data: T;
}

export abstract class StorageAdapter {
  /**
   * Initialize the storage backend.
   */
  abstract init(): Promise<void>;

  /**
   * Write a new record.
   */
  abstract create<T = any>(collection: string, record: StorageRecord<T>): Promise<void>;

  /**
   * Read a record by ID.
   */
  abstract read<T = any>(collection: string, id: string): Promise<StorageRecord<T> | null>;

  /**
   * Update an existing record.
   */
  abstract update<T = any>(
    collection: string,
    id: string,
    partial: Partial<StorageRecord<T>>
  ): Promise<void>;

  /**
   * Delete a record by ID.
   */
  abstract delete(collection: string, id: string): Promise<void>;

  /**
   * Query a collection with a simple filter.
   * Implementations may override with more advanced querying.
   */
  abstract query
