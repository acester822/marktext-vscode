/**
 * The number of monospace columns `str` occupies. Combining marks and
 * zero-width formatting characters contribute 0; East-Asian wide / fullwidth
 * code points contribute 2; everything else contributes 1.
 *
 * Iterating with `for...of` walks the string by code point, so astral
 * characters (surrogate pairs) are measured once rather than per code unit.
 */
export default function stringWidth(str: string): number;
