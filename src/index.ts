// Core Engine exports
export * from './engine/identity-final';
export * from './engine/config-loader';

// Root level module exports
export { GovernanceKernel } from '../SAIA‑GK1';

/**
 * BEAST System 3 Core Runtime Initialization
 */
import { ConfigLoader, SystemConfigManifest } from './engine/config-loader';

export interface BeastCoreOptions {
  rootDir?: string;
}

export class BeastSystemCore {
  public readonly config: SystemConfigManifest;

  constructor(options: BeastCoreOptions = {}) {
    const loader = new ConfigLoader(options.rootDir || process.cwd());
    this.config = loader.loadAll();
  }

  public initialize(): boolean {
    // Perform startup assertions across loaded configurations
    if (!this.config.harmPrevention || !this.config.supportPathways) {
      throw new Error('[BeastSystemCore] Critical initialization failure: Config manifests invalid.');
    }
    return true;
  }
}
