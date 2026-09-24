# AI/ML Complaint Classification Integration

## Goal
Integrate the uploaded classification and prioritization requirements into the existing **Challenge** workflow, without creating a second complaint system or redesigning the platform. Citizen reports will be classified automatically, administrators can review and correct results, and the original AI output remains auditable.

## Implementation

### 1. Establish one classification contract
- Replace the current domain list with the 12 fixed categories from the specification and define relevant subcategories for each, including `Other`.
- Add a canonical priority enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Standardize AI output as category, subcategory, priority, confidence, and a short reason.
- Retain the existing numeric priority and innovation scores only as supplemental platform metrics needed by deduplication, matching, and analytics.

### 2. Upgrade the live MVP workflow
- Extend the shared Challenge and AI analysis types with classification status, manual-review status, AI reason, and immutable original AI output.
- Update the in-session classifier to use the fixed taxonomy, full complaint context, deterministic priority rules, and the documented safe fallback instead of random category selection.
- Keep citizen-entered title and description unchanged.
- Run classification automatically after submission and ensure report creation succeeds even when classification cannot complete.
- Keep citizens unable to edit generated priority.

### 3. Upgrade the Express/Mongoose reference backend
- Add a focused `classifyComplaint` service abstraction with a strict structured-output contract and provider-independent interface.
- Build and validate the classification prompt against fixed category, subcategory, priority, confidence, and reason rules.
- Validate all provider responses before persistence; invalid, unavailable, or failed classifications use `Other` / `MEDIUM` / confidence `0` and require manual review.
- Extend the Challenge schema with the canonical priority and classification metadata while preserving the original AI result when an administrator overrides it.
- Make challenge creation save the citizen report reliably even if AI analysis fails, then continue duplicate detection and university matching when possible.
- Add request validation, input normalization, bounded text lengths, and reasonable rate limiting to challenge submission.
- Keep `POST /api/v1/challenges` as the existing endpoint rather than adding a duplicate complaints API.
- Remove credential-like example values from the sample environment file and document only placeholders.

### 4. Update citizen and administrator screens
- Citizen confirmation: show category, subcategory, priority label, confidence, reason, and Pending Review/manual-review state.
- Admin dashboard: add critical and high-priority counts plus priority distribution.
- Admin queue: add subcategory, priority, confidence, and classification-state information; add filters for subcategory, priority, date, and AI-classified/manual-review state.
- Admin review: allow category, subcategory, and priority correction; clearly distinguish the original AI suggestion from the current officer-approved values.
- Preserve existing duplicate detection, university matching, project lifecycle, visual system, and “AI-assisted analysis” labeling.

### 5. Seed compatibility and verification
- Update seeded records and downstream matching so the new taxonomy remains coherent, including the central water-contamination story under `Water & Sanitation`.
- Add focused tests for category validation, each priority level, ambiguous input, malformed provider output, provider failure, immutable source text, and admin override audit behavior.
- Verify the complete citizen submission → automatic classification → admin filtering/override flow in the live preview on desktop and mobile.
- Fix the two currently reported TypeScript return-path errors, then confirm the final preview build is clean.

## Technical details
- The existing live MVP remains in-session, while `/server` remains the Express/Mongoose implementation of the same contract.
- AI credentials remain server-only. The provider is replaceable through `classifyComplaint(text, context)`; no provider-specific logic leaks into controllers or React code.
- Classification failures are terminal for that AI attempt but never block report creation; the record is flagged for manual review with the exact documented fallback message.
- Existing AI-derived values are stored separately from administrator-approved values so overrides do not erase audit history.

## Deliverables
- Modified/created file list.
- Required environment variables.
- Updated endpoint and schema documentation.
- Classification flow and fallback behavior.
- Sample complaints covering LOW, MEDIUM, HIGH, CRITICAL, and ambiguous cases.
- Known limitations of the in-session live demo and optional external AI configuration.
