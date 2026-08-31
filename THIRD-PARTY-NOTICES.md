<!--
===============================================================================
                              THE GAMING HORIZON
                           THIRD-PARTY NOTICES
===============================================================================

                       THIRD-PARTY-NOTICES.md
                                 v1.0.0

===============================================================================

This document describes how third-party software, services, libraries,
assets, tools, integrations, and other external materials are handled
within The Gaming Horizon repository and ecosystem.

IMPORTANT:

- The root LICENSE applies only where legally applicable to Gaming Horizon
  repository materials covered by that license.
- Third-party materials remain subject to their own licenses, notices,
  terms, policies, and rights.
- This document must not invent dependency licenses or attribution notices.
- Exact third-party attribution requirements should be verified against
  the actual dependency and asset set before release.

Official Gaming Horizon launch:
1 January 2027

===============================================================================
-->

<a id="top"></a>

<div align="center">

<br>

<img
  src="assets/branding/logos/gaming-horizon-logo-source.png"
  width="470"
  alt="The Gaming Horizon Official Logo"
/>

<br><br>

# THE GAMING HORIZON — THIRD-PARTY NOTICES

### **Respect the Work That Makes the Horizon Possible.**

<br>

<a href="#status">
  <img src="https://img.shields.io/badge/STATUS-ACTIVE-7C3AED?style=flat-square" alt="Active">
</a>
<a href="#version">
  <img src="https://img.shields.io/badge/VERSION-1.0.0-6366F1?style=flat-square" alt="Version 1.0.0">
</a>
<a href="#software">
  <img src="https://img.shields.io/badge/DEPENDENCIES-REVIEW_REQUIRED-2563EB?style=flat-square" alt="Dependencies Review Required">
</a>
<a href="#licensing">
  <img src="https://img.shields.io/badge/LICENSES-PRESERVE_UPSTREAM-0EA5E9?style=flat-square" alt="Preserve Upstream Licenses">
</a>
<a href="#verification">
  <img src="https://img.shields.io/badge/ATTRIBUTION-VERIFY_BEFORE_RELEASE-181717?style=flat-square" alt="Verify Before Release">
</a>

<br><br>

<a href="LICENSE">
  <img src="https://img.shields.io/badge/READ-REPOSITORY_LICENSE-D22128?style=for-the-badge&logo=apache&logoColor=white" alt="Repository License">
</a>
<a href="COPYRIGHT.md">
  <img src="https://img.shields.io/badge/READ-COPYRIGHT-6366F1?style=for-the-badge" alt="Copyright">
</a>
<a href="BRAND.md">
  <img src="https://img.shields.io/badge/READ-BRAND_POLICY-7C3AED?style=for-the-badge" alt="Brand Policy">
</a>

<br><br>

<code>IDENTIFY</code>
&nbsp; • &nbsp;
<code>VERIFY</code>
&nbsp; • &nbsp;
<code>ATTRIBUTE</code>
&nbsp; • &nbsp;
<code>PRESERVE</code>
&nbsp; • &nbsp;
<code>REVIEW</code>
&nbsp; • &nbsp;
<code>UPDATE</code>

<br><br>

</div>

---

<a id="overview"></a>

## ✦ Overview

The Gaming Horizon is built using a combination of original project work and
third-party technologies, tools, services, libraries, standards, and other
external resources.

Those external materials may have their own:

```text
LICENSES

COPYRIGHT NOTICES

ATTRIBUTION REQUIREMENTS

TERMS OF SERVICE

PRIVACY POLICIES

BRAND RULES

USAGE CONDITIONS
```

These requirements remain separate from Gaming Horizon's own repository
policies.

---

<a id="status"></a>

## ✦ Status

Third-party notice system:

```text
ACTIVE
```

Project state:

```text
IN DEVELOPMENT
```

Current document version:

```text
1.0.0
```

Official Gaming Horizon launch:

```text
1 JANUARY 2027
```

---

<a id="version"></a>

## ✦ Version

```text
1.0.0
```

This is the version of the third-party notice documentation system.

It does not mean:

```text
ALL THIRD-PARTY DEPENDENCIES
HAVE BEEN PERMANENTLY FIXED
AT VERSION 1.0.0
```

Dependencies may evolve as the project develops.

---

## ✦ Core Principle

> **Use third-party work responsibly, preserve required notices, and never claim ownership of work that belongs to others.**

The basic process is:

```text
THIRD-PARTY MATERIAL
        │
        ▼
IDENTIFY SOURCE
        │
        ▼
VERIFY LICENSE / TERMS
        │
        ▼
UNDERSTAND OBLIGATIONS
        │
        ▼
PRESERVE REQUIRED NOTICE
        │
        ▼
USE APPROPRIATELY
        │
        ▼
REVIEW WHEN UPDATED
```

---

# REPOSITORY LICENSE BOUNDARY

<a id="repository-license"></a>

## ✦ Gaming Horizon Repository License

The root repository contains:

[`LICENSE`](LICENSE)

The repository license is:

```text
Apache License
Version 2.0
```

The authoritative legal text is the root `LICENSE` file.

---

## ✦ Apache 2.0 Does Not Replace Third-Party Licenses

The Gaming Horizon repository license does **not** automatically replace,
override, remove, or relicense third-party materials.

```text
GAMING HORIZON LICENSE
          │
          ▼
APPLIES WHERE LEGALLY
APPLICABLE TO GAMING
HORIZON MATERIAL
          │
          │
          └────────────── X
                          │
                          ▼
                    DOES NOT ERASE
                    THIRD-PARTY RIGHTS
```

If an external package uses a different license, that package remains subject
to its own license.

---

<a id="licensing"></a>

## ✦ Preserve Upstream Rights

When third-party material is included or distributed, required upstream
information should be preserved where applicable.

This may include:

```text
COPYRIGHT NOTICE

LICENSE FILE

NOTICE FILE

ATTRIBUTION

SOURCE INFORMATION

MODIFICATION NOTICE

OTHER REQUIRED LEGAL TEXT
```

What must be preserved depends on the specific upstream license.

---

# THIRD-PARTY CATEGORIES

<a id="categories"></a>

## ✦ Categories of Third-Party Material

Third-party material may appear in several different forms:

```text
SOFTWARE PACKAGES

FRAMEWORKS

LIBRARIES

BUILD TOOLS

DEVELOPMENT TOOLS

HOSTED SERVICES

DATABASE SERVICES

GITHUB AUTOMATION

ICONS

FONTS

IMAGES

MEDIA

DOCUMENTATION

CODE EXAMPLES

APIs

STANDARDS

INTEGRATIONS
```

Different categories require different review.

---

# SOFTWARE DEPENDENCIES

<a id="software"></a>

## ✦ JavaScript / Node.js Dependencies

The authoritative dependency manifests for the repository include:

```text
package.json

package-lock.json
```

These files should be treated as the primary source for identifying installed
Node.js packages and their resolved dependency graph.

---

## ✦ Do Not Maintain an Invented Dependency List

This document should not manually claim that a particular package is currently
used unless that claim is supported by the repository.

Use:

```text
package.json
```

for declared dependencies and development dependencies.

Use:

```text
package-lock.json
```

for the resolved dependency tree.

---

## ✦ Dependency Relationship

```text
package.json
     │
     ▼
DIRECT DEPENDENCIES
     │
     ▼
package-lock.json
     │
     ▼
DIRECT +
TRANSITIVE DEPENDENCIES
     │
     ▼
THIRD-PARTY LICENSE REVIEW
```

---

## ✦ Direct vs Transitive Dependencies

A package does not need to appear directly in `package.json` to become part of
the installed dependency tree.

```text
GAMING HORIZON
      │
      ▼
DIRECT PACKAGE
      │
      ▼
DEPENDENCY
      │
      ▼
TRANSITIVE PACKAGE
```

Third-party review should therefore consider both direct and transitive
dependencies when required.

---

# CONFIRMED TECHNOLOGY CONTEXT

<a id="confirmed-technology"></a>

## ✦ Confirmed Project Technologies

Current Gaming Horizon documentation confirms project use or configuration
around:

```text
NEXT.JS

TYPESCRIPT

NPM

SUPABASE MIGRATIONS

GITHUB ACTIONS

NETLIFY CONFIGURATION
```

These names identify technologies or services associated with the project.

They do **not** by themselves establish:

```text
A PARTICULAR LICENSE VERSION

A COMMERCIAL PARTNERSHIP

AN ENDORSEMENT

AN OFFICIAL SPONSORSHIP

A COMPLETE DEPENDENCY INVENTORY
```

---

## ✦ Technology Names

Product names, service names, company names, and other third-party identifiers
remain associated with their respective owners.

References in Gaming Horizon documentation are generally used to identify the
technology or service involved.

---

# NEXT.JS

<a id="nextjs"></a>

## ✦ Next.js

Gaming Horizon uses Next.js as part of its application foundation.

The exact installed version and dependency relationship should be verified
from:

```text
package.json

package-lock.json
```

Any required upstream licensing information should be derived from the actual
package version distributed or used by the project rather than being invented
in this file.

---

# TYPESCRIPT

<a id="typescript"></a>

## ✦ TypeScript

TypeScript is part of the confirmed Gaming Horizon development foundation.

Exact package/version details should be verified through the project
dependency manifests.

---

# NPM

<a id="npm"></a>

## ✦ npm

Gaming Horizon uses npm for package management.

The presence of npm package metadata does not imply that all packages share
the same license.

Each dependency can have its own licensing terms.

---

# SUPABASE

<a id="supabase"></a>

## ✦ Supabase

The repository contains Supabase migration infrastructure.

```text
supabase/migrations/
```

This confirms the presence of Supabase-related project infrastructure.

It should not automatically be interpreted as describing:

```text
ALL PRODUCTION SERVICES

ALL HOSTED DATA FLOWS

ALL SECURITY SETTINGS

ALL PRIVACY PROCESSING

A COMMERCIAL PARTNERSHIP
```

