# BizFlow Pilot — Technical & Operational Assumptions

Documenting engineering and operational decisions made for autonomous execution.

1. **Dual-Deployment Topology & Provider Selection**:
   - Staging/Testnet runs on Arc Testnet (Chain ID 5042002).
   - Production/Submission runs on Arc Mainnet (Chain ID 5042).
   - Because Circle developer docs only document `ARC-TESTNET` publicly, `DirectEvmProvider` (using viem with server-only key `TREASURY_PRIVATE_KEY`) serves as the production-ready, reliable provider for Mainnet settlement, with `CircleWalletsProvider` fully implemented for Testnet.

2. **Database & Persistence**:
   - We will use PostgreSQL (Supabase / standard Postgres) with Prisma ORM.
   - For local development and instant offline testing without pre-existing external Supabase credentials, the system will support an embedded SQLite or local PostgreSQL configuration, seamlessly connecting to live Supabase Postgres when `DATABASE_URL` is populated.
   - All migrations and seed scripts will run cleanly on both SQLite and PostgreSQL.

3. **Authentication**:
   - Supabase Auth (Magic Link) is supported when configured.
   - An instant corporate "Demo Owner Mode" is provided so reviewers and judges can immediately experience the command center without waiting for email magic links.

4. **USDC Decimals & System Contract**:
   - We strictly adhere to the 6-decimal standard for all financial calculations, invoices, purchase orders, and ERC-20 transfers.
   - Native gas balances returned from `eth_getBalance` (18 decimals) are isolated from ERC-20 token balances (6 decimals) using branded TypeScript types in `lib/money.ts`.
   - Contract `0x3600000000000000000000000000000000000000` is the default system contract for USDC on Arc, configurable via `ARC_MAINNET_USDC_ADDRESS` / `ARC_TESTNET_USDC_ADDRESS`.

5. **AI Model Agnostic with Deterministic Fallback**:
   - The AI agent supports Anthropic Claude and Google Gemini via unified structured JSON outputs validated by Zod schemas.
   - If no API key is provided, or if the model fails or times out, a deterministic financial heuristic algorithm immediately kicks in so the application is 100% resilient and self-contained for any reviewer.

6. **Safety Rails & Mainnet Guardrails**:
   - `MAX_MAINNET_PAYMENT_USDC` is enforced at 1.00 USDC default in mainnet mode to prevent catastrophic loss of funds during testing/demo.
   - An emergency Global Kill Switch halts all outbound transfers immediately at the policy engine level.
   - Idempotency keys (`idempotencyKey`) on all payments prevent double-spends on network retries or accidental double-clicks.
