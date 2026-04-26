# Document Feature

Generate comprehensive technical and user-facing documentation for a new feature. Analyzes relevant code, detects the feature stack type, and outputs two polished documentation files.

## Usage
```
/document-feature feature-name="<FeatureName>" [feature-path="<optional/path/to/feature>"]
```

**Examples:**
```
/document-feature feature-name="PasswordReset"
/document-feature feature-name="OrderTracking" feature-path="src/features/orders"
```

---

## Instructions

You are a senior documentation engineer. Your task is to generate two documentation files for the feature: **$ARGUMENTS**.

Parse the arguments to extract:
- `feature-name`: The name of the feature (required)
- `feature-path`: Optional path hint to locate relevant code (optional)

Then follow these steps precisely:

---

### Step 1 — Resolve the Feature Name

Convert `feature-name` to the following formats and store them for later use:
- **PascalCase**: e.g., `PasswordReset`
- **kebab-case**: e.g., `password-reset`
- **Title Case with spaces**: e.g., `Password Reset`
- **snake_case**: e.g., `password_reset`

---

### Step 2 — Discover and Analyze Relevant Code

Search the codebase for files related to the feature. Use a multi-pass strategy:

**Pass 1 — Direct path (if provided):**
If `feature-path` was given, list all files in that directory.

**Pass 2 — Pattern-based search:**
Search for files matching any of these patterns (use `find` and `grep` as needed):
- Filenames containing the feature name in any case variant
- Files importing or referencing the feature name as a string or symbol
- Route definitions, API endpoint strings, or config keys mentioning the feature

**Pass 3 — Entry points:**
Look for the feature in:
- `src/routes/`, `src/pages/`, `src/views/` (frontend routing)
- `src/api/`, `src/controllers/`, `src/handlers/`, `src/services/` (backend)
- `src/features/`, `src/modules/`, `src/components/` (modular structures)
- Any framework-specific directories (`app/`, `pages/`, `routes/`)

Read all relevant files and build a complete understanding of:
- What the feature does
- How it is invoked (UI action, API call, background job, etc.)
- Its inputs, outputs, and side effects
- Dependencies (libraries, services, database models, external APIs)
- Error handling patterns
- Auth/permission requirements
- Any tests that describe expected behavior

---

### Step 3 — Detect Stack Type

Based on the files found, classify the feature as one of:

| Stack Type | Classification Criteria |
|---|---|
| **frontend-only** | Only UI components, no server-side handlers |
| **backend-only** | Only API routes, services, jobs — no UI code |
| **full-stack** | Both UI and server-side code present |
| **infrastructure** | CI/CD, IaC, config, observability-related |

Store the detected stack type. It will influence what sections appear in each doc.

---

### Step 4 — Discover Existing Documentation Patterns

Before writing, inspect the project's existing docs to match conventions:

```bash
# Check for existing docs directories
ls docs/ 2>/dev/null || ls documentation/ 2>/dev/null || ls .docs/ 2>/dev/null

# Check existing developer docs for formatting style
ls docs/dev/ 2>/dev/null | head -5

# Check existing user docs
ls docs/user/ 2>/dev/null | head -5

# Look for a documentation style guide or template
find . -name "*.md" -path "*/docs/*" | head -3 | xargs head -30 2>/dev/null
```

Adopt the heading style, frontmatter format, link format, and terminology found in existing docs. If no docs exist yet, use the templates defined in Steps 5 and 6 as-is.

---

### Step 5 — Search for Related Documentation

Find any existing documentation that should be cross-referenced:

```bash
# Search existing markdown files for mentions of this feature
grep -ril "<feature-name-kebab>" docs/ 2>/dev/null
grep -ril "<feature-name-kebab>" README.md 2>/dev/null

# Find sibling features that are likely related
ls docs/dev/ 2>/dev/null
ls docs/user/ 2>/dev/null
```

Collect the paths of any related docs — you will link to them in both output files.

---

### Step 6 — Generate Developer Documentation

Create the file: `docs/dev/<feature-name-kebab>-implementation.md`

Use this structure (adapt sections based on detected stack type):