Relevant service terms and policies should be reviewed independently where
the hosted service is used.

---

# GITHUB

<a id="github"></a>

## ✦ GitHub

Gaming Horizon uses GitHub for repository hosting and repository operations.

The project includes GitHub-specific configuration under:

```text
.github/
```

GitHub system documentation:

[`.github/GITHUB-SYSTEM.md`](.github/GITHUB-SYSTEM.md)

GitHub's own services remain governed by GitHub's applicable terms and
policies.

---

# GITHUB ACTIONS

<a id="github-actions"></a>

## ✦ GitHub Actions

Workflow configuration is maintained under:

```text
.github/workflows/
```

Workflow documentation:

[`.github/workflows/README.md`](.github/workflows/README.md)

Individual third-party GitHub Actions, if introduced, should be reviewed for:

```text
SOURCE

LICENSE

MAINTENANCE

VERSION

PERMISSIONS

SECURITY

SUPPLY-CHAIN RISK
```

---

# NETLIFY

<a id="netlify"></a>

## ✦ Netlify

The repository contains:

```text
netlify.toml
```

This confirms Netlify-related deployment configuration.

It does not automatically establish:

```text
A PARTNERSHIP

SPONSORSHIP

ENDORSEMENT

SPECIFIC SERVICE PLAN

SPECIFIC DATA PROCESSING ARRANGEMENT
```

Hosted-service terms should be reviewed separately where applicable.

---

# THIRD-PARTY SERVICES

<a id="services"></a>

## ✦ Hosted Services Are Different From Software Dependencies

A hosted service is not necessarily distributed as repository source code.

```text
SOFTWARE PACKAGE
      │
      ▼
PACKAGE LICENSE


HOSTED SERVICE
      │
      ▼
SERVICE TERMS
+
PRIVACY POLICY
+
OTHER SERVICE CONDITIONS
```

Both may require review, but they are different legal relationships.

---

## ✦ Service Review

Before introducing an external hosted service, consider:

```text
WHAT DOES IT DO?

WHAT DATA DOES IT RECEIVE?

WHAT PERMISSIONS DOES IT NEED?

WHAT TERMS APPLY?

WHAT PRIVACY POLICY APPLIES?

WHAT SECURITY MODEL APPLIES?

CAN IT BE REMOVED?

WHAT HAPPENS IF IT FAILS?
```

---

# THIRD-PARTY ASSETS

<a id="assets"></a>

## ✦ Visual and Creative Assets

Third-party assets may include:

```text
IMAGES

ICONS

FONTS

ILLUSTRATIONS

VIDEO

AUDIO

TEXTURES

3D CONTENT

OTHER MEDIA
```

These must not automatically be treated as Apache-2.0 project assets.

---

## ✦ Asset Review

Before adding an external asset:

```text
IDENTIFY CREATOR / SOURCE
        │
        ▼
VERIFY PERMISSION
        │
        ▼
VERIFY LICENSE
        │
        ▼
ATTRIBUTION REQUIRED?
    ┌───┴───┐
    ▼       ▼
   YES      NO
    │       │
    ▼       ▼
RECORD      DOCUMENT
NOTICE      SOURCE
```

---

## ✦ Asset Documentation

Gaming Horizon asset documentation:

[`assets/README.md`](assets/README.md)

Brand documentation:

[`BRAND.md`](BRAND.md)

---

# FONTS

<a id="fonts"></a>

## ✦ Fonts

Font licensing must be reviewed separately from software licensing.

Before distributing or embedding a font, verify whether its license permits:

```text
WEB EMBEDDING

REDISTRIBUTION

MODIFICATION

COMMERCIAL USE

SUBSETTING

SELF-HOSTING
```

Do not assume that a freely downloadable font is free of licensing
requirements.

---

# ICONS

<a id="icons"></a>

## ✦ Icon Libraries

If third-party icon libraries are used, review the actual library's license
and any attribution requirements.

The existence of Gaming Horizon's own icon directory:

```text
assets/branding/icons/
```

does not imply that every icon used by the wider application is necessarily
owned by Gaming Horizon.

---

# IMAGES AND MEDIA

<a id="media"></a>

## ✦ Images, Video and Audio

Do not add media solely because it can be downloaded from the internet.

Before including external media, verify:

```text
OWNERSHIP

LICENSE

PERMISSION

ATTRIBUTION

MODIFICATION RIGHTS

DISTRIBUTION RIGHTS

COMMERCIAL USE RIGHTS
```

---

# SCREENSHOTS

<a id="screenshots"></a>

## ✦ Screenshots

Gaming Horizon screenshots are organized under:

```text
assets/screenshots/
```

Screenshots may incidentally contain:

```text
THIRD-PARTY PRODUCT NAMES

THIRD-PARTY GAME ART

EXTERNAL SERVICE UI

OTHER PROTECTED MATERIAL
```

A screenshot does not automatically transfer ownership of third-party material
shown within it.

---

# SHOWCASE MATERIAL

