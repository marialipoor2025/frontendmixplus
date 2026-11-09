# Audit Checklist 2: Assess and Measure Software Quality

**Purpose:** Verify that the organization systematically assesses and measures software quality using defined criteria, metrics, tools, and governance.  
**Scope:** Product quality, process quality, code quality, security quality, reliability, maintainability, usability, and delivery quality.  
**Audience:** Senior Software Engineer / QA Lead / Engineering Auditor / Engineering Manager  
**Applicable to:** Any software project or product line (web, mobile, backend, platform, embedded, data).

| Field | Value |
|---|---|
| Project / System | |
| Business Unit / Team | |
| Auditor | |
| Audit Date | |
| Quality Owner | |
| Measurement Window | |
| System Criticality | ☐ Mission-critical ☐ Business-critical ☐ Standard ☐ Experimental |
| Overall Result | ☐ Compliant ☐ Partially Compliant ☐ Non-Compliant |

**Scoring guide**
- **Pass (P):** Practice is established, measured, and evidenced.
- **Partial (R):** Practice exists inconsistently or without reliable measurement.
- **Fail (F):** Not practiced, not measured, or ignored.
- **N/A:** Not applicable (justify in Notes).

**Evidence examples:** Dashboards, CI reports, Sonar/quality gate results, incident records, test reports, SLO reports, customer defect trends, retrospectives, audit samples of PRs/releases.

---

## A. Quality Model & Criteria Definition

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| A1 | A software quality model is defined (e.g., ISO 25010-inspired: functional suitability, reliability, performance, usability, security, maintainability, portability). | ☐ | ☐ | ☐ | ☐ | |
| A2 | Quality attributes are prioritized by system criticality and business risk. | ☐ | ☐ | ☐ | ☐ | |
| A3 | Acceptance criteria / Definition of Done include measurable quality conditions. | ☐ | ☐ | ☐ | ☐ | |
| A4 | Non-functional requirements (NFRs) are documented and testable. | ☐ | ☐ | ☐ | ☐ | |
| A5 | Quality gates for merge/release are documented and approved. | ☐ | ☐ | ☐ | ☐ | |
| A6 | “Good enough” thresholds are explicit (not informal tribal knowledge). | ☐ | ☐ | ☐ | ☐ | |

---

## B. Measurement Framework & Metrics Governance

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| B1 | A metrics catalog exists (metric name, definition, formula, source, owner, target). | ☐ | ☐ | ☐ | ☐ | |
| B2 | Each metric has a clear purpose (decision it supports), not vanity collection. | ☐ | ☐ | ☐ | ☐ | |
| B3 | Baseline and targets are set for key metrics. | ☐ | ☐ | ☐ | ☐ | |
| B4 | Metric ownership and refresh frequency are assigned. | ☐ | ☐ | ☐ | ☐ | |
| B5 | Data quality of metrics is validated (source of truth, no double counting). | ☐ | ☐ | ☐ | ☐ | |
| B6 | Dashboards are accessible to engineering and stakeholders. | ☐ | ☐ | ☐ | ☐ | |
| B7 | Metrics are reviewed periodically and used in planning/retrospectives. | ☐ | ☐ | ☐ | ☐ | |
| B8 | Gaming of metrics is monitored (e.g., coverage inflation without meaningful tests). | ☐ | ☐ | ☐ | ☐ | |

---

## C. Functional Quality Assessment

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| C1 | Requirements / user stories are testable and traced to tests where required. | ☐ | ☐ | ☐ | ☐ | |
| C2 | Functional test coverage of critical journeys is measured. | ☐ | ☐ | ☐ | ☐ | |
| C3 | Defect escape rate to production is measured. | ☐ | ☐ | ☐ | ☐ | |
| C4 | Production incident rate linked to functional defects is tracked. | ☐ | ☐ | ☐ | ☐ | |
| C5 | Regression suite health is measured (pass rate, flakiness, runtime). | ☐ | ☐ | ☐ | ☐ | |
| C6 | UAT / business acceptance evidence exists for releases needing it. | ☐ | ☐ | ☐ | ☐ | |
| C7 | Critical bugs have SLA tracking to resolution. | ☐ | ☐ | ☐ | ☐ | |

