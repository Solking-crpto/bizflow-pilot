# BizFlow Pilot — Master Task List

## Safety & Ground Rules
- [x] Never print/log secrets (keys, passwords, connection strings). Variable names only.
- [x] Do not touch `.env`. Do not `git push`. Local commits after each milestone.
- [x] Never execute mainnet write transactions without explicit `--yes`.
- [x] Windows/PowerShell compatible scripts.
- [x] Port 3001 configuration.

---

## P0-A: Fix Dead Navigation
- [x] Set `"dev": "next dev -p 3001"` in `package.json` and fix `APP_URL` references.
- [x] Inspect all routes (`/`, `/inventory`, `/invoices`, `/agent`, `/payments`, `/audit`, `/simulator`, `/settings`, `/about`, `/verify/demo`): test network calls, console logs, errors.
- [x] Root cause analysis: resolved client/server boundaries, added `withDbTimeout` (2500ms) with rich fallback mock data (`lib/demoData.ts`), fixed port 6543 hang by pointing to `DIRECT_URL`.
- [x] Added `app/error.tsx` and `app/loading.tsx`.
- [x] Fixed all buttons and navigation links across all pages:
  - Process Invoices, Payment Desk, Inspect Hash Chain, Open Passport, View All, Consult AI Agent, Ask AI Agent, Go to Payment Desk.
  - Interactive Invoice Desk tabs (Verified, Needs Review, Blocked, All).
  - Interactive Payment Desk execution & confirmation modal restating network, amount, vendor, destination, cap.
  - Interactive Audit Ledger "Verify Chain" and "Export JSON".
  - Interactive Policy Simulator sliders and inputs.
  - Interactive Settings save form and emergency kill switch.
- [x] Add and execute Playwright smoke test (`tests-e2e/smoke.spec.ts`): All 6 tests PASSED (`6 passed (51.1s)`).
- [x] Milestone commit: `fix(nav): resolve route navigation, add error/loading boundaries, and interactive controls`

---

## P0-B: Secret Leak Resolution & Security Audit
- [x] Diagnosed Command Center "Settlement Infrastructure" card showing DB string:
  - **Root Cause:** Line 6 of `.env` had `PAYMENT_PROVIDER` erroneously set to the PostgreSQL database URL. In `app/page.tsx`, `{process.env.PAYMENT_PROVIDER || "direct"}` directly rendered that environment variable to HTML.
  - **Remediation:** Created `lib/treasury.ts` which sanitizes payment provider to strictly `"direct" | "circle"` and derives the public treasury address exclusively via viem (`privateKeyToAccount(key).address`).
- [x] Removed leak: display only network, chain ID, gas asset, public derived treasury address, sanitized provider name.
- [x] Audited all components and pages: ensured only `NEXT_PUBLIC_*` values reach client components.
- [x] Added security test `tests/leak.test.ts` asserting no sensitive substrings (`postgres`, `postgresql://`, `password`, `PRIVATE_KEY`, treasury key) in rendered HTML across all 10 routes: 10/10 PASSED.
- [x] Milestone commit: `sec(leak): remove DB URL leakage, enforce public-only client props, add leak test`

---

## P0-C: Known-Public Test Wallets Defense
- [x] Created blocklist of Hardhat/Anvil public test addresses in `lib/security/walletBlocklist.ts` (12 known addresses including `0x7099...79C8` and `0x3C44...93BC`).
- [x] Updated Policy Engine (`lib/policy/engine.ts`): `RULE_BLOCKLISTED_WALLET` strictly BLOCKS any destination on Mainnet if found in blocklist; warns on Testnet.
- [x] Seed vendor wallet from env `VENDOR_WALLET_ADDRESS` on Mainnet (`getSeededVendorWallet()` in `lib/demoData.ts` and `prisma/seed.ts`).
- [x] Kept `0x3C44...93BC` only in the malicious prompt-injection demo invoice as the attacker wallet to demonstrate automated rejection.
- [x] Milestone commit: `sec(wallets): add hardhat/anvil blocklist and configurable vendor wallet`

---