<a id="showcase"></a>

## ✦ Showcase

Conceptual showcase material is maintained separately under:

```text
assets/showcase/
```

Project truth:

```text
SHOWCASE
    ≠
SCREENSHOT
```

Third-party material appearing in showcase artwork still requires appropriate
rights or permission.

---

# BRAND NAMES AND MARKS

<a id="marks"></a>

## ✦ Third-Party Names and Marks

Names, logos, trademarks, service marks, and other brand identifiers belonging
to third parties remain associated with their respective owners.

References to third-party products or services do not automatically imply:

```text
ENDORSEMENT

SPONSORSHIP

AFFILIATION

PARTNERSHIP
```

---

## ✦ Gaming Horizon Brand Boundary

Gaming Horizon's own brand policy is documented in:

[`BRAND.md`](BRAND.md)

The project's Apache 2.0 repository license should not automatically be
interpreted as unrestricted permission to impersonate Gaming Horizon or misuse
its branding.

---

# THIRD-PARTY CODE

<a id="code"></a>

## ✦ Copied or Adapted Code

If code is copied, adapted, translated, or substantially derived from an
external source:

```text
IDENTIFY ORIGINAL SOURCE

VERIFY LICENSE

PRESERVE REQUIRED NOTICES

DOCUMENT MODIFICATION WHERE REQUIRED

FOLLOW ATTRIBUTION CONDITIONS
```

Do not remove notices simply to make code appear original.

---

## ✦ Small Examples and Documentation Snippets

Even examples from documentation can have licensing terms.

When substantially reusing external examples, verify:

```text
SOURCE LICENSE

DOCUMENTATION LICENSE

COPYRIGHT NOTICE

ATTRIBUTION REQUIREMENTS
```

---

# CONTRIBUTIONS

<a id="contributions"></a>

## ✦ Contributor Responsibility

Contributors should submit only material they have the right to contribute.

Read:

[`CONTRIBUTING.md`](CONTRIBUTING.md)

Contributors should not knowingly submit:

```text
UNLICENSED THIRD-PARTY CODE

PIRATED ASSETS

COPYRIGHTED MEDIA WITHOUT PERMISSION

PROPRIETARY SOURCE CODE

CONFIDENTIAL THIRD-PARTY MATERIAL

IMPROPERLY COPIED DOCUMENTATION
```

---

## ✦ Contribution Review

Before accepting external material:

```text
SOURCE KNOWN?
     │
     ▼
RIGHTS KNOWN?
     │
     ▼
LICENSE COMPATIBLE?
     │
     ▼
NOTICE REQUIRED?
     │
     ▼
SAFE TO INCLUDE?
```

---

# DEPENDENCY REVIEW

<a id="dependency-review"></a>

## ✦ Before Adding a Dependency

Review:

```text
PURPOSE

MAINTAINER

LICENSE

VERSION

SECURITY HISTORY

TRANSITIVE DEPENDENCIES

PACKAGE SIZE

MAINTENANCE STATUS

ALTERNATIVES

ACTUAL NEED
```

---

## ✦ Dependency Decision Flow

```text
NEW DEPENDENCY
      │
      ▼
REAL NEED?
   ┌──┴──┐
   ▼     ▼
  YES    NO
   │     │
   ▼     └──────────────► DO NOT ADD
LICENSE IDENTIFIED?
   │
   ▼
SECURITY ACCEPTABLE?
   │
   ▼
MAINTAINED?
   │
   ▼
TRANSITIVE IMPACT?
   │
   ▼
APPROPRIATE?
   │
   ▼
ADD + LOCK
```

---

# LICENSE COMPATIBILITY

<a id="compatibility"></a>

## ✦ License Compatibility

A third-party package being open source does not automatically mean it is
compatible with every project use.

Questions may include:

```text
CAN IT BE REDISTRIBUTED?

CAN IT BE MODIFIED?

IS ATTRIBUTION REQUIRED?

IS SOURCE DISCLOSURE REQUIRED?

IS A NOTICE FILE REQUIRED?

DOES IT AFFECT DERIVATIVE WORKS?

DOES DISTRIBUTION CHANGE OBLIGATIONS?
```

When uncertain, obtain appropriate legal or licensing review rather than
guessing.

---

# COPYRIGHT NOTICES

<a id="copyright"></a>

## ✦ Copyright

Third-party copyright notices must not be removed where preservation is
required.

Gaming Horizon copyright guidance:

[`COPYRIGHT.md`](COPYRIGHT.md)

```text
GAMING HORIZON COPYRIGHT
           ≠
OWNERSHIP OF
THIRD-PARTY MATERIAL
```

---

# NOTICE FILES

<a id="notice-files"></a>

## ✦ Upstream NOTICE Requirements

Some dependencies may provide a file such as:

```text
NOTICE
```

or equivalent attribution information.

Where an upstream license requires preservation or redistribution of notice
content, those obligations should be followed.

This repository should not create fabricated NOTICE content merely to appear
complete.

---

# SOURCE DISTRIBUTION

