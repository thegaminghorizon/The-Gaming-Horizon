<!--
===============================================================================
                              GAMING HORIZON
                         BEYOND THE HORIZON
===============================================================================

                        GITHUB WORKFLOW SYSTEM
                      .github/workflows/README.md

                       WORKFLOW SYSTEM v1.0.0

===============================================================================

DOCUMENT LOCATION
-----------------
.github/workflows/README.md

PURPOSE
-------
Documents the GitHub Actions automation architecture used by
The Gaming Horizon repository.

CURRENT WORKFLOWS
-----------------
ci.yml

RELATIVE PATH RULE
------------------

Official logo:
../../assets/branding/logos/gaming-horizon-logo-source.png

GitHub System:
../GITHUB-SYSTEM.md

Root README:
../../README.md

Contributing:
../../CONTRIBUTING.md

Security:
../../SECURITY.md

License:
../../LICENSE

===============================================================================
-->

<div align="center">

<br>

<img
src="../../assets/branding/logos/gaming-horizon-logo-source.png"
width="500"
alt="The Gaming Horizon Official Logo"
/>

<br><br>

<h1>The Gaming Horizon Workflow System</h1>

<p>
  <strong>
    GitHub Actions automation for validation, quality control,
    continuous integration, repository reliability, and future development.
  </strong>
</p>

<p>
  A maintainable automation layer designed to validate changes before
  they become part of The Gaming Horizon.
</p>

<br>

<!-- ========================================================= -->

<!--                       SYSTEM STATUS                       -->

<!-- ========================================================= -->

<a href="#status">
  <img
    src="https://img.shields.io/badge/STATUS-ACTIVE_DEVELOPMENT-7C3AED?style=flat-square"
    alt="Active Development"
  />
</a>
<a href="#version">
  <img
    src="https://img.shields.io/badge/VERSION-1.0.0-6366F1?style=flat-square"
    alt="Version 1.0.0"
  />
</a>
<a href="#workflow-system">
  <img
    src="https://img.shields.io/badge/WORKFLOW_SYSTEM-ACTIVE-2563EB?style=flat-square"
    alt="Workflow System Active"
  />
</a>
<a href="#continuous-integration">
  <img
    src="https://img.shields.io/badge/CI-AUTOMATED-0EA5E9?style=flat-square"
    alt="Continuous Integration"
  />
</a>
<a href="#security">
  <img
    src="https://img.shields.io/badge/SECURITY-MINIMUM_PERMISSIONS-0891B2?style=flat-square"
    alt="Minimum Permissions"
  />
</a>

<br><br>

<!-- ========================================================= -->

<!--                     WORKFLOW OPERATIONS                   -->

<!-- ========================================================= -->

<a href="#triggers">
  <img
    src="https://img.shields.io/badge/TRIGGERS-PUSH_%7C_PR_%7C_MANUAL-8B5CF6?style=flat-square"
    alt="Workflow Triggers"
  />
</a>
<a href="#dependency-installation">
  <img
    src="https://img.shields.io/badge/DEPENDENCIES-NPM_CI-7C3AED?style=flat-square"
    alt="npm ci"
  />
</a>
<a href="#linting">
  <img
    src="https://img.shields.io/badge/LINT-VALIDATION-6366F1?style=flat-square"
    alt="Lint Validation"
  />
</a>
<a href="#type-checking">
  <img
    src="https://img.shields.io/badge/TYPES-TYPE_CHECK-4F46E5?style=flat-square"
    alt="Type Checking"
  />
</a>
<a href="#testing">
  <img
    src="https://img.shields.io/badge/TESTS-AUTOMATED-3B82F6?style=flat-square"
    alt="Automated Tests"
  />
</a>
<a href="#production-build">
  <img
    src="https://img.shields.io/badge/BUILD-PRODUCTION-2563EB?style=flat-square"
    alt="Production Build"
  />
</a>

<br><br>

<!-- ========================================================= -->

<!--                     WORKFLOW QUALITY                      -->

<!-- ========================================================= -->

<a href="#permissions">
  <img
    src="https://img.shields.io/badge/PERMISSIONS-READ_ONLY-7C3AED?style=flat-square"
    alt="Read Only Permissions"
  />
</a>
<a href="#concurrency">
  <img
    src="https://img.shields.io/badge/CONCURRENCY-CONTROLLED-2563EB?style=flat-square"
    alt="Concurrency Controlled"
  />
</a>
<a href="#observability">
  <img
    src="https://img.shields.io/badge/SUMMARIES-AUTOMATED-0EA5E9?style=flat-square"
    alt="Automated Summaries"
  />
</a>
<a href="#maintenance">
  <img
    src="https://img.shields.io/badge/MAINTENANCE-DEFINED-14B8A6?style=flat-square"
    alt="Maintenance Defined"
  />
</a>
<a href="#governance">
  <img
    src="https://img.shields.io/badge/GOVERNANCE-REVIEWED-A855F7?style=flat-square"
    alt="Workflow Governance"
  />
</a>

<br><br>

<!-- ========================================================= -->

<!--                       QUICK LINKS                         -->

<!-- ========================================================= -->

