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
> BizFlow Pilot binds real business activity—purchase orders, warehouse receiving slips, and invoices—into policy-approved USDC payments on Arc Mainnet, anchored by an immutable cryptographic proof chain for every transaction."

---

## [0:30 - 1:15] Inbound Intake, 3-Way Reconciliation & Threat Neutralization

**Visual:** Navigate to **Invoice Desk** (`/invoices`). Click on the different invoices in the queue.

> "Let's look at four live test cases from our demo vendor scenario with **Northgate Cement Supply**:
>
> 1. **INV-MAINNET-101 (The Golden Path):** 10 bags of Portland Cement @ 0.05 USDC = 0.50 USDC. Our 3-way reconciliation engine proves that 10 bags were ordered under PO-MAINNET-0001, 10 bags were received in warehouse receipt GR-MAINNET-0001, and unit prices match within policy tolerance.
> 2. **INV-MAINNET-101-COPY (Duplicate Block):** A second submission of the same invoice is flagged instantly by our cryptographic duplicate engine at a 95% risk score and blocked.
> 3. **INV-MAINNET-102 (Quantity Mismatch):** Invoiced 12 bags versus 10 received—automatically quarantined for human review.
> 4. **INV-MAINNET-103 (Prompt-Injection Attack):** Contains a hostile injection payload attempting to trick the AI into transferring funds to an attacker's address. Our sanitizer flags the adversarial instructions, treats all document text as untrusted data, and completely blocks execution."

---

## [1:15 - 1:55] AI Finance Agent & Deterministic Policy Gate

**Visual:** Navigate to **AI Finance Agent** (`/agent`), then briefly show **Policy Simulator** (`/simulator`).

> "Here on the AI Agent Desk, the model is exposed to constrained advisory tools. It analyzes liquidity, compares due dates, and proposes optimal payment timing.
>
> But here is our ironclad security rule: **The agent only proposes. A deterministic policy engine decides.**
>
> In the Policy Simulator, we can see all 10 deterministic rules running server-side: vendor approval, destination wallet match, address cooldowns, spending caps, liquidity reserve buffers, and our global emergency kill switch. The language model never sees private keys and cannot alter these rules."

---

## [1:55 - 2:30] Live Arc USDC Settlement

**Visual:** Navigate to **Payment Desk** (`/payments`). Select INV-MAINNET-101, show network badge, click Execute Settlement, show confirmation modal and instant settlement.

> "Now let's settle on Arc Mainnet.
>
> BizFlow Pilot features a provider-agnostic settlement architecture. On Arc Mainnet, our `DirectEvmProvider` utilizes server-held credentials to sign native USDC transactions directly via Arc RPC.
>
> We hit **Execute Settlement**. Our backend enforces a database idempotency key, executes the USDC transfer on Arc, verifies the on-chain receipt, and immediately calls our `AuditAnchor.sol` smart contract to anchor the proof permanently."

---

## [2:30 - 3:00] Tamper-Evident Ledger & Public Payment Passport

**Visual:** Navigate to **Trust & Audit Ledger** (`/audit`), click **Verify Chain Integrity** (shows green checkmark), then open **Public Payment Passport** (`/verify/inv-mainnet-101`).

> "Finally, let's inspect the proof.
>
> In the Trust Ledger, every event is linked via SHA-256 hashes. Clicking 'Verify Chain' cryptographically verifies the entire sequence back to Genesis in real time.
>
> And here is the **Public Payment Passport**. Reviewers and suppliers can open this link with zero login to view the 10-point policy certification, the live Arc RPC receipt with gas consumed, the payment hash, and the on-chain anchor on Arc Mainnet.
>
> That is BizFlow Pilot: real business activity, real Arc USDC settlement, zero private keys in AI hands."
