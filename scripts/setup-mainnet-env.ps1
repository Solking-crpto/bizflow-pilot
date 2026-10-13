$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

function Fail($m) { Write-Host "STOP: $m" -ForegroundColor Red; exit 1 }
function Get-Ref($url) { if ($url -match 'postgres\.([a-z0-9]+):') { return $matches[1] } else { return $null } }
function Free-Port { Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }
function Read-Clip($prompt) {
  Read-Host $prompt | Out-Null
  $c = Get-Clipboard -Raw
  if (-not $c) { Fail 'The clipboard is empty. Copy the value first, then press Enter.' }
  return $c.Trim().Trim('"')
}

Write-Host "`nBizFlow Pilot - mainnet setup" -ForegroundColor Cyan
Free-Port

$testRef = $null
if (Test-Path .env) {
  $d = Get-Content .env | Where-Object { $_ -match '^\s*DIRECT_URL\s*=' } | Select-Object -First 1
  $testRef = Get-Ref $d
}

# 1. database (clipboard) + password (typed)
Write-Host "`n1/4 In Supabase (bizflow-mainnet): Connect > Session pooler > COPY the string." -ForegroundColor Yellow
$raw = Read-Clip 'Copied it? Press Enter'
$urls = @([regex]::Matches($raw, 'postgres(?:ql)?://[^\s"'']+') | ForEach-Object { $_.Value })
if ($urls.Count -eq 0) { Fail ("No postgresql:// URL found. Clipboard length: " + $raw.Length + ", starts with: [" + $raw.Substring(0,[Math]::Min(6,$raw.Length)) + "]") }
$pick = $urls | Where-Object { $_ -match ':5432/' } | Select-Object -First 1
if (-not $pick) { $pick = $urls[0] }
$raw = $pick
$raw = $raw.Trim('"')
if ($raw -notmatch '^postgres(ql)?://') { Fail 'The clipboard does not hold a postgresql:// string. Copy the Session pooler string from Supabase and try again.' }
if ($raw -notmatch '^postgres(?:ql)?://([^:]+):(.*)@([^@]+)$') { Fail 'Could not read that connection string.' }
$user = $matches[1]; $hostpart = $matches[3]
$hostpart = ($hostpart -split '\?')[0] -replace ':6543/',':5432/'
if ($hostpart -notmatch ':5432/') { Fail 'Use the Session pooler string (port 5432).' }
$mainRef = Get-Ref "postgresql://${user}:x@h"
if ($testRef -and $mainRef -eq $testRef) { Fail 'That is your TESTNET project. Use the bizflow-mainnet project.' }
Write-Host "Read: postgresql://${user}:***@${hostpart}" -ForegroundColor Green
$sp = Read-Host 'Type the mainnet database password (hidden, type it, do not paste)' -AsSecureString
$bp = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sp)
$pw = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bp)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bp)
if (-not $pw) { Fail 'No password was entered.' }
$db = "postgresql://${user}:$([uri]::EscapeDataString($pw))@${hostpart}"
$pw = $null

# 2. RPC
Write-Host "`n2/4 Quicknode mainnet URL: copy it and type Y, or just press Enter to skip." -ForegroundColor Yellow
$ans = Read-Host 'Y or Enter'
$rpc = 'https://rpc.mainnet.arc.io'
if ($ans -match '^[Yy]') {
  $rpc = Get-Clipboard -Raw
  $rpc = $rpc.Trim().Trim('"')
  if ($rpc -notmatch '^https://') { Fail 'The clipboard does not hold an https:// URL.' }
  Write-Host 'Quicknode URL read.' -ForegroundColor Green
} else { Write-Host 'Using the official RPC (may be permissioned).' -ForegroundColor Yellow }