<a id="distribution"></a>

## ✦ Distribution Changes Obligations

A dependency used only during development may have different practical notice
requirements from a dependency redistributed with a production artifact.

Review should distinguish:

```text
DEVELOPMENT USE

BUILD-TIME USE

SERVER-SIDE USE

CLIENT-SIDE DISTRIBUTION

BUNDLED DISTRIBUTION

SOURCE REDISTRIBUTION
```

The applicable license remains authoritative.

---

# DEVELOPMENT DEPENDENCIES

<a id="development-dependencies"></a>

## ✦ Development-Only Packages

Development dependencies may include:

```text
LINTERS

FORMATTERS

COMPILERS

TYPE TOOLS

TESTING TOOLS

BUILD TOOLS
```

Even when not included in a final production bundle, their licenses still
apply to their use and redistribution where relevant.

---

# CLIENT-SIDE DEPENDENCIES

<a id="client-dependencies"></a>

## ✦ Browser-Delivered Code

Because Gaming Horizon is browser-first, particular attention should be given
to code delivered to users' browsers.

```text
DEPENDENCY
    │
    ▼
BUNDLED?
    │
    ▼
DELIVERED TO USER?
    │
    ▼
REDISTRIBUTION / NOTICE
REVIEW WHERE REQUIRED
```

---

# GENERATED CONTENT

<a id="generated"></a>

## ✦ Generated and AI-Assisted Material

AI-assisted or generated material should not automatically be assumed to be
free from third-party rights concerns.

Before including generated content in official project assets, consider:

```text
SOURCE MATERIAL

THIRD-PARTY RIGHTS

BRAND ELEMENTS

COPYRIGHTED CHARACTERS

LOGOS

ATTRIBUTION

PLATFORM TERMS
```

AI documentation:

[`docs/AI.md`](docs/AI.md)

---

# EXTERNAL DOCUMENTATION

<a id="external-documentation"></a>

## ✦ Third-Party Documentation

External documentation may be linked for technical reference.

A link does not transfer ownership of that documentation to Gaming Horizon.

Do not copy substantial external documentation into the repository unless the
applicable license permits it.

---

# STANDARDS

<a id="standards"></a>

## ✦ Standards and Specifications

Technical standards may have their own copyright, licensing, or publication
conditions.

References to standards should identify them accurately without implying that
Gaming Horizon authored the standard.

---

# EXTERNAL LINKS

<a id="external-links"></a>

## ✦ External Links

Gaming Horizon documentation may link to third-party websites.

External links are provided for context, navigation, or technical reference.

Gaming Horizon does not automatically control:

```text
THIRD-PARTY CONTENT

THIRD-PARTY SECURITY

THIRD-PARTY PRIVACY

THIRD-PARTY AVAILABILITY

THIRD-PARTY TERMS
```

---

# SECURITY

<a id="security"></a>

## ✦ Third-Party Security

Every external dependency or service expands the project's trust surface.

Security policy:

[`SECURITY.md`](SECURITY.md)

Review third-party components for:

```text
KNOWN VULNERABILITIES

MAINTENANCE STATUS

SUPPLY-CHAIN RISK

COMPROMISED PACKAGES

EXCESSIVE PERMISSIONS

UNNECESSARY NETWORK ACCESS
```

---

# PRIVACY

<a id="privacy"></a>

## ✦ Third-Party Privacy

Third-party services may receive information depending on how they are
integrated.

Privacy policy:

[`PRIVACY.md`](PRIVACY.md)

Before introducing a service that processes user information, determine:

```text
WHAT DATA IS SENT?

WHY IS IT SENT?

IS IT NECESSARY?

WHERE IS IT PROCESSED?

WHAT TERMS APPLY?

WHAT PRIVACY POLICY APPLIES?

CAN THE DATA FLOW BE REDUCED?
```

Do not infer actual personal-data flows solely from the existence of a package
or configuration file.

---

# SERVICE TERMS

<a id="service-terms"></a>

## ✦ External Terms of Service

Third-party platforms used by Gaming Horizon may impose their own operating
rules.

Using a third-party API or service may require compliance with:

```text
TERMS OF SERVICE

DEVELOPER TERMS

API RULES

RATE LIMITS

BRAND GUIDELINES

PRIVACY REQUIREMENTS

CONTENT RULES
```

These obligations are separate from open-source package licenses.

---

# ATTRIBUTION

<a id="attribution"></a>

## ✦ Attribution Standard

When attribution is required, it should be:

```text
ACCURATE

READABLE

TRACEABLE TO THE SOURCE

CONSISTENT WITH THE LICENSE

NOT MISLEADING
```

Do not fabricate attribution merely because a dependency exists.

---

## ✦ Attribution Record

Where useful, future verified notices may record:

| Field | Purpose |
| --- | --- |
| Component | Package, asset, service, or resource |
| Source | Upstream project or provider |
| Version | Version actually used |
| License | Verified upstream license |
| Copyright | Verified upstream notice |
| Attribution | Required attribution text |
| Location | Where the material is used |
| Notes | Relevant redistribution requirements |

