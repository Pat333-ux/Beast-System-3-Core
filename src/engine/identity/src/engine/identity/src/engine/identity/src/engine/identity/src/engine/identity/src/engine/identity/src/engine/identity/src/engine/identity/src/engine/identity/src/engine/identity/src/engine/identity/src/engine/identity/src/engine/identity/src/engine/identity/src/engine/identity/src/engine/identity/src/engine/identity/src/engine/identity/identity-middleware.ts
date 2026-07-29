// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityMiddleware
// Purpose: Runtime middleware for identity validation, wallet verification,
// DID binding, governance enforcement, and event logging.

import { IdentityError } from "./identity-errors";
import { IdentitySubsystem } from "./identity-bootstrap";
import { Did, WalletAddress } from "./identity-manager";

export interface IdentityRequestContext {
  did?: Did;
  wallet?: WalletAddress;
  signature?: string;
  nonce?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export type MiddlewareNext = () => Promise<void>;

export type IdentityMiddlewareFn = (
  ctx: IdentityRequestContext,
  next: MiddlewareNext
) => Promise<void>;

export class IdentityMiddleware {
  private readonly chain: IdentityMiddlewareFn[] = [];

  use(fn: IdentityMiddlewareFn): void {
    this.chain.push(fn);
  }

  async run(ctx: IdentityRequestContext): Promise<void> {
    let index = -1;

    const runner = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new IdentityError(
          "INTEGRITY_VIOLATION",
          "Middleware called multiple times."
        );
      }
      index = i;

      const fn = this.chain[i];
      if (fn) {
        await fn(ctx, () => runner(i + 1));
      }
    };

    await runner(0);
  }
}

/**
 * Built-in middleware factories
 */

export function createWalletVerificationMiddleware(
  subsystem: IdentitySubsystem
): IdentityMiddlewareFn {
  return async (ctx, next) => {
    if (!ctx.wallet || !ctx.signature || !ctx.message || !ctx.nonce) {
      throw new IdentityError(
        "UNAUTHORIZED_ACTION",
        "Wallet verification requires wallet, signature, message, and nonce.",
        { ctx }
      );
    }

    const result = await subsystem.wallet.verifyAll(
      ctx.message,
      ctx.signature,
      ctx.did!,
      ctx.nonce
    );

    subsystem.events.emit(
      subsystem.events.createEvent("wallet.verified", {
        wallet: ctx.wallet,
        did: ctx.did,
        valid: result.valid,
        reason: result.reason,
      })
    );

    if (!result.valid) {
      throw new IdentityError(
        "UNAUTHORIZED_ACTION",
        "Wallet verification failed.",
        { reason: result.reason }
      );
    }

    await next();
  };
}

export function createDidBindingMiddleware(
  subsystem: IdentitySubsystem
): IdentityMiddlewareFn {
  return async (ctx, next) => {
    if (!ctx.did || !ctx.wallet) {
      throw new IdentityError(
        "INVALID_DID_FORMAT",
        "DID binding requires both DID and wallet.",
        { ctx }
      );
    }

    subsystem.validators.validateDidBinding(ctx.did, ctx.wallet);

    await next();
  };
}

export function createGovernanceMetadataMiddleware(
  subsystem: IdentitySubsystem
): IdentityMiddlewareFn {
  return async (ctx, next) => {
    if (!ctx.metadata) {
      throw new IdentityError(
        "MISSING_REQUIRED_METADATA",
        "Governance metadata is required.",
        { ctx }
      );
    }

    subsystem.metadata.validate("governance", ctx.metadata);

    await next();
  };
}

export function createIdentityExistenceMiddleware(
  subsystem: IdentitySubsystem
): IdentityMiddlewareFn {
  return async (ctx, next) => {
    if (!ctx.did) {
      throw new IdentityError("INVALID_DID", "DID is required.", { ctx });
    }

    const identity = subsystem.registry.getByDid(ctx.did);

    if (!identity) {
      throw new IdentityError(
        "IDENTITY_NOT_FOUND",
        "Identity does not exist.",
        { did: ctx.did }
      );
    }

    await next();
  };
}

/**
 * Factory: create a fully wired middleware pipeline
 */
export function createIdentityMiddlewarePipeline(
  subsystem: IdentitySubsystem
): IdentityMiddleware {
  const mw = new IdentityMiddleware();

  mw.use(createIdentityExistenceMiddleware(subsystem));
  mw.use(createDidBindingMiddleware(subsystem));
  mw.use(createWalletVerificationMiddleware(subsystem));
  mw.use(createGovernanceMetadataMiddleware(subsystem));

  return mw;
}
