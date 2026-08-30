# Transcripto

AI speech-to-text transcription, running entirely on Cloudflare's edge. Drop in an audio file, get a timestamped transcript back in seconds — no account required. Sign in with Google to save transcripts, get AI-generated summaries, and export to TXT/SRT/VTT/Markdown.

**Live demo:** [transcripto.aimensajid953.workers.dev](https://transcripto.aimensajid953.workers.dev)

## What it does

- **Transcribe without an account.** Upload a file, or record straight from the microphone, and get an accurate transcript back — nothing is saved, and no sign-up is needed. Guests get 10 minutes of transcription a day.
- **Sign in for more.** A Google account unlocks saved history, exports, and a bumped daily quota of 30 minutes — which carries over any guest usage from earlier the same day rather than resetting.
- **AI-generated summaries.** Every saved transcript gets an overview, key points, and action items generated automatically right after transcription and stored in the database — opening the Summary tab reads the stored result instantly instead of generating one on the spot.
- **Record in the browser.** A `MediaRecorder`-based recorder captures audio directly from the mic as an alternative to picking a file, feeding the exact same processing pipeline either way.
- **Client-side audio pipeline.** Long files are decoded, downmixed to mono, resampled to 16kHz, and split into ~20-second chunks entirely in the browser (in a Web Worker, so the UI never freezes). Cuts land in quiet moments — found via an RMS silence scan — instead of slicing mid-word.
- **Real transcription pipeline.** Chunks upload with bounded concurrency and automatic retry-with-backoff, with a live progress view and a cancel button that actually stops in-flight work.
- **Exports that matter.** Download a saved transcript as plain text, SRT/VTT subtitles, or Markdown.
- **A real design system.** Warm sand-and-ink visual language, one bronze accent color, full light/dark theming — hand-built as reusable React components from a set of design tokens, not just Tailwind defaults.

## Why it's built this way

Whisper on Cloudflare Workers AI reliably accepts about 1MB of audio per request, and Workers don't have `ffmpeg`. So audio has to be split *before* it reaches the server — which means doing real signal processing in the browser. That's the core engineering problem this project solves: decode → resample → find quiet cut points → encode → upload, all client-side, with the actual CPU-heavy work kept off the main thread in a Web Worker.

Everything else follows from two constraints: **free, hosted inference** (no GPU, no per-minute API bill) and **one deploy** (a single Cloudflare Worker serves the built SPA *and* the API, so there's no CORS to manage and nothing else to host).

## Tech stack

| | |
|---|---|
| **Frontend** | React 18 + TypeScript (strict) + Vite 7 + Tailwind CSS + react-router-dom |
| **API** | Hono 4, running on Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite), queried directly — no ORM |
| **AI** | Cloudflare Workers AI — `whisper-large-v3-turbo` for transcription, `gpt-oss-20b` for summaries |
| **Auth** | Google Identity Services, verified server-side via JWKS (`jose`), first-party session cookies |
| **Validation** | zod, with schemas shared between client and server |
| **Testing** | Vitest |
| **Icons** | lucide-react |

## Architecture

A single Cloudflare Worker serves both the static assets (the built SPA) and the API (`worker/routes/*`), routed by Hono. `worker/services/` holds business logic with no knowledge of HTTP; `worker/routes/` handles request parsing, auth, and responses. `shared/` holds zod schemas and the types inferred from them, imported by both the browser and the Worker, so a request/response shape only exists once.

On the client, audio never leaves the browser unprocessed: `src/audio/` decodes the file on the main thread (the Web Audio API's `decodeAudioData` can't run in a Worker), then hands the raw samples to a dedicated Web Worker for the CPU-heavy resampling and segmentation. `src/transcription/pipeline.ts` drives the chunk upload loop; `src/transcription/stitch.ts` reassembles the per-chunk results into one transcript.

Every user — guest or signed in — is subject to a daily transcription quota, enforced server-side and checked *before* the first chunk is even uploaded, so a file that won't fit is rejected up front rather than partway through.

## Local development

```bash
npm install
npx wrangler d1 create transcripto-db      # once — put the id in wrangler.jsonc
npx wrangler types                          # regenerate Env after any binding change
npx wrangler d1 migrations apply transcripto-db --local
npm run dev                                 # Vite + the Worker, together
npx tsc --noEmit                            # Vite doesn't type-check on its own
npm test                                    # Vitest
```

You'll also need a Google OAuth Client ID (`.env.local`: `VITE_GOOGLE_CLIENT_ID=...`) and a `JWT_SECRET` (`.dev.vars`) for sign-in to work locally.

## Deploying

```bash
npx wrangler d1 migrations apply transcripto-db --remote
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put JWT_SECRET
npm run deploy
```

One Worker, one command — the SPA and the API ship together.

## License

MIT © Aimen Sajid — see [LICENSE](LICENSE).
