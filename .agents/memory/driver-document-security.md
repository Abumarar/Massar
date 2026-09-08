---
name: Driver document security
description: Security boundary for Massar driver onboarding and operations review.
---

Driver compliance should remain a configurable, source-labeled review workflow rather than an automatic claim of legal approval. Driver identity, licence, vehicle, insurance, inspection, permit, and passenger-cover records are sensitive and must be stored privately with authenticated access before the product is used for real onboarding.

**Why:** The MVP needs a usable driver application and operations review surface now, but local device URIs or public files are not durable or safe for identity documents.

**How to apply:** Before production onboarding, add private object storage, store only object keys and review metadata in PostgreSQL, authenticate driver and operations roles, and enforce per-document access checks on upload, preview, and review endpoints.