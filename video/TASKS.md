# BizFlow Pilot — Video Production Task List

- [x] **Phase 0: Inspection & Setup**
  - [x] Check `.env.video.local` existence & `.gitignore` verification
  - [x] Check `video/video.config.json` configuration
  - [x] Inspect `media/` folder and record screenshot dimensions & files
  - [x] Verify tools: Node, npm, ffmpeg, ffprobe
  - [x] Initialize `video/` directory and `video/package.json`
  - [x] Create `video/assets/logo-mark.svg`
  - [x] Copy source screenshots to `video/assets/` under safe slug names

- [x] **Phase 1: Narration Audio (ElevenLabs)**
  - [x] Implement ElevenLabs TTS generator with caching in `video/cache/audio/`
  - [x] Generate audio clips for all scenes (0-8) using `eleven_multilingual_v2` and voice `uH7gCqB801c6y7oEmaew`
  - [x] Process audio: silence trimming, 150ms head / 350ms tail padding, loudnorm (-16 LUFS, true peak -1.5dB)
  - [x] Verify scene durations, word timestamps, and ensure total length <= 175s (Actual: 114.16s narration)

- [x] **Phase 2: Video Composition**
  - [x] Copy and organize screenshots into `video/assets/` under safe slug names
  - [x] Generate high-DPI browser plates with Playwright/Edge (`video/scripts/generate-plates.js`)
  - [x] Design Title Card (Scene 0), browser card frames, camera push/zooms, lower-thirds, burned captions
  - [x] Define precise pixel callout boxes for all scenes
  - [x] Design End Card (Scene 8) with live/repo URLs, Arc badge, and mainnet payment hash

- [x] **Phase 3: Render**
  - [x] Render full video to `video-out/BizFlow-Pilot-Demo.mp4` (1080p, 30fps, H.264, AAC, 27.59 MB)
  - [x] Generate `video-out/captions.srt` (289 synchronized lines)
  - [x] Generate `video-out/thumbnail.png` (1280x720)

- [x] **Phase 4: Quality Gates & Verification**
  - [x] Probe final video specs (1920x1080, 30fps, duration: 119.39s < 175s, filesize 27.59 MB < 100MB)
  - [x] Extract scene stills and verify callout alignment
  - [x] Generate `video-out/contact-sheet.png` (10-frame visual overview)
  - [x] Verify audio loudness (-17.43 LUFS integrated, true peak -1.61 dB)
  - [x] Honesty audit against `video.config.json` -> `video-out/qa-report.md`
  - [x] Pronunciation check (U S D C, A I, BizFlow all pronounced accurately)

- [x] **Phase 5: Final Report**
  - [x] Summarize outputs, duration, credits used, and file paths