**Suggested metrics to verify**
- Escaped defects / release
- % critical journeys automated
- Flaky test rate
- Defect reopen rate
- Requirements-to-test traceability (for regulated systems)

---

## D. Code Quality & Maintainability

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| D1 | Static analysis / linting is mandatory in CI. | ☐ | ☐ | ☐ | ☐ | |
| D2 | Code quality gates exist (complexity, duplication, smells, coverage thresholds). | ☐ | ☐ | ☐ | ☐ | |
| D3 | Technical debt is inventoried, prioritized, and budgeted. | ☐ | ☐ | ☐ | ☐ | |
| D4 | Code review effectiveness is assessed (checklist usage, review latency, blocker rate). | ☐ | ☐ | ☐ | ☐ | |
| D5 | Hotspot files (high churn + high complexity + high defects) are identified. | ☐ | ☐ | ☐ | ☐ | |
| D6 | Dependency freshness / outdated package risk is measured. | ☐ | ☐ | ☐ | ☐ | |
| D7 | Architecture fitness checks exist where relevant (module boundaries, layering). | ☐ | ☐ | ☐ | ☐ | |

**Suggested metrics to verify**
- Maintainability index / cognitive complexity trends
- Duplication %
- PR review turnaround time
- % PRs failing quality gate first time
- Tech debt aging (open items > 90 days)

---

## E. Security Quality Assessment

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| E1 | SAST / dependency scanning / secret scanning results are measured and gated. | ☐ | ☐ | ☐ | ☐ | |
| E2 | Vulnerability backlog is tracked by severity and age. | ☐ | ☐ | ☐ | ☐ | |
| E3 | Penetration test / security assessment findings are remediated against SLA. | ☐ | ☐ | ☐ | ☐ | |
| E4 | Security incidents and near-misses are recorded and analyzed. | ☐ | ☐ | ☐ | ☐ | |
| E5 | Privileged access and sensitive data handling are periodically reviewed. | ☐ | ☐ | ☐ | ☐ | |
| E6 | Secure SDLC checkpoints are evidenced (threat model, security review for high-risk changes). | ☐ | ☐ | ☐ | ☐ | |

**Suggested metrics to verify**
- Open critical/high vulns count and mean age
- Time to remediate by severity
- Secrets detected in repos (trend)
- % builds blocked by security gate

---

## F. Reliability, Performance & Operability

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| F1 | SLIs/SLOs/error budgets are defined for critical services. | ☐ | ☐ | ☐ | ☐ | |
| F2 | Availability / uptime is measured against target. | ☐ | ☐ | ☐ | ☐ | |
| F3 | Latency / throughput / saturation metrics are monitored for key transactions. | ☐ | ☐ | ☐ | ☐ | |
| F4 | Performance tests are run for material changes or on a schedule. | ☐ | ☐ | ☐ | ☐ | |
| F5 | MTTD / MTTR (detect / restore) are measured for incidents. | ☐ | ☐ | ☐ | ☐ | |
| F6 | Change failure rate and rollback rate are measured. | ☐ | ☐ | ☐ | ☐ | |
| F7 | Capacity and saturation risks are reviewed before peak periods. | ☐ | ☐ | ☐ | ☐ | |
| F8 | Backup restore tests are performed and evidenced. | ☐ | ☐ | ☐ | ☐ | |

**Suggested metrics to verify (DORA + SRE)**
- Deployment frequency
- Lead time for changes
- Change failure rate
- Mean time to restore
- SLO attainment % / error budget burn

---

