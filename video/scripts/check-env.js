import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env.video.local");

if (!fs.existsSync(envPath)) {
  console.log("Status: .env.video.local NOT found");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf-8");
const lines = content.split(/\r?\n/);
let hasApiKey = false;
let voiceId = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith("ELEVENLABS_API_KEY=")) {
    const val = trimmed.slice("ELEVENLABS_API_KEY=".length).trim();
    if (val.length > 5) hasApiKey = true;
  }
  if (trimmed.startsWith("ELEVENLABS_VOICE_ID=")) {
    voiceId = trimmed.slice("ELEVENLABS_VOICE_ID=".length).trim();
  }
}

console.log(`ELEVENLABS_API_KEY present: ${hasApiKey}`);
console.log(`ELEVENLABS_VOICE_ID: ${voiceId}`);
