# BizFlow Pilot — Master Execution Plan

**Project:** BizFlow Pilot — The AI Finance Agent that never holds the keys.
**Hackathon:** Arc Microgrants (DoraHacks)
**Architecture:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, viem, Circle Wallets SDK, Solidity (`paris` EVM).

---

## Phase Breakdown

### Phase 0: Discovery & Master Plan
- [x] Query Arc and Circle official docs for chain parameters, RPCs, explorers, and USDC contracts.
- [x] Document verified sources in `docs/SOURCES.md`.
- [x] Document operational assumptions in `docs/ASSUMPTIONS.md`.
- [x] Compile master architecture and task tracking in `docs/PLAN.md`.

### Phase 1: Foundation & Corporate Design System
- [ ] Initialize Next.js project with App Router, TypeScript strict mode, and Tailwind CSS.
- [ ] Configure corporate color tokens (`#0B1F33`, `#12355B`, `#0E9F8E`, `#16794C`, `#B45309`, `#B42318`, `#F5F7FA`, etc.) and typography (Inter + IBM Plex Mono).
- [ ] Build global layout: collapsible sidebar, header with org switcher, network badge, search, and logo mark.
- [ ] Build network configuration layer (`lib/networks.ts`) with runtime `eth_chainId` validation.
- [ ] Implement `lib/money.ts` with branded atomic units (`UsdcAtomic` 6dp vs `NativeGasAtomic` 18dp) and unit tests.
- [ ] Define Prisma data model (`organizations`, `vendors`, `items`, `stock_movements`, `purchase_orders`, `goods_receipts`, `invoices`, `agent_runs`, `policy_rules`, `payments`, `audit_events`, `anchors`, `settings`).
- [ ] Seed database with the corporate demo scenario (cement procurement, duplicate, mismatch, prompt-injection invoice).
- [ ] Setup authentication & Demo Owner fallback session.

### Phase 2: Records, Inventory & Invoice Desk
- [ ] Inventory ledger: stock levels, items, purchase orders, goods receipts.
- [ ] Invoice Desk UI: manual entry and file extraction simulation (with untrusted data labeling).
- [ ] Implement deterministic 3-way match engine (PO vs GR vs Invoice).
- [ ] Implement duplicate detection engine (file hash + vendor/invoice# uniqueness + fuzzy matching).
- [ ] 3-column reconciliation diff viewer (PO vs Receipt vs Invoice) with discrepancy highlights.
- [ ] Unit tests for 3-way matching and duplicate detection.

### Phase 3: AI Finance Agent & Policy Engine
- [ ] Deterministic Policy Engine (`lib/policy/engine.ts`):
  - Rule 1: Vendor approved and active
  - Rule 2: Destination wallet matches recorded vendor wallet + cooldown check
  - Rule 3: 3-way match within tolerance
  - Rule 4: Duplicate blocking
  - Rule 5: Per-payment, daily, and weekly caps
  - Rule 6: Approval threshold check
  - Rule 7: Post-payment liquidity reserve check
  - Rule 8: Mainnet guard (`MAX_MAINNET_PAYMENT_USDC` + confirmation)
  - Rule 9: Global kill switch
  - Rule 10: Idempotency check
- [ ] Full unit test suite for all 10 policy rules.
- [ ] AI Agent interface (`lib/agent/`):
  - Restricted tools (`get_cash_position`, `list_obligations`, `get_invoice_verification`, `propose_payment`)
  - Untrusted data wrapping & prompt injection pre-filter
  - Zod schema structured output validation
  - Deterministic rule-based fallback algorithm
- [ ] AI Finance Agent UI: cash-flow explanation, recommendations, risk flags, re-run actions.
- [ ] Policy Simulator page: interactive sandbox to test "what-if" rule evaluations without side effects.

### Phase 4: Payment Desk & Provider Adapters
- [ ] `PaymentProvider` interface definition.
- [ ] `CircleWalletsProvider` adapter for Arc Testnet.
- [ ] `DirectEvmProvider` adapter using viem for Arc Mainnet (and local testing).
- [ ] Idempotent execution pipeline with DB transaction locking.
- [ ] Receipt verification reading Arc RPC directly (checking `Transfer` events).
- [ ] Payment Desk UI: approval queue, payment execution modal with network-honest confirmation, live transaction state tracker.

### Phase 5: Tamper-Evident Audit Ledger & Smart Contract
- [ ] Append-only cryptographic hash chain (`prev_hash` -> `event_hash = sha256(prev_hash + canonical_json)`).
- [ ] Chain verification utility with tamper detection test.
- [ ] Smart Contract `contracts/AuditAnchor.sol` with `paris` EVM compiler target.
- [ ] Hardhat/viem deployment and verification scripts.
- [ ] Automatic anchoring flow upon payment confirmation.
- [ ] Public Payment Passport (`/verify/[id]`): public no-auth verification page displaying cryptographic proof chain, policy audit, and on-chain explorer links.

### Phase 6: Mainnet Readiness & Guardrails
- [ ] Configuration validation for mainnet (RPC fallback, chainId 5042, cap enforcement).
- [ ] Interactive confirmation modal for real mainnet funds.
- [ ] Documentation and scripts for mainnet contract deployment and proof anchoring (`docs/MAINNET_PROOF.md`).

### Phase 7: Polish, Testing & Submission
- [ ] Comprehensive automated test suite (unit + integration + security checks).
- [ ] Documentation: `README.md` with Mermaid architecture diagram, `docs/DEMO_SCRIPT.md`, and `docs/SUBMISSION.md`.
- [ ] Corporate fintech aesthetic refinement, accessibility (WCAG AA), responsiveness.
