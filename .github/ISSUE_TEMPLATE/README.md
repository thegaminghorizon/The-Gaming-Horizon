<!--
===============================================================================
                              GAMING HORIZON
                         BEYOND THE HORIZON
===============================================================================

                         ISSUE TEMPLATE SYSTEM
                    .github/ISSUE_TEMPLATE/README.md

                      ISSUE SYSTEM v1.0.0

===============================================================================

DOCUMENT LOCATION
-----------------
.github/ISSUE_TEMPLATE/README.md

PURPOSE
-------
Documents the Gaming Horizon GitHub issue-reporting system, template
standards, submission expectations, triage principles, security boundaries,
quality requirements, and long-term issue-management workflow.

RELATIVE PATH RULE
------------------

Official logo:
../../assets/branding/logos/gaming-horizon-logo-source.png

GitHub system:
../README.md

Repository README:
../../README.md

Contributing:
../../CONTRIBUTING.md

Code of Conduct:
../../CODE_OF_CONDUCT.md

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
  alt="Gaming Horizon Official Logo"
/>

<br><br>

<h1>Gaming Horizon Issue Template System</h1>

<p>
  <strong>
    Structured GitHub issue reporting for bugs, improvements,
    documentation feedback, feature discussions, and repository maintenance.
  </strong>
</p>

<p>
  A consistent issue-management system designed to make reports
  clearer, more actionable, easier to review, and easier to maintain.
</p>

<br>

<!-- ========================================================= -->
<!--                       SYSTEM STATUS                       -->
<!-- ========================================================= -->

<a href="#status">
  <img
    src="https://img.shields.io/badge/STATUS-ACTIVE_DEVELOPMENT-7C3AED?style=flat-square"
    alt="Status: Active Development"
  />
</a>
<a href="#version">
  <img
    src="https://img.shields.io/badge/VERSION-1.0.0-6366F1?style=flat-square"
    alt="Version 1.0.0"
  />
</a>
<a href="#issue-system">
  <img
    src="https://img.shields.io/badge/ISSUE_SYSTEM-ACTIVE-2563EB?style=flat-square"
    alt="Issue System Active"
  />
</a>
<a href="#templates">
  <img
    src="https://img.shields.io/badge/TEMPLATES-STRUCTURED-0EA5E9?style=flat-square"
    alt="Structured Templates"
  />
</a>
<a href="#license">
  <img
    src="https://img.shields.io/badge/LICENSE-APACHE_2.0-0891B2?style=flat-square"
    alt="Apache License 2.0"
  />
</a>

<br><br>

<!-- ========================================================= -->
<!--                       ISSUE AREAS                         -->
<!-- ========================================================= -->

<a href="#bug-reports">
  <img
    src="https://img.shields.io/badge/BUGS-REPORT-DC2626?style=flat-square"
    alt="Bug Reports"
  />
</a>
<a href="#feature-requests">
  <img
    src="https://img.shields.io/badge/FEATURES-REQUEST-8B5CF6?style=flat-square"
    alt="Feature Requests"
  />
</a>
<a href="#documentation">
  <img
    src="https://img.shields.io/badge/DOCUMENTATION-FEEDBACK-6366F1?style=flat-square"
    alt="Documentation Feedback"
  />
</a>
<a href="#improvements">
  <img
    src="https://img.shields.io/badge/IMPROVEMENTS-SUGGEST-3B82F6?style=flat-square"
    alt="Improvement Suggestions"
  />
</a>
<a href="#security">
  <img
    src="https://img.shields.io/badge/SECURITY-PRIVATE_REPORTING-0EA5E9?style=flat-square"
    alt="Security Reporting"
  />
</a>

<br><br>

<!-- ========================================================= -->
<!--                       ISSUE PROCESS                       -->
<!-- ========================================================= -->

<a href="#before-opening-an-issue">
  <img
    src="https://img.shields.io/badge/BEFORE_OPENING-CHECK_FIRST-7C3AED?style=flat-square"
    alt="Before Opening an Issue"
  />
</a>
<a href="#quality-standard">
  <img
    src="https://img.shields.io/badge/QUALITY-ACTIONABLE-2563EB?style=flat-square"
    alt="Issue Quality"
  />
</a>
<a href="#triage">
  <img
    src="https://img.shields.io/badge/TRIAGE-REVIEWED-0EA5E9?style=flat-square"
    alt="Issue Triage"
  />
