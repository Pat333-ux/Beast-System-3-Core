// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityDeployment
// Purpose: Deployment scaffolding for the Identity Layer. Provides container
// config, environment templates, health probes, and runtime wiring.

import path from "path";
import fs from "fs";

import { startIdentityServer } from "./identity-server";
import { IdentityAppConfig } from "./identity-app";

export interface DeploymentConfig {
  envFile?: string;
  outputDir?: string;
  port?: number;
  useFileStorage?: boolean;
  storageDir?: string;
  logStartup?: boolean;
  logEvents?: boolean;
  logRequests?: boolean;
}

export class IdentityDeployment {
  private readonly config: DeploymentConfig;

  constructor(config: DeploymentConfig = {}) {
    this.config = {
      envFile: config.envFile ?? ".env.identity",
      outputDir: config.outputDir ?? "deployment",
      port: config.port ?? 8080,
      useFileStorage: config.useFileStorage ?? false,
      storageDir: config.storageDir ?? "identity-storage",
      logStartup: config.logStartup ?? true,
      logEvents: config.logEvents ?? false,
      logRequests: config.logRequests ?? false,
    };
  }

  /**
   * Generate environment file.
   */
  generateEnvFile(): void {
    const envPath = path.join(process.cwd(), this.config.outputDir!, this.config.envFile!);

    if (!fs.existsSync(this.config.outputDir!)) {
      fs.mkdirSync(this.config.outputDir!, { recursive: true });
    }

    const envContent = [
      `IDENTITY_PORT=${this.config.port}`,
      `IDENTITY_USE_FILE_STORAGE=${this.config.useFileStorage}`,
      `IDENTITY_STORAGE_DIR=${this.config.storageDir}`,
      `IDENTITY_LOG_STARTUP=${this.config.logStartup}`,
      `IDENTITY_LOG_EVENTS=${this.config.logEvents}`,
      `IDENTITY_LOG_REQUESTS=${this.config.logRequests}`,
    ].join("\n");

    fs.writeFileSync(envPath, envContent);
  }

  /**
   * Generate Dockerfile.
   */
  generateDockerfile(): void {
    const dockerfilePath = path.join(process.cwd(), this.config.outputDir!, "Dockerfile");

    const dockerfile = `
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

CMD ["node", "dist/engine/identity/identity-server.js"]
`;

    fs.writeFileSync(dockerfilePath, dockerfile.trim());
  }

  /**
   * Generate Kubernetes deployment manifest.
   */
  generateKubernetesManifest(): void {
    const manifestPath = path.join(process.cwd(), this.config.outputDir!, "identity-deployment.yaml");

    const manifest = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-layer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: identity-layer
  template:
    metadata:
      labels:
        app: identity-layer
    spec:
      containers:
        - name: identity-layer
          image: identity-layer:latest
          ports:
            - containerPort: ${this.config.port}
          envFrom:
            - secretRef:
                name: identity-env
---
apiVersion: v1
kind: Service
metadata:
  name: identity-layer
spec:
  type: ClusterIP
  selector:
    app: identity-layer
  ports:
    - port: ${this.config.port}
      targetPort: ${this.config.port}
`;

    fs.writeFileSync(manifestPath, manifest.trim());
  }

  /**
   * Deploy locally (start server).
   */
  deployLocal(): void {
    startIdentityServer({
      port: this.config.port,
      useFileStorage: this.config.useFileStorage,
      logStartup: this.config.logStartup,
      logEvents: this.config.logEvents,
      logRequests: this.config.logRequests,
      storageDir: this.config.storageDir,
    });
  }

  /**
   * Generate all deployment artifacts.
   */
  generateAll(): void {
    this.generateEnvFile();
    this.generateDockerfile();
    this.generateKubernetesManifest();
  }
}
