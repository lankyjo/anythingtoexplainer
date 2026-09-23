# Install anythingtoexplainer

Turn a topic into a narrated explainer film. Everything runs locally: Remotion draws every frame,
kokoro synthesises the voice, no cloud services and no accounts.

Supported: Linux and macOS. On Windows use WSL and follow these steps inside it.

## 1. What the machine needs

| Requirement | Notes |
|---|---|
| Node >= 18 | Remotion and the UI server |
| Python >= 3.10 | voiceover and the scripts (a venv is created for you) |
| ffmpeg | audio decode and frame extraction |
| rsync | project scaffolding |
| ImageMagick (`convert` or `magick`) | still extraction |
| Chrome or Chromium | Remotion renders with it; `bin/setup` records the path so Remotion never has to download its own |

## 2. Check and install

From the repo root:

```bash
bin/setup            # checks everything, prints the exact install command per OS
bin/setup --yes      # also creates the Python venv and runs npm install
bin/setup doctor     # pass/fail report only; exit 1 when something is missing
```

`bin/setup` writes the detected browser path to `template/.env`, so `npx remotion` commands use the
system browser instead of downloading one. Re-run `doctor` after fixing anything it lists.

## 3. Install the skill into your agent

The standard path, via the skills CLI:

```bash
npx skills@latest add lankyjo/anythingtoexplainer --agent claude-code --agent opencode -y
```

Swap `--agent` for whatever your harness is called. Without that CLI, symlink the repo into your
harness's skills directory:

```bash
ln -s "$(pwd)" ~/.config/opencode/skills/anythingtoexplainer   # opencode
ln -s "$(pwd)" ~/.claude/skills/anythingtoexplainer            # Claude Code
```

Then just ask for a film: "Make me an explainer video about vector databases." The skill asks two
questions before writing anything - which style pack (paper, instrument or poster) and how long
(2-5 minutes) - and shows a 30-second preview before building the rest.

## 4. Three ways to start

```bash
bin/explain "vector databases" --style paper --minutes 3   # terminal: hands the prompt to your agent CLI
node ui/serve.mjs                                          # UI: create a project, copy its prompt, watch progress
```

In the UI, open http://localhost:4173, fill the form, press **Create project**, copy the prompt and
paste it into your agent. The page only reads files; the agent does the work. Projects live in
`projects/` (gitignore) and progress is derived from the artifacts.

## 5. First film checklist

1. `bin/setup doctor` - all green.
2. Create a project (UI or `bin/explain`).
3. Answer the skill's checkpoints: style + duration, then the narration, then the voice, then the
   30-second preview.
4. The finished film lands in `<project>/renders/`.

Budget about 2GB of disk per film (`node_modules` plus renders) and, on a small laptop, 30-60
minutes for a 3-5 minute film.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Remotion stalls downloading a browser | `bin/setup` writes the system browser path to `template/.env`; make sure Chrome/Chromium is installed, or pass `--browser-executable=/path/to/chrome` |
| `kokoro` import error | activate the venv (`source ~/.venvs/a2e/bin/activate`) and `pip install kokoro soundfile`; English G2P uses espeak-ng (`brew install espeak-ng` / `apt-get install espeak-ng`) |
| `python3 -m venv` fails | install `python3-venv` (Debian/Ubuntu) or use `python3.12 -m venv ~/.venvs/a2e` |
| "English-only: CJK character found" | the narration contains a Chinese character; translate it. The repo is English only by design |
| ffmpeg not found | `brew install ffmpeg` / `apt-get install ffmpeg` |
| `convert: command not found` | install ImageMagick (Debian ships `magick`, also accepted) |
| Node too old | install Node 20+; Remotion 4 needs >= 18 |
| Runs out of disk | delete `build_dev_*` and `build_full` inside the project; each is ~40MB, renders add more |

## 7. Verify the install

```bash
python3 selftest.py                 # guard + width table (with the venv active)
bash check_english.sh               # the English-only gate (text, fonts, image inventory)
python3 selftest.py --project examples/paper   # timeline vs audio onsets
node ui/selftest.mjs                # UI server contract
bin/setup doctor                    # environment report
```
