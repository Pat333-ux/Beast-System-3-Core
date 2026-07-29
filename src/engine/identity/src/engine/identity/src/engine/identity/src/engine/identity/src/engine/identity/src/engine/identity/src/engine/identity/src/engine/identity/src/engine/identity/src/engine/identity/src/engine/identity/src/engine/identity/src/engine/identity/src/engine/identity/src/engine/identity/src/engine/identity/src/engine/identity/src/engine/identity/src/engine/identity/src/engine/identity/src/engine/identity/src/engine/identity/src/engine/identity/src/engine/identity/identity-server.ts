// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityServer
// Purpose: Standalone server wrapper for the Identity Layer. Provides
// startup lifecycle, shutdown lifecycle, logging, and subsystem wiring.

import { IdentityHTTPServer, startIdentityHTTPServer } from "./identity-http";
import { IdentitySubsystem, bootstrapIdentitySubsystem } from "./identity-bootstrap";
import { IdentityStorageAdapter, createInMemoryStorage } from "./identity-storage";

export interface IdentityServerConfig {
  port?: number;
  storage?: IdentityStorageAdapter;
  subsystem?: IdentitySubsystem;
  logStartup?: boolean;
  logRequests?: boolean;
  logEvents?: boolean;
}

export class IdentityServer {
  private readonly config: IdentityServerConfig;
  private readonly storage: IdentityStorageAdapter;
  private readonly subsystem: IdentitySubsystem;
  private readonly http: IdentityHTTPServer;

  constructor(config: IdentityServerConfig = {}) {
    this.config = config;

    this.storage = config.storage ?? createInMemoryStorage();
    this.subsystem =
      config.subsystem ??
      bootstrapIdentitySubsystem({
        autoDidGeneration: true,
        autoGovernanceMetadata: true,
        autoWalletNormalization: true,
      });

    this.http = new IdentityHTTPServer({
      port: config.port ?? 8080,
      storage: this.storage,
      subsystem: this.subsystem,
    });

    if (config.logEvents) {
      this.subsystem.events.onAny((event) => {
        console.log("[IdentityEvent]", event.type, event.payload);
      });
    }
  }

  /**
   * Start the server.
   */
  start(): void {
    if (this.config.logStartup !== false) {
      console.log("===============================================");
      console.log("   Beast System 3.0 — Identity Layer Server");
      console.log("   Status: ONLINE");
      console.log("   Port:", this.config.port ?? 8080);
      console.log("   Governance Version: 3.0");
      console.log("   Federal Case:", "2:25-cv-00484-JPH-MJD");
      console.log("===============================================");
    }

    this.http.start();
  }

  /**
   * Stop the server.
   */
  stop(): void {
    console.log("IdentityServer shutting down...");
    // Express does not expose a direct stop method; this is a placeholder
  }

  /**
   * Get subsystem instance.
   */
  getSubsystem(): IdentitySubsystem {
    return this.subsystem;
  }

  /**
   * Get storage adapter.
   */
  getStorage(): IdentityStorageAdapter {
    return this.storage;
  }

  /**
   * Get HTTP server wrapper.
   */
  getHTTP(): IdentityHTTPServer {
    return this.http;
  }
}

/**
 * Factory: create and start a default Identity Server.
 */
export function startIdentityServer(config: IdentityServerConfig = {}): IdentityServer {
  const server = new IdentityServer(config);
  server.start();
  return server;
}
