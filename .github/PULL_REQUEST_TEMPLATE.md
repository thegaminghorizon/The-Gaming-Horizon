<!--
===============================================================================
                              GAMING HORIZON
                         BEYOND THE HORIZON
===============================================================================

                   THE GAMING HORIZON PULL REQUEST

                    .github/PULL_REQUEST_TEMPLATE.md

                         PR SYSTEM v1.0.0

===============================================================================

PURPOSE
-------
This template helps contributors submit clear, reviewable, secure,
and maintainable pull requests to The Gaming Horizon repository.

A strong pull request should explain:

- what changed;
- why the change is needed;
- which systems are affected;
- how the change was tested;
- whether documentation changed;
- whether accessibility was considered;
- whether security or privacy is affected;
- whether screenshots are required;
- whether the change introduces dependencies;
- whether the change is ready to merge.

REPOSITORY
----------
THE-GAMING-HORIZON

OWNER
-----
@thegaminghorizon

SECURITY
--------
Never include:

- passwords;
- API keys;
- access tokens;
- private keys;
- database credentials;
- session secrets;
- webhook secrets;
- private user data;
- confidential vulnerability details.

Security-sensitive reports should follow SECURITY.md rather than being
disclosed unnecessarily in a public pull request.

===============================================================================
-->

<div align="center">

<br>

<img
  src="https://raw.githubusercontent.com/thegaminghorizon/THE-GAMING-HORIZON/main/assets/branding/logos/gaming-horizon-logo-source.png"
  width="420"
  alt="The Gaming Horizon Official Logo"
/>

<br><br>

<h1>✦ The Gaming Horizon Pull Request</h1>

<p>
  <strong>
    Build carefully. Explain clearly. Validate completely.
  </strong>
</p>

<br>

<img
  src="https://img.shields.io/badge/TYPE-PULL_REQUEST-7C3AED?style=flat-square"
  alt="Pull Request"
/>
<img
  src="https://img.shields.io/badge/PROJECT-THE_GAMING_HORIZON-6366F1?style=flat-square"
  alt="The Gaming Horizon"
/>
<img
  src="https://img.shields.io/badge/STATUS-READY_FOR_REVIEW-2563EB?style=flat-square"
  alt="Ready for Review"
/>
<img
  src="https://img.shields.io/badge/VERSION-1.0.0-0EA5E9?style=flat-square"
  alt="PR System Version 1.0.0"
/>

<br><br>

<code>UNDERSTAND</code>
&nbsp; • &nbsp;
<code>BUILD</code>
&nbsp; • &nbsp;
<code>TEST</code>
&nbsp; • &nbsp;
<code>REVIEW</code>
&nbsp; • &nbsp;
<code>MERGE</code>

<br><br>

</div>

---

## ✦ Pull Request Summary

<!--
Provide a concise overview of this pull request.

Explain what this PR changes without requiring reviewers to inspect the diff
first.

Good:
Adds validation to the Gaming Horizon CI workflow so invalid npm lockfiles
fail before dependency installation.

Avoid:
Updated files.
-->

Describe the change:

```text
Summary:
```

---

## ✦ Why Is This Change Needed?

<!--
Explain the problem, limitation, maintenance need, feature requirement,
documentation need, or improvement that caused this change.
-->

```text
Reason:
```

---

## ✦ Pull Request Type

Select every category that applies.

- [ ] Feature
- [ ] Bug fix
- [ ] Improvement
- [ ] Refactor
- [ ] Performance
- [ ] Accessibility
- [ ] Documentation
- [ ] UI / UX
- [ ] Repository maintenance
- [ ] GitHub configuration
- [ ] CI / Workflow
- [ ] Dependency update
- [ ] Security improvement
- [ ] Privacy improvement
- [ ] Branding
- [ ] Assets
- [ ] Screenshots
- [ ] Showcase
- [ ] Developer experience
- [ ] Testing
- [ ] Build configuration
- [ ] Database / Migration
- [ ] Localization
- [ ] Support
- [ ] Other

If **Other**:

```text
Type:
```

---