<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/actions">
  <img
    src="https://img.shields.io/badge/GITHUB_ACTIONS-VIEW_RUNS-2088FF?style=flat-square&logo=githubactions&logoColor=white"
    alt="View GitHub Actions"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon">
  <img
    src="https://img.shields.io/badge/GITHUB-REPOSITORY-181717?style=flat-square&logo=github&logoColor=white"
    alt="Gaming Horizon Repository"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues">
  <img
    src="https://img.shields.io/badge/ISSUES-REPORT-EC4899?style=flat-square&logo=github&logoColor=white"
    alt="Report an Issue"
  />
</a>
<a href="https://thegaminghorizon.netlify.app/">
  <img
    src="https://img.shields.io/badge/WEBSITE-ENTER_THE_HORIZON-7C3AED?style=flat-square&logo=googlechrome&logoColor=white"
    alt="Gaming Horizon Website"
  />
</a>

<br><br>

<code>VALIDATE</code>
  •   <code>TEST</code>
  •   <code>BUILD</code>
  •   <code>REVIEW</code>
  •   <code>IMPROVE</code>

<br><br>

</div>

---

<a id="overview"></a>

## ✦ Overview

The `.github/workflows/` directory contains automated GitHub Actions workflows
for The Gaming Horizon repository.

These workflows exist to provide repeatable validation around repository
changes.

The goal is not automation for its own sake.

The goal is to answer important development questions automatically:

```text
CAN THE PROJECT INSTALL?
        │
        ▼
IS THE CODE VALID?
        │
        ▼
DO QUALITY CHECKS PASS?
        │
        ▼
CAN THE PROJECT BUILD?
        │
        ▼
IS THE CHANGE READY FOR REVIEW?
```

The workflow system should help detect problems before they reach the main
development branch.

---

<a id="status"></a>

## ✦ Status

Current workflow-system status:

```text
ACTIVE DEVELOPMENT
```

Current automation coverage:

| Area                         | Status                       |
| ---------------------------- | ---------------------------- |
| Continuous Integration       | Active                       |
| Dependency installation      | Active                       |
| Package-file validation      | Active                       |
| Lint execution               | Supported                    |
| Type checking                | Supported when script exists |
| Automated tests              | Supported when script exists |
| Production build             | Active                       |
| Runtime diagnostics          | Active                       |
| GitHub run summaries         | Active                       |
| Concurrency control          | Active                       |
| Minimum workflow permissions | Active                       |
| Deployment automation        | Not defined here             |
| Release automation           | Future if required           |

---

<a id="version"></a>

## ✦ Version

Current workflow-system version:

```text
1.0.0
```

Version structure:

```text
MAJOR.MINOR.PATCH
```

### Major

Used for substantial workflow architecture changes.

```text
1.0.0 → 2.0.0
```

Examples:

```text
MULTI-STAGE CI ARCHITECTURE
NEW BUILD MATRIX
COMPLETE AUTOMATION REDESIGN
MAJOR RELEASE PIPELINE
MAJOR SECURITY MODEL CHANGE
```

### Minor

Used when meaningful workflow functionality is added.

```text
1.0.0 → 1.1.0
```

Examples:

```text
NEW TEST WORKFLOW
NEW ACCESSIBILITY CHECK
NEW SECURITY SCAN
NEW RELEASE VALIDATION
NEW DEPLOYMENT CHECK
```

### Patch

Used for smaller workflow improvements.

```text
1.0.0 → 1.0.1
```

Examples:

```text
ACTION VERSION UPDATE
COMMENT IMPROVEMENT
CACHE FIX
TIMEOUT CHANGE
README CORRECTION
```

---

<a id="workflow-system"></a>

## ✦ Workflow System

Current relationship:

```text
.github/
│
├── GITHUB-SYSTEM.md
│
└── workflows/
    ├── README.md
    │   │
    │   └── ../GITHUB-SYSTEM.md
    └── ci.yml
```

Current workflow register:

| Workflow | Purpose                               | Status |
| -------- | ------------------------------------- | ------ |
| `ci.yml` | Validate and build repository changes | Active |

Future workflows should be added only when they solve a real repository need.

---

## ✦ Automation Architecture

```text
                    THE GAMING HORIZON
                            │
                            ▼
                       REPOSITORY
                            │
                            ▼
                         CHANGE
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
               PUSH               PULL REQUEST
                 │                     │
                 └──────────┬──────────┘
                            ▼
                     GITHUB ACTIONS
                            │
                            ▼
                      CI WORKFLOW
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
       VALIDATION        QUALITY           BUILD
           │                │                │
           └────────────────┼────────────────┘
                            ▼
                         RESULT
                            │
                     ┌──────┴──────┐
                     ▼             ▼
                   PASS           FAIL
                     │             │
                     ▼             ▼
                  REVIEW       INVESTIGATE
```

---

<a id="continuous-integration"></a>

## ✦ Continuous Integration

Primary workflow:

```text
ci.yml
```

The Continuous Integration workflow validates repository changes before they
are treated as ready.

Current pipeline:

