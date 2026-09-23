#!/usr/bin/env python3
"""Voiceover + timeline builder. Project root = the parent of this script's scripts/ dir.
Input script/narration.txt:
  # CHAPTER <n> <title>      chapter marker (chapter_gap blank frames are inserted before it)
  ## gap <frames>             extra blank frames before the next sentence
  one sentence|split by pipes into subtitle blocks   -> pipes split subtitles only, not speech
                                    block budget: <= 48 characters (longer blocks print a warning and shrink)
                                    leading/trailing spaces are trimmed; blocks are joined with a space for TTS
Output:
  public/assets/<slug>/audio.wav (48k stereo 16-bit; slug read from src/config.ts)
  script/timeline.json / timeline.md
  src/common/subs.ts (subtitle table), src/common/timeline.ts (TOTAL_FRAMES / CHAPTER_STARTS / SENTENCES)
Per-block cache lives in audio/cache/: changing one sentence re-synthesizes only that block.

TTS engine: kokoro-82m only, local inference (`pip install kokoro soundfile`; English G2P also needs espeak-ng).
  KOKORO_VOICE=am_liam  KOKORO_LANG=a (a=American English, b=British)  KOKORO_SPEED=1.0
  kokoro has no word boundaries -> each subtitle block is synthesized separately and concatenated,
  so block start frames are exact (CHUNK_PAD adjusts the inter-block silence).
Other env vars: GAP/CHAPTER_GAP/LEAD/TAIL (frames).
"""
import asyncio, hashlib, json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REM = ROOT
_cfg = open(f'{ROOT}/src/config.ts', encoding='utf-8').read()
SLUG = re.search(r"slug:\s*'([^']+)'", _cfg).group(1)
_m = re.search(r"lang:\s*'(zh|en)'", _cfg)
CFG_LANG = _m.group(1) if _m else 'zh'
FPS = 30
SR = 48000
ENGINE = os.environ.get('TTS_ENGINE', 'auto')
KOKORO_VOICE = os.environ.get('KOKORO_VOICE', 'am_liam')
KOKORO_LANG = os.environ.get('KOKORO_LANG', 'a')       # a=American English, b=British
KOKORO_SPEED = float(os.environ.get('KOKORO_SPEED', 1.0))
KOKORO_SR = 24000
CHUNK_PAD = float(os.environ.get('CHUNK_PAD', 0.06))  # silence between blocks (no word boundaries)
GAP = int(os.environ.get('GAP', 10))          # blank frames between sentences
CHAPTER_GAP = int(os.environ.get('CHAPTER_GAP', 45))  # blank frames before a chapter
LEAD = int(os.environ.get('LEAD', 40))        # blank frames at the head
TAIL = int(os.environ.get('TAIL', 90))        # blank frames at the tail
CACHE = f'{ROOT}/audio/cache'
os.makedirs(CACHE, exist_ok=True)
if ENGINE not in ('auto', 'kokoro'):
    raise SystemExit(f'unknown TTS_ENGINE={ENGINE} (this repo only supports auto / kokoro)')

# Any CJK character in the narration script aborts the build (repo rule: English only).
CJK_RE = re.compile(r'[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]')


def parse(path):
    items = []
    chap = 0
    chap_title = ''
    pending_gap = 0
    for raw in open(path, encoding='utf-8'):
        line = raw.strip()
        if not line:
            continue
        m = re.match(r'^#\s*CHAPTER\s+(\d+)\s+(.*)$', line)
        if m:
            chap = int(m.group(1)); chap_title = m.group(2).strip()
            items.append({'type': 'chapter', 'chapter': chap, 'title': chap_title})
            continue
        m = re.match(r'^##\s*gap\s+(\d+)', line)
        if m:
            pending_gap += int(m.group(1)); continue
        if line.startswith('#'):
            continue
        items.append({'type': 'sent', 'chapter': chap, 'raw': line, 'gap_before': pending_gap})
        pending_gap = 0
    return items


def assert_english(text, where):
    hit = CJK_RE.search(text)
    if hit:
        raise SystemExit(
            f'English-only: CJK character {hit.group(0)!r} found in {where} '
            f'(offset {hit.start()}). Translate it or remove it.'
        )