## P1: Mainnet Mode (Production Readiness)
- [x] Supported `.env.mainnet.local` and `.env.testnet.local`. Added cross-platform scripts (`dev:mainnet`, `dev:testnet`, `db:push:mainnet`, `seed:mainnet`, `preflight:mainnet`, `deploy:anchor:mainnet`, `compile:contracts`).
- [x] Verified `.gitignore` covers all `.env*` files except `.env.example`.
- [x] Network-honest UI: `components/layout/NetworkBadge.tsx` removes "STAGING SIMULATION" when Mainnet; displays navy "ARC MAINNET: real USDC" badge; displays confirmation modal before settlement.
- [x] On-chain live balance queries: `balanceOf(treasury)` (6dp) via viem RPC contract call, plus separate native gas balance `eth_getBalance` (18dp).
- [x] Added `DRY_RUN=true` mode for simulation without broadcast (`eth_estimateGas` and transaction simulation via RPC).
- [x] Mainnet seed (`scripts/seedMainnet.ts`) with demo-scale amounts (0.50 USDC total, 10 bags @ 0.05 USDC), configurable `MIN_RESERVE_USDC` (default 0.25 USDC).
- [x] Created `scripts/preflight-mainnet.ts` (read-only verification of env, chainId 5042, USDC contract, balances, DB, caps, blocklists) without printing secrets.
- [x] Implemented `scripts/deployAnchorMainnet.ts` requiring `--yes` flag and verifying bytecode & gas balance before broadcast.
- [x] Strengthened `DirectEvmProvider`: Sequential fallback RPCs (`ARC_MAINNET_RPC_FALLBACKS`), receipt and `Transfer` event verification, idempotency.
- [x] Enhanced `/verify/[id]` with direct Arc RPC verification and URL searchParams fallback.
- [x] Milestone commit: `feat(mainnet): implement mainnet preflight, dual env scripts, on-chain balances, and safe provider`

---

## P2: Deploy Readiness & Documentation
- [x] Build readiness without DB at build time: `export const dynamic = "force-dynamic"`, `withDbTimeout`, `npx next build` passes cleanly.
- [x] Documented required Vercel environment variable names in `README.md`.
- [x] Created `scripts/writeMainnetProof.ts` and generated `docs/MAINNET_PROOF.md`.
- [x] Updated `README.md` with comprehensive instructions, architecture diagram, security guarantees, and execution guides.
- [x] Milestone commit: `docs: update documentation, proof template, and build configurations`

---

## DoraHacks Arc Microgrants Judge Readiness (October 2026 Hardening)

### P0 — Data Safety & Honesty
- [x] Guard `scripts/seedMainnet.ts` against accidental execution if confirmed mainnet payments exist (requires `--force-wipe`).
- [x] Create non-destructive `scripts/relabelMainnetDemo.ts` (updates counterparty to fictional "Northgate Cement Supply (demo vendor)").
- [x] Remove "Verified" from vendor names across seeds and demo data; relabel org chip to "DEMO ORG"; add footer note: "Demo-scale data: amounts capped at 1 USDC".
- [x] Pluralize Command Center copy ("1 item", "items"); align Action Required counts; split payables into awaiting settlement vs settled to date.
- [x] Treasury card: show USDC balance and explain dual gas/settlement role on Arc.
- [x] Mainnet error handling: never use demo fallback on mainnet DB errors, provide Retry.
- [x] Milestone commit: `feat(p0): data safety, demo vendor relabeling, and honesty improvements` (`1f8f92c`)

### P1 — Judge Experience & Public APIs
- [x] Create `/judges` guide: pitch, dynamic compliance table, 5-minute evaluation path, and real vs demo disclosures.
- [x] Command Center `LiveProofCard`: display latest confirmed settlement, amount, vendor, copyable tx hash, anchor tx, and link to `/verify/[id]`.
- [x] Visitor notice on Payment Desk and Settings ("Read-only for visitors. Payments require the owner passcode.").
- [x] Sliding-window rate limiting on sensitive passcode endpoints (max 5 failed attempts in 5 min -> HTTP 429).
- [x] Public endpoints: `/api/proof` (cached 30s) and `/api/health` (live diagnostics).
- [x] Arc RPC live verification widget on `/verify/[id]` (`/api/audit/verify-rpc`).
- [x] Milestone commit: `feat(p1): add judge guide, live proof card, public proof/health apis, and rpc verification` (`e0f20b2`)

### P2 — UI Polish & Performance
- [x] Custom 404 page (`app/not-found.tsx`) with direct navigation links.
- [x] Route metadata & OpenGraph tags on all routes.
- [x] Memoized `getCommandCenterData` with React `cache()` and unified timeout.
- [x] Modals dismissible on Escape key; `tabular-nums` formatting for all monetary displays.
- [x] Status chip color styling: Verified=green, Needs review=amber, Blocked=red, Settled=teal, Anchored=blue.
- [x] Milestone commit: `style(p2): polish metadata, 404 handler, chip styling, and modal ergonomics` (`4937b01`)

### P3 — Repository, Docs, Final Verification
- [x] MIT `LICENSE` file.
- [x] Judge-centric `README.md` rewrite (pitch, live links, real 0.50 USDC tx hash, anchor contract, mermaid diagrams, trust model).
- [x] Updated `docs/SUBMISSION.md` and `docs/DEMO_SCRIPT.md` with verified mainnet hashes and fictional demo vendor.
- [x] Playwright smoke suite (`tests-e2e/smoke.spec.ts`): 7/7 passed.
- [x] Vitest test suite (`npm test`): 10 test files, 55 tests passed.
- [x] Production build (`npx next build`): 13 static & dynamic routes compiled and optimized cleanly.

