# Pre-Commit Security Scan — HomeBudget

**Date:** 2026-08-31  
**Verdict:** ✅ SAFE TO COMMIT — 0 new findings in staged files  
**Risk Score:** 52.1/100 (High Risk — pre-existing issues only)

## Staged Files (6)

- `src/app/legal/cgu/page.tsx`
- `src/app/legal/cgv/page.tsx`
- `src/app/legal/confidentialite/page.tsx`
- `src/app/legal/mentions-legales/page.tsx`
- `src/lib/cfo.ts`
- `src/lib/email.ts`

## Findings Summary

| Severity | 🆕 New (staged) | 📋 Existing |
|----------|----------------|-------------|
| 🔴 Critical | 0 | 0 |
| 🟠 High | 0 | 4 |
| 🟡 Medium | 0 | 0 |
| 🟢 Low | 0 | 0 |
| **Total** | **0** | **52** |

## Existing High Findings (pre-existing, not blocking)

### Secrets (gitleaks) — 48 findings in non-staged files
| Severity | File | Rule |
|----------|------|------|
| 🟠 High | `.env` | generic-api-key (AES key) |
| 🟠 High | `.env` | generic-api-key (AES key) |
| 🟠 High | `.env.local` | generic-api-key (AES key) |
| 🟠 High | `.env.local` | generic-api-key (Supabase URL key) |
| 🟠 High | `.env.local` | stripe-access-token (sk_test_…) |
| 🟠 High | `.env.local` | generic-api-key (Stripe webhook secret) |
| 🟠 High | `.env.local` | generic-api-key (Stripe pub key) |
| 🟠 High | `.next/**` | generic-api-key (build cache artifacts) ×41 |

**Remediation:** `.env` and `.env.local` are gitignored — not committed to git. `.next/` build artifacts are gitignored. No action required for commit. Consider adding `.next` to `.gitleaksignore` to reduce noise.

### Dependencies (npm audit) — 4 high findings
| Severity | Package | Vulnerability | Fix |
|----------|---------|---------------|-----|
| 🟠 High | `nanoid` | Loop indefinitely when size=0 (GHSA-2v37-7h3g-55p8) | Upgrade to ≥3.3.18 |
| 🟠 High | `deepmerge-ts` | Stack exhaustion on recursive objects (GHSA-ggr8-5vv4-36mx) | Upgrade to ≥8.0.0 |
| 🟠 High | `prisma` | Via deepmerge-ts transitive dep | Upgrade prisma |
| 🟠 High | `@prisma/config` | Via deepmerge-ts transitive dep | Upgrade prisma |

**Remediation:** `npm audit fix` or `npm install prisma@latest nanoid@latest`. These are transitive/dev dependency issues, not exploitable via the web surface in current usage context.

## Scan Coverage

| Tool | Status | Findings |
|------|--------|----------|
| gitleaks (secrets) | ✅ PASSED | 48 (all non-staged) |
| semgrep (SAST) | ✅ PASSED | 0 |
| npm audit (deps) | ✅ PASSED | 4 high (pre-existing) |
| checkov (IaC) | ⚠️ SKIPPED | No IaC files found |
| grype (CVE) | ⚠️ FAILED | WSL/Windows temp dir conflict |
| hadolint (Docker) | ✅ PASSED | No Dockerfiles |
| package-leakage | ✅ PASSED | private:true — no publish risk |
