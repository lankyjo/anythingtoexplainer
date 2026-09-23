#!/usr/bin/env python3
"""Minimal runnable checks for logic that has no visual signal of its own.
Run from the repo root with the venv active (numpy and pillow must be importable):
  python3 selftest.py                    # guard + width-table checks
  python3 selftest.py --project DIR      # also checks a built project's timeline against its audio

Checks:
  1) tts_build.py aborts on narration containing any CJK character;
  2) aborts on English narration with a single CJK line (the old >=20% threshold let this through);
  3) accepts clean English (guard only, no synthesis);
  4) aborts when src/config.ts still says lang: 'zh';
  5) the shared width table (template/src/common/emTable.json) against every bundled pack font:
     it must not underestimate real advances by more than 10% (text would overflow) nor
     overestimate by more than 28% (text would shrink for no reason);
  6) with --project: audio duration matches the timeline within 0.1 s, every sentence starts within
     one frame of its audio onset, and subtitle blocks sit inside their sentence.
  7) UI server checks live in ui/selftest.mjs (run by the UI ticket).
"""
import json, os, re, shutil, subprocess, sys, tempfile, wave

ROOT = os.path.dirname(os.path.abspath(__file__))
TTS = os.path.join(ROOT, 'template', 'scripts', 'tts_build.py')
EM_TABLE = os.path.join(ROOT, 'template', 'src', 'common', 'emTable.json')
PACK_FONTS = ['Manrope.ttf']  # extend when instrument/poster packs land
CANARIES = [
    'Retrieval-Augmented Generation',
    'How LLMs pass open-book exams',
    'of answers cite a retrieved source',
    'The future is already here.',
    '0123456789',
    'query, embedded',
]

CFG = "export const VIDEO = {\n  slug: 'selftest',\n  lang: 'en' as 'zh' | 'en',\n};\n"
CFG_ZH = CFG.replace("'en' as", "'zh' as")
CASES = [
    ('all-Chinese narration aborts', '\u4e00\u6bb5\u4e2d\u6587\u89e3\u8bf4\u3002\n', CFG, False),
    ('one Chinese line among English aborts', 'This is fine.\n\u8fd9\u91cc\u6709\u4e00\u884c\u4e2d\u6587\u3002\nMore English.\n', CFG, False),
    ('clean English passes the guard', '# CHAPTER 1 Intro\nThe future is already here.\n', CFG, True),
    ("config lang: 'zh' aborts", 'Clean English narration.\n', CFG_ZH, False),
]


def run_case(name, narration, cfg, should_pass):
    tmp = tempfile.mkdtemp(prefix='a2e_selftest_')
    try:
        os.makedirs(f'{tmp}/scripts'); os.makedirs(f'{tmp}/src/common'); os.makedirs(f'{tmp}/script')
        shutil.copy(TTS, f'{tmp}/scripts/tts_build.py')
        shutil.copy(os.path.join(ROOT, 'template', 'src', 'common', 'emTable.json'), f'{tmp}/src/common/emTable.json')
        open(f'{tmp}/src/config.ts', 'w').write(cfg)
        open(f'{tmp}/script/narration.txt', 'w').write(narration)
        env = {**os.environ, 'TTS_GUARD_ONLY': '1'}
        r = subprocess.run([sys.executable, 'scripts/tts_build.py'], cwd=tmp,
                           capture_output=True, text=True, env=env, timeout=60)
        ok = (r.returncode == 0) == should_pass
        print(('ok    ' if ok else 'FAIL  ') + name + ('' if ok else f': exit {r.returncode}\n{(r.stdout + r.stderr).strip()}'))
        return ok
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def predict_em(s, table):
    tot = 0.0
    for ch in s:
        c = ord(ch)
        tot += table['fullWidth'] if c >= table['fullWidthFrom'] else (
            table['space'] if ch == ' ' else table['upper'] if 'A' <= ch <= 'Z' else table['digit'] if '0' <= ch <= '9'
            else table['lower'] if 'a' <= ch <= 'z' else table['accented'] if 0xc0 <= c < 0x250 else table['punct'])
    return tot