## ✦ Change Scope

How large is this pull request?

- [ ] Small — isolated change
- [ ] Medium — affects multiple related files
- [ ] Large — affects multiple systems
- [ ] Cross-system — architectural or repository-wide change

---

## ✦ Affected Areas

Select every Gaming Horizon area affected by this PR.

### Platform

- [ ] Gateway
- [ ] Homepage
- [ ] Navigation
- [ ] Search / Command Palette
- [ ] Game Discovery
- [ ] Game Cards
- [ ] AI Companion
- [ ] AI Suggestions
- [ ] Customization
- [ ] Localization
- [ ] Music Player
- [ ] Sign In / Authentication
- [ ] Waitlist
- [ ] Support
- [ ] Funding / Support Us
- [ ] Error / 404 Experience
- [ ] Footer

### Ecosystem

- [ ] Discovery
- [ ] Community
- [ ] Creators
- [ ] Competition
- [ ] Developers
- [ ] AI & Future Technology
- [ ] Beyond / Future Direction

### Repository

- [ ] Root documentation
- [ ] `.github/`
- [ ] Issue templates
- [ ] Pull request system
- [ ] GitHub workflows
- [ ] CODEOWNERS
- [ ] Dependabot
- [ ] Funding configuration
- [ ] Assets
- [ ] Branding
- [ ] Screenshots
- [ ] Showcase
- [ ] Documentation
- [ ] Build configuration
- [ ] Dependencies

### Application

- [ ] `app/`
- [ ] `components/`
- [ ] `lib/`
- [ ] `public/`
- [ ] Supabase / migrations
- [ ] Configuration
- [ ] Other

---

## ✦ Related Issue

<!--
Use a GitHub closing keyword where appropriate.

Examples:

Closes #123
Fixes #456
Resolves #789

Do not claim an issue is resolved if this PR does not actually resolve it.
-->

```text
Related issue:
```

---

## ✦ Related Pull Requests

Optional.

```text
Related PR:
```

---

## ✦ What Changed?

List the most important changes.

### Added

```text
-
-
-
```

### Changed

```text
-
-
-
```

### Removed

```text
-
-
-
```

Use `Not applicable` where necessary.

---

## ✦ Change Flow

Use this section to summarize the effect of the PR.

```text
BEFORE
   │
   ▼
CURRENT SYSTEM
   │
   ▼
LIMITATION / NEED
   │
   ▼
THIS PULL REQUEST
   │
   ▼
UPDATED SYSTEM
   │
   ▼
EXPECTED RESULT
```

Describe the change:

```text
Flow:
```

---

## ✦ Architecture Impact

Does this PR change system architecture?

- [ ] Yes
- [ ] No
- [ ] Partially
- [ ] Not sure

If yes or partially:

```text
Architecture impact:
```

Optional architecture map:

```text
                    EXISTING SYSTEM
                           │
                           ▼
                       CHANGE
                           │
               ┌───────────┼───────────┐
               ▼           ▼           ▼
           COMPONENT     LOGIC       DATA
               │           │           │
               └───────────┼───────────┘
                           ▼
                     UPDATED SYSTEM
```

---

## ✦ User Experience Impact

Does this change affect what users see or interact with?

- [ ] Yes
- [ ] No

If yes:

```text
User experience impact:
```

Describe:

- what changes;
- what remains unchanged;
- whether existing workflows continue to work;
- whether users need to learn anything new.

---

## ✦ Before / After

Use this section for behavior or interface changes.

### Before

```text
Before:
```

### After

```text
After:
```

---

## ✦ Visual Changes

Does this pull request change visible UI?

- [ ] Yes
- [ ] No

If yes, attach:

```text
BEFORE SCREENSHOT
AFTER SCREENSHOT
RESPONSIVE SCREENSHOT
OPTIONAL RECORDING
```

### Before

<!-- Drag screenshot here -->

### After

<!-- Drag screenshot here -->

> [!IMPORTANT]
> Remove private data, account information, credentials, tokens, or unrelated
> personal information before uploading screenshots.

---

## ✦ Responsive Validation