```markdown
---
title: <Feature Title Case> — Developer Reference
feature: <feature-name-kebab>
stack: <detected stack type>
created: <today's date ISO 8601>
updated: <today's date ISO 8601>
status: draft
---

# <Feature Title Case> — Developer Reference

> **Cross-reference:** End-user guide → [`docs/user/<feature-name-kebab>-guide.md`](../../user/<feature-name-kebab>-guide.md)

## Overview

<!-- 2–4 sentence technical summary: what the feature does, why it exists, and what systems it touches. -->

## Architecture

<!-- Describe how the feature fits into the broader system. Include a text-based diagram if helpful. -->

### Component Map

| Layer | File(s) | Responsibility |
|---|---|---|
<!-- Populate from code analysis. Add rows for each discovered layer: UI, API, service, model, job, etc. -->

[IF full-stack OR frontend-only]
## Frontend

### Components

<!-- List each UI component with its path and a one-line description. -->

### State Management

<!-- Describe how state is handled: local state, context, Redux, Zustand, etc. -->

### Routes / Pages

<!-- List routes that render or involve this feature. -->
[END IF]

[IF full-stack OR backend-only]
## API Reference

### Endpoints

<!-- For each endpoint: -->
#### `METHOD /path/to/endpoint`

| Field | Value |
|---|---|
| **Auth required** | Yes / No |
| **Permission** | role or scope required |

**Request**
\`\`\`json
{
  // annotated JSON schema
}
\`\`\`

**Response — 200 OK**
\`\`\`json
{
  // annotated JSON schema
}
\`\`\`

**Error Responses**

| Status | Code | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR | ... |
| 401 | UNAUTHORIZED | ... |
| 404 | NOT_FOUND | ... |
| 500 | INTERNAL_ERROR | ... |

[END IF]

[IF full-stack OR backend-only]
## Data Model

<!-- Describe the database schema or data structures involved. -->

\`\`\`sql
-- or TypeScript interface / Prisma schema / Mongoose model
\`\`\`

### Key Fields

| Field | Type | Description |
|---|---|---|

[END IF]

## Configuration

<!-- Environment variables, feature flags, or config keys required. -->

| Variable | Required | Default | Description |
|---|---|---|---|

## Dependencies

### Internal

<!-- Other internal modules, services, or features this depends on. -->

### External

<!-- Third-party libraries, APIs, or services. -->

| Dependency | Version | Purpose |
|---|---|---|

## Error Handling

<!-- How errors are caught and surfaced. Retry logic, fallbacks, alerting. -->

## Security Considerations

<!-- Auth requirements, input validation, rate limiting, data sensitivity. -->

## Performance Notes

<!-- Expected load, caching strategy, DB query complexity, async patterns. -->

## Testing

<!-- How to run tests for this feature. -->

\`\`\`bash
# Unit tests
<test command>

# Integration tests
<test command>
\`\`\`

### Key Test Scenarios

<!-- List the most important test cases and what they verify. -->

## Deployment Notes

<!-- Any migration steps, feature flags to flip, infra changes, rollback plan. -->

## Known Limitations & TODOs

<!-- Any current gaps, edge cases not yet handled, or planned improvements. -->

## Related Documentation

<!-- Links to related developer docs discovered in Step 5. -->
- [Link to related doc 1](...)
- [Link to related doc 2](...)
```

**Populate every section** from your code analysis. Do not leave template placeholders — replace them with real content discovered from the codebase. If a section genuinely does not apply (e.g., no DB for a pure frontend feature), write a one-line note: `_Not applicable — this is a frontend-only feature._`

---

### Step 7 — Generate User Documentation

Create the file: `docs/user/<feature-name-kebab>-guide.md`

Use this structure:

