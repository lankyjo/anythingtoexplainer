# Zero-shot voice cloning on CPU for English explainer narration — Sept 2026

Scope: replace kokoro-82m in `template/scripts/tts_build.py` with a cloneable voice, English only, CPU-only Linux, torch 2.14.0+cpu, 15 GB RAM (~5 GB free), 67 GB disk, Node 24. All URLs accessed **2026-09-21** unless stated. Everything not traced to a primary source (official repo / model card / paper / vendor docs) is marked **UNVERIFIED**.

## Executive summary

- **Primary pick: Sopro v2 Turbo** (`sopro-v2-turbo`, 120M params, Apache-2.0 code **and** weights). 0.24 RTF offline / 0.21 streaming **on an Apple M3 CPU**, 5–20 s reference clip, no reference transcript needed, 24 kHz mono output in the documented web/ONNX runtime, and a one-command local web UI (`uvx --from sopro soprotts serve` → `http://localhost:7860`) that covers upload/record → clone → synthesize. x86 RTF is not published → UNVERIFIED on this machine.
- **Fallback: Chatterbox Nano** (110M, MIT code + MIT weights). Resemble's own README/model card claim **3× faster than realtime on 8 CPU cores**, `device="cpu"` is a documented argument, `pip install chatterbox-tts`. 10 s reference clip in the official example. Ships Gradio apps. Every output carries a Perth watermark [certain: README + model card].
- **Throughput alternative: ZipVoice** (123M, Apache-2.0 code) through **sherpa-onnx int8 ONNX**, which has official Node addon examples (`nodejs-addon-examples/test_tts_non_streaming_zipvoice_zh_en.js`) — the only path here with a real Node story. Costs: reference transcript required and the official README warns 1–2-word utterances can lose pronunciation (§3.5), which matters because tts_build.py synthesizes 3–8-word subtitle chunks.
- **No candidate ships an `npx` one-liner today.** Closest: `uvx --from sopro soprotts serve` (Python/uv, server+UI in one command) and `npx`/npm `@soprotts/onnx-web` (browser-only WebGPU/WASM, not a Node server). For a Node server you would write ~50 lines around `sherpa-onnx-node`. Details in the npx section.
- All three top picks are small enough for 5 GB free RAM on paper (110–123M params, ≤~0.5 GB fp32 weights); **no primary source publishes a measured peak RSS for any of them** → RAM estimates below are derived and marked.
- None of the three emits word/char timestamps. The existing chunk-per-subtitle concatenation in `tts_build.py` makes that a non-issue; if word timestamps are wanted later, WhisperX / torchaudio MMS forced alignment are the CPU paths (see timing section).
- **Repo is public + cloning the owner's own voice**: Sopro (Apache-2.0 code and weights) and Chatterbox (MIT code and weights, Nano and Turbo cards verified) permit commercial use. ZipVoice is Apache-2.0 code; its weights license was not confirmed → UNVERIFIED. F5-TTS weights are CC-BY-NC-4.0 and XTTS-v2's card is a custom ("other") license on an unmaintained repo — both excluded for commercial use (verified 2026-09-21).

## Decision table

RTF = generation time / audio duration (lower is better). "RAM est" = derived from parameter count + runtime overhead, **not measured** (UNVERIFIED). Disk assumes fp32 unless noted. Licenses verified 2026-09-21 via the GitHub license API and Hugging Face model-card metadata.

Candidates (recommended or viable):

