function rgbToHex(r, g, b) {
  const toHex = (v) => Math.round(Math.max(0, Math.min(255, v * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorDistance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

/** Walk Lottie JSON and collect fill/stroke colors (0–1 RGB). */
export function extractLottieColors(animationData) {
  const seen = new Set();
  const colors = [];

  const pushColor = (c) => {
    if (!Array.isArray(c) || c.length < 3) return;
    const [r, g, b, a = 1] = c;
    if (a < 0.08) return;
    const hex = rgbToHex(r, g, b);
    if (seen.has(hex)) return;
    seen.add(hex);
    colors.push({ r, g, b, hex });
  };

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (Array.isArray(node.c)) pushColor(node.c);
    if (node.k && Array.isArray(node.k.c)) pushColor(node.k.c);
    Object.values(node).forEach(walk);
  };

  walk(animationData);

  return colors.sort((a, b) => {
    const lum = (c) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return lum(b) - lum(a);
  });
}

/** Pick primary + soft accent; skip near-white / near-black. */
export function pickLottiePalette(animationData) {
  const colors = extractLottieColors(animationData);
  const isNeutral = (c) => {
    const spread = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
    const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return spread < 0.06 || lum > 0.94 || lum < 0.08;
  };

  const vivid = colors.filter((c) => !isNeutral(c));
  const primary = vivid[0] || colors[0];
  const secondary = vivid.find((c) => colorDistance(c, primary) > 0.12) || vivid[1] || primary;

  if (!primary) return null;

  return {
    primary: primary.hex,
    secondary: secondary.hex,
  };
}

export function lottiePaletteToCssVars(palette) {
  if (!palette) return {};
  return {
    '--error-lottie-primary': palette.primary,
    '--error-lottie-secondary': palette.secondary,
  };
}