</a>
<a href="#workflow">
  <img
    src="https://img.shields.io/badge/WORKFLOW-MAINTAINED-14B8A6?style=flat-square"
    alt="Issue Workflow"
  />
</a>
<a href="#governance">
  <img
    src="https://img.shields.io/badge/GOVERNANCE-DEFINED-A855F7?style=flat-square"
    alt="Issue Governance"
  />
</a>

<br><br>

<!-- ========================================================= -->
<!--                       QUICK LINKS                         -->
<!-- ========================================================= -->

<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues">
  <img
    src="https://img.shields.io/badge/ISSUES-VIEW_ALL-181717?style=flat-square&logo=github&logoColor=white"
    alt="View Issues"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues/new/choose">
  <img
    src="https://img.shields.io/badge/NEW_ISSUE-CHOOSE_TEMPLATE-7C3AED?style=flat-square&logo=github&logoColor=white"
    alt="Create New Issue"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon">
  <img
    src="https://img.shields.io/badge/GITHUB-REPOSITORY-181717?style=flat-square&logo=github&logoColor=white"
    alt="Gaming Horizon Repository"
  />
</a>
<a href="https://thegaminghorizon.netlify.app/">
  <img
    src="https://img.shields.io/badge/WEBSITE-ENTER_THE_HORIZON-7C3AED?style=flat-square&logo=googlechrome&logoColor=white"
    alt="Gaming Horizon Website"
  />
</a>

<br><br>

<code>REPORT</code>
&nbsp; • &nbsp;
<code>REPRODUCE</code>
&nbsp; • &nbsp;
<code>DISCUSS</code>
&nbsp; • &nbsp;
<code>TRIAGE</code>
&nbsp; • &nbsp;
<code>RESOLVE</code>

<br><br>

</div>

---

<a id="overview"></a>

## ✦ Overview

The Gaming Horizon issue template system provides a structured way to report,
discuss, and track repository problems or improvement opportunities.

The system is designed to make every issue easier to understand by answering
the most important questions before maintainers begin investigation.

A useful issue should help establish:

```text
WHAT IS THE PROBLEM?
WHY DOES IT MATTER?
WHAT WAS EXPECTED?
WHAT ACTUALLY HAPPENED?
HOW CAN IT BE REPRODUCED?
WHAT PART OF GAMING HORIZON IS AFFECTED?
WHAT ADDITIONAL CONTEXT IS AVAILABLE?
```

Issue templates reduce incomplete reports and make repository maintenance more
efficient.

> [!IMPORTANT]
> An issue should provide enough information for someone unfamiliar with the
> original situation to understand what is being reported.

---

<a id="status"></a>

## ✦ Status

Current issue-template-system status:

```text
ACTIVE DEVELOPMENT
```

Current responsibilities include:

| Area | Status |
| --- | --- |
| Structured issue submission | Active |
| Bug reporting guidance | Defined |
| Feature discussion guidance | Defined |
| Documentation feedback | Defined |
| Improvement reporting | Defined |
| Security boundary | Defined |
| Issue quality standards | Active |
| Triage workflow | Active |
| Contributor guidance | Active |
| Governance | Active |

The available issue forms or template files may evolve as Gaming Horizon
develops.

This README defines the broader issue-management standard.

---

<a id="version"></a>

## ✦ Version

Current issue-system version:

```text
1.0.0
```

Version model:

```text
MAJOR.MINOR.PATCH
```

### Major

Used when the overall issue-management architecture changes substantially.

```text
1.0.0 → 2.0.0
```

Possible reasons:

```text
Major template-system redesign
New repository triage architecture
Complete issue classification redesign
Major governance change
```

### Minor

Used when meaningful new issue categories or reporting workflows are added.

```text
1.0.0 → 1.1.0
```

Possible reasons:

```text
New accessibility issue template
New documentation request workflow
New integration issue category
New structured issue form
```

### Patch

Used for smaller refinements.

```text
1.0.0 → 1.0.1
```

Possible reasons:

```text
Template wording improvement
README correction
Metadata update
Label adjustment
Relative-path correction
```

---

<a id="issue-system"></a>

## ✦ Issue System

The Gaming Horizon issue lifecycle can be represented as:

```text
                     USER / CONTRIBUTOR
                             │
                             ▼
                        ISSUE NEED
                             │
                             ▼
                     CHOOSE TEMPLATE
                             │
                             ▼
                      PROVIDE CONTEXT
                             │
                             ▼
                           SUBMIT
                             │
                             ▼
                          TRIAGE
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
              VALID      NEEDS INFO    DUPLICATE
                │
                ▼
             REVIEW
                │
                ▼
          IMPLEMENT / RESOLVE
                │
                ▼
               CLOSE
```