```text
PUSH / PULL REQUEST / MANUAL
              │
              ▼
           CHECKOUT
              │
              ▼
        SETUP NODE.JS
              │
              ▼
       VALIDATE PACKAGE
              │
              ▼
           npm ci
              │
              ▼
            LINT
              │
              ▼
         TYPE CHECK
              │
              ▼
            TEST
              │
              ▼
       PRODUCTION BUILD
              │
              ▼
           SUMMARY
```

---

## ✦ CI Responsibility

The CI workflow is intended to detect:

```text
INSTALLATION FAILURES
INVALID PACKAGE STATE
LINT FAILURES
TYPE ERRORS WHEN CHECKING IS CONFIGURED
TEST FAILURES WHEN TESTS ARE CONFIGURED
PRODUCTION BUILD FAILURES
```

It should not silently replace human review.

Automation and review serve different purposes.

```text
AUTOMATION
    +
HUMAN REVIEW
    +
PROJECT STANDARDS
    =
STRONGER CHANGE CONTROL
```

---

<a id="triggers"></a>

## ✦ Workflow Triggers

Current CI triggers:

```yaml
push:
  branches:
    - main

pull_request:
  branches:
    - main

workflow_dispatch:
```

This means CI can run for:

```text
PUSH TO MAIN
PULL REQUEST TARGETING MAIN
MANUAL WORKFLOW RUN
```

---

## ✦ Trigger Flow

```text
                       CODE CHANGE
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
          PUSH MAIN     PULL REQUEST     MANUAL
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                         CI START
```

---

## ✦ Why Pull Request CI Matters

A pull request proposes a change before it becomes part of the primary branch.

CI provides automated evidence about whether the proposed repository state can
successfully complete expected validation.

```text
PROPOSE CHANGE
      │
      ▼
RUN CI
      │
 ┌────┴────┐
 ▼         ▼
PASS      FAIL
 │         │
 ▼         ▼
REVIEW    FIX
```

---

<a id="permissions"></a>

## ✦ Permissions

Current workflow permission model:

```yaml
permissions:
  contents: read
```

This follows a minimum-permission principle.

The CI workflow should only receive the repository access necessary to perform
its job.

---

## ✦ Permission Model

```text
WORKFLOW
   │
   ▼
NEEDS ACCESS
   │
   ▼
MINIMUM REQUIRED
   │
   ▼
CONTENTS: READ
```

Avoid granting:

```text
CONTENTS WRITE
ISSUES WRITE
PULL REQUESTS WRITE
PACKAGES WRITE
DEPLOYMENTS WRITE
```

unless a workflow genuinely requires that capability.

---

## ✦ Least Privilege

The preferred rule is:

> **Give automation only the permissions required to complete its defined task.**

This reduces the impact of:

```text
MISCONFIGURATION
COMPROMISED DEPENDENCIES
UNSAFE THIRD-PARTY ACTIONS
ACCIDENTAL AUTOMATION
WORKFLOW ERRORS
```

---

<a id="concurrency"></a>

## ✦ Concurrency

The CI workflow uses concurrency control.

Concept:

```text
COMMIT A
   │
   ▼
CI RUN A
   │
   │        COMMIT B
   │           │
   │           ▼
   │        CI RUN B
   │
   └──────► CANCEL OLD RUN
                │
                ▼
          VALIDATE LATEST
```

When several updates arrive quickly, older runs for the same branch or pull
request can be cancelled.

This reduces unnecessary CI consumption and focuses validation on the latest
state.

---

## ✦ Current Concurrency Pattern

```yaml
concurrency:
  group: "gaming-horizon-ci-${{ github.workflow }}-${{ github.ref }}"
  cancel-in-progress: true
```

---

## ✦ Environment

The workflow defines:

```yaml
NEXT_TELEMETRY_DISABLED: "1"
CI: "true"
```

### `NEXT_TELEMETRY_DISABLED`

Disables Next.js telemetry during automated CI execution.

### `CI`

Signals that commands are running in a continuous-integration environment.

---

## ✦ Runner

Current runner:

```text
ubuntu-latest
```

The workflow executes inside a GitHub-hosted Linux environment.

This provides a clean environment for every run.

---

## ✦ Runtime

Current Node.js target:

```text
Node.js 22
```

Node setup is handled through:

```text
actions/setup-node
```

The runtime version should remain intentionally controlled rather than relying
on whatever version happens to be available by default.

---

## ✦ Runtime Architecture

```text
GITHUB HOSTED RUNNER
        │
        ▼
    UBUNTU
        │
        ▼
    NODE.JS 22
        │
        ▼
       NPM
        │
        ▼
THE GAMING HORIZON BUILD
```

---

## ✦ Checkout

The workflow begins by checking out repository content.

```yaml
uses: actions/checkout@v4
```

This makes the repository files available to later workflow steps.

---

<a id="dependency-installation"></a>

## ✦ Dependency Installation

Dependencies are installed with:

```bash
npm ci
```

rather than:

```bash
npm install
```

for CI.

`npm ci` uses the committed lockfile to provide a cleaner and more reproducible
installation process.

---

## ✦ Dependency Inputs

The workflow expects:

```text
package.json
package-lock.json
```

at the configured project location.

Before installation, CI verifies that these files exist.

---

## ✦ Installation Flow

```text
package.json
     +
package-lock.json
     │
     ▼
   npm ci
     │
     ▼
node_modules
     │
     ▼
VALIDATION CONTINUES
```

