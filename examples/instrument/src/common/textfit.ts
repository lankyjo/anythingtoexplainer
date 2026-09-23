/**
 * Text width estimation and adaptive font size - pure functions, no DOM measurement, so renders are
 * deterministic (the same frame on every machine).
 *
 * Per-character em widths live in emTable.json, shared with scripts/tts_build.py (one table, both
 * readers). They were measured with fontTools on Noto Sans SC at wght 700-900. Manrope at wght 400
 * runs at 0.84-0.99 of that, so the table overestimates slightly for Paper, which is the safe
 * direction: text shrinks a touch early, never overflows. selftest.py checks the table against every
 * bundled pack font.
 *
 * The budget side (<= 48 characters per subtitle block) is enforced in the narration rules
 * (reference/narration-storyboard.md).
 */
import EM_TABLE from './emTable.json';

export const EM_HEAVY = 1;      // classic body / subtitles / titles (Noto Sans SC)
export const EM_WIDE = 1.18;    // classic display face (Audiowide): titles, uppercase abbreviations
export const EM_ORB = 1.2;      // classic numerals (Orbitron)
export const EM_TECH = 0.92;    // classic technical face (Exo 2, italic, narrow)

const charCount = (s: string): number => [...s].length;

/** Estimated width of a string in em (1em = fontSize px). */
export const textEm = (s: string, emScale = 1): number => {
  let em = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 32;
    em +=
      c >= EM_TABLE.fullWidthFrom ? EM_TABLE.fullWidth
      : ch === ' ' ? EM_TABLE.space
      : ch >= 'A' && ch <= 'Z' ? EM_TABLE.upper
      : ch >= '0' && ch <= '9' ? EM_TABLE.digit
      : ch >= 'a' && ch <= 'z' ? EM_TABLE.lower
      : c >= 0xc0 && c < 0x250 ? EM_TABLE.accented
      : EM_TABLE.punct;
  }
  return em * emScale;
};

/**
 * Estimated width in px. letterSpacing is the CSS px value: Chromium adds it after every character
 * (including the last) and it does not scale with font size, so display titles with letterSpacing
 * must include it here.
 */
export const textW = (s: string, size: number, emScale = 1, letterSpacing = 0): number => textEm(s, emScale) * size + letterSpacing * charCount(s);

/**
 * Shrink the font size until the text fits, down to minSize (default 78% of size). The result keeps
 * one decimal to avoid sub-pixel jitter. The letterSpacing part does not scale with font size, so it
 * is subtracted from maxW before solving. If it still overflows at minSize the copy violates the
 * block length budget - fix the copy instead of relying on this.
 */
export const fitSize = (s: string, maxW: number, size: number, minSize = size * 0.78, emScale = 1, letterSpacing = 0): number => {
  const em = textEm(s, emScale);
  const extra = letterSpacing * charCount(s);
  if (em * size + extra <= maxW) return size;
  return Math.max(minSize, Math.round(((maxW - extra) / Math.max(1e-6, em)) * 10) / 10);
};