The exact labels or states used by the repository may evolve, but the general
principle remains the same:

> Issues should move from uncertainty toward a clear outcome.

---

<a id="templates"></a>

## ✦ Templates

Issue templates live inside:

```text
.github/ISSUE_TEMPLATE/
```

The exact active templates are defined by the files currently present in this
directory.

Templates may be designed for areas such as:

```text
BUG REPORTS
FEATURE REQUESTS
DOCUMENTATION FEEDBACK
IMPROVEMENTS
OTHER STRUCTURED REPORTS
```

Only templates that actually exist in the repository should be treated as
available submission options.

---

## ✦ Why Templates Exist

Without structure, an issue may contain only:

```text
"doesn't work"
```

A useful template encourages something closer to:

```text
AREA
EXPECTED RESULT
ACTUAL RESULT
REPRODUCTION
ENVIRONMENT
ADDITIONAL CONTEXT
```

That difference significantly improves issue investigation.

---

<a id="before-opening-an-issue"></a>

## ✦ Before Opening an Issue

Before submitting a new issue:

1. Search existing open issues.
2. Search relevant closed issues.
3. Confirm the problem still exists.
4. Confirm the repository is the correct place to report it.
5. Choose the most appropriate available template.
6. Collect useful reproduction information.
7. Remove private or sensitive information.
8. Write a clear title.
9. Provide enough context for review.
10. Review the completed issue before submitting.

---

## ✦ Search First

Before opening a duplicate report, check:

```text
OPEN ISSUES
CLOSED ISSUES
RELATED DISCUSSIONS
DOCUMENTATION
KNOWN LIMITATIONS
```

A related issue may already contain:

```text
STATUS
WORKAROUNDS
EXPLANATION
DEVELOPMENT PROGRESS
REQUESTED INFORMATION
```

If an existing issue already represents the same problem, contribute relevant
new information there instead of creating an unnecessary duplicate.

---

## ✦ Issue Titles

A good title should identify the problem quickly.

Prefer:

```text
Search command palette does not close after navigation
```

over:

```text
Search bug
```

Prefer:

```text
Developer settings page displays incorrect empty state
```

over:

```text
Page broken
```

A title should describe the issue without requiring the entire description to
understand its general purpose.

---

<a id="bug-reports"></a>

## ✦ Bug Reports

A bug report documents behavior that differs from the intended experience.

A strong report typically explains:

```text
SUMMARY
EXPECTED BEHAVIOR
ACTUAL BEHAVIOR
REPRODUCTION STEPS
ENVIRONMENT
SCREENSHOTS OR RECORDINGS WHEN USEFUL
ADDITIONAL CONTEXT
```

---

## ✦ Bug Definition

A bug generally means:

```text
EXPECTED BEHAVIOR
        ≠
ACTUAL BEHAVIOR
```

Examples may include:

```text
BROKEN INTERACTION
INCORRECT UI STATE
UNEXPECTED ERROR
MISSING CONTENT
FAILED NAVIGATION
BROKEN RESPONSIVE BEHAVIOR
ACCESSIBILITY PROBLEM
DEVELOPMENT REGRESSION
```

---

## ✦ Reproduction Steps

Good reproduction instructions are:

```text
SPECIFIC
ORDERED
REPEATABLE
MINIMAL
```

Example structure:

```text
1. Open the affected page.
2. Select the relevant control.
3. Perform the reported action.
4. Observe the resulting behavior.
```

Avoid adding unrelated actions that do not contribute to reproducing the
problem.

---

## ✦ Expected Behavior

Explain what you expected to happen.

Good:

```text
The selected panel should close after navigation completes.
```

Weak:

```text
It should work.
```

Specific expected behavior makes comparison easier.

---

## ✦ Actual Behavior

Describe what happened instead.

Include relevant:

```text
ERROR MESSAGE
UI STATE
BROKEN INTERACTION
VISUAL PROBLEM
CONSOLE INFORMATION
```

when it is useful and safe to share.

---

## ✦ Environment

Environment details can help identify browser-specific or device-specific
problems.

Where relevant, include:

```text
OPERATING SYSTEM
BROWSER
BROWSER VERSION
DEVICE TYPE
SCREEN SIZE
PROJECT VERSION
RELEVANT CONFIGURATION
```

