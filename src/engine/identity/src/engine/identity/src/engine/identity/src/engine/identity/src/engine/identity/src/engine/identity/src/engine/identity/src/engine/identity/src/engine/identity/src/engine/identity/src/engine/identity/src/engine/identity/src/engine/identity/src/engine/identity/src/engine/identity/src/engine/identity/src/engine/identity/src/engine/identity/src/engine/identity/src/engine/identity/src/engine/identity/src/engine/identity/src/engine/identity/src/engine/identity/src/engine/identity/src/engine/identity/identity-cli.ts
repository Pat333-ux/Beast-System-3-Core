// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityCLI
// Purpose: Command-line interface for identity operations, badge issuance,
// artifact anchoring, wallet verification, and diagnostics.

import { Command } from "commander";
import chalk from "chalk";

import { startIdentityApp } from "./identity-app";
import { IdentityService } from "./identity-service";
import { IdentitySubsystem } from "./identity-bootstrap";
import { IdentityStorageAdapter } from "./identity-storage";

export class IdentityCLI {
  private readonly program = new Command();
  private readonly subsystem: IdentitySubsystem;
  private readonly storage: IdentityStorageAdapter;
  private readonly service: IdentityService;

  constructor() {
    const app = startIdentityApp({ logStartup: false });
    this.subsystem = app.getSubsystem();
    this.storage = app.getStorage();
    this.service = new IdentityService(this.subsystem, this.storage);

    this.configure();
  }

  /**
   * Configure CLI commands.
   */
  private configure(): void {
    this.program
      .name("identity-cli")
      .description("Beast System 3.0 — Identity Layer CLI")
      .version("3.0");

    // ------------------------------------------------------------
    // Create Identity
    // ------------------------------------------------------------
    this.program
      .command("create-identity")
      .description("Create a new governed identity")
      .argument("<wallet>", "Wallet address")
      .action(async (wallet) => {
        const identity = await this.service.createIdentity(wallet);
        console.log(chalk.green("Identity created:"));
        console.log(identity);
      });

    // ------------------------------------------------------------
    // Get Identity
    // ------------------------------------------------------------
    this.program
      .command("get-identity")
      .description("Retrieve an identity by DID")
      .argument("<did>", "DID")
      .action(async (did) => {
        const identity = await this.service.getIdentity(did);
        console.log(chalk.blue("Identity:"));
        console.log(identity);
      });

    // ------------------------------------------------------------
    // Issue Badge
    // ------------------------------------------------------------
    this.program
      .command("issue-badge")
      .description("Issue a badge to an identity")
      .argument("<did>", "DID")
      .argument("<code>", "Badge code")
      .action(async (did, code) => {
        const badge = await this.service.issueBadge(did, code);
        console.log(chalk.green("Badge issued:"));
        console.log(badge);
      });

    // ------------------------------------------------------------
    // List Identities
    // ------------------------------------------------------------
    this.program
      .command("list-identities")
      .description("List all identities")
      .action(async () => {
        const identities = await this.service.listIdentities();
        console.log(chalk.yellow("Identities:"));
        console.log(identities);
      });

    // ------------------------------------------------------------
    // List Events
    // ------------------------------------------------------------
    this.program
      .command("list-events")
      .description("List all identity events")
      .action(async () => {
        const events = await this.service.listEvents();
        console.log(chalk.magenta("Events:"));
        console.log(events);
      });

    // ------------------------------------------------------------
    // List Artifacts
    // ------------------------------------------------------------
    this.program
      .command("list-artifacts")
      .description("List all civic artifacts")
      .action(async () => {
        const artifacts = await this.service.listArtifacts();
        console.log(chalk.cyan("Artifacts:"));
        console.log(artifacts);
      });
  }

  /**
   * Run the CLI.
   */
  run(argv: string[]): void {
    this.program.parse(argv);
  }
}

/**
 * Factory: run the Identity CLI directly.
 */
export function runIdentityCLI(argv: string[] = process.argv): void {
  const cli = new IdentityCLI();
  cli.run(argv);
}