---

## ✦ Dependency Cache

Node setup includes npm caching.

Concept:

```text
FIRST RUN
   │
   ▼
DOWNLOAD PACKAGES
   │
   ▼
CACHE
   │
   ▼
NEXT RUN
   │
   ▼
REUSE AVAILABLE CACHE
```

Caching can improve CI efficiency while `npm ci` continues to enforce the
lockfile-defined installation state.

---

## ✦ Lockfile Integrity

Changes to dependencies should normally update:

```text
package.json
```

and where required:

```text
package-lock.json
```

The lockfile should remain committed when the project depends on npm's
lockfile-based reproducibility.

---

## ✦ Runtime Diagnostics

The workflow reports runtime information such as:

```text
NODE VERSION
NPM VERSION
RUNNER INFORMATION
```

This helps diagnose environment-dependent failures.

Example conceptual output:

```text
THE GAMING HORIZON
Continuous Integration

Node:
v22.x.x

npm:
xx.x.x

Runner:
Linux ...
```

---

<a id="linting"></a>

## ✦ Linting

The workflow runs:

```bash
npm run lint --if-present
```

This means:

```text
LINT SCRIPT EXISTS
       │
       ▼
   RUN LINT
```

while:

```text
NO LINT SCRIPT
       │
       ▼
DO NOT FAIL ONLY FOR ABSENCE
```

---

## ✦ Why Linting Matters

Linting can detect issues related to:

```text
CODE QUALITY
STYLE CONSISTENCY
COMMON MISTAKES
UNUSED CODE
INVALID PATTERNS
MAINTAINABILITY
```

The actual lint behavior is defined by repository configuration.

---

<a id="type-checking"></a>

## ✦ Type Checking

The workflow supports:

```bash
npm run typecheck --if-present
```

This allows the repository to introduce an explicit type-check script such as:

```json
"typecheck": "tsc --noEmit"
```

without requiring the workflow architecture to be rewritten later.

---

## ✦ Type Validation Flow

```text
TYPESCRIPT SOURCE
       │
       ▼
TYPECHECK SCRIPT?
   ┌───┴───┐
   ▼       ▼
  YES      NO
   │       │
   ▼       ▼
CHECK     CONTINUE
```

---

## ✦ Why Type Checking Matters

Type checking can detect:

```text
INVALID TYPES
INCORRECT FUNCTION USE
MISSING PROPERTIES
UNSAFE ASSUMPTIONS
INTERFACE MISMATCHES
```

before runtime.

---

<a id="testing"></a>

## ✦ Testing

Current workflow command:

```bash
npm test --if-present
```

Tests therefore become part of CI automatically once the repository defines a
supported test script.

---

## ✦ Testing Model

```text
SOURCE CHANGE
     │
     ▼
TEST SCRIPT EXISTS?
   ┌─┴─┐
   ▼   ▼
  YES  NO
   │   │
   ▼   ▼
 TEST CONTINUE
   │
   ▼
PASS / FAIL
```

---

## ✦ Future Testing

As the project evolves, automated testing may eventually cover areas such as:

```text
UNIT TESTS
COMPONENT TESTS
INTEGRATION TESTS
ACCESSIBILITY TESTS
END-TO-END TESTS
```

These should only be documented as active once they are actually implemented.

---

<a id="production-build"></a>

## ✦ Production Build

The strongest required application validation in the current workflow is:

```bash
npm run build
```

For the current web application, a successful production build helps confirm
that the project can compile under the CI environment.

---

## ✦ Build Validation

```text
SOURCE
   │
   ▼
DEPENDENCIES
   │
   ▼
QUALITY CHECKS
   │
   ▼
npm run build
   │
 ┌─┴─┐
 ▼   ▼
PASS FAIL
 │    │
 ▼    ▼
CI   INVESTIGATE
PASS
```

---

## ✦ Build Failure

A production build can fail for reasons including:

```text
COMPILATION ERROR
TYPE ERROR
INVALID IMPORT
MISSING MODULE
BROKEN CONFIGURATION
ENVIRONMENT REQUIREMENT
FRAMEWORK ERROR
```

The failed workflow step should be reviewed for the actual cause.

---

<a id="observability"></a>

## ✦ Workflow Summaries

The CI workflow writes GitHub Actions job summaries.

Successful runs provide a summary similar to:

```text
THE GAMING HORIZON CI

STATUS: PASSED

Repository checkout      ✓
Node environment         ✓
Dependencies             ✓
Lint                     ✓
Type checking            ✓
Tests                    ✓
Production build         ✓
```

Failed runs provide a failure summary directing maintainers to the relevant
workflow logs.

---

## ✦ Why Summaries Matter

Workflow logs can be large.

A concise summary provides a quick answer to:

```text
DID CI PASS?
WHAT COMMIT RAN?
WHAT BRANCH RAN?
WHAT SHOULD I CHECK NEXT?
```

---

## ✦ CI Outcome Model

```text
                         CI RUN
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
               SUCCESS             FAILURE
                 │                   │
                 ▼                   ▼
            PASS SUMMARY       FAILURE SUMMARY
                 │                   │
                 ▼                   ▼
              REVIEW             INVESTIGATE
```

