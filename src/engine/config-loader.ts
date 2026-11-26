import * as fs from 'fs';
import * as path from 'path';

export interface HarmPreventionConfig {
  version: string;
  rules: Array<{ id: string; category: string; strict: boolean }>;
  [key: string]: unknown;
}

export interface SupportPathwaysConfig {
  version: string;
  pathways: Array<{ id: string; target: string }>;
  [key: string]: unknown;
}

export interface LucricityConfig {
  version: string;
  tokenomics?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SystemConfigManifest {
  harmPrevention: HarmPreventionConfig;
  supportPathways: SupportPathwaysConfig;
  lucricity: LucricityConfig;
}

export class ConfigLoader {
  private readonly rootPath: string;

  constructor(baseDir: string = process.cwd()) {
    this.rootPath = baseDir;
  }

  private loadJsonFile<T>(filename: string): T {
    const filePath = path.join(this.rootPath, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[ConfigLoader] Target configuration file missing: ${filename}`);
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as T;
  }

  public loadAll(): SystemConfigManifest {
    const harmPrevention = this.loadJsonFile<HarmPreventionConfig>('harm-prevention.json');
    const supportPathways = this.loadJsonFile<SupportPathwaysConfig>('support-pathways.json');
    const lucricity = this.loadJsonFile<LucricityConfig>('lucricity.json');

    return {
      harmPrevention,
      supportPathways,
      lucricity,
    };
  }
}