Do not provide unnecessary personal device information.

---

<a id="feature-requests"></a>

## ✦ Feature Requests

Feature requests should begin with the problem or opportunity.

Recommended structure:

```text
PROBLEM
WHY IT MATTERS
PROPOSED DIRECTION
EXPECTED BENEFIT
ALTERNATIVES
ADDITIONAL CONTEXT
```

---

## ✦ Problem Before Solution

Prefer:

```text
Users currently need several actions to reach frequently used discovery tools.
A quicker access mechanism could reduce navigation friction.
```

instead of only:

```text
Add another button.
```

Understanding the problem creates room for better solutions.

---

## ✦ Feature Requests Are Proposals

Submitting a feature request does not guarantee:

```text
IMPLEMENTATION
PRIORITY
ROADMAP PLACEMENT
RELEASE DATE
ACCEPTANCE
```

Requests may be:

```text
ACCEPTED
DECLINED
DEFERRED
MERGED WITH ANOTHER IDEA
REQUIRING MORE DISCUSSION
```

based on project direction and feasibility.

---

## ✦ Scope

Feature proposals should align with Gaming Horizon's actual direction.

Gaming Horizon is a browser-first gaming ecosystem.

Requests should avoid assuming it is:

```text
A CLOUD GAMING SERVICE
A GAME STREAMING SERVER
A DESKTOP LAUNCHER
A DOWNLOAD CLIENT
A QUEUE-BASED STREAMING PLATFORM
```

unless future maintained project documentation explicitly changes that scope.

---

<a id="documentation"></a>

## ✦ Documentation Issues

Documentation feedback may involve:

```text
OUTDATED CONTENT
BROKEN LINKS
INCORRECT PATHS
UNCLEAR INSTRUCTIONS
MISSING EXPLANATIONS
FORMATTING PROBLEMS
ACCESSIBILITY ISSUES
INCONSISTENT TERMINOLOGY
```

Good documentation issues identify both:

```text
WHERE THE PROBLEM IS
```

and:

```text
WHAT NEEDS IMPROVEMENT
```

---

## ✦ Documentation Paths

When reporting a documentation problem, include the file path where possible.

Example:

```text
assets/screenshots/README.md
```

or:

```text
.github/PULL_REQUEST_TEMPLATE.md
```

This helps maintainers locate the problem quickly.

---

## ✦ Broken Links

When reporting a broken internal link, provide:

```text
SOURCE FILE
LINK OR BUTTON
EXPECTED DESTINATION
CURRENT RESULT
```

Gaming Horizon documentation relies heavily on relative paths, so accurate
location information is especially useful.

---

<a id="improvements"></a>

## ✦ Improvement Suggestions

Not every useful issue is a bug or feature request.

Improvement proposals may address:

```text
CODE QUALITY
DOCUMENTATION
REPOSITORY STRUCTURE
DEVELOPER EXPERIENCE
ACCESSIBILITY
PERFORMANCE
MAINTAINABILITY
AUTOMATION
UI CLARITY
CONTRIBUTOR EXPERIENCE
```

Explain:

```text
CURRENT SITUATION
PROPOSED IMPROVEMENT
WHY IT HELPS
POSSIBLE TRADE-OFFS
```

---

<a id="quality-standard"></a>

## ✦ Issue Quality Standard

A Gaming Horizon issue should ideally be:

```text
CLEAR
SPECIFIC
RELEVANT
ACTIONABLE
RESPECTFUL
SEARCHABLE
SAFE TO SHARE
```

---

## ✦ Clear

The issue should explain its purpose without unnecessary ambiguity.

---

## ✦ Specific

Identify the affected area.

Prefer:

```text
AI Companion suggestion panel
```

over:

```text
AI stuff
```

---

## ✦ Relevant

The issue should relate to:

```text
GAMING HORIZON
THE REPOSITORY
DOCUMENTATION
SUPPORTED PROJECT INFRASTRUCTURE
```

---

## ✦ Actionable

Provide enough information for someone to investigate or discuss the report.

---

## ✦ Respectful

Issue discussions must follow:

```text
../../CODE_OF_CONDUCT.md
```

Technical disagreement should remain focused on the work.

---

## ✦ Searchable

Use meaningful titles and terminology so future contributors can locate the
issue.

---

## ✦ Safe to Share

Review the issue carefully before posting it publicly.

---

<a id="attachments"></a>

## ✦ Screenshots & Attachments

