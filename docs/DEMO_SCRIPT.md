# BizFlow Pilot — 3-Minute Demo Video Script

**Target Duration:** 3 minutes (180 seconds)  
**Presenter:** Founder / Lead Engineer  
**Role:** Senior Full-Stack & Fintech Security Engineer  

---

## [0:00 - 0:30] The Core Problem & Value Proposition

**Visual:** Opening on BizFlow Pilot **Command Center** (`/`). Clean corporate interface, navy and teal branding.

> "Modern autonomous agents are being pitched to manage enterprise finance—yet giving an AI agent direct custody of private keys or letting an LLM execute payments is an existential security disaster.
>
> Meet **BizFlow Pilot**: *the AI finance agent that never holds the keys.*
>
> BizFlow Pilot binds real business activity—purchase orders, warehouse receiving slips, and invoices—into policy-approved USDC payments on Arc, anchored by an immutable cryptographic proof chain for every transaction."

---

## [0:30 - 1:15] Inbound Intake, 3-Way Reconciliation & Threat Neutralization

**Visual:** Navigate to **Invoice Desk** (`/invoices`). Click on the different invoices in the queue.

> "Let's look at four live test cases from our construction supplier scenario:
>
> 1. **Invoice 401 (The Golden Path):** 200 bags of Portland Cement. Our 3-way reconciliation diff engine automatically proves that 200 bags were ordered under PO-2026-0089, 200 bags were physically verified by the warehouse in GR-2026-0089, and unit prices match within policy tolerance.
> 2. **Invoice 401-COPY (Duplicate Block):** Flagged instantly by our cryptographic duplicate engine at a 95% risk score.
> 3. **Invoice 402 (Quantity Mismatch):** Invoiced 240 bags versus 200 received—automatically quarantined for human review.
> 4. **Invoice 403 (Hostile Injection):** Contains a prompt-injection payload attempting to trick the AI into diverting funds to a rogue address. Our sanitizer flags the adversarial instructions, treats all document text as untrusted data, and completely neutralizes the threat."

---

## [1:15 - 1:55] AI Finance Agent & Deterministic Policy Gate

**Visual:** Navigate to **AI Finance Agent** (`/agent`), then briefly show **Policy Simulator** (`/simulator`).

> "Here on the AI Agent Desk, the model is exposed to only four constrained advisory tools. It analyzes liquidity, compares due dates, and proposes optimal payment timing.
>
> But here is our ironclad security rule: **The agent only proposes. A deterministic policy engine decides.**
>
> In the Policy Simulator, we can see all 10 deterministic rules running server-side: vendor approval, destination wallet match, 24-hour cooldowns, spending caps, liquidity reserve buffers, and our global emergency kill switch. The language model never sees private keys and cannot alter these rules."

---

## [1:55 - 2:30] Live Arc USDC Settlement

**Visual:** Navigate to **Payment Desk** (`/payments`). Select Invoice 401, show network badge, click Execute Settlement, show confirmation modal and instant settlement.

> "Now let's settle on Arc.
>
> BizFlow Pilot features a provider-agnostic settlement architecture. On testnet, it integrates Circle Developer-Controlled Wallets. On Arc Mainnet, our `DirectEvmProvider` utilizes server-held credentials to sign native USDC transactions directly to Arc's ERC-20 contract.
>
> We hit **Execute Settlement**. Our backend enforces a database idempotency key, executes the USDC transfer on Arc, verifies the on-chain receipt, and immediately calls our minimal `AuditAnchor.sol` smart contract to anchor the proof permanently."

---

## [2:30 - 3:00] Tamper-Evident Ledger & Public Payment Passport

**Visual:** Navigate to **Trust & Audit Ledger** (`/audit`), click **Verify Chain Integrity** (shows green checkmark), then open **Public Payment Passport** (`/verify/demo`).

> "Every single action—from invoice intake to policy evaluation and Arc settlement—is cryptographically hashed into an append-only SHA-256 chain. We can click **Verify Chain Integrity** right now to mathematically validate every block back to genesis.
>
> Finally, this is the **Public Payment Passport** at `/verify/[id]`. A shareable, no-login cryptographic certificate that auditors and suppliers can open in seconds to verify the invoice hash, policy decision hash, Arc settlement transaction, and on-chain anchor proof.
>
> BizFlow Pilot delivers corporate-grade enterprise finance on Arc: autonomous, policy-bounded, and tamper-evident."