Only verified data should be entered.

---

# VERIFICATION

<a id="verification"></a>

## ✦ Pre-Release Third-Party Review

Before public production release, perform a dependency and asset review against
the actual repository state.

Review:

```text
package.json

package-lock.json

APPLICATION SOURCE

PUBLIC ASSETS

BRANDING ASSETS

SCREENSHOTS

SHOWCASE MATERIAL

GITHUB ACTIONS

HOSTED SERVICE CONFIGURATION

DATABASE / SERVICE INTEGRATIONS
```

---

## ✦ Verification Checklist

- [ ] Direct dependencies identified
- [ ] Relevant transitive dependencies identified
- [ ] Installed versions verified
- [ ] Licenses verified from authoritative package metadata or upstream sources
- [ ] Required copyright notices preserved
- [ ] Required NOTICE files preserved
- [ ] Attribution obligations identified
- [ ] Client-distributed packages reviewed
- [ ] Third-party GitHub Actions reviewed
- [ ] Fonts reviewed
- [ ] Icons reviewed
- [ ] Images reviewed
- [ ] Audio/video reviewed where applicable
- [ ] External code examples reviewed
- [ ] Hosted services reviewed separately from packages
- [ ] Service terms reviewed where applicable
- [ ] Privacy impact reviewed
- [ ] Security impact reviewed
- [ ] Incompatible or unclear material resolved before release

---

# AUTOMATED LICENSE SCANNING

<a id="automation"></a>

## ✦ Automation May Assist Review

Automated tools may help inventory dependency licenses.

However:

```text
AUTOMATED LICENSE RESULT
          ≠
FINAL LEGAL DETERMINATION
```

Automation may miss:

```text
CUSTOM LICENSE FILES

DUAL LICENSING

NOTICE REQUIREMENTS

ASSET LICENSES

SERVICE TERMS

CODE COPIED OUTSIDE PACKAGE MANAGEMENT
```

Human review remains important.

---

# DEPENDENCY UPDATES

<a id="updates"></a>

## ✦ Review Again When Dependencies Change

```text
DEPENDENCY UPDATE
       │
       ▼
NEW VERSION
       │
       ▼
LICENSE CHANGED?
       │
       ▼
NOTICE CHANGED?
       │
       ▼
SECURITY CHANGED?
       │
       ▼
REVIEW
```

Dependabot configuration:

```text
.github/dependabot.yml
```

Dependency automation does not replace licensing review.

---

# REMOVING A DEPENDENCY

<a id="removal"></a>

## ✦ Removal

When removing third-party material:

```text
REMOVE CODE

REMOVE UNUSED ASSETS

REMOVE CONFIGURATION

REMOVE OBSOLETE NOTICES
ONLY WHEN NO LONGER REQUIRED

VERIFY BUILD

VERIFY DOCUMENTATION
```

Do not remove legally required notices while corresponding material remains
distributed.

---

# THIRD-PARTY CLAIMS

<a id="claims"></a>

## ✦ Rights Concerns

If someone believes Gaming Horizon contains material that improperly uses
third-party rights, the concern should be reviewed carefully.

Useful information may include:

```text
IDENTIFICATION OF THE MATERIAL

LOCATION IN THE REPOSITORY OR PLATFORM

ORIGINAL SOURCE

RIGHTS INFORMATION

RELEVANT LICENSE OR OWNERSHIP CONTEXT

REQUESTED REVIEW
```

Support:

[`SUPPORT.md`](SUPPORT.md)

---

# NO IMPLIED ENDORSEMENT

<a id="endorsement"></a>

## ✦ External Technology Is Not Automatic Endorsement

Use of or reference to third-party technologies does not automatically mean
that the third party:

```text
SPONSORS GAMING HORIZON

ENDORSES GAMING HORIZON

PARTNERS WITH GAMING HORIZON

CERTIFIES GAMING HORIZON

APPROVES GAMING HORIZON
```

Likewise, Gaming Horizon's use of a technology does not necessarily represent
an endorsement of every product or service offered by its provider.

---

# PROJECT TRUTH

<a id="truth"></a>

## ✦ Third-Party Truth Standards

Do not claim:

```text
OFFICIAL PARTNER

OFFICIAL SPONSOR

CERTIFIED BY

SUPPORTED BY

ENDORSED BY

POWERED BY
```

unless that relationship is actually established and the wording is permitted.

---

## ✦ Documentation Truth

```text
PACKAGE INSTALLED
       ≠
PARTNERSHIP


CONFIGURATION FILE
       ≠
COMMERCIAL AGREEMENT


SERVICE INTEGRATION
       ≠
ENDORSEMENT


OPEN SOURCE
       ≠
NO LICENSE


PUBLICLY AVAILABLE
       ≠
FREE TO REDISTRIBUTE
```

---

# RESPONSIBILITY MODEL

<a id="responsibility"></a>

## ✦ Third-Party Responsibility