Screenshots can be useful when reporting:

```text
UI BUGS
RESPONSIVE ISSUES
LAYOUT PROBLEMS
VISUAL REGRESSIONS
ERROR STATES
```

Before uploading, remove or hide:

```text
PERSONAL EMAILS
PHONE NUMBERS
PRIVATE MESSAGES
ACCESS TOKENS
API KEYS
PRIVATE URL PARAMETERS
ACCOUNT IDENTIFIERS
PASSWORDS
RECOVERY CODES
SESSION INFORMATION
```

---

## ✦ Code & Logs

When including code or logs:

- include only the relevant portion;
- remove secrets;
- use Markdown code blocks;
- preserve useful error context;
- avoid pasting enormous unrelated logs.

Example:

```text
Relevant error
↓
Small supporting log
↓
Reproduction context
```

is usually more useful than thousands of unrelated lines.

---

<a id="security"></a>

## ✦ Security Issues

Potential vulnerabilities require special handling.

Do **not** publish sensitive vulnerability details in a normal public issue
when public disclosure could increase risk.

Refer to:

```text
../../SECURITY.md
```

for the current Gaming Horizon security-reporting process.

---

## ✦ Never Put Secrets in Issues

Never publish:

```text
PASSWORDS
API KEYS
ACCESS TOKENS
PRIVATE KEYS
DATABASE CREDENTIALS
SUPABASE SERVICE ROLE KEYS
DEPLOYMENT SECRETS
WEBHOOK SECRETS
RECOVERY CODES
SESSION TOKENS
```

If a secret is accidentally exposed publicly, it should be treated as
compromised and handled according to the relevant security process.

---

## ✦ Security vs Bug Report

A normal bug might be:

```text
A button does not respond.
```

A security issue might involve:

```text
UNAUTHORIZED ACCESS
CREDENTIAL EXPOSURE
AUTHENTICATION BYPASS
SENSITIVE DATA DISCLOSURE
PRIVILEGE PROBLEMS
```

When unsure whether public disclosure is appropriate, use the repository's
security guidance first.

---

<a id="triage"></a>

## ✦ Issue Triage

Triage is the process of understanding and organizing newly submitted issues.

Typical triage questions include:

```text
IS THE ISSUE VALID?
CAN IT BE REPRODUCED?
IS MORE INFORMATION NEEDED?
IS IT A DUPLICATE?
WHAT AREA DOES IT AFFECT?
WHAT IS ITS IMPACT?
DOES IT BELONG IN THIS REPOSITORY?
```

---

## ✦ Possible Triage Outcomes

An issue may eventually be identified as:

```text
VALID
DUPLICATE
NEEDS INFORMATION
NOT REPRODUCIBLE
OUT OF SCOPE
PLANNED
DECLINED
RESOLVED
```

The repository's actual GitHub labels determine the formal labels used.

This README does not require every conceptual state above to exist as a label.

---

## ✦ Needs Information

If important details are missing, maintainers may request:

```text
REPRODUCTION STEPS
ENVIRONMENT
SCREENSHOTS
ERROR OUTPUT
EXPECTED BEHAVIOR
ADDITIONAL CONTEXT
```

Providing requested information helps the issue continue through triage.

---

## ✦ Duplicate Issues

If an issue duplicates an existing report, it may be closed or redirected.

Duplicate closure does not mean the problem is unimportant.

It keeps discussion centralized.

---

## ✦ Out-of-Scope Issues

An issue may be out of scope when it concerns something the Gaming Horizon
repository does not control or maintain.

Where possible, maintainers may explain why the report does not belong here.

---

## ✦ Priority

Issue priority should reflect project needs rather than who comments most often.

Factors may include:

```text
SEVERITY
USER IMPACT
SECURITY
REPRODUCIBILITY
PROJECT DIRECTION
IMPLEMENTATION COST
DEPENDENCIES
MAINTENANCE RISK
```

---

## ✦ Discussion

Issue comments should help move the report forward.

Useful comments may provide:

```text
NEW REPRODUCTION INFORMATION
TECHNICAL ANALYSIS
CONFIRMATION
ALTERNATIVE SOLUTIONS
ADDITIONAL CONTEXT
IMPLEMENTATION NOTES
```

Avoid comments that add no meaningful information.

---

## ✦ Staying on Topic

Keep discussion focused on the issue.

If a different problem is discovered, it may deserve a separate issue.

This keeps:

```text
HISTORY
DECISIONS
IMPLEMENTATION
RESOLUTION
```