---

<a id="security"></a>

## ✦ Workflow Security

GitHub Actions configuration is executable repository infrastructure.

It should therefore be reviewed with the same care as application code.

Never hard-code:

```text
PASSWORDS
API KEYS
ACCESS TOKENS
PRIVATE KEYS
DATABASE PASSWORDS
SUPABASE SERVICE ROLE KEYS
NETLIFY TOKENS
WEBHOOK SECRETS
SESSION VALUES
DEPLOYMENT CREDENTIALS
```

inside workflow files.

---

## ✦ Secret Handling

Bad:

```yaml
env:
  API_KEY: "real-secret"
```

Correct conceptual model:

```text
GITHUB SECRET STORAGE
        │
        ▼
WORKFLOW REFERENCE
        │
        ▼
RUNTIME ONLY
```

Secrets should only be introduced when a workflow genuinely requires them.

---

## ✦ Environment Variables

Not every environment variable is secret.

Examples such as:

```text
CI=true
NEXT_TELEMETRY_DISABLED=1
```

can safely exist directly in workflow configuration.

Sensitive values should not.

---

## ✦ Third-Party Actions

Before introducing another GitHub Action, evaluate:

```text
IS IT NECESSARY?
IS IT MAINTAINED?
WHAT PERMISSIONS DOES IT REQUIRE?
WHAT CODE WILL EXECUTE?
IS THE VERSION CONTROLLED?
WHAT REPOSITORY ACCESS DOES IT RECEIVE?
```

---

## ✦ Action Versions

Current CI uses versioned actions such as:

```text
actions/checkout@v4
actions/setup-node@v4
```

Action versions should be reviewed periodically.

Updates should be intentional rather than automatic assumptions.

---

## ✦ Supply Chain Awareness

Automation depends on:

```text
GITHUB ACTIONS
NODE.JS
NPM
PROJECT DEPENDENCIES
```

Each additional external dependency expands the automation supply chain.

Keep workflow dependencies purposeful.

---

## ✦ Deployment Boundary

The CI workflow currently focuses on:

```text
VALIDATION
QUALITY
BUILD
```

It should not automatically be treated as a deployment workflow.

Conceptual separation:

```text
CONTINUOUS INTEGRATION
        │
        ├── INSTALL
        ├── CHECK
        ├── TEST
        └── BUILD


DEPLOYMENT
        │
        └── RELEASE / HOST
```

If deployment automation is introduced later, it should have its own clearly
defined security and permission model.

---

## ✦ CI vs Deployment

| CI                                  | Deployment                                |
| ----------------------------------- | ----------------------------------------- |
| Validates changes                   | Publishes changes                         |
| Runs quality checks                 | Interacts with hosting                    |
| Builds project                      | May require deployment credentials        |
| Can use read-only repository access | May require limited write/external access |
| Lower privilege                     | Potentially higher privilege              |

Keeping these responsibilities separate improves clarity.

---

## ✦ Failure Philosophy

A CI failure is useful information.

The goal is not merely to achieve a green checkmark.

The goal is to identify problems before integration.

```text
FAILURE
   │
   ▼
INFORMATION
   │
   ▼
INVESTIGATION
   │
   ▼
CORRECTION
   │
   ▼
VALIDATION
```

---

## ✦ Do Not Bypass Without Reason

If CI fails, do not automatically remove or weaken the failing check.

First determine:

```text
IS THE CODE WRONG?
IS THE WORKFLOW WRONG?
IS THE CONFIGURATION WRONG?
HAS THE ENVIRONMENT CHANGED?
IS A DEPENDENCY BROKEN?
```

Then address the real cause.

---

## ✦ Workflow Performance

CI should be thorough enough to provide confidence without wasting unnecessary
resources.

Current optimizations include:

```text
NPM CACHE
CONCURRENCY CANCELLATION
SINGLE VALIDATION JOB
TIMEOUT LIMIT
OPTIONAL NONEXISTENT SCRIPTS
```

---

## ✦ Timeout

The current CI job uses:

```text
20 minutes
```

as its maximum runtime.

A timeout prevents unexpectedly stalled workflows from running indefinitely.

If the normal build begins approaching that limit, investigate the cause before
simply increasing it.

---

## ✦ Current Workflow Map

```text
ci.yml
  │
  ├── Trigger
  │     ├── Push → main
  │     ├── Pull Request → main
  │     └── Manual
  │
  ├── Environment
  │     ├── Ubuntu
  │     ├── Node.js 22
  │     └── npm
  │
  ├── Validation
  │     ├── package.json
  │     └── package-lock.json
  │
  ├── Installation
  │     └── npm ci
  │
  ├── Quality
  │     ├── lint
  │     ├── typecheck
  │     └── test
  │
  ├── Build
  │     └── npm run build
  │
  └── Reporting
        ├── Success Summary
        └── Failure Summary
```

---

## ✦ Workflow Responsibility Matrix

