#!/usr/bin/env node
// anythingtoexplainer UI companion: a local page that creates film projects, hands you the prompt
// to run in your agent, and shows progress from the files on disk. Node built-ins only, no build
// step, no dependencies. It never runs TTS, renders or an agent itself.
//
//   node ui/serve.mjs [--port 4173] [--workspace ./projects]
//
// The workspace defaults to <repo>/projects (gitignored). Every subdirectory with a src/config.ts is
// a project. Progress comes from the project's artifacts plus an optional progress.json the skill
// writes at stage boundaries.
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const PORT = Number(arg('--port', process.env.A2E_PORT ?? 4173));
const WORKSPACE = resolve(arg('--workspace', process.env.A2E_WORKSPACE ?? join(ROOT, 'projects')));
mkdirSync(WORKSPACE, {recursive: true});

const STAGE_LABELS = ['scaffold', 'research', 'narration', 'voiceover', 'storyboard', 'shots', 'render'];
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const nonEmpty = (p) => read(p).trim().length > 0;

function projectNames() {
  return readdirSync(WORKSPACE, {withFileTypes: true})
    .filter((d) => d.isDirectory() && existsSync(join(WORKSPACE, d.name, 'src', 'config.ts')))
    .map((d) => d.name)
    .sort();
}

function projectState(name) {
  const dir = join(WORKSPACE, name);
  if (!dir.startsWith(WORKSPACE + sep)) throw new Error('path escapes the workspace');
  const cfg = read(join(dir, 'src', 'config.ts'));
  const style = (cfg.match(/style:\s*'(paper|instrument|poster)'/) || [])[1] ?? 'paper';
  const slug = (cfg.match(/slug:\s*'([^']+)'/) || [])[1] ?? 'demo';
  const narration = read(join(dir, 'script', 'narration.txt'));
  const shotsDir = join(dir, 'src', 'shots');
  const shotTables = existsSync(shotsDir)
    ? readdirSync(shotsDir).filter((g) => nonEmpty(join(shotsDir, g, 'index.ts')) && /SHOTS_\w+\s*:\s*ShotDef\[\]\s*=\s*\[[^\]]/.test(read(join(shotsDir, g, 'index.ts'))))
    : [];
  const rendersDir = join(dir, 'renders');
  const clips = existsSync(rendersDir) ? readdirSync(rendersDir).filter((f) => f.endsWith('.mp4')) : [];
  const stillsDir = join(dir, 'stills');
  const stills = existsSync(stillsDir)
    ? readdirSync(stillsDir).flatMap((g) => readdirSync(join(stillsDir, g)).filter((f) => /\.(png|jpg)$/.test(f)).map((f) => `stills/${g}/${f}`))
    : [];
  const progress = (() => {
    try { return JSON.parse(read(join(dir, 'progress.json')) || '{}'); } catch { return {}; }
  })();
  const stages = {
    scaffold: true,
    research: nonEmpty(join(dir, 'research', 'research.md')),
    narration: /[A-Za-z]{3}/.test(narration.replace(/^#.*$/gm, '')),
    voiceover: existsSync(join(dir, 'public', 'assets', slug, 'audio.wav')),
    storyboard: existsSync(join(dir, 'storyboard.md')),
    shots: shotTables.length > 0,
    render: clips.length > 0,
  };
  return {
    name, style, slug,
    stages,
    stage: progress.stage ?? STAGE_LABELS.filter((s) => stages[s]).pop() ?? 'scaffold',
    note: progress.note ?? '',
    done: STAGE_LABELS.filter((s) => stages[s]).length,
    total: STAGE_LABELS.length,
    stills: stills.slice(-12),
    clips,
    prompt: buildPrompt(name, style),
    mtime: statSync(join(dir, 'src', 'config.ts')).mtimeMs,
  };
}

function buildPrompt(name, style) {
  return [
    `Use the anythingtoexplainer skill at ${ROOT} to make an explainer video about: ${name}.`,
    `Style pack: ${style}.`,
    `Follow SKILL.md, including its checkpoints: confirm style and duration before writing anything,`,
    `write progress.json at each stage boundary (stage: scaffold|research|narration|voiceover|storyboard|shots|render),`,
    `and show me the 30-second preview before building the rest.`,
  ].join(' ');
}

function createProject({topic, style, minutes, subtitles}) {
  const name = String(topic || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  if (!name) throw new Error('topic must contain letters or digits');
  if (!['paper', 'instrument', 'poster'].includes(style)) throw new Error('unknown style');
  const dir = join(WORKSPACE, name);
  if (existsSync(dir)) throw new Error(`project ${name} already exists`);
  const proc = spawn('bash', [join(ROOT, 'template', 'scripts', 'new_project.sh'), dir, name], {stdio: 'ignore', detached: true});
  proc.unref();
  writeFileSync(join(WORKSPACE, `${name}.pending.json`), JSON.stringify({name, style, minutes, subtitles, startedAt: Date.now()}));
  const wait = setInterval(() => {
    if (!existsSync(join(dir, 'src', 'config.ts'))) return;
    clearInterval(wait);
    const cfgPath = join(dir, 'src', 'config.ts');
    let cfg = readFileSync(cfgPath, 'utf8');
    cfg = cfg.replace(/style: '(paper|instrument|poster)'/, `style: '${style}'`)
             .replace(/subtitles:\s*(true|false)/, `subtitles: ${subtitles ? 'true' : 'false'}`);
    writeFileSync(cfgPath, cfg);
    writeFileSync(join(dir, 'progress.json'), JSON.stringify({stage: 'scaffold', note: `created from the UI; target ${minutes} minutes`}, null, 2));
  }, 1000);
  return name;
}

const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.json': 'application/json'};

function serveFile(req, res, abs) {
  if (!existsSync(abs) || statSync(abs).isDirectory()) return fail(res, 404, 'not found');
  const type = MIME[extname(abs)] ?? 'application/octet-stream';
  const size = statSync(abs).size;
  const range = req.headers.range;
  if (range && /^bytes=\d*-\d*$/.test(range)) {
    const [from, to] = range.replace('bytes=', '').split('-').map((v) => (v === '' ? undefined : Number(v)));
    const start = from ?? 0;
    const end = Math.min(to ?? size - 1, size - 1);
    res.writeHead(206, {'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1});
    return createReadStream(abs, {start, end}).pipe(res);
  }
  res.writeHead(200, {'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size});
  createReadStream(abs).pipe(res);
}

function fail(res, code, message) {
  res.writeHead(code, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({error: message}));
}

function json(res, body) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) return serveFile(req, res, join(ROOT, 'ui', 'index.html'));
    if (req.method === 'GET' && url.pathname === '/api/state') {
      return json(res, {
        workspace: WORKSPACE,
        projects: projectNames()
          .filter((n) => existsSync(join(WORKSPACE, n, 'src', 'config.ts')))
          .map((n) => projectState(n))
          .sort((a, b) => b.mtime - a.mtime),
      });
    }
    if (req.method === 'POST' && url.pathname === '/api/projects') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const created = createProject(JSON.parse(body || '{}'));
          json(res, {created});
        } catch (e) {
          fail(res, 400, e.message);
        }
      });
      return;
    }
    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      const rest = decodeURIComponent(url.pathname.slice('/media/'.length));
      const [project, ...rel] = rest.split('/');
      const abs = normalize(join(WORKSPACE, project, ...rel));
      if (!abs.startsWith(join(WORKSPACE, project) + sep) && abs !== join(WORKSPACE, project)) return fail(res, 403, 'path escapes the project');
      if (!abs.startsWith(WORKSPACE + sep)) return fail(res, 403, 'path escapes the workspace');
      return serveFile(req, res, abs);
    }
    fail(res, 404, 'not found');
  } catch (e) {
    fail(res, 500, String(e.message ?? e));
  }
});

export {server, WORKSPACE, projectState, createProject};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`anythingtoexplainer UI: http://localhost:${PORT}`);
    console.log(`workspace: ${WORKSPACE}`);
    console.log('projects are created here; the agent CLI does the work, this page only reads files.');
  });
}
