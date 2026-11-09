# Audit Checklist 1: Define Software Standards

**Purpose:** Verify that the organization has defined, documented, approved, communicated, and enforced software standards for its systems.  
**Scope:** Architecture, coding, security, testing, delivery, data, operations, and documentation standards.  
**Audience:** Senior Software Engineer / Engineering Auditor / Architecture Review Board  
**Applicable to:** Any software project or product line (web, mobile, backend, platform, embedded, data).

| Field | Value |
|---|---|
| Project / System | |
| Business Unit / Team | |
| Auditor | |
| Audit Date | |
| Standards Owner | |
| Review Period | |
| Overall Result | ☐ Compliant ☐ Partially Compliant ☐ Non-Compliant |

**Scoring guide**
- **Pass (P):** Requirement is met with clear evidence.
- **Partial (R):** Partially met; gaps exist but intent is present.
- **Fail (F):** Missing, outdated, or not followed.
- **N/A:** Not applicable to this system (justify in Notes).

**Evidence examples:** Standards documents, ADRs, style guides, CI configs, PR templates, security baselines, onboarding packs, exception logs, training records.

---

## A. Governance & Ownership

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| A1 | There is a named owner (role/person) for software standards. | ☐ | ☐ | ☐ | ☐ | |
| A2 | Standards are approved by an authorized body (e.g., Architecture Board, Engineering Lead, CISO where relevant). | ☐ | ☐ | ☐ | ☐ | |
| A3 | Standards have a defined review/update cycle (e.g., quarterly/annually or on major technology change). | ☐ | ☐ | ☐ | ☐ | |
| A4 | Version control and change history exist for standards documents. | ☐ | ☐ | ☐ | ☐ | |
| A5 | There is a documented exception/waiver process with expiry and approver. | ☐ | ☐ | ☐ | ☐ | |
| A6 | Standards applicability is clear by system type (criticality, tech stack, regulated vs non-regulated). | ☐ | ☐ | ☐ | ☐ | |

---

## B. Architecture & Design Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| B1 | Target architecture principles are documented (modularity, loose coupling, API-first, cloud-native, etc.). | ☐ | ☐ | ☐ | ☐ | |
| B2 | Technology stack standards exist (approved languages, frameworks, databases, messaging, cloud services). | ☐ | ☐ | ☐ | ☐ | |
| B3 | Non-approved technologies require formal exception. | ☐ | ☐ | ☐ | ☐ | |
| B4 | Architecture Decision Records (ADRs) or equivalent are required for significant decisions. | ☐ | ☐ | ☐ | ☐ | |
| B5 | Integration standards are defined (API style, versioning, contracts, error formats, auth). | ☐ | ☐ | ☐ | ☐ | |
| B6 | Resilience standards are defined (retries, timeouts, circuit breakers, graceful degradation). | ☐ | ☐ | ☐ | ☐ | |
| B7 | Scalability and performance expectations are stated at design time. | ☐ | ☐ | ☐ | ☐ | |
| B8 | Multi-tenancy / isolation standards exist where applicable. | ☐ | ☐ | ☐ | ☐ | |

---

## C. Coding & Engineering Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| C1 | Language-specific coding standards / style guides are published. | ☐ | ☐ | ☐ | ☐ | |
| C2 | Naming conventions are defined for code, APIs, repos, branches, configs, and environments. | ☐ | ☐ | ☐ | ☐ | |
| C3 | Code review standards are mandatory (who reviews, what to check, merge rules). | ☐ | ☐ | ☐ | ☐ | |
| C4 | Branching / trunk-based / GitFlow (or chosen model) is standardized. | ☐ | ☐ | ☐ | ☐ | |
| C5 | Commit message and PR description standards exist. | ☐ | ☐ | ☐ | ☐ | |
| C6 | Linting/formatting tools are standardized and required in CI. | ☐ | ☐ | ☐ | ☐ | |
| C7 | Dependency management standards exist (lockfiles, approved registries, upgrade policy). | ☐ | ☐ | ☐ | ☐ | |
| C8 | Shared libraries / internal packages have ownership and versioning rules. | ☐ | ☐ | ☐ | ☐ | |
| C9 | Feature flag / dark-launch standards exist where used. | ☐ | ☐ | ☐ | ☐ | |

---

## D. Security & Privacy Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| D1 | Secure coding standards are defined (OWASP or equivalent baseline). | ☐ | ☐ | ☐ | ☐ | |
| D2 | Authentication and authorization patterns are standardized. | ☐ | ☐ | ☐ | ☐ | |
| D3 | Secrets management standards prohibit secrets in code/repos. | ☐ | ☐ | ☐ | ☐ | |
| D4 | Cryptography standards specify approved algorithms and key handling. | ☐ | ☐ | ☐ | ☐ | |
| D5 | Data classification and handling standards exist (PII, confidential, public). | ☐ | ☐ | ☐ | ☐ | |
| D6 | Privacy requirements (consent, retention, minimization, right-to-erasure) are documented where applicable. | ☐ | ☐ | ☐ | ☐ | |
| D7 | Threat modeling is required for high-risk changes/systems. | ☐ | ☐ | ☐ | ☐ | |
| D8 | Vulnerability management SLAs are defined (critical/high/medium). | ☐ | ☐ | ☐ | ☐ | |
| D9 | Third-party / open-source license and security review standards exist. | ☐ | ☐ | ☐ | ☐ | |

