// Parametric drawing kit: 2.5D projection, wireframe primitives, seeded repetition and hatching.
// The point is that detail comes from loops and parameters, never from hand-written path data.
// Colours are passed in so every pack can use the kit.
import React from 'react';

export type V3 = [number, number, number];
export type Cam = {yaw?: number; pitch?: number; s?: number; cx?: number; cy?: number; persp?: number};

/** Project a 3D point to the screen. Mild perspective; y is up in world space. */
export const project3 = (p: V3, cam: Cam = {}): [number, number] => {
  const {yaw = -0.6, pitch = 0.32, s = 1, cx = 640, cy = 360, persp = 1400} = cam;
  const [x, y, z] = p;
  const cyw = Math.cos(yaw), syw = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const X = x * cyw - z * syw;
  const Z = x * syw + z * cyw;
  const Y = y * cp - Z * sp;
  const D = y * sp + Z * cp;
  const f = persp / (persp + D);
  return [cx + X * s * f, cy - Y * s * f];
};

type Stroke = {color: string; w?: number; op?: number};

export const Wire: React.FC<{verts: V3[]; edges: Array<[number, number]>; cam?: Cam} & Stroke> = ({verts, edges, cam, color, w = 1.5, op = 1}) => (
  <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: op}}>
    {edges.map(([a, b], i) => {
      const [x1, y1] = project3(verts[a], cam);
      const [x2, y2] = project3(verts[b], cam);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
    })}
  </svg>
);

/** Wireframe box from a corner and a size. */
export const Box3: React.FC<{o: V3; size: V3; cam?: Cam} & Stroke> = ({o, size, cam, color, w = 1.5, op = 1}) => {
  const [x, y, z] = o; const [a, b, c] = size;
  const verts: V3[] = [[x, y, z], [x + a, y, z], [x + a, y, z + c], [x, y, z + c], [x, y + b, z], [x + a, y + b, z], [x + a, y + b, z + c], [x, y + b, z + c]];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return <Wire verts={verts} edges={edges} cam={cam} color={color} w={w} op={op} />;
};

/** Wireframe cylinder along Y (an upright drum), from a base centre. Segments control roundness. */
export const Cylinder: React.FC<{base: V3; r: number; h: number; segments?: number; cam?: Cam} & Stroke> = ({base, r, h, segments = 24, cam, color, w = 1.5, op = 1}) => {
  const [bx, by, bz] = base;
  const verts: V3[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    verts.push([bx + Math.cos(a) * r, by, bz + Math.sin(a) * r]);
  }
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < segments; i++) {
    edges.push([i, (i + 1) % segments]);                       // base ellipse
    edges.push([i + segments, ((i + 1) % segments) + segments]); // top ellipse
    edges.push([i, i + segments]);                             // sides
  }
  const verts2 = [...verts, ...verts.map(([x, y, z]) => [x, y + h, z] as V3)];
  return <Wire verts={verts2} edges={edges} cam={cam} color={color} w={w} op={op} />;
};

/** Wireframe polyhedron from explicit vertices and edges (Platonic solids, prisms, custom shapes). */
export const Poly: React.FC<{verts: V3[]; edges: Array<[number, number]>; cam?: Cam} & Stroke> = ({verts, edges, cam, color, w = 1.5, op = 1}) => (
  <Wire verts={verts} edges={edges} cam={cam} color={color} w={w} op={op} />
);

/** Tetrahedron, cube, octahedron, dodecahedron (approx) and icosahedron (approx) edge sets. */
export const SOLIDS: Record<string, {verts: V3[]; edges: Array<[number, number]>}> = (() => {
  const t = 1 / Math.sqrt(3);
  const tetra: V3[] = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  const octa: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const cube: V3[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  const ico: V3[] = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  const edgesOf = (verts: V3[], min: number, max: number) => {
    const e: Array<[number, number]> = [];
    for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(verts[i][0] - verts[j][0], verts[i][1] - verts[j][1], verts[i][2] - verts[j][2]);
      if (d > min && d < max) e.push([i, j]);
    }
    return e;
  };
  return {
    tetra: {verts: tetra, edges: edgesOf(tetra, 3.2, 3.6)},
    cube: {verts: cube, edges: edgesOf(cube, 1.9, 2.1)},
    octa: {verts: octa, edges: edgesOf(octa, 1.3, 1.5)},
    ico: {verts: ico, edges: edgesOf(ico, 1.9, 2.1)},
    dodeca: {verts: ico, edges: edgesOf(ico, 1.9, 2.1)}, // icosahedron stands in until a true dodecahedron is needed
  };
})();

/** Seeded repetition: rows/cols of small marks (crowds, textures, dot fields). */
export const Marks: React.FC<{x: number; y: number; cols: number; rows: number; pitch?: number; seed?: number; kind?: 'dot' | 'tick' | 'cross'; size?: number; color: string; op?: number; jitter?: number; alpha?: (col: number, row: number) => number}> = ({x, y, cols, rows, pitch = 18, seed = 1, kind = 'dot', size = 3, color, op = 1, jitter = 0.25, alpha}) => {
  const rnd = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const marks = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const jx = (rnd(i) - 0.5) * pitch * jitter;
    const jy = (rnd(i + 99) - 0.5) * pitch * jitter;
    const px = x + c * pitch + jx, py = y + r * pitch + jy;
    const a = (alpha ? alpha(c, r) : 1) * op;
    if (kind === 'dot') marks.push(<circle key={i} cx={px} cy={py} r={size / 2} fill={color} opacity={a} />);
    else if (kind === 'tick') marks.push(<line key={i} x1={px} y1={py} x2={px} y2={py + size * 2} stroke={color} strokeWidth={1.4} opacity={a} />);
    else marks.push(<g key={i} opacity={a}><line x1={px - size} y1={py - size} x2={px + size} y2={py + size} stroke={color} strokeWidth={1.4} /><line x1={px - size} y1={py + size} x2={px + size} y2={py - size} stroke={color} strokeWidth={1.4} /></g>);
  }
  return <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>{marks}</svg>;
};
