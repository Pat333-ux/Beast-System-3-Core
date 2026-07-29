// Beast System 3.0 — Sovereign Identity Kernel v3
// Module: IdentityMetadata
// Purpose: Standardized metadata schemas, governance-aligned validation,
// federal-record anchoring, and structured metadata utilities for identities,
// badges, and civic artifacts.

import { IdentityError } from "./identity-errors";

export type MetadataValue = string | number | boolean | Date | Record<string, unknown>;

export interface MetadataSchemaField {
  key: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date" | "object";
  description?: string;
}

export interface MetadataSchema {
  name: string;
  fields: MetadataSchemaField[];
}

export interface MetadataRecord {
  [key: string]: MetadataValue;
}

/**
 * Built-in governance metadata schema
 */
export const GovernanceMetadataSchema: MetadataSchema = {
  name: "governance",
  fields: [
    {
      key: "governanceVersion",
      required: true,
      type: "string",
      description: "Semantic governance version (e.g. '3.0')",
    },
    {
      key: "federalRecordAnchor",
      required: true,
      type: "string",
      description: "Anchor reference to federal filing packet",
    },
    {
      key: "insignia",
      required: true,
      type: "string",
      description: "Ouroboros insignia reference",
    },
    {
      key: "provenance",
      required: true,
      type: "string",
      description: "Provenance chain (e.g. 'New World Order DAO')",
    },
  ],
};

/**
 * Metadata validator
 */
export class MetadataValidator {
  private readonly schemas = new Map<string, MetadataSchema>();

  constructor() {
    this.registerSchema(GovernanceMetadataSchema);
  }

  /**
   * Register a new metadata schema.
   */
  registerSchema(schema: MetadataSchema): void {
    this.schemas.set(schema.name, schema);
  }

  /**
   * Validate metadata against a schema.
   */
  validate(schemaName: string, metadata: MetadataRecord): void {
    const schema = this.schemas.get(schemaName);

    if (!schema) {
      throw new IdentityError(
        "GOVERNANCE_CONSTRAINT_FAILURE",
        `Metadata schema '${schemaName}' is not registered.`,
        { metadata }
      );
    }

    for (const field of schema.fields) {
      const value = metadata[field.key];

      if (field.required && (value === undefined || value === null)) {
        throw new IdentityError(
          "MISSING_REQUIRED_METADATA",
          `Required metadata key '${field.key}' is missing.`,
          { key: field.key }
        );
      }

      if (value !== undefined && field.type) {
        const valid = this.validateType(field.type, value);

        if (!valid) {
          throw new IdentityError(
            "GOVERNANCE_CONSTRAINT_FAILURE",
            `Metadata key '${field.key}' must be of type '${field.type}'.`,
            { key: field.key, value }
          );
        }
      }
    }
  }

  /**
   * Type validation helper.
   */
  private validateType(type: MetadataSchemaField["type"], value: MetadataValue): boolean {
    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "date":
        return value instanceof Date;
      case "object":
        return typeof value === "object" && value !== null;
      default:
        return true;
    }
  }

  /**
   * Apply metadata patch with validation.
   */
  applyPatch(
    schemaName: string,
    existing: MetadataRecord,
    patch: MetadataRecord
  ): MetadataRecord {
    const merged = { ...existing, ...patch };
    this.validate(schemaName, merged);
    return merged;
  }

  /**
   * Create a metadata record from scratch.
   */
  create(schemaName: string, metadata: MetadataRecord): MetadataRecord {
    this.validate(schemaName, metadata);
    return metadata;
  }
}

/**
 * Factory for default metadata validator.
 */
export function createMetadataValidator(): MetadataValidator {
  return new MetadataValidator();
}