easier to follow.

---

<a id="workflow"></a>

## ✦ Issue Workflow

Recommended lifecycle:

```text
SEARCH
  ↓
SELECT TEMPLATE
  ↓
WRITE
  ↓
REVIEW
  ↓
SUBMIT
  ↓
TRIAGE
  ↓
DISCUSS
  ↓
IMPLEMENT / RESOLVE
  ↓
VERIFY
  ↓
CLOSE
```

Not every issue requires code changes.

Some may be resolved through:

```text
DOCUMENTATION
EXPLANATION
CONFIGURATION
DESIGN DECISION
DUPLICATE IDENTIFICATION
SCOPE CLARIFICATION
```

---

## ✦ Issue States

| State | Meaning |
| --- | --- |
| `OPEN` | Issue remains unresolved |
| `TRIAGE` | Being reviewed or classified |
| `NEEDS INFORMATION` | Additional details are required |
| `PLANNED` | Accepted for future work |
| `IN PROGRESS` | Related work is underway |
| `BLOCKED` | Waiting on another requirement |
| `RESOLVED` | Problem has been addressed |
| `CLOSED` | Discussion or work is complete |

Actual repository labels may differ.

---

## ✦ Closing Issues

An issue may be closed when:

```text
THE PROBLEM IS FIXED
THE REQUEST IS COMPLETED
THE ISSUE IS DUPLICATE
THE ISSUE IS OUT OF SCOPE
THE REQUEST IS DECLINED
THE REPORT CANNOT PROGRESS
THE QUESTION HAS BEEN ANSWERED
```

Where practical, closure should include enough context to understand why.

---

## ✦ Linking Pull Requests

When code changes resolve an issue, the related pull request should reference
the issue where appropriate.

This creates a useful history:

```text
ISSUE
  ↓
DISCUSSION
  ↓
PULL REQUEST
  ↓
CODE CHANGE
  ↓
RESOLUTION
```

---

## ✦ Contributor Expectations

Issue participation should follow:

```text
../../CONTRIBUTING.md
```

and:

```text
../../CODE_OF_CONDUCT.md
```

Contributors are encouraged to:

```text
SEARCH BEFORE POSTING
USE THE RIGHT TEMPLATE
PROVIDE CONTEXT
RESPOND TO QUESTIONS
KEEP DISCUSSION RESPECTFUL
PROTECT PRIVATE INFORMATION
```

---

## ✦ Maintainer Expectations

Issue maintainers should aim for:

```text
CONSISTENT TRIAGE
CLEAR COMMUNICATION
REASONABLE CLASSIFICATION
RESPECTFUL REVIEW
TRACEABLE DECISIONS
```

Not every request can be implemented, but repository decisions should remain
understandable where practical.

---

<a id="governance"></a>

## ✦ Issue Governance

The issue system supports repository governance by creating a visible,
searchable history of:

```text
PROBLEMS
REQUESTS
DECISIONS
DISCUSSIONS
IMPLEMENTATION
RESOLUTION
```

This history can help future contributors understand why changes were made.

---

## ✦ Issue Integrity

Do not use issues to publish intentionally false claims about:

```text
PROJECT STATUS
PARTNERSHIPS
SPONSORS
SECURITY INCIDENTS
FEATURE AVAILABILITY
RELEASE INFORMATION
PROJECT OWNERSHIP
```

Reports should distinguish observation from assumption.

---

## ✦ Current Project Information

When an issue references changing project information, maintained repository
documentation should remain the authoritative source.

A historical issue may describe an earlier project state.

That does not automatically make its older information current.

---

## ✦ GitHub System Relationship

The issue system is part of:

```text
.github/
```

Parent documentation:

```text
../README.md
```

The wider GitHub repository system also includes:

```text
ISSUE_TEMPLATE/
workflows/
CODEOWNERS
FUNDING.yml
PULL_REQUEST_TEMPLATE.md
dependabot.yml
```

---

## ✦ Relative Paths

This README lives at:

```text
.github/ISSUE_TEMPLATE/README.md
```

Therefore:

### Official logo

```text
../../assets/branding/logos/gaming-horizon-logo-source.png
```

### GitHub README

```text
../README.md
```

### Repository README

```text
../../README.md
```

### Contributing

```text
../../CONTRIBUTING.md
```

### Code of Conduct

```text
../../CODE_OF_CONDUCT.md
```

### Security

```text
../../SECURITY.md
```

### License