```text
CONTRIBUTOR
    │
    ▼
IDENTIFY SOURCE
    │
    ▼
MAINTAINER REVIEW
    │
    ▼
LICENSE / RIGHTS CHECK
    │
    ▼
SECURITY / PRIVACY CHECK
    │
    ▼
INCLUDE RESPONSIBLY
    │
    ▼
PRESERVE NOTICE
```

---

# THIRD-PARTY NOTICE ARCHITECTURE

<a id="architecture"></a>

## ✦ System Relationship

```text
                         THIRD-PARTY MATERIAL
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
             SOFTWARE          SERVICES          ASSETS
                 │                │                │
                 ▼                ▼                ▼
              LICENSE           TERMS            RIGHTS
                 │                │                │
                 └────────────────┼────────────────┘
                                  ▼
                           PROJECT REVIEW
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
             SECURITY          PRIVACY         COPYRIGHT
                 │                │                │
                 └────────────────┼────────────────┘
                                  ▼
                       THIRD-PARTY NOTICES
```

---

# RELATED DOCUMENTATION

<a id="related"></a>

## ✦ Related Documentation

| Area | Document |
| --- | --- |
| Main Project | [`README.md`](README.md) |
| Repository License | [`LICENSE`](LICENSE) |
| Copyright | [`COPYRIGHT.md`](COPYRIGHT.md) |
| Brand | [`BRAND.md`](BRAND.md) |
| Terms | [`TERMS.md`](TERMS.md) |
| Privacy | [`PRIVACY.md`](PRIVACY.md) |
| Security | [`SECURITY.md`](SECURITY.md) |
| Support | [`SUPPORT.md`](SUPPORT.md) |
| Contributing | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Code of Conduct | [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) |
| Documentation | [`docs/README.md`](docs/README.md) |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Developers | [`docs/DEVELOPERS.md`](docs/DEVELOPERS.md) |
| AI | [`docs/AI.md`](docs/AI.md) |
| Assets | [`assets/README.md`](assets/README.md) |
| Branding | [`assets/branding/README.md`](assets/branding/README.md) |
| Screenshots | [`assets/screenshots/README.md`](assets/screenshots/README.md) |
| Showcase | [`assets/showcase/README.md`](assets/showcase/README.md) |
| GitHub System | [`.github/GITHUB-SYSTEM.md`](.github/GITHUB-SYSTEM.md) |
| Workflows | [`.github/workflows/README.md`](.github/workflows/README.md) |

---

# MAINTENANCE

<a id="maintenance"></a>

## ✦ Maintaining This Document

Update this document when meaningful changes occur to:

```text
DEPENDENCY POLICY

ATTRIBUTION REQUIREMENTS

ASSET SOURCING

THIRD-PARTY SERVICES

LICENSE REVIEW PROCESS

PROJECT DISTRIBUTION MODEL
```

Exact third-party package notices should be updated when the actual dependency
set requires them.

---

## ✦ Review Triggers

Review third-party obligations when:

```text
NEW DEPENDENCY ADDED

DEPENDENCY MAJOR VERSION CHANGES

LICENSE CHANGES

NEW ASSET ADDED

NEW FONT ADDED

NEW THIRD-PARTY SERVICE ADDED

NEW API INTEGRATION ADDED

NEW GITHUB ACTION ADDED

DISTRIBUTION MODEL CHANGES

PUBLIC RELEASE PREPARATION BEGINS
```

---

# PRE-LAUNCH REVIEW

<a id="pre-launch"></a>

## ✦ Before 1 January 2027

Before official launch, complete a real third-party inventory based on the
actual production repository and deployed platform.

```text
CURRENT REPOSITORY
       │
       ▼
DEPENDENCY INVENTORY
       │
       ▼
ASSET INVENTORY
       │
       ▼
SERVICE INVENTORY
       │
       ▼
LICENSE VERIFICATION
       │
       ▼
ATTRIBUTION REVIEW
       │
       ▼
SECURITY REVIEW
       │
       ▼
PRIVACY REVIEW
       │
       ▼
FINAL NOTICE SET
       │
       ▼
LAUNCH
```

Official launch:

```text
1 JANUARY 2027
```

---

# THIRD-PARTY REVIEW CHECKLIST

<a id="checklist"></a>

## ✦ Repository Review

- [ ] `package.json` reviewed
- [ ] `package-lock.json` reviewed
- [ ] Direct dependencies identified
- [ ] Relevant transitive dependencies reviewed
- [ ] License metadata verified
- [ ] Required notices preserved
- [ ] GitHub Actions reviewed
- [ ] Copied external code reviewed

---

## ✦ Asset Review

- [ ] Logos reviewed
- [ ] Icons reviewed
- [ ] Banners reviewed
- [ ] Fonts reviewed
- [ ] Images reviewed
- [ ] Screenshots reviewed
- [ ] Showcase assets reviewed
- [ ] Video/audio reviewed where applicable
- [ ] Attribution requirements documented

---

## ✦ Service Review