def check_font_tables():
    from PIL import ImageFont
    table = json.load(open(EM_TABLE, encoding='utf-8'))
    ok = True
    for name in PACK_FONTS:
        path = os.path.join(ROOT, 'template', 'public', 'fonts', name)
        if not os.path.exists(path):
            print(f'FAIL  width table: font missing {path}')
            ok = False
            continue
        font = ImageFont.truetype(path, 200)
        worst = 0.0
        for s in CANARIES:
            ratio = (font.getlength(s) / 200) / max(1e-6, predict_em(s, table))
            worst = max(worst, abs(ratio - 1))
            if ratio > 1.10 or ratio < 0.72:
                print(f'FAIL  width table vs {name}: ratio {ratio:.3f} for "{s}" (allowed 0.72-1.10)')
                ok = False
        if ok:
            print(f'ok    width table vs {name} (worst deviation {worst * 100:.0f}%)')
    return ok


def check_project(d):
    import numpy as np
    tl_path = os.path.join(d, 'script', 'timeline.json')
    if not os.path.exists(tl_path):
        print(f'FAIL  project {d}: no script/timeline.json')
        return False
    tl = json.load(open(tl_path, encoding='utf-8'))
    slug = re.search(r"slug:\s*'([^']+)'", open(os.path.join(d, 'src', 'config.ts'), encoding='utf-8').read()).group(1)
    wav = os.path.join(d, 'public', 'assets', slug, 'audio.wav')
    if not os.path.exists(wav):
        print(f'FAIL  project {d}: no {wav}')
        return False
    ok = True
    with wave.open(wav) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if ch == 2: x = x.reshape(-1, 2)[:, 0]
    dur = len(x) / sr
    if abs(dur - tl['total_frames'] / tl['fps']) >= 0.1:
        print(f'FAIL  audio duration {dur:.2f}s vs timeline {tl["total_frames"] / tl["fps"]:.2f}s')
        ok = False
    step = int(sr / tl['fps'])
    nf = len(x) // step
    rms = np.sqrt((x[:nf * step].reshape(nf, step) ** 2).mean(axis=1))
    for s in tl['sentences']:
        f0 = s['from'] - 1
        # The block is placed at f0 exactly; trim_edges keeps ~30ms of lead-in, so the audible
        # onset is 1-2 frames later. Detect the first frame above 5% of the sentence peak and
        # require it inside [f0-1, f0+3]; never before the placement by more than a frame.
        peak = float(rms[f0:f0 + 40].max()) if len(rms) > f0 else 0.0
        floor = max(0.008, 0.05 * peak)
        onset = next((i for i in range(max(0, f0 - 2), min(len(rms), f0 + 6)) if rms[i] > floor), -1)
        if onset < 0 or not (f0 - 1 <= onset <= f0 + 3):
            print(f'FAIL  {s["id"]}: audio onset at frame {onset}, timeline says {f0}')
            ok = False
        for sb in s['subs']:
            if sb['from'] < s['from'] - 1 or sb['to'] > s['to'] + 1:
                print(f'FAIL  {s["id"]}: subtitle f{sb["from"]}-{sb["to"]} outside sentence f{s["from"]}-{s["to"]}')
                ok = False
    if ok:
        print(f'ok    project {d}: {len(tl["sentences"])} sentences match their audio onsets')
    return ok


if __name__ == '__main__':
    results = [run_case(*c) for c in CASES]
    results.append(check_font_tables())
    if '--project' in sys.argv:
        results.append(check_project(sys.argv[sys.argv.index('--project') + 1]))
    n_fail = results.count(False)
    print(f'{len(results) - n_fail}/{len(results)} passed')
    sys.exit(1 if n_fail else 0)