def cache_path(text, ext):
    sig = f'{ENGINE}|{KOKORO_VOICE}|{KOKORO_LANG}|{KOKORO_SPEED}|{text}'
    return f'{CACHE}/{hashlib.sha1(sig.encode()).hexdigest()[:16]}{ext}'


# Subtitle block width estimate: same em table as src/common/textfit.ts (one shared JSON),
# used to flag blocks wider than the 1160px safe area at 44px.
# Authoring budget: <= 48 characters per block (see narration-storyboard.md).
SUB_MAX_W = 1160
SUB_SIZE = 44
_EM = json.load(open(f'{ROOT}/src/common/emTable.json', encoding='utf-8'))


def text_em(s):
    """Same table as textEm() in src/common/textfit.ts (src/common/emTable.json)."""
    t = 0.0
    for ch in s:
        c = ord(ch)
        if c >= _EM['fullWidthFrom']:
            t += _EM['fullWidth']        # CJK/full-width, plus U+2000+ punctuation, arrows, math symbols
        elif ch == ' ':
            t += _EM['space']
        elif 'A' <= ch <= 'Z':
            t += _EM['upper']
        elif '0' <= ch <= '9':
            t += _EM['digit']
        elif 'a' <= ch <= 'z':
            t += _EM['lower']
        elif 0xc0 <= c < 0x250:
            t += _EM['accented']         # accented Latin letters
        else:
            t += _EM['punct']            # half-width punctuation
    return t


def write_wav(path, x, sr):
    """x: float32 mono (n,) or stereo (n,2) -> 16-bit PCM wav."""
    import wave
    a = np.asarray(x, dtype=np.float32)
    pcm = (np.clip(a, -1.0, 1.0) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1 if a.ndim == 1 else a.shape[1]); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())


_kokoro = None

# kokoro pronunciation overrides (TTS text only; subtitles keep the original spelling).
# Syntax is kokoro/misaki's [word](/ipa/). kokoro spells out all-caps tokens letter by letter
# (CUDA/NIXL/MIG/DeepGEMM) and reads "v5.0" as "v five zero", so they are overridden here.
PRONOUNCE = {
    'CUDA': '[CUDA](/kˈudə/)',
    'NIXL': '[NIXL](/nˈɪksəl/)',
    'MIG': '[MIG](/mˈɪɡ/)',
    'DeepGEMM': '[DeepGEMM](/dˌipʤˈɛm/)',
    'v5.0': '[v5.0](/vˈi fˈIv pYnt ˈO/)',
}


def apply_pronounce(text):
    for k, v in PRONOUNCE.items():
        text = re.sub(r'(?<![A-Za-z0-9])' + re.escape(k) + r'(?![A-Za-z0-9])', v, text)
    return text


def synth_kokoro(text):
    """kokoro-82m: local inference, 24kHz, no word boundaries."""
    global _kokoro
    text = apply_pronounce(text)
    au = cache_path(text, '.wav')
    if os.path.exists(au):
        return au
    if _kokoro is None:
        try:
            from kokoro import KPipeline
        except ImportError:
            raise SystemExit('TTS_ENGINE=kokoro needs kokoro: pip install kokoro soundfile; English G2P also needs espeak-ng')
        _kokoro = KPipeline(lang_code=KOKORO_LANG)
    parts = []
    for r in _kokoro(text, voice=KOKORO_VOICE, speed=KOKORO_SPEED):
        a = getattr(r, 'audio', None)
        if a is None:
            a = r[2]                                    # older versions yield (graphemes, phonemes, audio)
        if hasattr(a, 'detach'):
            a = a.detach().cpu().numpy()                # torch tensor
        parts.append(np.asarray(a, dtype=np.float32).reshape(-1))
    if not parts:
        raise SystemExit(f'kokoro produced no audio: {text[:24]}...')
    write_wav(au, np.concatenate(parts), KOKORO_SR)
    return au


def decode(au):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', au, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def trim_edges(x, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x, 0.0
    a = max(0, idx[0] - int(0.03 * SR)); b = min(len(x), idx[-1] + int(0.12 * SR))
    return x[a:b], a / SR


