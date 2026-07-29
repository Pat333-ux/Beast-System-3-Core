// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityApp
// Purpose: Top-level application wrapper for the Identity Layer.
// Provides configuration loading, subsystem bootstrap, server startup,
// diagnostics, and lifecycle management.

import path from "path";
import fs from "fs";

import { IdentityServer, startIdentityServer } from "./identity-server";
import { IdentitySubsystem, bootstrapIdentitySubsystem } from "./identity-bootstrap";
import { IdentityStorageAdapter, createFileStorage, createInMemoryStorage } from "./identity-storage";

export interface IdentityAppConfig {
  port?: number;
  storageDir?: string;
  useFileStorage?: boolean;
  logStartup?: boolean;
  logEvents?: boolean;
  logRequests?: boolean;
  env?: Record<string, string>;
}

export class IdentityApp {
  private readonly config: IdentityAppConfig;
  private readonly subsystem: IdentitySubsystem;
  private readonly storage: IdentityStorageAdapter;
  private readonly server: IdentityServer;

  constructor(config: IdentityAppConfig = {}) {
    this.config = this.loadConfig(config);

    this.subsystem = bootstrapIdentitySubsystem({
      autoDidGeneration: true,
      autoGovernanceMetadata: true,
      autoWalletNormalization: true,
    });

    this.storage = this.config.useFileStorage
      ? createFileStorage(this.config.storageDir!)
      : createInMemoryStorage();

    this.server = new IdentityServer({
      port: this.config.port,
      storage: this.storage,
      subsystem: this.subsystem,
      logStartup: this.config.logStartup,
      logEvents: this.config.logEvents,
      logRequests: this.config.logRequests,
    });
  }

  /**
   * Load configuration from:
   * - Provided config object
   * - Environment variables
   * - identity.config.json (optional)
   */
  private loadConfig(config: IdentityAppConfig): IdentityAppConfig {
    const envConfig = this.loadEnvConfig();
    const fileConfig = this.loadFileConfig();

    return {
      port: config.port ?? envConfig.port ?? fileConfig.port ?? 8080,
      storageDir:
        config.storageDir ??
        envConfig.storageDir ??
        fileConfig.storageDir ??
        path.join(process.cwd(), "identity-storage"),
      useFileStorage:
        config.useFileStorage ??
        envConfig.useFileStorage ??
        fileConfig.useFileStorage ??
        false,
      logStartup:
        config.logStartup ??
        envConfig.logStartup ??
        fileConfig.logStartup ??
        true,
      logEvents:
        config.logEvents ??
        envConfig.logEvents ??
        fileConfig.logEvents ??
        false,
      logRequests:
        config.logRequests ??
        envConfig.logRequests ??
        fileConfig.logRequests ??
        false,
      env: {
        ...fileConfig.env,
        ...envConfig.env,
        ...config.env,
      },
    };
  }

  /**
   * Load config from environment variables.
   */
  private loadEnvConfig(): IdentityAppConfig {
    return {
      port: process.env.IDENTITY_PORT
        ? parseInt(process.env.IDENTITY_PORT, 10)
        : undefined,
      storageDir: process.env.IDENTITY_STORAGE_DIR,
      useFileStorage: process.env.IDENTITY_USE_FILE_STORAGE === "true",
      logStartup: process.env.IDENTITY_LOG_STARTUP === "true",
      logEvents: process.env.IDENTITY_LOG_EVENTS === "true",
      logRequests: process.env.IDENTITY_LOG_REQUESTS === "true",
      env: process.env as Record<string, string>,
    };
  }

  /**
   * Load config from identity.config.json if present.
   */
  private loadFileConfig(): IdentityAppConfig {
    const file = path.join(process.cwd(), "identity.config.json");

    if (!fs.existsSync(file)) return {};

    try {
      const json = JSON.parse(fs.readFileSync(file, "utf8"));
      return json;
    } catch {
      console.warn("Failed to parse identity.config.json");
      return {};
    }
  }

  /**
   * Start the full Identity Layer application.
   */
  start(): void {
    this.server.start();
  }

  /**
   * Stop the application.
   */
  stop(): void {
    this.server.stop();
  }

  /**
   * Access subsystem.
   */
  getSubsystem(): IdentitySubsystem {
    return this.subsystem;
  }

  /**
   * Access storage.
   */
  getStorage(): IdentityStorageAdapter {
    return this.storage;
  }

  /**
   * Access server.
   */
  getServer(): IdentityServer {
    return this.server;
  }
}

/**
 * Factory: start a default Identity App.
 */
export function startIdentityApp(config: IdentityAppConfig = {}): IdentityApp {
  const app = new IdentityApp(config);
  app.start();
  return app;
}