```text
../../LICENSE
```

---

## ✦ Path Matrix

| Document | Official logo path |
| --- | --- |
| `/README.md` | `assets/branding/logos/gaming-horizon-logo-source.png` |
| `/.github/README.md` | `../assets/branding/logos/gaming-horizon-logo-source.png` |
| `/.github/ISSUE_TEMPLATE/README.md` | `../../assets/branding/logos/gaming-horizon-logo-source.png` |
| `/assets/README.md` | `branding/logos/gaming-horizon-logo-source.png` |

---

## ✦ Repository Policy Matrix

From:

```text
.github/ISSUE_TEMPLATE/README.md
```

use:

| Resource | Relative path |
| --- | --- |
| Repository README | `../../README.md` |
| GitHub System | `../README.md` |
| Contributing | `../../CONTRIBUTING.md` |
| Code of Conduct | `../../CODE_OF_CONDUCT.md` |
| Security | `../../SECURITY.md` |
| Privacy | `../../PRIVACY.md` |
| Terms | `../../TERMS.md` |
| Copyright | `../../COPYRIGHT.md` |
| Third-Party Notices | `../../THIRD-PARTY-NOTICES.md` |
| License | `../../LICENSE` |

---

<details>

<summary><strong>✦ Issue template troubleshooting</strong></summary>

<br>

If an issue template does not appear correctly on GitHub:

1. Confirm the file exists inside `.github/ISSUE_TEMPLATE/`.
2. Confirm the filename and extension.
3. Confirm the file exists on the default branch.
4. Validate YAML front matter or issue-form YAML where applicable.
5. Check indentation carefully.
6. Confirm required metadata is present.
7. Confirm the template is not intentionally disabled.
8. Review repository issue settings.
9. Test the **New issue** page.
10. Check GitHub documentation when using advanced issue-form features.

Issue template directory:

```text
.github/ISSUE_TEMPLATE/
```

</details>

---

## ✦ Template Design Standard

A Gaming Horizon issue template should be:

```text
SHORT ENOUGH TO COMPLETE
DETAILED ENOUGH TO INVESTIGATE
CLEARLY STRUCTURED
ACCESSIBLE
PURPOSEFUL
SAFE
```

Avoid templates containing dozens of fields that provide little value.

Every requested field should answer:

> **How will this information help review the issue?**

---

## ✦ Required vs Optional Information

Only make information required when it is genuinely necessary.

Useful required information may include:

```text
SUMMARY
DESCRIPTION
EXPECTED RESULT
ACTUAL RESULT
```

depending on the template.

Useful optional information may include:

```text
SCREENSHOTS
ADDITIONAL CONTEXT
RELATED ISSUES
POSSIBLE SOLUTION
```

The exact structure should match the issue category.

---

## ✦ Placeholder Guidance

Template placeholder text should explain what belongs in a field without
writing the issue for the contributor.

Good:

```text
Describe what you expected to happen.
```

Avoid:

```text
Write something here.
```

---

## ✦ Template Language

Use language that is:

```text
PROFESSIONAL
CLEAR
NEUTRAL
HELPFUL
CONCISE
```

Avoid:

```text
ACCUSATORY LANGUAGE
UNNECESSARY JARGON
VAGUE QUESTIONS
OVERLY COMPLEX INSTRUCTIONS
```

---

## ✦ Accessibility

Issue templates should remain usable with assistive technologies.

Prefer:

```text
CLEAR HEADINGS
DESCRIPTIVE LABELS
REAL TEXT
LOGICAL ORDER
UNDERSTANDABLE INSTRUCTIONS
```

Do not rely solely on:

```text
EMOJI
COLOR
DECORATIVE SYMBOLS
```

to communicate issue meaning.

---

## ✦ Privacy

GitHub issues are generally public in a public repository.

Before submitting, contributors should assume that issue content can be seen by
others.

Do not include information that should remain private.

---

## ✦ Issue Quality Gate

Before submitting an issue:

- [ ] Existing issues have been searched
- [ ] Appropriate template has been selected
- [ ] Title clearly describes the issue
- [ ] Description is understandable
- [ ] Relevant context is included
- [ ] Reproduction steps are included when applicable
- [ ] Expected behavior is clear when applicable
- [ ] Actual behavior is clear when applicable
- [ ] Screenshots are useful and safe
- [ ] Logs contain no secrets
- [ ] Personal information has been removed
- [ ] Security-sensitive details are not being publicly disclosed
- [ ] Discussion follows the Code of Conduct
- [ ] Report relates to Gaming Horizon
- [ ] Submission has been reviewed before posting

