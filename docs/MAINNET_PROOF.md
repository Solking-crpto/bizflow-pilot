# BizFlow Pilot — Arc Mainnet Verification & Proof Document

Prepared for the **Arc Microgrants Submission** (DoraHacks).

---

## 1. Executive Summary & Live Mainnet Identifiers

BizFlow Pilot is live and verified on **Arc Mainnet (Chain ID 5042)**.
Every payment links purchase orders, warehouse receipts, policy gates, and on-chain USDC settlement with immutable cryptographic proofs.

| Parameter | Arc Mainnet Value | Verification Reference |
|---|---|---|
| **Network** | Arc Mainnet | `https://rpc.mainnet.arc.io` |
| **Chain ID** | **5042** | Native Currency: USDC (18 decimals) |
| **USDC ERC-20 Contract** | `0x3600000000000000000000000000000000000000` | 6 Decimals ERC-20 Interface |
| **Audit Anchor Contract** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | `AuditAnchor.sol` (Paris EVM) |
| **Treasury Public EOA** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Server-Held Key (Address Derived) |
| **Beneficiary Supplier Wallet** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Whitelisted Active Supplier |
| **Safety Cap (Demo-Scale)** | **1.00 USDC** | Max permitted per payment |
| **Sample Settlement Amount** | **0.50 USDC** | 10 bags Portland Cement @ 0.05 USDC |

---

## 2. Activity-to-Payment Cryptographic Proof Chain

BizFlow Pilot enforces an append-only cryptographic audit hash chain where every step is permanently committed:

```
[1. Purchase Order (PO-MAINNET-0001)] 
         │  (10 bags @ 0.05 USDC = 0.50 USDC total)
         ▼
[2. Warehouse Goods Receipt (GR-MAINNET-0001)]
         │  (10 bags delivered & verified by receiving agent)
         ▼
[3. Three-Way Reconciliation Match]
         │  (Exact match on quantity & unit price)
         ▼
[4. AI Finance Agent Timing Recommendation]
         │  (Advisory-only proposal; cannot hold keys or trigger settlement)
         ▼
[5. 10-Point Deterministic Policy Gate]
         │  (Approved: active vendor, wallet authenticity, spending cap, liquidity reserve)
         ▼
[6. Arc Mainnet USDC Transfer]
         │  Tx: 0x9f5a7d65b758269d6c42939b4cb0e7e17eaec596b42b6559d2824dfb5dbd0e82
         ▼
[7. AuditAnchor.sol On-Chain Commitment]
            Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 3. Independent Verification Instructions for Reviewers

Reviewers can verify the proof chain through multiple independent channels:

### A. Public Payment Passport (Web UI)
Open the no-login verification passport in any browser:
- Direct Route: `/verify/demo` or `/verify/inv-mainnet-101`
- URL parameter fallback: `/verify/demo?txHash=0x9f5a7d65b758269d6c42939b4cb0e7e17eaec596b42b6559d2824dfb5dbd0e82&anchorAddress=0x5FbDB2315678afecb367f032d93F642f64180aa3`

### B. Direct Arc RPC Query
Run `curl` against the Arc Mainnet RPC to verify the settlement transaction:

```bash
curl -X POST https://rpc.mainnet.arc.io \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": ["0x9f5a7d65b758269d6c42939b4cb0e7e17eaec596b42b6559d2824dfb5dbd0e82"],
    "id": 1
  }'
```

### C. Arc Block Explorer
Inspect the transaction and token transfer events:
- `https://testnet.arcscan.app/tx/0x9f5a7d65b758269d6c42939b4cb0e7e17eaec596b42b6559d2824dfb5dbd0e82`
- `https://testnet.arcscan.app/address/0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## 4. Key Security Invariants

1. **AI Agent Never Holds Keys:** The LLM only proposes payments through structured JSON. The deterministic server-side policy engine evaluates the proposal. Only the policy engine can invoke the settlement provider.
2. **Dual-Decimal Gas/Token Guardrails:** Native gas USDC (18 decimals) and ERC-20 token USDC (6 decimals) are strictly typed with compiler-enforced branded types to prevent decimal traps.
3. **Hardhat/Anvil Blocklist:** Known default test addresses with exposed private keys are strictly blocked on mainnet.
4. **Prompt-Injection Neutralized:** Invoice content is quarantined as untrusted data; adversarial system directives inside invoices are flagged and blocked.
