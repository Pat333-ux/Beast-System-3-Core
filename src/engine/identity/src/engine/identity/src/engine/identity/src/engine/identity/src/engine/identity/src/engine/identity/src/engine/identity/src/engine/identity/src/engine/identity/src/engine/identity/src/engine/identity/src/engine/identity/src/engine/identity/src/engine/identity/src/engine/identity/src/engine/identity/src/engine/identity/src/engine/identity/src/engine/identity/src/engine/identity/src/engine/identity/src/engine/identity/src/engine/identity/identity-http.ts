// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityHTTP
// Purpose: HTTP server wrapper for the Identity Layer. Provides a fully
// operational Express server with routing, controllers, and subsystem wiring.

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { IdentitySubsystem, bootstrapIdentitySubsystem } from "./identity-bootstrap";
import { IdentityService } from "./identity-service";
import { createIdentityRouter } from "./identity-router";
import { createInMemoryStorage, IdentityStorageAdapter } from "./identity-storage";

export interface IdentityHTTPConfig {
  port?: number;
  storage?: IdentityStorageAdapter;
  subsystem?: IdentitySubsystem;
  cors?: boolean;
  jsonLimit?: string;
}

export class IdentityHTTPServer {
  private readonly app = express();
  private readonly port: number;
  private readonly subsystem: IdentitySubsystem;
  private readonly storage: IdentityStorageAdapter;

  constructor(config: IdentityHTTPConfig = {}) {
    this.port = config.port ?? 8080;
    this.subsystem = config.subsystem ?? bootstrapIdentitySubsystem({
      autoDidGeneration: true,
      autoGovernanceMetadata: true,
      autoWalletNormalization: true,
    });

    this.storage = config.storage ?? createInMemoryStorage();

    // Middleware
    this.app.use(bodyParser.json({ limit: config.jsonLimit ?? "2mb" }));
    if (config.cors !== false) {
      this.app.use(cors());
    }

    // Identity service + router
    const service = new IdentityService(this.subsystem, this.storage);
    const router = createIdentityRouter(this.subsystem, this.storage);

    this.app.use("/identity", router);

    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({ ok: true, status: "Identity Layer Online" });
    });
  }

  /**
   * Start the HTTP server.
   */
  start(): void {
    this.app.listen(this.port, () => {
      console.log(`IdentityHTTPServer running on port ${this.port}`);
    });
  }

  /**
   * Get underlying Express app (for embedding into larger systems).
   */
  getApp(): express.Application {
    return this.app;
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
}

/**
 * Factory: create and start a default Identity HTTP server.
 */
export function startIdentityHTTPServer(config: IdentityHTTPConfig = {}): IdentityHTTPServer {
  const server = new IdentityHTTPServer(config);
  server.start();
  return server;
}