- [ ] External hosted services identified
- [ ] Service terms reviewed
- [ ] Privacy policies reviewed
- [ ] Data flows reviewed
- [ ] Security implications reviewed
- [ ] Branding requirements reviewed
- [ ] No false partnership claims introduced

---

## ✦ Release Review

- [ ] Final dependency set confirmed
- [ ] Final asset set confirmed
- [ ] Final service set confirmed
- [ ] Third-party notices accurate
- [ ] No invented license information remains
- [ ] Required attribution is visible where necessary
- [ ] Repository `LICENSE` remains unmodified
- [ ] Brand rights remain separately documented
- [ ] Copyright documentation is consistent
- [ ] Legal review obtained where necessary

---

# OFFICIAL NETWORK

<a id="network"></a>

## ✦ Official Gaming Horizon Network

| Destination | Address |
| --- | --- |
| Website | `https://thegaminghorizon.netlify.app/` |
| Support Us | `https://thegaminghorizon.netlify.app/support-us` |
| GitHub | `https://github.com/thegaminghorizon` |
| Repository | `https://github.com/thegaminghorizon/The-Gaming-Horizon` |
| Discord | `https://discord.gg/M5PeNThBwF` |
| X | `https://x.com/gamingshorizon` |
| Instagram | `https://www.instagram.com/thegaminghorizon/` |

Network documentation:

[`docs/NETWORK.md`](docs/NETWORK.md)

---

# THIRD-PARTY NOTICE SUMMARY

<a id="summary"></a>

## ✦ At a Glance

```text
┌────────────────────────────────────────────────────────────────┐
│              THE GAMING HORIZON — THIRD PARTY                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                  THIRD-PARTY MATERIAL                          │
│                           │                                    │
│            ┌──────────────┼──────────────┐                     │
│            ▼              ▼              ▼                     │
│         SOFTWARE       SERVICES         ASSETS                 │
│            │              │              │                     │
│            ▼              ▼              ▼                     │
│         LICENSE         TERMS           RIGHTS                 │
│            │              │              │                     │
│            └──────────────┼──────────────┘                     │
│                           ▼                                    │
│                        VERIFY                                  │
│                           │                                    │
│                           ▼                                    │
│                       ATTRIBUTE                                │
│                           │                                    │
│                           ▼                                    │
│                        PRESERVE                                │
│                           │                                    │
│                           ▼                                    │
│                         REVIEW                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## ✦ Third-Party Notice System

```text
PROJECT          THE GAMING HORIZON

DOCUMENT         THIRD-PARTY-NOTICES.md

VERSION          1.0.0

STATUS           ACTIVE

PROJECT LICENSE  APACHE LICENSE 2.0

DEPENDENCIES     package.json
                 package-lock.json

TECH CONTEXT     NEXT.JS
                 TYPESCRIPT
                 NPM
                 SUPABASE MIGRATIONS
                 GITHUB ACTIONS
                 NETLIFY CONFIGURATION

SOFTWARE         VERIFY PACKAGE LICENSES

SERVICES         VERIFY SERVICE TERMS

ASSETS           VERIFY RIGHTS / ATTRIBUTION

BRANDS           NO IMPLIED ENDORSEMENT

SECURITY         SECURITY.md

PRIVACY          PRIVACY.md

COPYRIGHT        COPYRIGHT.md

BRAND            BRAND.md

GITHUB SYSTEM    .github/GITHUB-SYSTEM.md

OFFICIAL LAUNCH  1 JANUARY 2027
```

---

<a id="final-principle"></a>

## ✦ Final Principle

The Gaming Horizon can build on the work of others without pretending that
work belongs to Gaming Horizon.

```text
IDENTIFY THE SOURCE.

VERIFY THE RIGHTS.

UNDERSTAND THE LICENSE.

PRESERVE THE NOTICE.

RESPECT ATTRIBUTION.

REVIEW SERVICES
SEPARATELY.

DO NOT INVENT
LEGAL INFORMATION.

DO NOT CLAIM
PARTNERSHIPS THAT
DO NOT EXIST.

UPDATE NOTICES
WHEN THE PROJECT
CHANGES.
```

Open source does not mean ownerless.

Publicly available does not mean unrestricted.

Using a technology does not create a partnership.

Respecting those boundaries is part of building Gaming Horizon responsibly.

---

<div align="center">

<br>

<img
  src="assets/branding/logos/gaming-horizon-logo-source.png"
  width="330"
  alt="The Gaming Horizon Official Logo"
/>

<br><br>

<strong>THE GAMING HORIZON — THIRD-PARTY NOTICES</strong>

<br>

<sub>Third-Party Notice System · Version 1.0.0</sub>

<br><br>

<code>
IDENTIFY · VERIFY · ATTRIBUTE · PRESERVE · REVIEW · UPDATE
</code>

<br><br>

<strong>
Respect the work that makes the Horizon possible.
</strong>

<br><br>

<strong>
Third-party materials remain subject to their own rights and licenses.
</strong>

<br><br>

<strong>
There is always another world beyond the horizon.
</strong>

<br><br>

</div>