| Engine | Params / disk est | RAM est | CPU RTF | License code / weights | Web UI / server | Timestamps | Verdict |
|---|---|---|---|---|---|---|---|
| **Sopro v2 Turbo** | 120M / ~0.5 GB | ~1–2 GB | **0.24 offline, 0.21 stream (M3 CPU, author-measured)**; H100 0.07; x86 UNVERIFIED | Apache-2.0 / Apache-2.0 | `soprotts serve` → `:7860` UI; browser ONNX package | none advertised | **Primary** — best measured WER/SIM per size, clean license, one-command UI, no ref transcript |
| **Chatterbox Nano** | 110M + vocoder / ~0.5 GB+ | ~1.5–3 GB | **3× realtime on 8 CPU cores (vendor claim)** | MIT / MIT | Gradio scripts in repo; no HTTP API | none advertised | **Fallback** — cleanest license, explicit CPU claim, mature pip package; watermarks output |
| **ZipVoice + sherpa-onnx int8** | 123M / **104 MB int8 archive** + 24 kHz vocoder | ~0.5–1 GB | int8 ONNX CPU path documented; numeric x86 RTF UNVERIFIED | Apache-2.0 / **UNVERIFIED** | CLI; no UI (examples only) | none advertised | **Throughput pick** — smallest int8 footprint, Node addon exists; ref transcript + short-phrase caveat |
| Chatterbox Turbo | 350M / ~1.4 GB | ~2–3 GB | GPU-oriented; CPU not published | MIT / MIT | Gradio | none | If Nano quality is insufficient |
| Chatterbox Multilingual V3 | 500M / ~2 GB | ~3–4 GB | not published for CPU | MIT / MIT (repo-wide; per-card UNVERIFIED) | Gradio | none | English-only repo doesn't need 23 languages |
| **NeuTTS Air** (Neuphonic) | 748M / Q4–Q8 GGUF ~0.5 GB | ~1–2 GB | "real-time on mid-range devices" (vendor, no number) | GitHub API `NOASSERTION` / HF card apache-2.0 | example scripts only | none advertised | CPU/GGUF alternative; 3 s cloning claim; no UI, no RTF published |
| Kokoro-82m (status quo) | 82M / ~0.3 GB | low | fast | Apache-2.0 | — | sentence-level only | No zero-shot cloning |

Also checked, **not recommended** for this pipeline (one-line reasons; each backed by a citation in the notes):

| Engine | Params | License code / weights | CPU verdict | Why not |
|---|---|---|---|---|
| IndexTTS 2.5 | 0.8B | bilibili custom / custom ("other") | 0.20–0.29 RTF on RTX 4090 only | License friction (commercial by contact) + RAM risk |
| F5-TTS | 336M | MIT / **CC-BY-NC-4.0** | no published CPU RTF | Non-commercial weights |
| XTTS-v2 | ~0.8B | MPL-2.0 / custom ("other") | CPU impractical (UNVERIFIED) | Unmaintained (last push 2024-08) + license |
| GPT-SoVITS | training-first (62k★) | MIT / UNVERIFIED | CPU unverified | No CPU evidence found |
| CosyVoice 2/3 | 0.5B+ | Apache-2.0 / UNVERIFIED | CPU unverified | No CPU evidence found |
| OpenVoice v2 | — | MIT / UNVERIFIED | CPU unverified | Not evaluated in this pass |
| Zonos | 1.6B | Apache-2.0 / UNVERIFIED | — | Size |
| Higgs Audio v2 | 5.8B params reported | Apache-2.0 / custom ("other") | — | Size |
| VibeVoice 1.5B / Realtime-0.5B | 1.5B / ~1.0B | MIT / MIT | CPU unverified | Size / CPU unknown |
| Orpheus | ~3B | Apache-2.0 / UNVERIFIED | — | Size |
| Dia | 1.6B | Apache-2.0 / UNVERIFIED | — | Size, dialogue-oriented |
| Kani TTS | 370M | Apache-2.0 / Apache-2.0 | CPU unverified | English-focused; cloning not documented |
| Supertonic 3 | — | — / OpenRAIL | runs via sherpa-onnx | Fixed preset voices; cloning not confirmed |

**Nothing above is a recommendation without a primary-source citation.**

## Per-engine notes with citations

### Sopro v2 Turbo — PRIMARY