| Responsibility            |        CI        |
| ------------------------- | :--------------: |
| Checkout repository       |         ✓        |
| Configure Node.js         |         ✓        |
| Validate package files    |         ✓        |
| Install dependencies      |         ✓        |
| Run lint                  | ✓ when available |
| Run explicit typecheck    | ✓ when available |
| Run tests                 | ✓ when available |
| Build production app      |         ✓        |
| Create Action summary     |         ✓        |
| Deploy website            |         —        |
| Publish release           |         —        |
| Modify repository content |         —        |
| Handle production secrets |         —        |

---

## ✦ Validation Layers

The current workflow can be understood as five layers:

```text
┌──────────────────────────────────────────────┐
│  05  BUILD                                  │
│      Production compilation                 │
├──────────────────────────────────────────────┤
│  04  TEST                                   │
│      Automated behavior validation          │
├──────────────────────────────────────────────┤
│  03  QUALITY                                │
│      Lint + Type checks                     │
├──────────────────────────────────────────────┤
│  02  DEPENDENCIES                           │
│      Deterministic npm installation         │
├──────────────────────────────────────────────┤
│  01  REPOSITORY                             │
│      Checkout + package validation          │
└──────────────────────────────────────────────┘
```

Every layer builds confidence before the next stage.

---

## ✦ Change Confidence Model

```text
LOWER CONFIDENCE
      │
      ▼
SOURCE CHANGE
      │
      ▼
PACKAGE VALIDATION
      │
      ▼
DEPENDENCY INSTALL
      │
      ▼
STATIC QUALITY
      │
      ▼
AUTOMATED TESTING
      │
      ▼
PRODUCTION BUILD
      │
      ▼
HIGHER CONFIDENCE
```

CI increases confidence.

It does not guarantee that every possible problem has been eliminated.

---

<a id="maintenance"></a>

## ✦ Workflow Maintenance

GitHub workflows require maintenance as:

```text
NODE.JS EVOLVES
GITHUB ACTIONS EVOLVE
DEPENDENCIES CHANGE
BUILD SYSTEMS CHANGE
PROJECT STRUCTURE CHANGES
SECURITY REQUIREMENTS CHANGE
```

Automation that is never reviewed eventually becomes technical debt.

---

## ✦ Review Schedule

Workflow configuration should be reviewed when:

```text
CI STARTS FAILING UNEXPECTEDLY
NODE VERSION CHANGES
PACKAGE MANAGER CHANGES
BUILD COMMAND CHANGES
NEW TEST SYSTEM IS ADDED
NEW SECURITY REQUIREMENT APPEARS
REPOSITORY STRUCTURE CHANGES
GITHUB ACTION VERSION BECOMES OUTDATED
```

---

## ✦ Adding a New Workflow

Before adding another workflow:

1. Identify the exact problem.
2. Confirm the existing CI cannot handle it cleanly.
3. Define its triggers.
4. Define its permissions.
5. Identify any secrets it requires.
6. Minimize external actions.
7. Add timeout protection.
8. Consider concurrency.
9. Test the workflow.
10. Document it in this README.

---

## ✦ New Workflow Decision Flow

```text
NEW AUTOMATION IDEA
        │
        ▼
DOES IT SOLVE A REAL PROBLEM?
        │
   ┌────┴────┐
   ▼         ▼
  YES        NO
   │         │
   ▼         ▼
CAN CI      DO NOT
HANDLE IT?  ADD
   │
 ┌─┴─┐
 ▼   ▼
YES  NO
 │   │
 ▼   ▼
EXTEND   DESIGN NEW
CI       WORKFLOW
```

---

## ✦ Updating a Workflow

Before modifying existing automation:

1. Understand current behavior.
2. Identify why the change is required.
3. Check GitHub Action compatibility.
4. Review permission implications.
5. Review secret implications.
6. Make the smallest effective change.
7. Validate YAML.
8. Run or test the workflow.
9. Review the result.
10. Update documentation if behavior changed.

---

## ✦ Removing a Workflow

Remove a workflow when:

```text
ITS RESPONSIBILITY NO LONGER EXISTS
ANOTHER WORKFLOW REPLACES IT
THE PROJECT NO LONGER USES THE TOOL
THE AUTOMATION CREATES MORE COST THAN VALUE
```

Do not leave inactive or misleading automation without a reason.

---

<a id="governance"></a>

## ✦ Workflow Governance

Workflow changes affect repository behavior and should be treated as
infrastructure changes.

Review should consider:

```text
CORRECTNESS
SECURITY
PERMISSIONS
DEPENDENCIES
PERFORMANCE
MAINTAINABILITY
PROJECT FIT
```

---

## ✦ Automation Standard

Every workflow should answer:

### What triggers it?

```text
PUSH?
PULL REQUEST?
MANUAL?
SCHEDULE?
RELEASE?
```

### What does it do?

Its responsibility should be clear.

### What permissions does it need?

Use the minimum.

### What happens if it fails?

Failure should be understandable.

### Who maintains it?

The repository should retain clear ownership.

---

## ✦ Workflow Quality Gate

Before merging workflow changes:

* [ ] YAML syntax is valid
* [ ] Trigger behavior is intentional
* [ ] Permissions are minimized
* [ ] No secrets are hard-coded
* [ ] Third-party actions are justified
* [ ] Action versions are explicit
* [ ] Node/runtime version is intentional
* [ ] Dependency cache behavior is understood
* [ ] Commands match repository scripts
* [ ] Timeout is defined where appropriate
* [ ] Concurrency behavior is understood
* [ ] Failure behavior is useful
* [ ] Summary output remains understandable
* [ ] Documentation is updated if required
* [ ] No unrelated deployment capability was introduced

