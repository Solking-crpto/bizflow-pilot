import fs from "fs";

const manifest = JSON.parse(fs.readFileSync("video/cache/audio/manifest.json", "utf-8"));
for (const s of manifest.scenes) {
  console.log(`\n=== Scene ${s.id}: ${s.name} (${s.durationSec.toFixed(2)}s) ===`);
  const words = s.words.map((w) => `${w.word}[${w.start.toFixed(2)}-${w.end.toFixed(2)}]`).join(" ");
  console.log(words);
}
