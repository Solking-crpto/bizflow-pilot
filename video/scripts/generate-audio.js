import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");
const videoDir = path.resolve(__dirname, "../");
const mediaDir = path.resolve(rootDir, "media");
const cacheDir = path.resolve(videoDir, "cache/audio");

// 1. Read environment securely
const envPath = path.resolve(rootDir, ".env.video.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.video.local does not exist.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
let apiKey = "";
let voiceId = "uH7gCqB801c6y7oEmaew";
let modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith("ELEVENLABS_API_KEY=")) {
    apiKey = trimmed.slice("ELEVENLABS_API_KEY=".length).trim();
  }
  if (trimmed.startsWith("ELEVENLABS_VOICE_ID=")) {
    voiceId = trimmed.slice("ELEVENLABS_VOICE_ID=".length).trim();
  }
}

if (!apiKey) {
  console.error("Error: ELEVENLABS_API_KEY is missing in .env.video.local.");
  process.exit(1);
}

// 2. Read video config
const configPath = path.resolve(videoDir, "video.config.json");
let config = {
  paymentTxHash: "",
  anchorTxHash: "",
};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

// 3. Check for optional screenshots in media/
function fileExistsWithExt(baseName) {
  const exts = [".png", ".jpg", ".jpeg", ".webp"];
  for (const ext of exts) {
    const full = path.join(mediaDir, `${baseName}${ext}`);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

const hasPaymentConfirmed = !!fileExistsWithExt("Payment Confirmed");
const hasPaymentPassport = !!fileExistsWithExt("Payment Passport");
const hasVendorWallet = !!fileExistsWithExt("Vendor Wallet Balance");

// 4. Determine scene script text
const scene6UseVersionA = Boolean(config.paymentTxHash && hasPaymentConfirmed);
const scene7UseVersionA = Boolean(config.anchorTxHash);

console.log("=== SCENE SCRIPT SELECTION ===");
console.log(`Scene 6: ${scene6UseVersionA ? "Version A (Payment Confirmed)" : "Version B (Policy-Approved Settlement)"}`);
console.log(`Scene 7: ${scene7UseVersionA ? "Version A (Anchored on Arc)" : "Version B (Hash-Chained Ledger)"}`);
console.log(`Optional media: Payment Confirmed=${hasPaymentConfirmed}, Payment Passport=${hasPaymentPassport}, Vendor Wallet=${hasVendorWallet}`);

const scenes = [
  {
    id: 0,
    title: "Title Card",
    name: "00_title",
    text: "Small businesses lose money to duplicate invoices, overbilling, and payments sent to the wrong wallet. This is BizFlow Pilot: an A I finance agent that never holds the keys.",
  },
  {
    id: 1,
    title: "Command Center",
    name: "01_command_center",
    text: "The Command Center runs live on Arc mainnet. The treasury balance is read straight from the chain, and every payable, approval and settlement is tied to a cryptographic proof chain.",
  },
  {
    id: 2,
    title: "Inventory & Purchase Orders",
    name: "02_inventory",
    text: "Everything starts with business records. Purchase orders and signed goods receipts are the source of truth for every payment decision.",
  },
  {
    id: 3,
    title: "Invoice Desk",
    name: "03_invoice_desk",
    text: "When an invoice arrives, it is matched three ways: purchase order, goods receipt, and invoice. A duplicate is blocked automatically. A quantity mismatch is sent to review. And this invoice hides an instruction telling the A I to pay a new wallet. BizFlow treats that text as untrusted data, flags the threat, and the payment never reaches execution.",
  },
  {
    id: 4,
    title: "AI Finance Agent",
    name: "04_agent",
    text: "The A I agent ranks obligations, explains cash-flow risk, and recommends what to pay and when. But it can only propose. It cannot sign, spend, or change the rules. If the model fails, a deterministic fallback takes over.",
  },
  {
    id: 5,
    title: "Policy Simulator",
    name: "05_simulator",
    text: "A deterministic policy engine enforces ten rules: approved vendor, matching wallet, three-way match, spending limits, and a safety reserve. The simulator shows exactly which rule would block a change, with no side effects.",
  },
  {
    id: 6,
    title: "Payment Desk",
    name: "06_payment_desk",
    text: scene6UseVersionA
      ? "Now the real payment. Zero point five zero U S D C, capped at one U S D C for this demo, protected by an owner passcode. The server re-checks every rule at execution time, sends the transfer on Arc mainnet, and verifies the receipt and transfer event directly from the chain. The transaction hash is on screen."
      : "The Payment Desk executes only policy-approved settlements. Each payment is capped, needs an owner passcode, is re-checked at execution time, and is verified from the chain after it is sent.",
  },
  {
    id: 7,
    title: "Trust & Audit Ledger",
    name: "07_audit_ledger",
    text: scene7UseVersionA
      ? "Every step is written to a hash-chained ledger, and the proof is anchored on Arc by an on-chain audit contract. Change any record, and chain verification fails."
      : "Every step is written to a hash-chained ledger. Change any record, and chain verification fails.",
  },
  {
    id: 8,
    title: "Judge Guide & Outro",
    name: "08_judge_guide",
    text: "For reviewers, the Judge Guide lists every requirement with live links to the mainnet transaction, the contract, and the public repository. Anyone can verify a payment without logging in. BizFlow Pilot: the A I proposes, the policy decides, and the wallet obeys.",
  },
];

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const voiceSettings = {
  stability: 0.5,
  similarity_boost: 0.8,
  style: 0.15,
  use_speaker_boost: true,
};

let totalCharactersUsed = 0;

async function generateSceneAudio(scene, index) {
  const hashKey = crypto
    .createHash("sha256")
    .update(`${scene.text}_${voiceId}_${modelId}_${JSON.stringify(voiceSettings)}`)
    .digest("hex")
    .slice(0, 12);

  const rawAudioPath = path.join(cacheDir, `${scene.name}_${hashKey}.raw.mp3`);
  const alignmentPath = path.join(cacheDir, `${scene.name}_${hashKey}.alignment.json`);
  const finalAudioPath = path.join(cacheDir, `${scene.name}_final.mp3`);
  const wordsJsonPath = path.join(cacheDir, `${scene.name}_words.json`);

  let alignmentData = null;

  if (fs.existsSync(rawAudioPath) && fs.existsSync(alignmentPath)) {
    console.log(`[Cache Hit] Scene ${scene.id} (${scene.name})`);
    alignmentData = JSON.parse(fs.readFileSync(alignmentPath, "utf-8"));
  } else {
    console.log(`[API Call] Scene ${scene.id} (${scene.name}) - length: ${scene.text.length} chars...`);
    totalCharactersUsed += scene.text.length;

    const previous_text = index > 0 ? scenes[index - 1].text : undefined;
    const next_text = index < scenes.length - 1 ? scenes[index + 1].text : undefined;

    const payload = {
      text: scene.text,
      model_id: modelId,
      voice_settings: voiceSettings,
      previous_text,
      next_text,
    };

    // Try /with-timestamps first
    let res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      console.error("ElevenLabs authentication failed (401). Please check your API key in .env.video.local.");
      process.exit(1);
    }

    if (res.ok) {
      const data = await res.json();
      const audioBuffer = Buffer.from(data.audio_base64, "base64");
      fs.writeFileSync(rawAudioPath, audioBuffer);
      alignmentData = data.alignment || null;
      fs.writeFileSync(alignmentPath, JSON.stringify(alignmentData, null, 2));
    } else {
      console.log(`with-timestamps returned status ${res.status}, falling back to standard text-to-speech...`);
      res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`ElevenLabs API error (${res.status}): ${errText}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(rawAudioPath, Buffer.from(arrayBuffer));
      alignmentData = null;
      fs.writeFileSync(alignmentPath, JSON.stringify(null));
    }
  }

  // Post-processing with ffmpeg:
  // 1. silenceremove head/tail
  // 2. add 150ms delay at head, apad 350ms at tail
  // 3. loudnorm integrated -16 LUFS, true peak -1.5 dB
  console.log(`[Processing Audio] ${scene.name}...`);
  const filter = [
    "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB:detection=peak",
    "areverse",
    "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB:detection=peak",
    "areverse",
    "adelay=150|150",
    "apad=pad_len=16800",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
  ].join(",");

  const ffmpegCmd = `ffmpeg -y -v error -i "${rawAudioPath}" -af "${filter}" -ar 48000 -b:a 192k "${finalAudioPath}"`;
  execSync(ffmpegCmd);

  // Probe duration
  const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${finalAudioPath}"`;
  const durStr = execSync(probeCmd).toString().trim();
  const durationSec = parseFloat(durStr);

  // Build words timing array
  const wordsTiming = buildWordTimings(scene.text, alignmentData, durationSec);
  fs.writeFileSync(wordsJsonPath, JSON.stringify({ durationSec, words: wordsTiming }, null, 2));

  console.log(`  -> Duration: ${durationSec.toFixed(2)}s`);
  return { id: scene.id, name: scene.name, title: scene.title, durationSec, words: wordsTiming, path: finalAudioPath };
}

function buildWordTimings(text, alignment, totalDuration) {
  if (alignment && alignment.characters && alignment.character_start_times_seconds) {
    const chars = alignment.characters;
    const starts = alignment.character_start_times_seconds;
    const ends = alignment.character_end_times_seconds;

    const words = [];
    let currentWord = "";
    let wordStart = null;
    let wordEnd = null;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (/\s/.test(char)) {
        if (currentWord) {
          // Adjust for 150ms head padding
          words.push({
            word: currentWord,
            start: Math.max(0, (wordStart ?? 0) + 0.15),
            end: (wordEnd ?? (wordStart ?? 0) + 0.2) + 0.15,
          });
          currentWord = "";
          wordStart = null;
          wordEnd = null;
        }
      } else {
        if (wordStart === null) wordStart = starts[i];
        wordEnd = ends[i];
        currentWord += char;
      }
    }
    if (currentWord) {
      words.push({
        word: currentWord,
        start: Math.max(0, (wordStart ?? 0) + 0.15),
        end: (wordEnd ?? (wordStart ?? 0) + 0.2) + 0.15,
      });
    }
    return words;
  }

  // Fallback: estimate linearly from words
  const rawWords = text.trim().split(/\s+/);
  const speechDuration = Math.max(0.5, totalDuration - 0.5);
  const timePerWord = speechDuration / rawWords.length;
  return rawWords.map((word, i) => ({
    word,
    start: 0.15 + i * timePerWord,
    end: 0.15 + (i + 0.9) * timePerWord,
  }));
}

async function main() {
  console.log("=== BIZFLOW PILOT AUDIO PRODUCTION ===");
  const results = [];
  let totalVideoDuration = 0;

  for (let i = 0; i < scenes.length; i++) {
    const res = await generateSceneAudio(scenes[i], i);
    results.push(res);
    totalVideoDuration += res.durationSec;
  }

  console.log("\n=== NARRATION AUDIO SUMMARY ===");
  console.log(`ElevenLabs characters billed: ${totalCharactersUsed}`);
  results.forEach((r) => {
    console.log(`Scene ${r.id} (${r.title}): ${r.durationSec.toFixed(2)}s`);
  });
  console.log(`Total narration duration: ${totalVideoDuration.toFixed(2)}s (${Math.floor(totalVideoDuration / 60)}m ${(totalVideoDuration % 60).toFixed(1)}s)`);

  if (totalVideoDuration > 175) {
    console.warn(`WARNING: Total audio duration (${totalVideoDuration.toFixed(1)}s) exceeds 175s hard cap!`);
  } else {
    console.log(`[PASS] Video duration is within target (target: ~155s, limit: 175s).`);
  }

  // Write master audio manifest
  fs.writeFileSync(
    path.join(cacheDir, "manifest.json"),
    JSON.stringify({ totalCharactersUsed, totalVideoDuration, scenes: results }, null, 2)
  );
}

main().catch((err) => {
  console.error("Audio generation failed:", err);
  process.exit(1);
});
