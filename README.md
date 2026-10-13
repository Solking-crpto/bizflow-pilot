# BizFlow Pilot

> **The AI Finance Agent That Never Holds The Keys.**  
> *Turning verified business activity into policy-approved USDC payments on Arc, with tamper-evident audit proofs.*

Built for the **Arc Microgrants Hackathon (DoraHacks)** — 12-14 October 2026.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![Arc Network](https://img.shields.io/badge/Arc_Network-Mainnet_%26_Testnet-teal.svg)](https://arc.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph OperationalLayer["Operational Activity Layer"]
        PO["Purchase Order (PO)"]
        GR["Warehouse Goods Receipt (GR)"]
        INV["Vendor Inbound Invoice"]
    end

    subgraph VerificationEngine["Verification & Reconciliation Engine"]
        MATCH["3-Way Match Engine\n(Qty exact, Price within 1%)"]
        DUP["Duplicate Detection Engine\n(SHA-256 + Heuristic)"]
        SANITIZE["Untrusted Data Sanitizer\n(Prompt-Injection Neutralizer)"]
    end

    subgraph AgentLayer["AI Advisory Layer (Air-Gapped)"]
        LLM["AI Finance Agent\n(Structured Zod Output)"]
        FALLBACK["Deterministic Heuristic Fallback"]
    end

    subgraph SecurityGate["Deterministic Policy Gate (Server-Side)"]
        POLICY{"10-Rule Policy Engine\n• Active Vendor\n• Wallet Authenticity\n• Spending Caps & Cooldowns\n• Liquidity Reserve Floor\n• Global Kill Switch\n• Strict Idempotency"}
    end

    subgraph SettlementLayer["Arc Blockchain Settlement"]
        PROVIDER{"Payment Provider\nAdapter"}
        DIRECT["DirectEvmProvider\n(Viem Signer / Mainnet)"]
        CIRCLE["CircleWalletsProvider\n(Circle SDK / Testnet)"]
        ARC_USDC[("Arc USDC System Contract\n0x3600...0000")]
        ANCHOR["AuditAnchor.sol\n(paris EVM target)"]
    end

    subgraph VerificationOutput["Audit & Verification"]
        LEDGER[("Append-Only Audit Ledger\nSHA-256 Hash Chain")]
        PASSPORT["Public Payment Passport\n(/verify/[id])"]
    end

    PO --> MATCH
    GR --> MATCH
    INV --> SANITIZE --> MATCH
    INV --> DUP

    MATCH --> LLM
    MATCH --> FALLBACK

    LLM -- "propose_payment only\n(No keys / No wallet access)" --> POLICY
    FALLBACK --> POLICY

    POLICY -- "If ALL 10 Rules Pass" --> PROVIDER
    PROVIDER --> DIRECT --> ARC_USDC
    PROVIDER --> CIRCLE --> ARC_USDC

    ARC_USDC -- "Receipt Confirmed" --> ANCHOR
    ARC_USDC --> LEDGER
    ANCHOR --> LEDGER
    LEDGER --> PASSPORT
```

---

## Key Features

1. **Activity-to-Payment Proof Chain:** Purchase order, warehouse receiving slip, invoice, liquidity position, agent recommendation, policy result, Arc transaction, and anchor proof are bound in a tamper-evident cryptographic chain.
2. **Ironclad Air-Gap Security:** The AI agent can only propose actions. It never receives private keys, never interfaces with wallets, and cannot bypass the deterministic policy engine.
3. **Prompt-Injection Neutralization:** Invoice text is quarantined as untrusted data. Heuristic pattern filters block adversarial attempts to reroute funds.
4. **Deterministic 3-Way Reconciliation:** Mathematical matching of PO vs Goods Receipt vs Invoice. Quantities must match physically; unit prices are verified against a 1.00% policy tolerance.
5. **Provider-Agnostic Arc Settlement:**
   - **Arc Mainnet (Chain ID 5042):** Settled via `DirectEvmProvider` with a server-held EOA signer executing USDC transfers to system contract `0x3600000000000000000000000000000000000000`.
   - **Arc Testnet (Chain ID 5042002):** Settled via `CircleWalletsProvider` using Circle's Developer-Controlled Wallets SDK.
6. **Arc Dual-Decimal Protection:** Branded TypeScript types (`UsdcAtomic` 6dp vs `NativeGasAtomic` 18dp) prevent mixing native gas units and token units.
7. **Public Payment Passport (`/verify/[id]`):** A no-login, shareable verification certificate showing hashes, policy checks passed, amounts, and Arc block explorer links.
8. **Policy Simulator:** An interactive sandbox to test "what-if" scenarios (price hikes, wallet tampering, kill-switch halts) with zero side effects.

---

## Network Modes & Arc Specifications

| Parameter | Arc Mainnet | Arc Testnet |
|---|---|---|
| **Chain ID** | `5042` | `5042002` |
| **Native Gas Currency** | USDC (18 decimals via `eth_getBalance`) | USDC (18 decimals via `eth_getBalance`) |
| **USDC ERC-20 Contract** | `0x3600000000000000000000000000000000000000` (6dp) | `0x3600000000000000000000000000000000000000` (6dp) |
| **Primary RPC** | `https://rpc.mainnet.arc.io` | `https://rpc.testnet.arc.network` |
| **Fallback RPC** | `https://rpc.arc.network` | `https://rpc.testnet.arc.io` |
| **Block Explorer** | `https://explorer.arc.io` | `https://testnet.arcscan.app` |
| **Settlement Adapter** | `DirectEvmProvider` (Viem) | `CircleWalletsProvider` (Circle SDK) |

---

## Quickstart Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v20+)
- npm or pnpm
- Windows, macOS, or Linux (cross-platform scripts via `dotenv-cli`)

### 2. Clone and Install
```bash
git clone https://github.com/your-username/bizflow-pilot.git
cd bizflow-pilot
npm install
```

### 3. Environment Configuration

BizFlow Pilot supports twin environment setups:
- `.env.testnet.local` for Arc Testnet (Circle Wallets SDK / staging simulation)
- `.env.mainnet.local` for Arc Mainnet (Viem direct signer with real USDC on Arc)

Copy `.env.example` to set up your local environment:
```bash
cp .env.example .env
```

### 4. Running Arc Mainnet vs Testnet

#### Testnet Mode (Staging)
```bash
npm run dev:testnet          # Runs on http://localhost:3001 with testnet config
```

#### Mainnet Mode (Production)
```bash
# 1. Run the safe read-only preflight check (validates RPC, chain ID 5042, balances, caps, blocklists):
npm run preflight:mainnet

# 2. Seed demo-scale mainnet invoices (0.50 USDC total, 10 bags @ 0.05 USDC):
npm run seed:mainnet

# 3. (Optional) Deploy AuditAnchor to Arc Mainnet (requires explicit --yes):
npm run deploy:anchor:mainnet -- --yes

# 4. Launch Mainnet development server:
npm run dev:mainnet          # Runs on http://localhost:3001 with mainnet config
```

### 5. Automated Verification & Testing

#### Unit & Security Test Suite (42 tests):
```bash
npm test
```
Verifies:
- 3-Way matching arithmetic (`tests/matching.test.ts`)
- Branded currency math (`tests/money.test.ts`)
- AI agent prompt-injection defense (`tests/agent.test.ts`)
- 10-rule deterministic policy enforcement (`tests/policy.test.ts`)
- Full golden-path e2e acceptance (`tests/e2e.test.ts`)
- Cryptographic hash-chain integrity & tampering detection (`tests/audit.test.ts`)
- Air-gap key isolation (`tests/secrets.test.ts`)
- Secret & DB URL leak prevention on all 10 routes (`tests/leak.test.ts`)

#### Playwright End-to-End Smoke Test:
```bash
npm run test:e2e
```
Visits all 10 application routes (`/`, `/inventory`, `/invoices`, `/agent`, `/payments`, `/audit`, `/simulator`, `/settings`, `/about`, `/verify/demo`), interacts with tabs, confirmation modals, kill-switch toggles, hash verification, and asserts 0 unhandled console errors or 5xx responses.

---

## Production Deployment (Vercel)

When deploying BizFlow Pilot to Vercel, configure these environment variables in your project settings:

| Variable Name | Purpose | Example / Required Format |
|---|---|---|
| `NEXT_PUBLIC_NETWORK_MODE` | Active network mode | `mainnet` or `testnet` |
| `NEXT_PUBLIC_CHAIN_ID` | Arc chain identifier | `5042` (mainnet) or `5042002` (testnet) |
| `NEXT_PUBLIC_RPC_URL` | Primary Arc RPC endpoint | `https://rpc.mainnet.arc.io` |
| `NEXT_PUBLIC_EXPLORER_URL` | Block explorer base URL | `https://explorer.arc.io` |
| `DATABASE_URL` | Supabase / Neon pooled URL | `postgresql://...` (pgbouncer) |
| `DIRECT_URL` | Direct DB connection (session) | `postgresql://...` (port 5432) |
| `TREASURY_PRIVATE_KEY` | Server-held signer key | `0x...` (Air-gapped on server, never sent to client) |
| `VENDOR_WALLET_ADDRESS` | Whitelisted vendor address | `0x...` (Your recipient wallet) |
| `MAX_MAINNET_PAYMENT_USDC` | Safety ceiling per payment | `1.00` |
| `MIN_RESERVE_USDC` | Required operating reserve floor| `0.25` |
| `ARC_ANCHOR_CONTRACT_ADDRESS`| AuditAnchor address on Arc | `0x...` |

> **Security Note:** BizFlow Pilot enforces strict client/server boundaries. Private keys, database URLs, and Circle entity secrets are strictly prohibited from client bundles and are verified by `tests/leak.test.ts`.

---

## 10-Rule Deterministic Policy Engine

| Rule Code | Policy Rule | Enforced Action |
|---|---|---|
| `RULE_VENDOR_ACTIVE` | Approved & Active Vendor Verification | **Block** if suspended or unwhitelisted |
| `RULE_WALLET_AUTHENTICITY` | Destination Wallet Match & Cooldown | **Block** if address altered; **Review** if cooldown active |
| `RULE_3WAY_MATCH` | Three-Way Reconciliation Match | **Review** if quantities or unit prices mismatch |
| `RULE_INTEGRITY_CHECK` | Duplicate Screen & Injection Defense | **Block** if duplicate score >= 90% or hostile injection detected |
| `RULE_SPENDING_LIMITS` | Per-Payment & Daily Spending Caps | **Block** if invoice exceeds vendor limit or daily cap |
| `RULE_APPROVAL_THRESHOLD` | High-Value Human Approval Sign-off | **Review** if invoice exceeds threshold without sign-off |
| `RULE_RESERVE_PROTECTION` | Post-Settlement Liquidity Reserve | **Review** if post-payment balance dips below operating floor |
| `RULE_MAINNET_GUARD` | Arc Mainnet Safety Cap & Confirmation | **Block** if mainnet amount > 1.00 USDC without confirmation modal |
| `RULE_KILL_SWITCH` | Global Emergency Kill Switch | **Block** immediately halts all settlements |
| `RULE_IDEMPOTENCY` | Strict One-Time Settlement Idempotency | **Block** prevents duplicate transaction hashes |

---

## Smart Contract: `AuditAnchor.sol`

Compiled with `evmVersion: "paris"` to guarantee compatibility with Arc Network and avoid the `PUSH0` opcode.

```solidity
function anchor(bytes32 invoiceHash, bytes32 decisionHash, bytes32 paymentRef) external
```
- Emits `Anchored(invoiceHash, decisionHash, paymentRef, msg.sender, timestamp)`
- Prevents replay attacks by reverting if an `invoiceHash` has already been anchored.

---

## Security Model & Limitations

- **Keys Air-Gapped:** Private keys and Circle entity secrets reside exclusively in server-side memory.
- **Zero Hallucination Settlement:** The LLM cannot authorize or initiate payments directly.
- **Scope Boundary:** Multi-currency FX, payroll, and speculative yield protocols are intentionally omitted to focus on high-assurance accounts payable.
- **Mainnet Cap:** Default mainnet payments are capped at `1.00 USDC` (`MAX_MAINNET_PAYMENT_USDC`) for demonstration safety.

---

## License

MIT License. Designed and engineered for the Arc Microgrants Program (DoraHacks).