async def synth_sentence(chunks):
    """One sentence -> (float32 mono audio, per-block start seconds inside the sentence, sentence seconds).
    kokoro has no word boundaries -> each subtitle block is synthesized and concatenated,
    so block starts are exact; the price is a slightly clipped seam between blocks."""
    pad = np.zeros(int(CHUNK_PAD * SR), dtype=np.float32)
    parts = []; starts = []; pos = 0.0
    for i, c in enumerate(chunks):
        xi, _ = trim_edges(decode(synth_kokoro(c)))
        if i:
            parts.append(pad); pos += len(pad) / SR
        starts.append(pos)
        parts.append(xi); pos += len(xi) / SR
    x = np.concatenate(parts) if parts else np.zeros(0, dtype=np.float32)
    return x, starts, len(x) / SR


async def main(narr, guard_only=False):
    global ENGINE
    narration = open(narr, encoding='utf-8').read()
    assert_english(narration, 'script/narration.txt')
    if CFG_LANG != 'en':
        raise SystemExit(f"src/config.ts has lang: '{CFG_LANG}'; this repo is English-only, set lang: 'en'")
    if guard_only:
        print('guard ok')
        return
    items = parse(narr)
    if ENGINE == 'auto':
        ENGINE = 'kokoro'
        print(f'TTS_ENGINE={ENGINE}')
    # Blocks are joined with a space for TTS so "powerful|but" is not read as "powerfulbut".
    sep = ' '
    t = LEAD / FPS
    audio_parts = []  # (start_sec, np.array)
    sentences = []; chapters = []
    sid = 0
    total_chars = 0; total_words = 0; speech_sec = 0.0
    for it in items:
        if it['type'] == 'chapter':
            t += CHAPTER_GAP / FPS
            chapters.append({'n': it['chapter'], 'title': it['title'], 'from': int(round(t * FPS)) + 1})
            continue
        t += it['gap_before'] / FPS
        raw = it['raw']
        chunks = [c.strip() for c in raw.split('|') if c.strip()]
        if not chunks:
            continue
        tts_text = sep.join(chunks)
        x, starts, dur = await synth_sentence(chunks)
        sid += 1
        subs = [(t + starts[i], t + (starts[i + 1] if i + 1 < len(starts) else dur)) for i in range(len(chunks))]
        f0 = int(round(t * FPS)) + 1; f1 = int(round((t + dur) * FPS))
        sentences.append({'id': f'S{sid:02d}', 'chapter': it['chapter'], 'from': f0, 'to': f1, 'text': tts_text,
                          'subs': [{'from': int(round(a * FPS)) + 1, 'to': int(round(b * FPS)), 'text': c} for c, (a, b) in zip(chunks, subs)]})
        audio_parts.append((t, x))
        total_chars += len(re.sub(r'[.,!?:;()\-—…\s]', '', tts_text))
        total_words += len(tts_text.split()); speech_sec += dur
        t += dur + GAP / FPS
    t += TAIL / FPS
    total = int(np.ceil(t * FPS))
    # Mix the soundtrack
    y = np.zeros(int(total / FPS * SR) + SR, dtype=np.float32)
    for st, x in audio_parts:
        a = int(st * SR); y[a:a + len(x)] += x
    y = y[: int(total / FPS * SR)]
    peak = float(np.max(np.abs(y))) or 1.0
    y = y / peak * 0.89
    os.makedirs(f'{REM}/public/assets/{SLUG}', exist_ok=True)
    wav = f'{REM}/public/assets/{SLUG}/audio.wav'
    write_wav(wav, np.stack([y, y], 1), SR)
    # Fix subtitles: no overlap across sentences; contiguous blocks stay as they are
    all_subs = []
    for s in sentences:
        for k, sb in enumerate(s['subs']):
            if sb['to'] < sb['from']:
                sb['to'] = sb['from']
            all_subs.append(dict(sb))
    for i in range(len(all_subs) - 1):
        if all_subs[i]['to'] >= all_subs[i + 1]['from']:
            all_subs[i]['to'] = all_subs[i + 1]['from'] - 1
    # Width check: over-wide blocks get auto-shrunk by Subtitle.tsx (>1.3x wraps to two lines);
    # the right fix is to split the copy again with |
    over = [(sb, text_em(sb['text']) * SUB_SIZE) for sb in all_subs]
    over = [(sb, w) for sb, w in over if w > SUB_MAX_W]
    if over:
        print(f'{len(over)}/{len(all_subs)} subtitle blocks exceed the {SUB_MAX_W}px safe area at {SUB_SIZE}px '
              f'(auto-shrunk; keep blocks <= 48 characters and split with |):')
        for sb, w in over[:5]:
            print(f"    f{sb['from']} (~{w:.0f}px{', wraps to two lines' if w > SUB_MAX_W * 1.3 else ''}) {sb['text']}")
    # Output
    tl = {'fps': FPS, 'total_frames': total, 'engine': ENGINE,
          'voice': KOKORO_VOICE, 'rate': KOKORO_SPEED,
          'gap': GAP, 'chapter_gap': CHAPTER_GAP, 'lead': LEAD, 'tail': TAIL,
          'lang': 'en', 'chapters': chapters, 'sentences': sentences, 'chars': total_chars, 'words': total_words,
          'speech_sec': round(speech_sec, 2)}
    os.makedirs(f'{ROOT}/script', exist_ok=True)
    json.dump(tl, open(f'{ROOT}/script/timeline.json', 'w'), ensure_ascii=False, indent=1)
    with open(f'{ROOT}/script/timeline.md', 'w') as f:
        f.write(f"# Timeline ({ENGINE} · {tl['voice']} {tl['rate']}, {total} frames = {total/FPS:.1f}s, "
                f"{total_words} words, {total_words/max(1e-6,speech_sec):.2f} words/s)\n\n")
        f.write('| Sentence | Ch | Frames from-to | Dur | Text (| splits subtitles) |\n|---|---|---|---|---|\n')
        for s in sentences:
            f.write(f"| {s['id']} | {s['chapter']} | {s['from']}-{s['to']} | {(s['to']-s['from']+1)/FPS:.1f}s | {'|'.join(sb['text'] for sb in s['subs'])} |\n")
        f.write('\n## Chapter start frames\n')
        for c in chapters:
            f.write(f"- Chapter {c['n']} {c['title']}: f{c['from']}\n")
    # Text always goes through json.dumps: a JSON string is a valid TS literal and escapes " \ and control
    # characters (hand-built quotes break on \ ' ` ${} in the copy and can turn text into code)
    def lit(s):
        return json.dumps(s, ensure_ascii=False)
    with open(f'{REM}/src/common/subs.ts', 'w') as f:
        f.write('// Generated by scripts/tts_build.py (per-block synthesis -> subtitle blocks).\n')
        f.write('// To edit subtitles, edit script/narration.txt and rerun.\n')
        f.write("export type SubEntry = {from: number; to: number; text: string};\nexport const SUBS: SubEntry[] = [\n")
        for sb in all_subs:
            f.write(f"  {{from: {sb['from']}, to: {sb['to']}, text: {lit(sb['text'])}}},\n")
        f.write('];\n')
    with open(f'{REM}/src/common/timeline.ts', 'w') as f:
        f.write('// Generated by scripts/tts_build.py. Frames start at 1 and are inclusive.\n')
        f.write(f'export const TOTAL_FRAMES = {total};\n')
        f.write('export const CHAPTER_STARTS: Array<{n: number; title: string; from: number}> = [\n')
        for c in chapters:
            f.write(f"  {{n: {c['n']}, title: {lit(c['title'])}, from: {c['from']}}},\n")
        f.write('];\n')
        f.write('export type Sentence = {id: string; chapter: number; from: number; to: number; text: string};\n')
        f.write('export const SENTENCES: Sentence[] = [\n')
        for s in sentences:
            f.write(f"  {{id: {lit(s['id'])}, chapter: {s['chapter']}, from: {s['from']}, to: {s['to']}, text: {lit(s['text'])}}},\n")
        f.write('];\n')
    print(f'engine={ENGINE} voice={tl["voice"]} total_frames={total} ({total/FPS:.1f}s) '
          f'sentences={len(sentences)} words={total_words} speech={speech_sec:.1f}s '
          f'rate={total_words/max(1e-6,speech_sec):.2f} words/s')
    for c in chapters:
        print(f"  chapter {c['n']} {c['title']} from f{c['from']}")


if __name__ == '__main__':
    narr = sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/script/narration.txt'
    asyncio.run(main(narr, guard_only=os.environ.get('TTS_GUARD_ONLY') == '1'))
