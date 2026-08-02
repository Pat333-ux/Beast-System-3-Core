# Beast System 3.0 — Organizational Layer

This directory contains the initial Organizational Layer artifacts for Beast System 3.0. It is intended to be the source of truth for org structure, roles, workflows, and tokenomics policy. These artifacts are JSON-first and designed to be consumed by the governance, identity, tokenomics, and oracle modules.

Structure:
- org_structure.json — top-level org map and module references
- roles.json — wallet-bound role definitions
- manifest.json — index of artifacts and versions
- workflows/governance_document_approval.json — example executable workflow
- governance/dao_charter.json — example governance document metadata
- tokenomics/lucr_policy.json — LUCR policy object

Next steps: link these artifacts into your beast-governance / beast-identity modules and wire CI to validate JSON schemas.