```markdown
---
title: How to Use <Feature Title Case>
feature: <feature-name-kebab>
audience: end-users
created: <today's date ISO 8601>
updated: <today's date ISO 8601>
---

# How to Use <Feature Title Case>

> **For developers:** See the [technical implementation guide](../../dev/<feature-name-kebab>-implementation.md).

## What Is This Feature?

<!-- 1–3 sentences. Plain language. No jargon. Focus on the user benefit. -->

## Before You Start

<!-- Prerequisites the user needs: account type, permissions, prior steps. Use a short checklist. -->

- [ ] ...
- [ ] ...

## Step-by-Step Guide

<!-- Break the flow into numbered steps. Each step = one user action. -->

### Step 1 — <Action>

<!-- Screenshot placeholder — replace with actual screenshot -->
![Step 1: <description>](./screenshots/<feature-name-kebab>/step-01.png)
> _Screenshot: <describe what the user sees here>_

<!-- Instruction text -->

---

### Step 2 — <Action>

<!-- Screenshot placeholder -->
![Step 2: <description>](./screenshots/<feature-name-kebab>/step-02.png)
> _Screenshot: <describe what the user sees here>_

<!-- Instruction text -->

---

<!-- Repeat for each step discovered from code/UI analysis. Aim for 3–7 steps. -->

## What Happens Next

<!-- Describe the outcome or confirmation the user will see after completing the steps. -->

## Frequently Asked Questions

<!-- Write 2–4 FAQs based on likely confusion points, error states, or edge cases found in the code. -->

**Q: <Question>**
A: <Answer>

**Q: <Question>**
A: <Answer>

## Troubleshooting

<!-- For each error state or validation message found in the code, explain what it means and how to fix it. -->

| Error / Message | What It Means | What To Do |
|---|---|---|

## Related Guides

<!-- Links to related user docs discovered in Step 5. -->
- [Link to related guide 1](...)
- [Link to related guide 2](...)

---
_Have feedback on this guide? Contact the team at [support channel]._
```

Populate the FAQ and Troubleshooting sections from real error messages, validation logic, and edge cases found in the code. Keep language simple — write for someone who is not technical.

For screenshots: generate one `![Screenshot placeholder]` per major UI step. If the feature has no UI (backend-only), omit screenshot placeholders and add a note: `_This feature has no user interface. It runs automatically._`

---

### Step 8 — Ensure Output Directories Exist

Before writing, create the directories if they don't exist:

```bash
mkdir -p docs/dev
mkdir -p docs/user
mkdir -p docs/user/screenshots/<feature-name-kebab>
```

---

### Step 9 — Write the Files

Write both files to disk:
1. `docs/dev/<feature-name-kebab>-implementation.md`
2. `docs/user/<feature-name-kebab>-guide.md`

---

### Step 10 — Report Summary

After writing both files, print a concise summary:

```
✅ Documentation generated for: <Feature Title Case>
   Stack type detected: <stack type>
   
   📁 docs/dev/<feature-name-kebab>-implementation.md
      Sections: Overview, Architecture, [API Reference], [Data Model], Configuration,
                Dependencies, Error Handling, Security, Performance, Testing, Deployment
   
   📁 docs/user/<feature-name-kebab>-guide.md
      Steps documented: <N>
      Screenshot placeholders: <N>
      FAQs written: <N>
      Troubleshooting entries: <N>
   
   🔗 Cross-references added: both files link to each other
   📎 Related docs linked: <list any found, or "none found">
   
   Next steps:
   - Replace screenshot placeholders in docs/user/screenshots/<feature-name-kebab>/
   - Review and adjust the "Deployment Notes" section before releasing
   - Update the `status` frontmatter field from `draft` to `published` when ready
```

---

## Bonus Behaviors

### Frontend/Backend/Full-Stack Adaptation
The command already adapts section visibility based on `stack type` detected in Step 3. Frontend-only docs omit API and data model sections. Backend-only docs omit component and route sections. Full-stack docs include all sections.

### Screenshot Automation (if Playwright or Puppeteer is available)
If `playwright` or `puppeteer` is detected in `package.json`, after generating docs offer to run:
```bash
npx playwright screenshot --url <detected route> --output docs/user/screenshots/<feature-name-kebab>/
```
And insert the captured screenshots into the user doc, replacing the placeholder `![...]` lines.

### Auto-linking Related Docs
In Step 5, if related docs are found, they are automatically included in the "Related Documentation" and "Related Guides" sections of both files. Use relative paths so links work regardless of where the repo is hosted.
