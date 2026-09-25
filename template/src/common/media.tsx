// Imported pictures: PNG/JPG/SVG assets from public/assets/<slug>/, composited like any other element.
// Every imported asset must be listed in the project's MANIFEST.md with its source and licence, and
// any text visible inside it counts as on-screen text (English-only gate).
import React from 'react';
import {Img, staticFile} from 'remotion';

export const Picture: React.FC<{src: string; x: number; y: number; w?: number; h?: number; op?: number; rot?: number; radius?: number}> = ({src, x, y, w, h, op = 1, rot = 0, radius = 0}) => (
  <Img
    src={staticFile(src)}
    style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: op, transform: rot ? `rotate(${rot}deg)` : undefined, borderRadius: radius, objectFit: 'contain'}}
  />
);
