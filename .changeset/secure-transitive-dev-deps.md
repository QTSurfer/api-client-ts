---
"@qtsurfer/api-client": patch
---

Update transitive dev dependencies flagged by security alerts: `handlebars` to 4.7.10
(CVE-2026-33937, CVE-2026-106445, CVE-2026-106446) and `tar` to 7.5.22 (CVE-2026-59873 and
earlier node-tar advisories), both pulled in by `@hey-api/openapi-ts` and `giget`. Runtime output
is unchanged — these are devDependency-only.