# 3. treasury key (clipboard)
Write-Host "`n3/4 In MetaMask (the DEMO wallet): Account details > Show private key > COPY it." -ForegroundColor Yellow
$key = Read-Clip 'Copied it? Press Enter'
$key = $key.Trim()
if ($key -notmatch '^0x') { $key = "0x$key" }
if ($key -notmatch '^0x[0-9a-fA-F]{64}$') { Fail 'That is not a private key (64 hex characters). Copy it again.' }
Set-Clipboard -Value ' '
$env:BZ_TK = $key
$treasury = $null
try { $treasury = (node -e "const {privateKeyToAccount}=require('viem/accounts');console.log(privateKeyToAccount(process.env.BZ_TK).address)").Trim() } catch { }
Remove-Item Env:BZ_TK -ErrorAction SilentlyContinue
if ($treasury -match '^0x[0-9a-fA-F]{40}$') { Write-Host "Key OK. Treasury PUBLIC address (send your USDC here): $treasury" -ForegroundColor Green }
else { Write-Host 'Key format OK (could not derive the address; we will check it in preflight).' -ForegroundColor Yellow }

# 4. vendor wallet (public)
$vendor = (Read-Host "`n4/4 Vendor wallet PUBLIC address (0x...)").Trim()
if ($vendor -notmatch '^0x[0-9a-fA-F]{40}$') { Fail 'A wallet address is 0x followed by 40 characters.' }
if ($treasury -and $vendor.ToLower() -eq $treasury.ToLower()) { Fail 'The vendor must be a different wallet from the treasury.' }
$bad = @('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266','0x70997970c51812dc3a010c7d01b50e0d17dc79c8','0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc','0x90f79bf6eb2c4f870365e785982e1f101e93b906','0x15d34aaf54267db7d7c367839aaf71a00a2c6a65','0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc')
if ($bad -contains $vendor.ToLower()) { Fail 'That is a public test wallet. Use your own wallet.' }

$llm = @()
if (Test-Path .env) { $llm = @(Get-Content .env | Where-Object { $_ -match '^\s*(LLM_PROVIDER|GOOGLE_API_KEY|ANTHROPIC_API_KEY)\s*=' }) }

$content = @(
  'NEXT_PUBLIC_NETWORK_MODE=mainnet',
  'NEXT_PUBLIC_APP_URL=http://localhost:3001',
  'PAYMENT_PROVIDER=direct',
  'DRY_RUN=true',
  "DATABASE_URL=$db",
  "DIRECT_URL=$db",
  "ARC_MAINNET_RPC_URL=$rpc",
  'ARC_MAINNET_RPC_FALLBACKS=https://rpc.mainnet.arc.io',
  'ARC_MAINNET_EXPLORER_URL=https://explorer.arc.io',
  'ARC_MAINNET_USDC_ADDRESS=0x3600000000000000000000000000000000000000',
  "TREASURY_PRIVATE_KEY=$key",
  "VENDOR_WALLET_ADDRESS=$vendor",
  'MAX_MAINNET_PAYMENT_USDC=1.00',
  'MIN_RESERVE_USDC=0.25',
  'AUDIT_ANCHOR_ADDRESS='
) + $llm
[System.IO.File]::WriteAllLines((Join-Path (Get-Location) '.env.mainnet.local'), $content)
Write-Host "`nCreated .env.mainnet.local (DRY_RUN=true: nothing will be sent)" -ForegroundColor Green

git check-ignore -q .env.mainnet.local
if ($LASTEXITCODE -ne 0) { Add-Content .gitignore "`n.env.mainnet.local"; Write-Host 'Added .env.mainnet.local to .gitignore' -ForegroundColor Yellow }

$key = $null; $db = $null; $rpc = $null
$ErrorActionPreference = 'Continue'
Free-Port

Write-Host "`n[1/4] prisma generate" -ForegroundColor Cyan
npx prisma generate
Write-Host "`n[2/4] push schema to the MAINNET database" -ForegroundColor Cyan
npm run db:push:mainnet
Write-Host "`n[3/4] seed demo-scale data" -ForegroundColor Cyan
npm run seed:mainnet
Write-Host "`n[4/4] preflight check (read-only)" -ForegroundColor Cyan
npm run preflight:mainnet