- Repo: <https://github.com/samuel-vitorino/sopro> (accessed 2026-09-21). Blog: <https://research.haloneuro.ai/posts/sopro-v2> (published 2026-08-27, accessed 2026-09-21). Model card: <https://huggingface.co/samuel-vitorino/sopro-v2-turbo>.
- 120M params, English + European Portuguese + French + German, zero-shot cloning from **5–20 s** reference audio [repo README].
- **0.24 RTF offline / 0.21 RTF streaming on an Apple M3 CPU**; ~300 ms time-to-first-audio; 0.07 RTF offline on H100. Single-stream PyTorch, default settings [blog].
- No reference transcript required — "the prompt to the semantic LM is just the reference's semantic tokens plus some style tokens. That removes an ASR dependency" [blog]. This is a differentiator vs ZipVoice.
- Output **24 kHz mono Float32** [npm `@soprotts/onnx-web` README, <https://registry.npmjs.org/@soprotts%2Fonnx-web>, accessed 2026-09-21].
- License: Apache-2.0 code [repo LICENSE.txt / GitHub license badge]; weights `apache-2.0` [HF model card metadata] → commercial use permitted.
- Install/run: `pip install -U sopro` or `uvx --from sopro soprotts serve`; CLI `soprotts "text" --ref ref.wav --out out.wav`; CPU flags `--int8` (int8 AR weights), `--steps` default 2 [README].
- Local demo server: `http://localhost:7860`, model downloads on first use [README].
- Caveats from the authors: minimal text frontend (abbreviations/numbers/symbols may be mispronounced — prefer words), mixed-language text is a weak spot, streaming path is not bit-exact with offline, no watermarking, training code not released [README + blog].
- Quality: self-reported Seed-TTS test-en WER **1.63** / SIM 0.655 at 120M, 2 steps (vs F5-TTS 1.83 / 0.67 at 336M, ground truth 2.14) [blog tables]. Self-reported, official harness.
- No word/char timestamps advertised [UNVERIFIED whether hidden kwargs exist].

### Chatterbox Nano — FALLBACK

- Repo: <https://github.com/resemble-ai/chatterbox> (accessed 2026-09-21). Model card: <https://huggingface.co/ResembleAI/chatterbox-nano>.
- Family: Nano 110M (English), Turbo 350M (English), Multilingual V3 500M (23+ languages), original 500M [repo README model zoo].
- Nano: "**3x faster than realtime on 8 CPU cores**", single-step distilled token-to-mel decoder, `[laugh]`/`[chuckle]` tags, loaded via `ChatterboxTurboTTS.from_pretrained(device="cpu", nano=True)` [README + model card].
- Reference clip: official example uses a **10 s** wav (`your_10s_ref_clip.wav`) [README usage].
- License: code MIT [GitHub license]; Nano weights explicitly `License: mit` [HF model card]. This is the cleanest license of all candidates.
- Install: `pip install chatterbox-tts` [README]. Note: developed/tested on Python 3.11; this machine runs 3.12 → compatibility for 3.12 was not verified.
- UI: `gradio_tts_app.py`, `gradio_tts_turbo_app.py`, `gradio_tts_turbo_app.py`, `gradio_vc_app.py` exist in the repo (Gradio app, not an HTTP API) [repo file list].
- Every generated file carries a **Perth watermark**; the README documents extraction [README].
- **Output sample rate: 24 kHz** — verified in source: `S3GEN_SR = 24000` in `src/chatterbox/models/s3gen/const.py`, and `self.sr = S3GEN_SR` in `src/chatterbox/tts_turbo.py` [raw source, accessed 2026-09-21].
- Turbo weights are also MIT [HF card `ResembleAI/chatterbox-turbo`, license `mit`, checked 2026-09-21].
- No official Node bindings; an ONNX export exists (`ResembleAI/chatterbox-turbo-ONNX`) but no Node package was verified → no npx path [UNVERIFIED for Node].

### ZipVoice + sherpa-onnx — THROUGHPUT PICK

- Repo: <https://github.com/k2-fsa/ZipVoice> (accessed 2026-09-21). Paper: <https://arxiv.org/abs/2506.13053>. sherpa-onnx docs: <https://k2-fsa.github.io/sherpa/onnx/tts/zipvoice.html>.
- 123M params, Chinese+English, Apache-2.0 code [README].
- CPU guidance: `--num-thread` (default 1 thread), ONNX path `zipvoice.bin.infer_zipvoice_onnx`, INT8 via `--onnx-int8 True` with "a certain degree of speech quality degradation"; "Don't use ONNX on GPU" [README §3.2]. C++ deployment via sherpa-onnx [README "CPU Deployment"].
- Paper abstract: "ZipVoice matches state-of-the-art models in speech quality, while being 3 times smaller and up to 30 times faster" than the DiT-based baseline [<https://arxiv.org/abs/2506.13053>, accessed 2026-09-21].
- sherpa-onnx int8 package: **`sherpa-onnx-zipvoice-distill-int8-zh-en-emilia.tar.bz2` = 104.1 MB** (release asset size, GitHub API, accessed 2026-09-21), non-distilled fp32 605 MB, distill fp32 456 MB; vocoder `vocos_24khz.onnx` separate. CLI documented with `--reference-audio` **and** `--reference-text`; reference text must exactly match the audio or quality degrades [sherpa docs].
- sherpa-onnx publishes "RTF of pre-trained models" charts measured on a Raspberry Pi 4B, but the numeric values on those pages are chart images and could not be extracted → **UNVERIFIED**, no x86 number.
- Recommended prompt: **< 3 s** for single-speaker, "a very long prompt will slow down the inference and degenerate the speech quality" [README §3.1].
- Short text caveat: "When generating speech for very short texts (e.g., one or two words), the generated speech may sometimes omit certain pronunciations. To resolve this issue, pass `--speed 0.3`" [README §3.5]. 3–8-word subtitle blocks sit near this risk zone.
- Node: sherpa-onnx ships official Node addon examples for ZipVoice, e.g. `nodejs-addon-examples/test_tts_non_streaming_zipvoice_zh_en.js` and `nodejs-examples/test-offline-tts-zipvoice-zh-en.js` [sherpa docs page, "API examples → JavaScript"]; npm package `sherpa-onnx-node` exists [npm registry, package page accessed 2026-09-21]. Whether the current npm release exposes the ZipVoice config in its typed API was not executed → **UNVERIFIED**.
- Weights license: repo code is Apache-2.0; the HF-hosted checkpoint license was not confirmed in this pass → **UNVERIFIED**.

### IndexTTS 2.5 — excluded (license + CPU)

- Repo: <https://github.com/index-tts/index-tts> (accessed 2026-09-21); model card <https://huggingface.co/IndexTeam/IndexTTS-2.5>; report <https://arxiv.org/abs/2601.03888>.
- 0.8B params, released 2026-08-10, multilingual, emotion control [README news].
- Published RTF: **0.20–0.29 on RTX 4090** (bf16, kv_cache); no CPU numbers [README inference-speed table].
- License: bilibili Model Use License Agreement; "For commercial usage and cooperation, please contact indexspeech@bilibili.com" [README license section].
- Excluded for this pipeline: custom license friction and 0.8B + Qwen emotion components likely exceed the ~5 GB free RAM budget. CPU RTF not published → **UNVERIFIED**.

### F5-TTS — excluded for a public/commercial repo

- Repo: <https://github.com/SWivid/F5-TTS> (active, last push 2026-09-21); code license **MIT** [GitHub API, accessed 2026-09-21].
- Weights: HF card `SWivid/F5-TTS` license **`cc-by-nc-4.0`** [HF API model metadata, accessed 2026-09-21] → **non-commercial**. 336M params. No CPU RTF published.

### XTTS-v2 — excluded

- Code repo <https://github.com/coqui-ai/TTS>: **MPL-2.0**, last push **2024-08-16** (unmaintained) [GitHub API].
- Weights: HF card `coqui/XTTS-v2` license is **`other`** (custom Coqui license, widely documented as the non-commercial CPML) [HF API model metadata, accessed 2026-09-21]. Do not use in a commercial pipeline.

### Other engines checked — one line each

Verified against GitHub/HF metadata on 2026-09-21; none has CPU evidence strong enough to beat the picks.

- **GPT-SoVITS** — code MIT [GitHub API]; 62k★; training/few-shot-oriented. Weights license and CPU RTF not verified → not recommended.
- **CosyVoice 2/3** — code Apache-2.0 [GitHub API]; 0.5B+ class. No published CPU RTF found → not recommended.
- **OpenVoice v2** — code MIT [GitHub API]; last push 2025-04. Not evaluated for CPU/quality here → not recommended.
- **Zonos** — code Apache-2.0 [GitHub API]; ~1.6B. Too large for the RAM budget → excluded.
- **Higgs Audio v2** — code Apache-2.0 [GitHub API]; HF card `bosonai/higgs-audio-v2-generation-3B-base` reports **5.77B** params and license `other` [HF API]. Too large → excluded.
- **Microsoft VibeVoice** — code MIT [GitHub API]; `VibeVoice-1.5B` and `VibeVoice-Realtime-0.5B` are MIT on HF (Realtime checkpoint reports 1.02B params) [HF API]; active repo (last push 2026-09-03). CPU RTF/RAM not published → not verifiable now; revisit if a CPU/GGUF build appears.
- **Orpheus** — code Apache-2.0 [GitHub API]; ~3B Llama-based. Too large → excluded.
- **Dia** — code Apache-2.0 [GitHub API]; 1.6B, dialogue-oriented. Too large → excluded.
- **Kani TTS** — `nineninesix/kani-tts-450m-0.2-ft`: license **Apache-2.0**, 369.8M params, "trained primarily on English" [HF model card README + HF API, accessed 2026-09-21]. Zero-shot cloning is **not documented** → not recommended.
- **NeuTTS Air / Nano** — see candidate row. Air: HF card license **apache-2.0**, 747.9M params, GGUF q4/q8 quantizations; official README: "Instant voice cloning - create your own speaker with as little as 3 seconds of audio", "Real-time generation on mid-range devices" [<https://github.com/neuphonic/neutts-air> + HF API, accessed 2026-09-21]. GitHub repo license is NOASSERTION while the Air weights card is apache-2.0; Nano is `other`. No RTF number, no web UI verified. Credible CPU fallback if Sopro/Chatterbox fail.
- **Supertonic 3** — HF card license **OpenRAIL** [HF API]; the open-weight package "includes fixed preset voice styles"; voice cloning not confirmed → not recommended.
- **PocketTTS / Pocket TTS** — referenced by the Sopro blog as a 100M-class baseline; not independently verified in this pass → UNVERIFIED, not recommended.

## The npx + local port + voice-clone UI path

Requirement: `npx <something>` → local port → upload/record sample → clone → synthesize.

**Short answer: no verified package does this today in one npm command.** What exists:

1. **Sopro (closest match, but via `uvx`, not `npx`)**:
   ```bash
   uvx --from sopro soprotts serve        # uv/uvx, one command
   # open http://localhost:7860, upload/record reference, synthesize
   ```
   Primary source: repo README + blog. The server is the app; the UI is bundled. This is the smallest reliable implementation that exists today: zero files to write. It needs `uv` installed (single static binary) — not npm.

2. **Sopro in the browser (npm, but no Node server)**: `npm install @soprotts/onnx-web` / `npx` cannot serve by itself. The package is an ES module that runs the ONNX model in the browser via WebGPU/WASM and accepts a `File`/`Blob` reference (`tts.prepareReference(file)`, `tts.synthesize('Hello.', reference)` → Float32Array 24 kHz mono) — verified from the npm README. So an `npx vite`-style static serving story is possible, but you would still write the UI glue; there is no ready-made `npx sopro` command in the registry record.

3. **Node server around sherpa-onnx (real npm path, you write the server)**: `npm i sherpa-onnx-node` + the official ZipVoice Node example. Minimal architecture: ~50–100 lines of Node — an `http` server exposing `POST /clone` (writes reference wav + text once) and `POST /say` (calls the offline TTS API, returns wav) — plus a static HTML page with `<input type="file">`/MediaRecorder and a text box. No published package was found that already bundles this specific UI → **UNVERIFIED that a ready-made one exists**.

4. **No npx path found for Chatterbox.** Resemble ships Python + Gradio only; no official Node package was verified.

Smallest reliable implementation overall: **option 1 (Sopro)** for interactive voice setup, plus keep the batch path in `tts_build.py` calling the Python API. Option 3 is the only true npx story and is the fallback if Node-only tooling is a hard requirement.

## Subtitle timing

- **Sopro v2 Turbo**: no word/char timestamps advertised [UNVERIFIED if available]. `tts_build.py` already synthesizes per subtitle block (3–8 words) and concatenates, so block start times are exact without timestamps — nothing to change. Per-call reference encoding can dominate on many short chunks: the official non-streaming API takes `ref_audio_path` per call, and the streaming API documents `prepare_reference()` + `ref=` reuse; whether `synthesize()` accepts a prepared `ref` is UNVERIFIED.
- **Chatterbox Nano/Turbo**: no word/char timestamps advertised [UNVERIFIED]. Same chunk-and-concatenate strategy applies.
- **ZipVoice/sherpa-onnx**: no timestamps advertised; same strategy. But per-block synthesis hits the short-text caveat (§3.5 above), so prefer synthesizing per *sentence* and splitting blocks by proportion, or keep blocks ≥4 words and verify by listening.
- If true word-level timing is ever wanted, the CPU-capable primary paths are:
  - **torchaudio forced alignment with the MMS_FA model** — a small (<1 GB) wav2vec2 aligner designed for CPU inference; official tutorial documents running it for English. Source: <https://pytorch.org/audio/stable/tutorials/forced_alignment_tutorial.html> (accessed 2026-09-21). Works CPU-only; token/word-level output.
  - **WhisperX** — word-level timestamps by combining faster-whisper (CTranslate2, CPU-supported) with a wav2vec2 alignment model. Repo: <https://github.com/m-bain/whisperX> (accessed 2026-09-21). Heavier install; CPU support documented [UNVERIFIED for this exact machine].
  - Either is only needed for karaoke-style word highlighting; the current block-level subtitles don't require it.

## Recommendation

**Primary: Sopro v2 Turbo.**
Why: best published quality-per-byte among small cloners (self-reported Seed-TTS-en WER 1.63 at 120M with 2-step decoding), Apache-2.0 code **and** weights (commercial OK), no reference transcript requirement, 5–20 s reference window, and the only candidate with a one-command local server + UI. Migration into `tts_build.py` is an engine branch like the existing kokoro/edge split.

Commands:
```bash
# one-time
pip install -U sopro                # into ~/.venvs/a2e
# or zero-install server + UI:
uvx --from sopro soprotts serve     # http://localhost:7860

# batch synthesis, per subtitle block (mirrors tts_build.py chunking)
soprotts "the text of one subtitle block" --ref audio/voice-ref.wav --int8 --out chunk.wav
```

Python batch integration sketch (per block; prepare the reference once):
```python
from sopro import SoproTTS
tts = SoproTTS.from_pretrained("samuel-vitorino/sopro-v2-turbo", device="cpu")
ref_audio = "audio/voice-ref.wav"                              # 5–20 s voice sample
wav = tts.synthesize(block_text, ref_audio_path=ref_audio)     # verified non-streaming form
# if per-call reference encoding dominates, the streaming API documents prepare_reference() + ref=
# check the actual output sample rate at integration (web runtime documents 24 kHz mono)
```
(Python API shape from the [model card](https://huggingface.co/samuel-vitorino/sopro-v2-turbo); `prepare_reference` reuse shown in the streaming example.)

Migration notes for `template/scripts/tts_build.py`:
- Add `sopro` to the `TTS_ENGINE` allowlist (today only `auto`/`kokoro` are accepted); the existing English-only guard in `main()` already matches the constraint.
- `KOKORO_SR = 24000` already exists as a 24 kHz precedent and `write_wav` handles any rate; confirm Sopro's actual output rate at integration (24 kHz verified for the web runtime, Python runtime UNVERIFIED).
- Keep the per-block `synth_sentence` loop but call `tts.synthesize(chunk, ref=ref)` per block; `CHUNK_PAD` still applies. No timestamps needed.
- Text frontend is minimal: numbers/abbreviations may mispronounce, so extend the existing `PRONOUNCE` rewrite table (spell out numerals and acronyms before synthesis). Do not rely on the model to normalize.
- Cache key must include the reference file hash, not just text — the voice can change independently of the script (existing cache signature covers voice only via env vars).

**Fallback: Chatterbox Nano.** Pick it if Sopro's x86 RTF turns out unusable, if you want the most permissive license (MIT code + MIT weights), or if watermarking is required. Commands:
```bash
pip install chatterbox-tts
python - <<'PY'
from chatterbox.tts_turbo import ChatterboxTurboTTS
m = ChatterboxTurboTTS.from_pretrained(device="cpu", nano=True)
wav = m.generate("one subtitle block", audio_prompt_path="audio/voice-ref.wav")
PY
```
Tradeoff: vendor CPU claim only (3× realtime on 8 cores), Python 3.11 tested (this box is 3.12), no Node path, output watermarked.

**If throughput on x86 is the binding constraint: ZipVoice int8 via sherpa-onnx.** int8 ONNX is the most proven small-CPU deployment here and the only real npm path. Costs: exact reference transcript, short-phrase caveat, no reference-free cloning.

## UNVERIFIED list

- Sopro v2 Turbo **x86 CPU RTF and peak RAM** — 0.24 RTF is an Apple M3 measurement; no Linux/x86 number published. Benchmark on this machine before committing.
- Peak RAM for every engine (Sopro, Chatterbox Nano, ZipVoice int8, NeuTTS Air) — no measured RSS published in any source checked; table values are estimates.
- ZipVoice **weights license** — `k2-fsa/ZipVoice` HF card has no license field; code is Apache-2.0. Confirm before any commercial distribution.
- ZipVoice **stock checkpoint English quality**: the paper claims parity with SOTA at 3× smaller size, but the widely deployed artifact is the zh-en distill int8 model; degradation from int8 is acknowledged but unquantified. Short-phrase behavior on 3–8-word English blocks is not measured (README only warns about 1–2 words).
- sherpa-onnx ZipVoice **RTF numbers** — published only as chart images for a Raspberry Pi 4B; no extractable x86 value.
- ZipVoice via `sherpa-onnx-node` npm v1.13.8 — Node examples exist in-repo; whether the published npm API exposes the ZipVoice config was not executed.
- Chatterbox Nano/Turbo **Python 3.12 compatibility** — repo says developed/tested on Python 3.11; this machine runs 3.12.
- Chatterbox Multilingual V3 weight card license — repo-wide MIT statement; V3 card not read directly.
- Chatterbox **RAM/CPU speed on this exact machine** — vendor claim is 3× realtime on 8 cores.
- IndexTTS 2.5 CPU RTF/RAM; its HF license is `other` (bilibili custom) — commercial use requires contacting bilibili per README.
- XTTS-v2 — license name "CPML" itself not re-verified; HF card says `other`; repo unmaintained since 2024-08-16.
- NeuTTS Air — cloning quality, RTF on x86, reference-length/transcript requirements, and any server/UI are unverified beyond the official README claims.
- WhisperX on this exact CPU/RAM budget — CPU support documented broadly; not executed here. torchaudio MMS forced alignment is the smaller CPU alternative.
- VibeVoice Realtime-0.5B CPU feasibility; Kani TTS cloning support; Supertonic 3 cloning support; CosyVoice/GPT-SoVITS/OpenVoice/Zonos/Higgs/Orpheus/Dia CPU RTF — all unverified; none is recommended here.
- Whether any hidden word/char timestamp API exists in Sopro or Chatterbox — none documented, not tested.
- Sopro streaming path is documented as not bit-exact with offline; implications for per-block synthesis were not measured.

## Independent verification (main session, 2026-09-21)

Spot-checked the load-bearing claims directly against primary sources; all resolved:

- `https://pypi.org/pypi/sopro/json` → 200: version 2.2.0, uploaded 2026-09-01, license Apache-2.0, homepage = the GitHub repo.
- `https://api.github.com/repos/samuel-vitorino/sopro` → 200: Apache-2.0, 954 stars, created 2025-12-30.
- `https://huggingface.co/api/models/samuel-vitorino/sopro-v2-turbo` → 200: `license: apache-2.0`, languages en/pt/fr/de, tag `voice-cloning`.
- Repo README confirms: 120M params, 5–20 s zero-shot reference, `uvx --from sopro soprotts serve` → localhost:7860, `--int8` CPU option, minimal text frontend (spell out numbers/abbreviations), mixed-language weakness.
- Blog (research.haloneuro.ai/posts/sopro-v2) confirms 0.24 RTF offline / 0.21 streaming / ~300 ms TTFB on Apple M3 CPU, 0.07 RTF on H100; single-stream PyTorch, default settings.
- `https://huggingface.co/api/models/ResembleAI/chatterbox-nano` → 200: `license: mit`; repo README confirms 110M, "3x faster than realtime on 8 CPU cores", `nano=True`, Perth watermarking on every output.
- ZipVoice: GitHub repo Apache-2.0 (1070 stars, last push 2025-12-02); HF model card has **no license field**, so the weights-license gap in the UNVERIFIED list stands.

Machine spec, measured after the report was written (`lscpu`): **Intel Core i5-6300U, 2 physical cores / 4 threads, 2.4 GHz base (2016 Skylake-U laptop), 15 GB RAM**. This makes the CPU-speed risk larger than the report implies:

- Chatterbox's "3x realtime on 8 CPU cores" translates to roughly 1x at best on 4 old threads, likely worse.
- Sopro's 0.24 RTF on an M3 (4P+4E, far higher IPC) plausibly lands near or above 1.0 RTF here.
- Neither is usable/unusable until measured; the engine choice is not the binding constraint — this CPU is. Benchmark both before migrating `tts_build.py`.