## G. Usability, Accessibility & Customer Quality Signals

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| G1 | UX / usability defects are tracked separately from pure functional bugs where useful. | ☐ | ☐ | ☐ | ☐ | |
| G2 | Accessibility conformance is assessed against the chosen standard (e.g., WCAG). | ☐ | ☐ | ☐ | ☐ | |
| G3 | Customer-reported defect trends are reviewed. | ☐ | ☐ | ☐ | ☐ | |
| G4 | Support ticket themes related to product quality are fed back to engineering. | ☐ | ☐ | ☐ | ☐ | |
| G5 | Release notes / known issues communication quality is reviewed for high-impact releases. | ☐ | ☐ | ☐ | ☐ | |

**Suggested metrics to verify**
- CSAT / NPS linked to release windows (if available)
- Accessibility issue open count by severity
- Top recurring support categories
- Time to acknowledge / fix customer-blocking defects

---

## H. Process Quality (How Work Is Done)

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| H1 | Work intake quality is assessed (clear problem, acceptance criteria, risk notes). | ☐ | ☐ | ☐ | ☐ | |
| H2 | Estimation / planning quality is reviewed via predictability metrics (where used). | ☐ | ☐ | ☐ | ☐ | |
| H3 | Test planning occurs before or with implementation for significant work. | ☐ | ☐ | ☐ | ☐ | |
| H4 | Release readiness checklist is used and retained. | ☐ | ☐ | ☐ | ☐ | |
| H5 | Post-release verification / monitoring window is defined and executed. | ☐ | ☐ | ☐ | ☐ | |
| H6 | Retrospectives convert quality issues into actionable improvements. | ☐ | ☐ | ☐ | ☐ | |
| H7 | Supplier / vendor / outsourced component quality is assessed when used. | ☐ | ☐ | ☐ | ☐ | |

---

## I. Tooling, Automation & Data Integrity of Assessment

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| I1 | Quality tooling chain is standardized (test runners, scanners, observability, dashboards). | ☐ | ☐ | ☐ | ☐ | |
| I2 | Quality signals are automated in CI/CD where practical. | ☐ | ☐ | ☐ | ☐ | |
| I3 | Manual-only quality checks are documented and scheduled. | ☐ | ☐ | ☐ | ☐ | |
| I4 | Tool configurations are versioned and reviewed. | ☐ | ☐ | ☐ | ☐ | |
| I5 | False positives / noisy alerts are managed so teams trust the signals. | ☐ | ☐ | ☐ | ☐ | |
| I6 | Historical quality data is retained for trend analysis. | ☐ | ☐ | ☐ | ☐ | |

---

## J. Reporting, Decision-Making & Continuous Improvement

| ID | Checkpoint | P | R | F | N/A | Evidence / Notes |
|---|---|---|---|---|---|---|
| J1 | Regular quality reports exist for leadership and teams (weekly/sprint/monthly). | ☐ | ☐ | ☐ | ☐ | |
| J2 | Quality risks are escalated with severity, impact, and recommended actions. | ☐ | ☐ | ☐ | ☐ | |
| J3 | Releases can be blocked or rolled back based on quality evidence. | ☐ | ☐ | ☐ | ☐ | |
| J4 | Improvement actions from quality reviews have owners and due dates. | ☐ | ☐ | ☐ | ☐ | |
| J5 | Trend improvement is demonstrated over time for priority metrics. | ☐ | ☐ | ☐ | ☐ | |
| J6 | Audit findings from prior quality assessments are closed or tracked. | ☐ | ☐ | ☐ | ☐ | |

---

## Sample Scorecard (fill during audit)

| Quality Area | Target | Current | Trend | Status |
|---|---|---|---|---|
| Escaped critical defects | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| Automated critical-path coverage | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| Change failure rate | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| MTTR | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| SLO attainment | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| Open high/critical vulns | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| Flaky test rate | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |
| Tech debt aging | | | ↑ / → / ↓ | ☐ OK ☐ Watch ☐ Fail |

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
- Quality measurement maturity: ☐ Ad hoc ☐ Emerging ☐ Defined ☐ Quantitatively managed ☐ Optimizing
- Decision-ready quality visibility: ☐ Yes ☐ No ☐ Partial
- Comments:

**Auditor signature / date:** ______________________  
**Quality owner acknowledgment:** ______________________
