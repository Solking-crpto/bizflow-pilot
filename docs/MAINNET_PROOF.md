# BizFlow Pilot — Arc Mainnet Verification & Live Proof Guide

**Network:** Arc Mainnet  
**Chain ID:** `5042` (`0x13b2`)  
**Native Gas Asset:** USDC (18 decimals via `eth_getBalance`)  
**USDC System Contract:** `0x3600000000000000000000000000000000000000` (6 decimals via ERC-20 `transfer`)  
**Primary RPC:** `https://rpc.mainnet.arc.io` (Fallback: `https://rpc.arc.network`)  
**Explorer:** `https://explorer.arc.io`

---

## 1. Safety Guardrails for Mainnet Execution

BizFlow Pilot includes hard-coded safety controls for Arc Mainnet:

1. **Safety Cap (`MAX_MAINNET_PAYMENT_USDC`)**:
   - Fixed to `1.00 USDC` by default to prevent accidental large fund movements during hackathon demonstrations.
   - Enforced by Rule 8 in `lib/policy/engine.ts`.
2. **Explicit Human Confirmation Modal**:
   - In `mainnet` mode, the Payment Desk displays a navy confirmation modal that explicitly restates the exact USDC amount, destination vendor address, and Arc network ID.
3. **Decoupled Key Storage**:
   - The treasury signer key (`TREASURY_PRIVATE_KEY`) is stored exclusively in server environment variables and is never transmitted to the browser client or exposed to the LLM agent.

---

## 2. Step-by-Step Mainnet Deployment & Live Transaction Checklist

### Step 2.1: Fund Treasury Account with Mainnet USDC
1. Generate or assign a dedicated demo treasury wallet address.
2. Request a tiny allocation of Mainnet USDC for gas and payments via your Circle representative, or bridge USDC from Ethereum using Circle Bridge Kit / CCTP.
3. Verify native gas balance via RPC:
   ```bash
   curl -X POST https://rpc.mainnet.arc.io \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["<YOUR_TREASURY_ADDRESS>", "latest"],"id":1}'
   ```

### Step 2.2: Deploy AuditAnchor.sol to Arc Mainnet
Run the deployment script configured with the `paris` EVM target:
```bash
npx hardhat run scripts/deployAnchor.js --network arcMainnet
```
This generates `deployments/arcMainnet.json` with the deployed contract address. Copy the address into `AUDIT_ANCHOR_ADDRESS` in `.env.local`.

### Step 2.3: Execute Live Mainnet Settlement (<= 1.00 USDC)
1. Set `NEXT_PUBLIC_NETWORK_MODE="mainnet"` in `.env.local`.
2. Start the app with `npm run dev`.
3. Open the **Payment Desk** at `http://localhost:3000/payments`.
4. Observe the navy **ARC MAINNET** badge.
5. Select a 1.00 USDC payable obligation, click **Execute Settlement**, and confirm the modal.
6. The transaction will execute via `DirectEvmProvider`, confirm on Arc Mainnet, and anchor on `AuditAnchor.sol`.

---

## 3. Verified Proof Record Template

Once executed, record your live hashes below:

```text
================================================================================
BIZFLOW PILOT — ARC MAINNET PROOF OF SETTLEMENT
================================================================================
Timestamp: [INSERT_DATE_TIME]
Chain ID: 5042
Treasury Address: [INSERT_TREASURY_ADDRESS]
Beneficiary Address: [INSERT_BENEFICIARY_ADDRESS]
Settled Amount: 1.00 USDC

Arc Settlement Tx Hash:
0x...
Explorer Link: https://explorer.arc.io/tx/0x...

AuditAnchor Contract Address:
0x...
Explorer Link: https://explorer.arc.io/address/0x...

AuditAnchor Tx Hash:
0x...
Explorer Link: https://explorer.arc.io/tx/0x...

Public Payment Passport URL:
https://bizflow-pilot.vercel.app/verify/[PAYMENT_ID]
================================================================================
```