If this PR affects UI, confirm relevant layouts.

- [ ] Desktop checked
- [ ] Laptop checked
- [ ] Tablet checked
- [ ] Mobile checked
- [ ] Responsive behavior unchanged
- [ ] Not applicable

Notes:

```text
Responsive validation:
```

---

## ✦ Accessibility

Does this change affect accessibility?

- [ ] Yes
- [ ] No
- [ ] Not sure
- [ ] Not applicable

If applicable, check what was reviewed:

- [ ] Keyboard navigation
- [ ] Visible focus states
- [ ] Semantic structure
- [ ] Screen-reader compatibility
- [ ] Text alternatives
- [ ] Contrast
- [ ] Text readability
- [ ] Reduced motion
- [ ] Touch target size
- [ ] Error feedback
- [ ] Cognitive clarity
- [ ] Responsive accessibility

Details:

```text
Accessibility notes:
```

---

## ✦ Testing

How was this change validated?

- [ ] Local development
- [ ] Production build
- [ ] Lint
- [ ] Type checking
- [ ] Automated tests
- [ ] Manual testing
- [ ] Browser testing
- [ ] Responsive testing
- [ ] Accessibility testing
- [ ] CI workflow
- [ ] Not applicable

Commands used:

```bash
# Example

npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Actual commands:

```bash
```

---

## ✦ Test Results

Summarize the result.

```text
Test result:
```

Example:

```text
npm ci        PASS
lint          PASS
typecheck     PASS
tests         PASS
build         PASS
```

Do not report a check as passing if it was not run.

---

## ✦ Browser Validation

If relevant:

- [ ] Chrome
- [ ] Edge
- [ ] Firefox
- [ ] Safari
- [ ] Other
- [ ] Not applicable

Details:

```text
Browser validation:
```

---

## ✦ Continuous Integration

Has the repository CI workflow been considered?

- [ ] CI passes
- [ ] CI currently running
- [ ] CI changes are included in this PR
- [ ] CI is not relevant
- [ ] CI failure requires investigation

If CI fails, summarize the reason:

```text
CI status:
```

---

## ✦ Build Validation

Does the project build successfully?

- [ ] Yes
- [ ] No
- [ ] Not tested
- [ ] Not applicable

Command:

```bash
npm run build
```

Build notes:

```text
Build result:
```

---

## ✦ Dependencies

Does this PR change dependencies?

- [ ] Yes
- [ ] No

If yes:

### Added

```text
-
```

### Updated

```text
-
```

### Removed

```text
-
```

Explain why each new dependency is necessary:

```text
Dependency reasoning:
```

---

## ✦ Lockfile

If dependencies changed:

- [ ] `package.json` updated
- [ ] `package-lock.json` updated
- [ ] Lockfile remains valid
- [ ] `npm ci` succeeds
- [ ] Not applicable

---

## ✦ Performance

Could this change affect performance?

- [ ] Improves performance
- [ ] No meaningful impact expected
- [ ] May increase runtime cost
- [ ] May increase bundle size
- [ ] May increase network requests
- [ ] May increase rendering complexity
- [ ] Requires performance review
- [ ] Not applicable

Details:

```text
Performance impact:
```

---

## ✦ Security

Does this pull request affect:

- [ ] Authentication
- [ ] Authorization
- [ ] API access
- [ ] Developer keys
- [ ] Webhooks
- [ ] User-generated content
- [ ] Database access
- [ ] Dependencies
- [ ] GitHub Actions
- [ ] Repository permissions
- [ ] External integrations
- [ ] No security-sensitive area

Security notes:

```text
Security impact:
```

---

## ✦ Security Validation

Before submitting:

- [ ] No passwords are committed.
- [ ] No API keys are committed.
- [ ] No access tokens are committed.
- [ ] No private keys are committed.
- [ ] No database credentials are committed.
- [ ] No webhook secrets are committed.
- [ ] No session secrets are committed.
- [ ] No private user data is committed.
- [ ] No production `.env` file is committed.
- [ ] No confidential vulnerability information is unnecessarily disclosed.

> [!CAUTION]
> If this pull request concerns a confidential vulnerability, review
> `SECURITY.md` before publishing sensitive information.

---

## ✦ Privacy

Does this change collect, process, expose, or store user information?

- [ ] Yes
- [ ] No
- [ ] Not sure
- [ ] Not applicable

If yes:

```text
Privacy impact:
```

Consider whether related privacy documentation requires an update.

---

## ✦ Database / Supabase

Does this change affect Supabase or database structure?

- [ ] Yes
- [ ] No

If yes:

- [ ] Migration included
- [ ] Migration reviewed
- [ ] Existing data impact considered
- [ ] Rollback / recovery considerations reviewed
- [ ] No secrets included
- [ ] Documentation updated where required

Migration:

```text
Migration path:
```

---

## ✦ GitHub Workflow Changes

Does this PR change `.github/workflows/`?

- [ ] Yes
- [ ] No

If yes, confirm:

- [ ] Workflow YAML is valid.
- [ ] Triggers are intentional.
- [ ] Permissions use least privilege.
- [ ] No secrets are hard-coded.
- [ ] Third-party actions are necessary.
- [ ] Action versions are explicit.
- [ ] Concurrency was considered.
- [ ] Timeout behavior was considered.
- [ ] Failure behavior is understandable.
- [ ] Workflow documentation was updated where required.

---

## ✦ Repository Permission Impact

Does this PR increase GitHub Action or repository permissions?

- [ ] No
- [ ] Yes
- [ ] Not applicable

If yes:

```text
New permission:
Reason:
```

Permission increases should be justified explicitly.

---

## ✦ Documentation

Does this change require documentation updates?

- [ ] Documentation updated
- [ ] Documentation not required
- [ ] Documentation will follow separately
- [ ] Not sure

Updated files:

```text
Documentation:
```

---

## ✦ README Impact

Does the root or related README require changes?

- [ ] Yes — updated
- [ ] No
- [ ] Not applicable

Details:

```text
README impact:
```

---

## ✦ Asset Changes

Does this PR modify Gaming Horizon assets?

- [ ] Yes
- [ ] No

If yes:

- [ ] Official logo source preserved
- [ ] Naming standards followed
- [ ] Correct directory used
- [ ] Duplicate asset avoided
- [ ] Screenshot vs showcase classification is correct
- [ ] Accessibility considerations reviewed
- [ ] Documentation updated

Assets changed:

```text
Assets:
```

---

## ✦ Branding Integrity

If branding is affected:

- [ ] Official Gaming Horizon logo geometry remains unchanged.
- [ ] No unofficial logo replacement was introduced.
- [ ] No arbitrary brand recoloring was introduced.
- [ ] Generated showcase graphics are not presented as official source assets.
- [ ] Conceptual visuals are clearly separated from real product screenshots.
- [ ] Not applicable

---

## ✦ Content Integrity

Confirm factual accuracy where the change affects public-facing content.

- [ ] No invented user counts.
- [ ] No invented revenue claims.
- [ ] No invented partnerships.
- [ ] No invented sponsorships.
- [ ] No invented awards.
- [ ] No invented team members.
- [ ] No unverified press claims.
- [ ] No invented statistics.
- [ ] Current functionality and future ideas are clearly separated.
- [ ] Not applicable

---

## ✦ Project Scope

The Gaming Horizon is a **browser-first gaming ecosystem**.

This PR should not unintentionally redefine the project as:

```text
CLOUD GAMING PLATFORM
GAME STREAMING SERVER
DESKTOP GAME LAUNCHER
DOWNLOAD CLIENT
QUEUE-BASED STREAMING SERVICE
```

unless a separately approved project decision establishes such a direction.

Please confirm:

- [ ] This PR remains aligned with the documented Gaming Horizon scope.
- [ ] Current capabilities are separated from future concepts.
- [ ] Experimental ideas are not presented as released functionality.

---

## ✦ Breaking Changes

Does this PR introduce a breaking change?

- [ ] Yes
- [ ] No

If yes:

```text
Breaking change:
```

Migration / adaptation required:

```text
Required action:
```

---

## ✦ Backward Compatibility

Does existing behavior remain compatible?

- [ ] Yes
- [ ] No
- [ ] Partially
- [ ] Not applicable

Details:

```text
Compatibility:
```

---

## ✦ Configuration Changes

Does this PR modify configuration?

- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `next.config.mjs`
- [ ] `tsconfig.json`
- [ ] ESLint
- [ ] PostCSS
- [ ] Netlify
- [ ] GitHub Actions
- [ ] Dependabot
- [ ] CODEOWNERS
- [ ] Funding
- [ ] Other
- [ ] None

Explain important configuration changes:

```text
Configuration:
```

---

## ✦ Environment Variables

Does the change require environment variables?

- [ ] Yes
- [ ] No

If yes, list **names only**, never secret values.

```text
VARIABLE_NAME
ANOTHER_VARIABLE
```

Do not paste actual credentials.

---

## ✦ Deployment Impact

Does this PR affect deployment behavior?

- [ ] Yes
- [ ] No
- [ ] Not sure

If yes:

```text
Deployment impact:
```

CI validation and deployment responsibilities should remain clearly separated.

---

## ✦ Rollback Considerations

If this PR causes unexpected problems, can it be safely reverted?

- [ ] Yes
- [ ] No
- [ ] Requires special steps
- [ ] Not applicable

Details:

```text
Rollback:
```

---

## ✦ Risks

Identify possible risks.

```text
Risk:
Mitigation:
```

Examples:

```text
Regression
Performance degradation
Data migration issue
Accessibility regression
Build failure
Configuration conflict
Dependency incompatibility
```

---

## ✦ Trade-Offs

What did this implementation trade off?

```text
Trade-offs:
```

Possible areas:

```text
COMPLEXITY
PERFORMANCE
MAINTAINABILITY
BUNDLE SIZE
DEVELOPMENT TIME
COMPATIBILITY
ACCESSIBILITY
FLEXIBILITY
```

---

## ✦ Alternatives Considered

Were other approaches considered?

```text
Alternative:
Why not selected:
```

---

## ✦ Reviewer Focus

Tell reviewers where their attention is most valuable.

```text
Please review:
-
-
-
```

Examples:

```text
ARCHITECTURE
SECURITY
ACCESSIBILITY
MIGRATION
WORKFLOW PERMISSIONS
RESPONSIVE UI
DEPENDENCY CHANGE
```

---

## ✦ Files Requiring Special Review

Optional.

```text
File:
Reason:
```

---

## ✦ Review Architecture

```text
                       PULL REQUEST
                            │
                            ▼
                       AUTOMATION
                            │
                            ▼
                       CI VALIDATION
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
                 PASS              FAIL
                   │                 │
                   ▼                 ▼
              CODE REVIEW           FIX
                   │                 │
                   └────────┬────────┘
                            ▼
                       CODEOWNERS
                            │
                            ▼
                    @thegaminghorizon
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
                APPROVE          REQUEST
                                  CHANGES
                   │                 │
                   └────────┬────────┘
                            ▼
                     FINAL VALIDATION
                            │
                            ▼
                          MERGE