---

## E. Testing & Quality Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| E1 | Test strategy standards define unit, integration, E2E, performance, and security testing expectations. | ☐ | ☐ | ☐ | ☐ | |
| E2 | Minimum coverage / quality gates are defined (and justified by risk, not vanity targets alone). | ☐ | ☐ | ☐ | ☐ | |
| E3 | Definition of Done includes quality criteria. | ☐ | ☐ | ☐ | ☐ | |
| E4 | Test data standards prevent use of production PII in lower environments (or require masking). | ☐ | ☐ | ☐ | ☐ | |
| E5 | Non-functional testing standards exist (load, soak, chaos where relevant). | ☐ | ☐ | ☐ | ☐ | |
| E6 | Accessibility standards are defined for user-facing systems (e.g., WCAG target level). | ☐ | ☐ | ☐ | ☐ | |
| E7 | Defect severity / priority taxonomy is standardized. | ☐ | ☐ | ☐ | ☐ | |

---

## F. CI/CD, Release & Environment Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| F1 | Pipeline standards exist (build, test, scan, approve, deploy stages). | ☐ | ☐ | ☐ | ☐ | |
| F2 | Environment standards are defined (dev/test/stage/prod parity expectations). | ☐ | ☐ | ☐ | ☐ | |
| F3 | Deployment strategies are standardized (blue/green, canary, rolling) with rollback rules. | ☐ | ☐ | ☐ | ☐ | |
| F4 | Change management / release approval standards match system criticality. | ☐ | ☐ | ☐ | ☐ | |
| F5 | Infrastructure-as-Code standards exist (tooling, review, state management). | ☐ | ☐ | ☐ | ☐ | |
| F6 | Configuration management standards separate config from code and protect prod config. | ☐ | ☐ | ☐ | ☐ | |
| F7 | Artifact versioning and immutability standards exist. | ☐ | ☐ | ☐ | ☐ | |

---

## G. Observability, Reliability & Operations Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| G1 | Logging standards define levels, structure, correlation IDs, and PII redaction. | ☐ | ☐ | ☐ | ☐ | |
| G2 | Metrics / SLI / SLO standards exist for critical services. | ☐ | ☐ | ☐ | ☐ | |
| G3 | Alerting standards define ownership, severity, and escalation. | ☐ | ☐ | ☐ | ☐ | |
| G4 | Tracing / distributed diagnostics standards exist for service landscapes. | ☐ | ☐ | ☐ | ☐ | |
| G5 | Incident response / postmortem standards exist (blameless, action tracking). | ☐ | ☐ | ☐ | ☐ | |
| G6 | Backup, restore, and DR standards include RPO/RTO targets. | ☐ | ☐ | ☐ | ☐ | |
| G7 | Runbook / on-call documentation standards exist. | ☐ | ☐ | ☐ | ☐ | |

---

## H. Data & Integration Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| H1 | Data modeling / schema change standards exist (migrations, compatibility). | ☐ | ☐ | ☐ | ☐ | |
| H2 | API contract standards and consumer compatibility rules are defined. | ☐ | ☐ | ☐ | ☐ | |
| H3 | Event/message schema standards and versioning rules exist. | ☐ | ☐ | ☐ | ☐ | |
| H4 | Data retention and archival standards are documented. | ☐ | ☐ | ☐ | ☐ | |
| H5 | Master data / reference data ownership is defined where relevant. | ☐ | ☐ | ☐ | ☐ | |

---

## I. Documentation & Knowledge Standards

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| I1 | Required system documentation set is defined (README, architecture overview, runbooks, API docs). | ☐ | ☐ | ☐ | ☐ | |
| I2 | Documentation location and ownership are standardized. | ☐ | ☐ | ☐ | ☐ | |
| I3 | Onboarding materials reference current standards. | ☐ | ☐ | ☐ | ☐ | |
| I4 | Standards are discoverable in a single known portal/repo. | ☐ | ☐ | ☐ | ☐ | |

---

## J. Adoption, Training & Enforcement

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| J1 | Teams are trained on applicable standards; training records exist. | ☐ | ☐ | ☐ | ☐ | |
| J2 | Standards are enforced by tooling (linters, scanners, pipeline gates), not only by policy. | ☐ | ☐ | ☐ | ☐ | |
| J3 | Compliance to standards is checked in design/code reviews. | ☐ | ☐ | ☐ | ☐ | |
| J4 | Periodic audits or scorecards measure standards adoption. | ☐ | ☐ | ☐ | ☐ | |
| J5 | Non-compliance is tracked to remediation with owners and due dates. | ☐ | ☐ | ☐ | ☐ | |
| J6 | Feedback loop exists for teams to propose standards changes. | ☐ | ☐ | ☐ | ☐ | |

---

## Findings Summary

| Severity | Count | IDs |
|---|---|---|
| Critical | | |
| High | | |
| Medium | | |
| Low | | |

### Critical / High findings
1. 
2. 
3. 

### Required actions (remediation plan)

| Action | Owner | Due Date | Status |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

### Auditor conclusion
- Standards maturity level: ☐ Initial ☐ Defined ☐ Managed ☐ Optimized
- Ready for organization-wide use: ☐ Yes ☐ No ☐ Conditionally
- Comments:

**Auditor signature / date:** ______________________  
**Standards owner acknowledgment:** ______________________
