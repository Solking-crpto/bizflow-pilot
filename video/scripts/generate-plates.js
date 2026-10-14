import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");
const videoDir = path.resolve(__dirname, "../");
const assetsDir = path.resolve(videoDir, "assets");
const platesDir = path.resolve(videoDir, "cache/plates");

if (!fs.existsSync(platesDir)) {
  fs.mkdirSync(platesDir, { recursive: true });
}

const configPath = path.resolve(videoDir, "video.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Read logo SVG
const logoSvg = fs.readFileSync(path.join(assetsDir, "logo-mark.svg"), "utf-8");

// Convert image to base64
function imgToBase64(filename) {
  const file = path.join(assetsDir, filename);
  if (!fs.existsSync(file)) return "";
  const buf = fs.readFileSync(file);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const scenes = [
  {
    id: 1,
    name: "01_command_center",
    file: "01_command_center.png",
    url: "https://bizflow.internal/command-center",
    title: "Command Center · Real-Time Treasury Overview",
  },
  {
    id: 2,
    name: "02_inventory",
    file: "02_inventory.png",
    url: "https://bizflow.internal/inventory",
    title: "Inventory & Purchase Orders · Authorizations & Receiving Slips",
  },
  {
    id: 3,
    name: "03_invoice_desk",
    file: "03_invoice_desk.png",
    url: "https://bizflow.internal/invoices",
    title: "Invoice Desk · 3-Way Reconciliation & Threat Screening",
  },
  {
    id: 4,
    name: "04_agent",
    file: "04_agent.png",
    url: "https://bizflow.internal/agent",
    title: "AI Finance Agent · Propose-Only Obligation Optimization",
  },
  {
    id: 5,
    name: "05_simulator",
    file: "05_simulator.png",
    url: "https://bizflow.internal/simulator",
    title: "Policy Simulator · Deterministic 10-Point Rule Engine",
  },
  {
    id: 6,
    name: "06_payment_desk",
    file: "06_payment_desk.png",
    url: "https://bizflow.internal/payments",
    title: "Payment Desk · Passcode-Protected Arc Mainnet Settlement",
  },
  {
    id: 7,
    name: "07_audit_ledger",
    file: "07_audit_ledger.png",
    url: "https://bizflow.internal/audit",
    title: "Trust & Audit Ledger · SHA-256 Hash Chain & On-Chain Anchor",
  },
  {
    id: 8,
    name: "08_judge_guide",
    file: "08_judge_guide.png",
    url: "https://bizflow.internal/judges",
    title: "Judge Evaluation Guide · Live Verification on Arc Mainnet",
  },
];

async function generatePlates() {
  console.log("Launching Edge browser via Playwright...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  // 1. Title Card Plate (Scene 0)
  console.log("Generating Title Card plate...");
  const page0 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page0.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1920px;
          height: 1080px;
          background: radial-gradient(circle at 50% 40%, #163B66 0%, #0B1F33 70%, #071524 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .logo-wrap {
          width: 160px;
          height: 160px;
          margin-bottom: 32px;
          filter: drop-shadow(0 20px 40px rgba(14, 159, 142, 0.35));
        }
        .title {
          font-size: 76px;
          font-weight: 800;
          letter-spacing: -2px;
          background: linear-gradient(180deg, #FFFFFF 0%, #E2EDF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
        }
        .title span {
          background: linear-gradient(135deg, #19C3AE 0%, #0E9F8E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(14, 159, 142, 0.15);
          border: 1px solid rgba(14, 159, 142, 0.4);
          color: #19C3AE;
          padding: 8px 18px;
          border-radius: 9999px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #19C3AE;
          box-shadow: 0 0 10px #19C3AE;
        }
        .tagline {
          font-size: 34px;
          font-weight: 600;
          color: #E2EDF8;
          max-width: 1000px;
          text-align: center;
          line-height: 1.4;
          letter-spacing: -0.5px;
        }
        .tagline .hl {
          color: #19C3AE;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="badge">
        <div class="badge-dot"></div>
        Arc Mainnet · Chain 5042
      </div>
      <div class="logo-wrap">${logoSvg}</div>
      <h1 class="title">BizFlow <span>Pilot</span></h1>
      <p class="tagline">The <span class="hl">AI</span> proposes. Policy decides. The <span class="hl">wallet obeys</span>.</p>
    </body>
    </html>
  `);
  await page0.screenshot({ path: path.join(platesDir, "plate_00_title.png"), type: "png" });
  await page0.close();

  // 2. Browser Window Plates (Scenes 1-8)
  for (const s of scenes) {
    console.log(`Generating plate for Scene ${s.id} (${s.name})...`);
    const imgData = imgToBase64(s.file);
    const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1920px;
            height: 1080px;
            background: radial-gradient(circle at 50% 30%, #153860 0%, #0B1F33 65%, #071524 100%);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            position: relative;
            overflow: hidden;
            padding-top: 55px;
          }
          .grid-bg {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
            background-size: 60px 60px;
            pointer-events: none;
          }
          .window-card {
            width: 1620px;
            height: 810px;
            background: #0E1726;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(14, 159, 142, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            z-index: 10;
          }
          .chrome-header {
            height: 42px;
            background: #111E30;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            padding: 0 16px;
            gap: 16px;
            flex-shrink: 0;
          }
          .traffic-dots {
            display: flex;
            gap: 8px;
          }
          .dot {
            width: 11px;
            height: 11px;
            border-radius: 50%;
          }
          .dot-red { background: #FF5F56; }
          .dot-yellow { background: #FFBD2E; }
          .dot-green { background: #27C93F; }
          .url-bar {
            flex: 1;
            max-width: 680px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            color: #94A3B8;
          }
          .url-bar span {
            color: #19C3AE;
          }
          .window-title {
            font-size: 12px;
            color: #64748B;
            font-weight: 500;
          }
          .screenshot-container {
            flex: 1;
            background: #0B132B;
            position: relative;
            overflow: hidden;
          }
          .screenshot-img {
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="grid-bg"></div>
        <div class="window-card">
          <div class="chrome-header">
            <div class="traffic-dots">
              <div class="dot dot-red"></div>
              <div class="dot dot-yellow"></div>
              <div class="dot dot-green"></div>
            </div>
            <div class="url-bar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>https://</span>bizflow-pilot.arc.mainnet/${s.name.replace(/^[0-9]+_/, "")}
            </div>
            <div class="window-title">${s.title.split("·")[0].trim()}</div>
          </div>
          <div class="screenshot-container">
            <img class="screenshot-img" src="${imgData}" alt="${s.title}" />
          </div>
        </div>
      </body>
      </html>
    `);
    await p.screenshot({ path: path.join(platesDir, `plate_${s.name}.png`), type: "png" });
    await p.close();
  }

  // 3. End Card Plate (Scene 8 tail)
  console.log("Generating End Card plate...");
  const pageEnd = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const txShort = config.paymentTxHash ? `${config.paymentTxHash.slice(0, 10)}...${config.paymentTxHash.slice(-8)}` : "";
  const anchorShort = config.anchorTxHash ? `${config.anchorTxHash.slice(0, 10)}...${config.anchorTxHash.slice(-8)}` : "";
  await pageEnd.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1920px;
          height: 1080px;
          background: radial-gradient(circle at 50% 35%, #153860 0%, #0B1F33 65%, #071524 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .logo-wrap {
          width: 130px;
          height: 130px;
          margin-bottom: 24px;
          filter: drop-shadow(0 20px 40px rgba(14, 159, 142, 0.35));
        }
        .title {
          font-size: 64px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 12px;
        }
        .title span {
          background: linear-gradient(135deg, #19C3AE 0%, #0E9F8E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(14, 159, 142, 0.15);
          border: 1px solid rgba(14, 159, 142, 0.4);
          color: #19C3AE;
          padding: 8px 20px;
          border-radius: 9999px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 36px;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #19C3AE;
          box-shadow: 0 0 10px #19C3AE;
        }
        .links-grid {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
        }
        .link-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 16px 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .link-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #19C3AE;
          text-transform: uppercase;
          font-weight: 600;
        }
        .link-val {
          font-size: 18px;
          font-weight: 600;
          color: #FFFFFF;
        }
        .proof-box {
          background: rgba(11, 31, 51, 0.8);
          border: 1px solid rgba(14, 159, 142, 0.3);
          border-radius: 12px;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }
        .proof-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .proof-label {
          color: #94A3B8;
        }
        .proof-val {
          color: #19C3AE;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="logo-wrap">${logoSvg}</div>
      <h1 class="title">BizFlow <span>Pilot</span></h1>
      <div class="badge">
        <div class="badge-dot"></div>
        Live on Arc Mainnet · Built for Arc Microgrants
      </div>
      <div class="links-grid">
        <div class="link-pill">
          <span class="link-label">Live Deployment</span>
          <span class="link-val">${config.liveUrl.replace(/^https?:\/\//, "")}</span>
        </div>
        <div class="link-pill">
          <span class="link-label">Open Source Repository</span>
          <span class="link-val">${config.repoUrl.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
      ${txShort ? `
      <div class="proof-box">
        <div class="proof-item">
          <span class="proof-label">Mainnet Payment:</span>
          <span class="proof-val">${txShort}</span>
        </div>
        ${anchorShort ? `
        <div class="proof-item">
          <span class="proof-label">Audit Anchor:</span>
          <span class="proof-val">${anchorShort}</span>
        </div>` : ""}
      </div>` : ""}
    </body>
    </html>
  `);
  await pageEnd.screenshot({ path: path.join(platesDir, "plate_09_end_card.png"), type: "png" });
  await pageEnd.close();

  await browser.close();
  console.log("All plates successfully generated!");
}

generatePlates().catch((err) => {
  console.error("Plate generation failed:", err);
  process.exit(1);
});