```

---

## ✦ Change Quality

A strong Gaming Horizon pull request should be:

| Standard | Meaning |
| --- | --- |
| **Focused** | Solves a clear problem |
| **Understandable** | Reviewers can understand the change |
| **Tested** | Appropriate validation has been completed |
| **Secure** | Does not introduce unnecessary risk |
| **Accessible** | Inclusive behavior is preserved |
| **Maintainable** | Future development remains manageable |
| **Compatible** | Existing behavior is considered |
| **Documented** | Required documentation is updated |
| **Truthful** | Public claims reflect actual project state |
| **Reviewable** | Scope is reasonable and evidence is provided |

---

## ✦ Final Validation

Before requesting review:

### Code

- [ ] The change is complete.
- [ ] Temporary debugging code was removed.
- [ ] Unrelated changes were removed.
- [ ] Naming is clear.
- [ ] Code is understandable.
- [ ] Existing patterns were followed where appropriate.

### Quality

- [ ] Lint was considered.
- [ ] Type checking was considered.
- [ ] Tests were considered.
- [ ] Build validation was considered.
- [ ] Browser behavior was considered where relevant.
- [ ] Responsive behavior was considered where relevant.

### Security

- [ ] No secrets are committed.
- [ ] Permissions were reviewed.
- [ ] Dependencies were reviewed.
- [ ] Sensitive information was removed.

### Documentation

- [ ] Documentation is updated where required.
- [ ] Comments explain unusual decisions where needed.
- [ ] Public-facing claims are accurate.

### Git

- [ ] Commit history is understandable.
- [ ] The branch contains only intended changes.
- [ ] Merge conflicts are resolved.
- [ ] The PR targets the correct branch.

---

## ✦ Pull Request Readiness

Select one:

- [ ] Ready for review
- [ ] Draft / work in progress
- [ ] Needs design review
- [ ] Needs technical review
- [ ] Needs security review
- [ ] Needs accessibility review
- [ ] Needs documentation review

---

## ✦ Additional Context

Add anything else reviewers should know.

```text
Additional context:
```

---

## ✦ Contributor Declaration

By submitting this pull request, I confirm:

- [ ] I have reviewed my own changes.
- [ ] I understand what this PR changes.
- [ ] I have not intentionally included secrets or private data.
- [ ] I have provided truthful testing information.
- [ ] I have not represented proposed functionality as already released.
- [ ] I understand that maintainers may request changes.
- [ ] I understand that submission does not guarantee merge.
- [ ] I will respond constructively to review feedback.
- [ ] I have followed applicable repository policies.

---

## ✦ Pull Request Lifecycle

```text
IDEA / ISSUE
     │
     ▼