---

## ✦ Troubleshooting

<details>

<summary><strong>CI does not start</strong></summary>

<br>

Check:

```text
.github/workflows/ci.yml
```

Then verify:

1. YAML syntax.
2. Workflow exists on the branch.
3. Trigger matches the event.
4. GitHub Actions is enabled for the repository.
5. Branch name matches `main`.
6. Workflow file uses a supported structure.

</details>

<details>

<summary><strong>npm ci fails</strong></summary>

<br>

Check:

```text
package.json
package-lock.json
```

Possible causes:

```text
LOCKFILE OUT OF SYNC
INVALID DEPENDENCY
PACKAGE REGISTRY FAILURE
NODE VERSION INCOMPATIBILITY
CORRUPTED PACKAGE METADATA
```

Run locally where appropriate:

```bash
npm ci
```

</details>

<details>

<summary><strong>Lint fails</strong></summary>

<br>

Run:

```bash
npm run lint
```

Review the exact lint output.

Do not weaken lint configuration merely to hide a legitimate issue.

</details>

<details>

<summary><strong>Type checking fails</strong></summary>

<br>

If the repository defines:

```text
typecheck
```

run:

```bash
npm run typecheck
```

and review the reported TypeScript errors.

</details>

<details>

<summary><strong>Tests fail</strong></summary>

<br>

Run:

```bash
npm test
```

where the repository defines a test script.

Determine whether:

```text
CODE IS WRONG
TEST IS WRONG
EXPECTED BEHAVIOR CHANGED
ENVIRONMENT DIFFERS
```

</details>

<details>

<summary><strong>Production build fails</strong></summary>

<br>

Run:

```bash
npm run build
```

Review:

```text
COMPILATION
IMPORTS
TYPES
CONFIGURATION
ENVIRONMENT VARIABLES
DEPENDENCIES
```

</details>

<details>

<summary><strong>Build needs environment variables</strong></summary>

<br>

Do not hard-code production secrets in `ci.yml`.

First determine whether the build truly requires them.

For sensitive values, use an appropriate GitHub secret or protected
configuration mechanism.

Document the requirement without publishing the secret itself.

</details>

---

## ✦ Relative Paths

This README lives at:

```text
.github/workflows/README.md
```

Therefore:

### CI workflow

```text
ci.yml
```

### GitHub System

```text
../GITHUB-SYSTEM.md
```

### Official logo

```text
../../assets/branding/logos/gaming-horizon-logo-source.png
```

### Repository README

```text
../../README.md
```

### Security

```text
../../SECURITY.md
```

### Contributing

```text
../../CONTRIBUTING.md
```

### License

```text
../../LICENSE
```

---

## ✦ Path Matrix

| Current document              | Destination   | Path                                                         |
| ----------------------------- | ------------- | ------------------------------------------------------------ |
| `.github/workflows/README.md` | CI            | `ci.yml`                                                     |
| `.github/workflows/README.md` | GitHub system | `../GITHUB-SYSTEM.md`                                        |
| `.github/workflows/README.md` | Root README   | `../../README.md`                                            |
| `.github/workflows/README.md` | Logo          | `../../assets/branding/logos/gaming-horizon-logo-source.png` |
| `.github/workflows/README.md` | Security      | `../../SECURITY.md`                                          |
| `.github/workflows/README.md` | Contributing  | `../../CONTRIBUTING.md`                                      |

---

## ✦ Repository Policy Matrix

| Policy              | Relative path                  |
| ------------------- | ------------------------------ |
| Repository README   | `../../README.md`              |
| Contributing        | `../../CONTRIBUTING.md`        |
| Code of Conduct     | `../../CODE_OF_CONDUCT.md`     |
| Security            | `../../SECURITY.md`            |
| Privacy             | `../../PRIVACY.md`             |
| Terms               | `../../TERMS.md`               |
| Copyright           | `../../COPYRIGHT.md`           |
| Third-Party Notices | `../../THIRD-PARTY-NOTICES.md` |
| License             | `../../LICENSE`                |

---

## ✦ Workflow Naming Standard

Workflow filenames should remain simple and descriptive.

Current:

```text
ci.yml
```

Good future examples:

```text
security.yml
accessibility.yml
release.yml
```

only when such workflows actually exist.

Avoid:

```text
workflow1.yml
new.yml
test2.yml
final-workflow.yml
actions.yml
random-check.yml
```

---

## ✦ Responsibility Separation

Avoid turning one workflow into every possible automation system.

Prefer:

```text
CI
  └── VALIDATION


SECURITY
  └── SECURITY AUTOMATION


RELEASE
  └── RELEASE AUTOMATION
```

when these systems genuinely become complex enough to deserve separation.

---

## ✦ Future Workflow Possibilities

The following are **possible future directions**, not claims of current
implementation:

```text
ACCESSIBILITY VALIDATION
DEDICATED TESTING
DEPENDENCY SECURITY
CODE QUALITY
RELEASE VALIDATION
DOCUMENTATION CHECKS
LINK VALIDATION
```