---

## ✦ Issue Golden Rules

### `01` — Search first

Avoid duplicate reports when an existing issue already covers the problem.

### `02` — Choose the right template

Use the submission path that best matches the issue.

### `03` — Write a clear title

The title should explain the problem at a glance.

### `04` — Provide context

Enough information should exist for investigation.

### `05` — Reproduce when possible

Repeatable bugs are easier to diagnose.

### `06` — Protect sensitive information

Public issues are not a place for credentials or secrets.

### `07` — Keep discussion focused

Stay on the issue being addressed.

### `08` — Respect contributors

Follow the Code of Conduct.

### `09` — Separate proposals from commitments

A feature request does not automatically become roadmap work.

### `10` — Close with clarity

Resolved or declined issues should remain understandable later.

---

## ✦ Issue System Standard

A Gaming Horizon issue should ultimately be:

| # | Standard | Meaning |
|:---:|---|---|
| `01` | **Clear** | Easy to understand |
| `02` | **Specific** | Identifies the affected area |
| `03` | **Actionable** | Provides useful investigation information |
| `04` | **Relevant** | Belongs to Gaming Horizon |
| `05` | **Searchable** | Uses meaningful titles and terminology |
| `06` | **Safe** | Contains no sensitive information |
| `07` | **Respectful** | Follows community standards |
| `08` | **Traceable** | Can connect discussion to resolution |
| `09` | **Truthful** | Distinguishes fact from assumption |
| `10` | **Maintainable** | Supports long-term repository history |

---

## ✦ Release Information

```text
SYSTEM          Gaming Horizon Issue Template System
VERSION         1.0.0
STATUS          Active Development
TYPE            GitHub Issue Infrastructure
PROJECT         Gaming Horizon
LOCATION        .github/ISSUE_TEMPLATE/
PARENT SYSTEM   .github/
REPOSITORY      The-Gaming-Horizon
```

---

<a id="license"></a>

## ✦ License & Repository Policies

Repository policy documents are located two directories above this README.

```text
../../LICENSE
../../COPYRIGHT.md
../../PRIVACY.md
../../SECURITY.md
../../TERMS.md
../../THIRD-PARTY-NOTICES.md
../../CONTRIBUTING.md
../../CODE_OF_CONDUCT.md
```

These documents remain authoritative for their respective policy areas.

---

<div align="center">

<br>

<img
  src="../../assets/branding/logos/gaming-horizon-logo-source.png"
  width="340"
  alt="Gaming Horizon Official Logo"
/>

<br><br>

<strong>GAMING HORIZON</strong>

<br>

<sub>Issue Template System · Version 1.0.0</sub>

<br><br>

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
<a href="#templates">
  <img
    src="https://img.shields.io/badge/TEMPLATES-STRUCTURED-8B5CF6?style=flat-square"
    alt="Structured Templates"
  />
</a>
<a href="#triage">
  <img
    src="https://img.shields.io/badge/TRIAGE-REVIEWED-2563EB?style=flat-square"
    alt="Issue Triage"
  />
</a>
<a href="#security">
  <img
    src="https://img.shields.io/badge/SECURITY-PRIVATE_REPORTING-0EA5E9?style=flat-square"
    alt="Private Security Reporting"
  />
</a>

<br><br>

<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues">
  <img
    src="https://img.shields.io/badge/ISSUES-VIEW_ALL-181717?style=flat-square&logo=github&logoColor=white"
    alt="View Issues"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon/issues/new/choose">
  <img
    src="https://img.shields.io/badge/NEW_ISSUE-CHOOSE_TEMPLATE-7C3AED?style=flat-square&logo=github&logoColor=white"
    alt="Create New Issue"
  />
</a>
<a href="https://github.com/thegaminghorizon/The-Gaming-Horizon">
  <img
    src="https://img.shields.io/badge/GITHUB-REPOSITORY-181717?style=flat-square&logo=github&logoColor=white"
    alt="Gaming Horizon Repository"
  />
</a>

<br><br>

<code>
REPORT · REPRODUCE · DISCUSS · TRIAGE · RESOLVE
</code>

<br><br>

<strong>
Report clearly. Discuss constructively. Resolve what comes next.
</strong>

<br><br>

<sub>
© 2026 Gaming Horizon · Beyond the Horizon
</sub>

<br><br>

</div>