UNDERSTAND
     │
     ▼
IMPLEMENT
     │
     ▼
SELF REVIEW
     │
     ▼
TEST
     │
     ▼
OPEN PR
     │
     ▼
CI
     │
     ▼
CODE REVIEW
     │
     ▼
REVISE
     │
     ▼
APPROVE
     │
     ▼
MERGE
     │
     ▼
VERIFY
     │
     ▼
EVOLVE
```

---

## ✦ Merge Standard

A pull request should normally reach:

```text
CLEAR PURPOSE
      +
FOCUSED CHANGE
      +
SUCCESSFUL VALIDATION
      +
SECURITY REVIEW
      +
DOCUMENTATION
      +
OWNER REVIEW
      =
MERGE READY
```

---

<div align="center">

<br>

<img
  src="https://raw.githubusercontent.com/thegaminghorizon/THE-GAMING-HORIZON/main/assets/branding/logos/gaming-horizon-logo-source.png"
  width="280"
  alt="The Gaming Horizon Official Logo"
/>

<br><br>

<strong>THE GAMING HORIZON</strong>

<br>

<sub>Pull Request System · Version 1.0.0</sub>

<br><br>

<img
  src="https://img.shields.io/badge/UNDERSTAND-THE_CHANGE-7C3AED?style=flat-square"
  alt="Understand the Change"
/>
<img
  src="https://img.shields.io/badge/BUILD-WITH_PURPOSE-6366F1?style=flat-square"
  alt="Build with Purpose"
/>
<img
  src="https://img.shields.io/badge/TEST-WITH_CONFIDENCE-2563EB?style=flat-square"
  alt="Test with Confidence"
/>
<img
  src="https://img.shields.io/badge/REVIEW-WITH_CARE-0EA5E9?style=flat-square"
  alt="Review with Care"
/>
<img
  src="https://img.shields.io/badge/MERGE-WHAT_MATTERS-14B8A6?style=flat-square"
  alt="Merge What Matters"
/>

<br><br>

<code>
UNDERSTAND · BUILD · TEST · REVIEW · MERGE
</code>

<br><br>

<strong>
Build what matters. Validate what changes. Improve what remains.
</strong>

<br><br>

<sub>
Gaming Horizon · Beyond the Horizon
</sub>

<br><br>

</div>