They should only be added when useful to the actual repository.

---

## ✦ Workflow Evolution

```text
                    v1.0.0
                      │
                      ▼
                 CORE CI
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       QUALITY      TESTING     SECURITY
          │           │           │
          └───────────┼───────────┘
                      ▼
               MATURE AUTOMATION
```

The system should evolve based on need rather than complexity for appearance.

---

## ✦ GitHub Workflow Golden Rules

### `01` — Automate real needs

Automation should solve a measurable development problem.

### `02` — Validate before integration

Catch preventable failures before they reach the main branch.

### `03` — Keep permissions minimal

Read-only should remain the default whenever possible.

### `04` — Never commit secrets

Credentials do not belong inside workflow YAML.

### `05` — Keep actions intentional

Every third-party action expands the automation supply chain.

### `06` — Fail with useful information

A failure should help developers understand what broke.

### `07` — Keep CI reproducible

Use controlled runtimes and lockfile-based dependency installation.

### `08` — Keep workflows maintainable

Future contributors should understand what each step does.

### `09` — Separate validation from deployment

Higher-risk automation deserves explicit architecture.

### `10` — Evolve with the project

Add automation when Gaming Horizon genuinely needs it.

---

## ✦ Workflow System Standard

A Gaming Horizon workflow should ultimately be:

|   #  | Standard         | Meaning                                    |
| :--: | ---------------- | ------------------------------------------ |
| `01` | **Purposeful**   | Solves a real automation need              |
| `02` | **Secure**       | Uses minimum access and protects secrets   |
| `03` | **Repeatable**   | Produces predictable validation            |
| `04` | **Observable**   | Failures and results are understandable    |
| `05` | **Efficient**    | Avoids unnecessary work                    |
| `06` | **Maintainable** | Can be understood and updated              |
| `07` | **Reviewable**   | Changes are easy to inspect                |
| `08` | **Reliable**     | Supports consistent repository quality     |
| `09` | **Extensible**   | Can evolve without unnecessary redesign    |
| `10` | **Aligned**      | Supports the wider Gaming Horizon standard |

---

## ✦ Current Workflow Register

```text
.github/
└── workflows/
    ├── README.md
    │
    └── Workflow documentation
    │
    └── ci.yml
        │
        ├── Push validation
        ├── Pull request validation
        ├── Manual execution
        ├── Package validation
        ├── Dependency installation
        ├── Lint
        ├── Type checking
        ├── Tests
        ├── Production build
        └── Workflow summaries
```

---

## ✦ Release Information

```text
SYSTEM          The Gaming Horizon Workflow System
VERSION         1.0.0
STATUS          Active Development
TYPE            GitHub Actions Infrastructure
PROJECT         Gaming Horizon
LOCATION        .github/workflows/
CURRENT CI      ci.yml
PARENT SYSTEM   .github/
REPOSITORY      The-Gaming-Horizon
```

---

<div align="center">

<br>

<img
src="../../assets/branding/logos/gaming-horizon-logo-source.png"
width="340"
alt="The Gaming Horizon Official Logo"
/>

<br><br>

<strong>THE GAMING HORIZON</strong>

<br>

<sub>GitHub Workflow System · Version 1.0.0</sub>

<br><br>

<a href="#continuous-integration">
  <img
    src="https://img.shields.io/badge/CI-AUTOMATED-7C3AED?style=flat-square"
    alt="CI Automated"
  />
</a>
<a href="#permissions">
  <img
    src="https://img.shields.io/badge/PERMISSIONS-READ_ONLY-6366F1?style=flat-square"
    alt="Read Only Permissions"
  />
</a>
<a href="#production-build">
  <img
    src="https://img.shields.io/badge/BUILD-VALIDATED-2563EB?style=flat-square"
    alt="Build Validated"
  />
</a>
<a href="#security">
  <img
    src="https://img.shields.io/badge/SECURITY-PROTECTED-0EA5E9?style=flat-square"
    alt="Security Protected"
  />
</a>
<a href="#maintenance">
  <img
    src="https://img.shields.io/badge/MAINTENANCE-DEFINED-14B8A6?style=flat-square"
    alt="Maintenance Defined"
  />
</a>

<br><br>

<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/actions">
  <img
    src="https://img.shields.io/badge/GITHUB_ACTIONS-VIEW_RUNS-2088FF?style=flat-square&logo=githubactions&logoColor=white"
    alt="View GitHub Actions"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon">
  <img
    src="https://img.shields.io/badge/GITHUB-REPOSITORY-181717?style=flat-square&logo=github&logoColor=white"
    alt="GitHub Repository"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues">
  <img
    src="https://img.shields.io/badge/ISSUES-REPORT-EC4899?style=flat-square&logo=github&logoColor=white"
    alt="Report an Issue"
  />
</a>

<br><br>

<code>
VALIDATE · TEST · BUILD · REVIEW · IMPROVE
</code>

<br><br>

<strong>
Build carefully. Validate continuously. Improve what remains.
</strong>

<br><br>

<sub>
Gaming Horizon · Beyond the Horizon
</sub>

<br><br>

</div>
