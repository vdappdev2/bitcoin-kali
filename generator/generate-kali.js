// Bitcoin Kali — pixel-art devotional portrait generator (run2)
//
// Composition order (back to front):
//   1. Background + atmosphere/halo
//   2. Prone Shiva (drawn before Kali so her feet overlap his chest)
//   3. Hair rear-mass (behind Kali body)
//   4. Kali body: legs, hips, torso, neck
//   5. Breasts
//   6. Long head-garland down torso (mundamala)
//   7. Pearl necklace at neck base
//   8. Skirt of severed arms at hips
//   9. Four bent, tapered arms
//  10. Head details (face, crown, front hair)
//  11. Items in each hand
//
// Base canvas: 256×256, nearest-neighbor upscaled to 1024×1024.
// All fillRect coords are integers so the upscale stays crisp.

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// --- Generator version (single source of truth: package.json) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const { version: GENERATOR_VERSION } = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf8')
);

// --- Per-piece identity names (loop index i → output filename stem) ---
// These match the locked NFT identity names in currentplan.md.
// Order is load-bearing: it pairs with the seed sequence (seed = startSeed + i * 31)
// and the forced item/background cycle in the main loop. Do not reorder.
const IDENTITY_NAMES = [
  'Kali-Destroyer-of-Fiat',          // i = 0
  'Kali-Slayer-of-Bankers',          // i = 1
  'Kali-Bane-of-Debasement',         // i = 2
  'Kali-Goddess-of-Sovereignty',     // i = 3
  'Kali-Devourer-of-Time',           // i = 4
  'Kali-of-the-Cremation-Ground',    // i = 5  (curator: kali.bitcoins@)
  'Kali-Mother-of-the-Immutable',    // i = 6
];

// --- RNG ---
function makeRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }

// --- CONSTANTS ---
const BASE = 256;
const FINAL = 1024;
const CX = 128;
const SKIN = '#2a1e4a';
const SKIN_HI = '#4a3866';
const SKIN_SH = '#18102a';
const HAIR = '#0a0a14';
const HAIR_HI = '#1a1428';
const TONGUE = '#c92a2a';
const BLOOD = '#7a0a0a';
const RED_PALM = '#c63838';
const BONE = '#e8dfc6';
const BONE_SH = '#a89a78';
const GOLD = '#d4af37';
const GOLD_HI = '#f0d060';
const SILVER = '#c8c8d0';
const SHIVA_SKIN = '#a8c0e0';     // pale ash-blue (Nilakantha / cremation ash)
const SHIVA_SKIN_SH = '#6878a0';
const FLESH_LIGHT = '#e0b088';
const FLESH_MID = '#c08868';
const FLESH_DARK = '#8a5838';

// --- BACKGROUND PALETTES ---
const PALETTES = {
  void:     { sky1: '#0a0820', sky2: '#1a0a2e', accent: '#6c5b9b', star: '#e8e0ff' },
  fire:     { sky1: '#1a0606', sky2: '#3a1208', accent: '#ff7a18', star: '#ffd060' },
  mandala:  { sky1: '#0a1418', sky2: '#10262a', accent: '#3a8a8e', star: '#a8e0d8' },
  arch:     { sky1: '#4a7ea8', sky2: '#7ca4c4', accent: '#8a6a4a', star: '#f4d878' },
  moon:     { sky1: '#0a0810', sky2: '#1a0810', accent: '#9a1818', star: '#ffb0a0' },
  ground:   { sky1: '#1a1418', sky2: '#2a2228', accent: '#5a4a48', star: '#c8b8a0' },
  silver_halo: { sky1: '#1a1826', sky2: '#2a2438', accent: '#b0b0c8', star: '#f0f0ff' },
};

// --- BACKGROUNDS ---
function drawBackground(ctx, rng, palette, kind) {
  for (let y = 0; y < BASE; y++) {
    const t = y / BASE;
    ctx.fillStyle = lerpHex(palette.sky1, palette.sky2, t);
    ctx.fillRect(0, y, BASE, 1);
  }

  if (kind === 'void') {
    for (let i = 0; i < 90; i++) {
      const x = randInt(rng, 0, BASE - 1);
      const y = randInt(rng, 0, 190);
      ctx.fillStyle = palette.star;
      ctx.fillRect(x, y, 1, 1);
      if (rng() < 0.2) { ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
    }
  } else if (kind === 'fire') {
    for (let r = 100; r > 0; r -= 2) {
      const t = r / 100;
      ctx.fillStyle = lerpHex(palette.accent, palette.sky1, t);
      ctx.beginPath();
      ctx.arc(CX, 120, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 36; i++) {
      const a = rng() * Math.PI * 2;
      const d = 80 + randInt(rng, 0, 30);
      const fx = Math.floor(CX + Math.cos(a) * d);
      const fy = Math.floor(120 + Math.sin(a) * d);
      ctx.fillStyle = palette.star;
      ctx.fillRect(fx, fy, 1, randInt(rng, 2, 4));
    }
  } else if (kind === 'mandala') {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1;
    for (let r = 30; r <= 115; r += 10) {
      ctx.beginPath();
      ctx.arc(CX, 120, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(CX, 120);
      ctx.lineTo(CX + Math.cos(a) * 115, 120 + Math.sin(a) * 115);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      for (let r = 30; r <= 115; r += 10) {
        const dx = Math.floor(CX + Math.cos(a) * r);
        const dy = Math.floor(120 + Math.sin(a) * r);
        ctx.fillStyle = palette.star;
        ctx.fillRect(dx, dy, 1, 1);
      }
    }
  } else if (kind === 'arch') {
    ctx.fillStyle = palette.accent;
    ctx.fillRect(20, 30, 12, 180);
    ctx.fillRect(BASE - 32, 30, 12, 180);
    ctx.beginPath();
    ctx.arc(CX, 30, 108, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = lerpHex(palette.sky1, palette.sky2, 0.3);
    ctx.beginPath();
    ctx.arc(CX, 36, 96, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(32, 36, BASE - 64, 174);
    ctx.fillStyle = palette.star;
    ctx.fillRect(16, 26, 20, 4);
    ctx.fillRect(BASE - 36, 26, 20, 4);
    // inner archway trim
    ctx.fillStyle = palette.accent;
    for (let a = 0; a < Math.PI; a += Math.PI / 16) {
      const x = Math.floor(CX - Math.cos(a) * 96);
      const y = Math.floor(36 - Math.sin(a) * 96) + 86;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (kind === 'moon') {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(CX, 80, 56, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ground') {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.moveTo(0, 210);
    let x = 0;
    while (x < BASE) {
      const peak = randInt(rng, 125, 165);
      const w = randInt(rng, 30, 60);
      ctx.lineTo(x + w / 2, peak);
      ctx.lineTo(x + w, 210);
      x += w;
    }
    ctx.closePath();
    ctx.fill();
    // Two oscillating smoke columns. Each column wanders side-to-side as it
    // rises in runs of 2-4 steps in one direction, then flips direction.
    // The result: a wavering snake-like column of smoke that stays roughly
    // vertical overall but reads as actual rising smoke, not a leaning stack.
    const SMOKE = '#9098a0';
    const SMOKE_HI = '#b8c0c8';
    const drawOscillatingColumn = (startX, startY, totalSteps, initialDir) => {
      let bx = startX;
      let by = startY;
      let dir = initialDir;
      let runLeft = randInt(rng, 2, 4);
      for (let step = 0; step < totalSteps; step++) {
        const bw = randInt(rng, 6, 11);
        const bh = randInt(rng, 2, 4);
        ctx.fillStyle = SMOKE;
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = SMOKE_HI;
        ctx.fillRect(bx + 1, by, bw - 2, 1);
        bx += dir * randInt(rng, 2, 5);
        by -= randInt(rng, 8, 14);
        if (rng() < 0.3) bx += randInt(rng, -2, 2);
        runLeft -= 1;
        if (runLeft <= 0) {
          dir = -dir;
          runLeft = randInt(rng, 2, 4);
        }
      }
    };
    // Both columns share the same initial drift direction and behavior.
    // Left column (viewer's left = Kali's right): 9 blobs.
    // Right column (viewer's right = Kali's left): 8 blobs (shorter, doesn't reach as high).
    const sharedDir = rng() < 0.5 ? 1 : -1;
    drawOscillatingColumn(randInt(rng, 30, 56),  randInt(rng, 184, 194), 9, sharedDir);
    drawOscillatingColumn(randInt(rng, 200, 226), randInt(rng, 184, 194), 8, sharedDir);
  } else if (kind === 'silver_halo') {
    // Silver moon disc behind the head. Cool palette doesn't blend with the
    // gold crown, so the disc can sit high (y=90) without losing the crown.
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(CX, 90, 56, 0, Math.PI * 2);
    ctx.fill();
    // cooler inner fill
    ctx.fillStyle = lerpHex(palette.accent, palette.sky1, 0.35);
    ctx.beginPath();
    ctx.arc(CX, 90, 48, 0, Math.PI * 2);
    ctx.fill();
    // bright silver rim
    ctx.fillStyle = palette.star;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.floor(CX + Math.cos(a) * 56);
      const y = Math.floor(90 + Math.sin(a) * 56);
      ctx.fillRect(x, y, 1, 1);
    }
    // short rays only (no long rays)
    ctx.strokeStyle = palette.star;
    ctx.lineWidth = 1;
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const rInner = 58;
      const rOuter = 68;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * rInner, 90 + Math.sin(a) * rInner);
      ctx.lineTo(CX + Math.cos(a) * rOuter, 90 + Math.sin(a) * rOuter);
      ctx.stroke();
    }
    // subtle moon surface mottling
    for (let i = 0; i < 12; i++) {
      const mx = randInt(rng, CX - 44, CX + 44);
      const my = randInt(rng, 50, 130);
      const dx = mx - CX, dy = my - 90;
      if (dx * dx + dy * dy < 46 * 46) {
        ctx.fillStyle = lerpHex(palette.accent, palette.sky1, 0.5);
        ctx.fillRect(mx, my, 2, 1);
      }
    }
  }
}

// --- PRONE SHIVA ---
// Horizontal across the bottom, head on viewer's LEFT, feet pointing RIGHT.
// Simplified silhouette: no spread-hair (previously read as a fork), no arms.
// The goal at this resolution is an unambiguous prone-human silhouette, not anatomy.
function drawShiva(ctx) {
  // cremation-ground floor beneath
  ctx.fillStyle = '#1a1014';
  ctx.fillRect(0, 232, BASE, BASE - 232);

  // --- head (viewer's left) ---
  // Face is rotated 90° CCW to match the prone body orientation:
  // forehead points LEFT (toward back of head), eyes are stacked vertically
  // in the middle of the head, mouth is on the RIGHT (toward chin), and the
  // hair sits on the LEFT (back-of-head end).
  ctx.fillStyle = SHIVA_SKIN;
  // head block
  ctx.fillRect(30, 208, 18, 18);
  // rounded corners
  ctx.fillRect(32, 207, 14, 1);
  ctx.fillRect(32, 226, 14, 1);

  // hair on the LEFT (back of head, now pointing left)
  ctx.fillStyle = '#241a12';
  ctx.fillRect(28, 209, 4, 16);
  ctx.fillRect(26, 211, 2, 12);
  ctx.fillRect(24, 214, 2, 6);
  // wispy back-of-head tuft pointing further left
  ctx.fillRect(22, 216, 2, 2);

  // third eye on forehead (LEFT side of head), rotated 90° → horizontal slit
  ctx.fillStyle = '#7a1010';
  ctx.fillRect(33, 216, 3, 1);
  ctx.fillStyle = '#a82020';
  ctx.fillRect(33, 217, 3, 1);

  // eyes — stacked vertically in the middle of the head, each as a vertical slit
  ctx.fillStyle = '#3a2818';
  // upper eye (was the left eye of an upright face)
  ctx.fillRect(38, 212, 1, 3);
  // lower eye (was the right eye)
  ctx.fillRect(38, 220, 1, 3);
  // eyelid lines (rotated brows)
  ctx.fillStyle = '#241a12';
  ctx.fillRect(39, 212, 1, 3);
  ctx.fillRect(39, 220, 1, 3);

  // nose ridge (middle, vertical line)
  ctx.fillStyle = SHIVA_SKIN_SH;
  ctx.fillRect(41, 215, 1, 5);

  // mouth/mustache on the RIGHT (chin end), now a vertical line
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(44, 214, 1, 6);
  ctx.fillStyle = '#241a12';
  ctx.fillRect(45, 215, 1, 4);

  // --- neck ---
  ctx.fillStyle = SHIVA_SKIN;
  ctx.fillRect(48, 212, 8, 14);

  // --- torso block (broad chest → waist → hips, one continuous silhouette) ---
  // chest
  ctx.fillRect(56, 202, 86, 28);
  // chest shading (single line along bottom for subtle form)
  ctx.fillStyle = SHIVA_SKIN_SH;
  ctx.fillRect(56, 229, 86, 1);
  // nipples — small grey-blue dots, symmetric across body centerline
  ctx.fillStyle = '#586890';
  ctx.fillRect(82, 212, 1, 1);
  ctx.fillRect(82, 220, 1, 1);

  // --- waist (narrower) ---
  ctx.fillStyle = SHIVA_SKIN;
  ctx.fillRect(142, 206, 14, 22);

  // --- hips ---
  ctx.fillRect(156, 202, 20, 28);

  // loincloth wrap — spans the full body width so it reads as wrapping the waist
  // base wrap (full body height: y=202..230)
  ctx.fillStyle = '#a89078';
  ctx.fillRect(156, 202, 20, 28);
  // dark edges (fabric ends top + bottom of the wrap)
  ctx.fillStyle = '#6a5440';
  ctx.fillRect(156, 202, 20, 1);
  ctx.fillRect(156, 229, 20, 1);
  // fold lines along the wrap
  ctx.fillRect(156, 210, 20, 1);
  ctx.fillRect(156, 220, 20, 1);
  // highlights along the upper edge of each fold
  ctx.fillStyle = '#c8b090';
  ctx.fillRect(156, 203, 20, 1);
  ctx.fillRect(156, 211, 20, 1);
  ctx.fillRect(156, 221, 20, 1);
  // knot bump sticking out at the front (viewer's top side of the body)
  ctx.fillStyle = '#a89078';
  ctx.fillRect(164, 199, 5, 3);
  ctx.fillStyle = '#6a5440';
  ctx.fillRect(164, 199, 5, 1);
  ctx.fillRect(164, 201, 5, 1);
  ctx.fillStyle = '#c8b090';
  ctx.fillRect(165, 200, 3, 1);
  // loose end hanging at the back side of the wrap
  ctx.fillStyle = '#a89078';
  ctx.fillRect(165, 230, 3, 3);
  ctx.fillStyle = '#6a5440';
  ctx.fillRect(165, 232, 3, 1);

  // --- thighs ---
  ctx.fillStyle = SHIVA_SKIN;
  ctx.fillRect(176, 206, 26, 22);
  // knee shading
  ctx.fillStyle = SHIVA_SKIN_SH;
  ctx.fillRect(200, 212, 2, 10);

  // --- lower legs ---
  ctx.fillStyle = SHIVA_SKIN;
  ctx.fillRect(202, 208, 20, 18);

  // --- feet (pointing up/right) ---
  ctx.fillRect(222, 206, 10, 18);
  // toe detail
  ctx.fillStyle = SHIVA_SKIN_SH;
  ctx.fillRect(230, 208, 2, 2);
  ctx.fillRect(230, 212, 2, 2);
  ctx.fillRect(230, 216, 2, 2);
  ctx.fillRect(230, 220, 2, 2);
}

// --- HAIR REAR MASS ---
// A single solid dark mass behind the figure, wider than the body so it
// frames her on both sides. Texture comes from grey strand-highlight streaks
// inside the mass — NOT from gaps or detached side-wisps (those read as
// pigtails/spider-legs). Body overlays the center; hair peeks ~14px on each
// side and cascades past the hips.
function drawHairRear(ctx) {
  ctx.fillStyle = HAIR;

  // 1. Mass behind the head with a jagged wispy top edge
  ctx.fillRect(CX - 28, 46, 56, 18);
  ctx.fillRect(CX - 22, 42, 6, 4);
  ctx.fillRect(CX - 12, 40, 6, 2);
  ctx.fillRect(CX, 40, 6, 2);
  ctx.fillRect(CX + 10, 42, 6, 4);

  // 2. Wide solid rear mass — full upper body width
  ctx.fillRect(CX - 32, 64, 64, 64);   // shoulders + upper back

  // 3. Mid-back (slightly narrower)
  ctx.fillRect(CX - 30, 128, 60, 46);

  // 4. Tapering past hips
  ctx.fillRect(CX - 24, 174, 48, 22);
  ctx.fillRect(CX - 18, 196, 36, 6);

  // 5. Grey strand-highlight streaks for hair texture (across the whole mass)
  ctx.fillStyle = HAIR_HI;
  const streakXs = [
    CX - 30, CX - 26, CX - 22, CX - 18, CX - 14, CX - 10, CX - 6, CX - 2,
    CX + 2,  CX + 6,  CX + 10, CX + 14, CX + 18, CX + 22, CX + 26, CX + 30,
  ];
  for (const sx of streakXs) {
    // each streak broken into 3 segments for organic look
    ctx.fillRect(sx, 66, 1, 28);
    ctx.fillRect(sx, 100, 1, 40);
    ctx.fillRect(sx, 146, 1, 50);
  }
  // a few brighter highlights for depth
  const brightXs = [CX - 24, CX - 12, CX + 8, CX + 20];
  for (const sx of brightXs) {
    ctx.fillRect(sx, 80, 1, 20);
    ctx.fillRect(sx, 130, 1, 30);
    ctx.fillRect(sx, 170, 1, 25);
  }
}

// --- KALI BODY ---
// Female proportions: shoulders → narrow waist → wider hips → legs.
// Drawn around CX, with torso/head/legs in layered rects.
function drawKaliBody(ctx, rng) {
  // --- legs ---
  ctx.fillStyle = SKIN;
  // left thigh (viewer's left = Kali's right thigh)
  ctx.fillRect(CX - 13, 165, 9, 18);
  // right thigh
  ctx.fillRect(CX + 4, 165, 9, 18);
  // left calf (narrower)
  ctx.fillRect(CX - 12, 183, 8, 14);
  // right calf
  ctx.fillRect(CX + 4, 183, 8, 14);
  // left ankle
  ctx.fillRect(CX - 11, 197, 7, 4);
  // right ankle
  ctx.fillRect(CX + 4, 197, 7, 4);
  // left foot (overlaps Shiva's chest)
  ctx.fillRect(CX - 14, 201, 11, 5);
  // right foot
  ctx.fillRect(CX + 3, 201, 11, 5);
  // red soles (alta)
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(CX - 14, 205, 11, 1);
  ctx.fillRect(CX + 3, 205, 11, 1);
  // anklets
  ctx.fillStyle = GOLD;
  ctx.fillRect(CX - 12, 199, 9, 2);
  ctx.fillRect(CX + 3, 199, 9, 2);

  // leg shading
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 13, 165, 2, 32);
  ctx.fillRect(CX + 11, 165, 2, 32);
  // highlight
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 7, 167, 1, 28);
  ctx.fillRect(CX + 7, 167, 1, 28);

  // --- hips (wider than waist) ---
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 18, 148, 36, 17);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 18, 148, 3, 17);
  ctx.fillRect(CX + 15, 148, 3, 17);

  // --- waist (narrow) ---
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 13, 134, 26, 14);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 13, 134, 2, 14);
  ctx.fillRect(CX + 11, 134, 2, 14);
  // navel
  ctx.fillRect(CX, 142, 1, 2);

  // --- upper torso ---
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 16, 115, 32, 19);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 16, 115, 3, 19);
  ctx.fillRect(CX + 13, 115, 3, 19);
  // chest highlight centerline
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 1, 118, 2, 16);

  // --- shoulders (widest torso point) ---
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 18, 102, 36, 13);
  // shoulder caps
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 18, 102, 6, 2);
  ctx.fillRect(CX + 12, 102, 6, 2);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 18, 112, 36, 1);

  // --- neck ---
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 6, 92, 12, 11);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 6, 100, 12, 1);
}

function drawBreasts(ctx) {
  // rectangular, integrated with torso shading
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 12, 118, 8, 6);
  ctx.fillRect(CX + 4, 118, 8, 6);
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 12, 123, 8, 1);
  ctx.fillRect(CX + 4, 123, 8, 1);
  // nipples
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 9, 121, 1, 1);
  ctx.fillRect(CX + 7, 121, 1, 1);
  // underbust curve
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 11, 124, 6, 1);
  ctx.fillRect(CX + 5, 124, 6, 1);
}

// --- HEAD GARLAND (mundamala) ---
// Two diverging chains of severed heads: start close at the neck, drape
// outward and down along the torso, then converge at the belly and continue
// as a short vertical drape. Gives the garland more "separation" so it
// doesn't clump into a bib at the top.
function drawHeadGarland(ctx, rng) {
  // Left chain — starts inside the neckline, bows outward, sweeps down
  const leftChain = [
    [CX - 11, 104],
    [CX - 14, 112],
    [CX - 17, 122],
    [CX - 18, 132],
    [CX - 15, 142],
    [CX - 8,  150],
  ];
  // Right chain — mirror
  const rightChain = [
    [CX + 11, 104],
    [CX + 14, 112],
    [CX + 17, 122],
    [CX + 18, 132],
    [CX + 15, 142],
    [CX + 8,  150],
  ];
  // Convergence point + short vertical drape
  const center = [
    [CX, 156],
    [CX, 163],
  ];

  // Draw red cord first (so heads draw on top)
  ctx.fillStyle = BLOOD;
  const cordAll = [...leftChain, ...rightChain, ...center];
  for (const [x, y] of cordAll) {
    ctx.fillRect(x, y + 2, 1, 1);
  }
  // Cord connecting strokes between adjacent heads in each chain
  for (let i = 0; i < leftChain.length - 1; i++) {
    const [x1, y1] = leftChain[i], [x2, y2] = leftChain[i + 1];
    drawCordSeg(ctx, x1, y1, x2, y2);
  }
  for (let i = 0; i < rightChain.length - 1; i++) {
    const [x1, y1] = rightChain[i], [x2, y2] = rightChain[i + 1];
    drawCordSeg(ctx, x1, y1, x2, y2);
  }
  // Cord from bottom of each chain converging to center
  drawCordSeg(ctx, leftChain[5][0], leftChain[5][1], CX, 156);
  drawCordSeg(ctx, rightChain[5][0], rightChain[5][1], CX, 156);
  drawCordSeg(ctx, CX, 156, CX, 163);

  // Now draw the heads on top
  for (const [x, y] of leftChain) drawSeveredHead(ctx, x, y, rng);
  for (const [x, y] of rightChain) drawSeveredHead(ctx, x, y, rng);
  for (const [x, y] of center) drawSeveredHead(ctx, x, y, rng);
}

function drawCordSeg(ctx, x1, y1, x2, y2) {
  ctx.fillStyle = BLOOD;
  const dx = x2 - x1, dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + dx * t);
    const y = Math.round(y1 + dy * t);
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawSeveredHead(ctx, cx, cy, rng) {
  // 6 wide × 5 tall severed head
  // skin
  const fleshTones = [FLESH_LIGHT, FLESH_MID];
  ctx.fillStyle = fleshTones[Math.floor(rng() * 2)];
  ctx.fillRect(cx - 3, cy - 1, 6, 4);
  // hair on top
  ctx.fillStyle = HAIR;
  ctx.fillRect(cx - 3, cy - 2, 6, 2);
  // side hair tufts
  ctx.fillRect(cx - 4, cy, 1, 2);
  ctx.fillRect(cx + 3, cy, 1, 2);
  // closed eyes (dead)
  ctx.fillStyle = '#1a1014';
  ctx.fillRect(cx - 2, cy, 1, 1);
  ctx.fillRect(cx + 1, cy, 1, 1);
  // mustache line
  ctx.fillRect(cx - 2, cy + 2, 4, 1);
  // blood dot below
  ctx.fillStyle = BLOOD;
  ctx.fillRect(cx, cy + 3, 1, 1);
}

// --- PEARL NECKLACE ---
// Raised slightly (sits closer to the throat) and angled DOWN — center pearl
// dips below the end pearls, like a real necklace hanging from the collarbone.
function drawPearlNecklace(ctx) {
  ctx.fillStyle = BONE;
  for (let i = 0; i < 7; i++) {
    const x = CX - 12 + i * 4;
    const y = 99 - Math.abs(i - 3);   // U-dip: ends higher, center lower
    ctx.fillRect(x, y, 2, 2);
  }
  // central jewel hanging below the dip
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(CX - 1, 103, 2, 2);
  ctx.fillStyle = GOLD;
  ctx.fillRect(CX - 2, 102, 4, 1);
  ctx.fillRect(CX - 2, 105, 4, 1);
}

// --- SKIRT OF SEVERED ARMS ---
function drawSkirt(ctx, rng) {
  // jeweled waistband
  ctx.fillStyle = GOLD;
  ctx.fillRect(CX - 20, 162, 40, 3);
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(CX - 1, 163, 2, 1);
  // blood band underneath
  ctx.fillStyle = BLOOD;
  ctx.fillRect(CX - 20, 165, 40, 2);

  // hanging severed arms
  for (let i = 0; i < 8; i++) {
    const ax = CX - 18 + i * 5 + randInt(rng, -1, 1);
    const ay = 167;
    const ah = randInt(rng, 8, 13);
    // upper arm (skin)
    ctx.fillStyle = FLESH_MID;
    ctx.fillRect(ax, ay, 3, ah);
    // shading
    ctx.fillStyle = FLESH_DARK;
    ctx.fillRect(ax + 2, ay, 1, ah);
    // hand at tip (wider block)
    ctx.fillStyle = FLESH_LIGHT;
    ctx.fillRect(ax - 1, ay + ah, 5, 3);
    // tiny fingers
    ctx.fillStyle = FLESH_DARK;
    ctx.fillRect(ax, ay + ah + 2, 1, 1);
    ctx.fillRect(ax + 2, ay + ah + 2, 1, 1);
    // blood at cut
    ctx.fillStyle = BLOOD;
    ctx.fillRect(ax, ay, 3, 1);
  }
}

// --- ARMS (bent, tapered) ---
// Each arm has two segments: shoulder→elbow, elbow→hand.
// Returns hand positions for item drawing.
function drawArms(ctx) {
  // Upper-left hand (viewer upper-left = Kali's own upper-right, holds sword)
  drawTaperedSeg(ctx, CX - 17, 108, CX - 30, 92, 6, 5);
  drawTaperedSeg(ctx, CX - 30, 92, CX - 48, 72, 5, 4);

  // Upper-right hand (viewer upper-right = Kali's own upper-left, holds bitcoin item)
  drawTaperedSeg(ctx, CX + 17, 108, CX + 30, 92, 6, 5);
  drawTaperedSeg(ctx, CX + 30, 92, CX + 48, 72, 5, 4);

  // Lower-left hand (viewer lower-left = Kali's own lower-right, abhaya mudra with RED palm)
  drawTaperedSeg(ctx, CX - 18, 118, CX - 34, 130, 6, 5);
  drawTaperedSeg(ctx, CX - 34, 130, CX - 52, 148, 5, 4);

  // Lower-right hand (viewer lower-right = Kali's own lower-left, holds kapala)
  drawTaperedSeg(ctx, CX + 18, 118, CX + 34, 130, 6, 5);
  drawTaperedSeg(ctx, CX + 34, 130, CX + 52, 148, 5, 4);

  // elbow bumps (highlights)
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 31, 91, 3, 2);
  ctx.fillRect(CX + 29, 91, 3, 2);
  ctx.fillRect(CX - 35, 129, 3, 2);
  ctx.fillRect(CX + 33, 129, 3, 2);

  return {
    upperL: { x: CX - 48, y: 72 },
    upperR: { x: CX + 48, y: 72 },
    lowerL: { x: CX - 52, y: 148 },
    lowerR: { x: CX + 52, y: 148 },
  };
}

// Tapered segment: thickness interpolates from w1 (at x1,y1) to w2 (at x2,y2).
function drawTaperedSeg(ctx, x1, y1, x2, y2, w1, w2) {
  const dx = x2 - x1, dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + dx * t);
    const y = Math.round(y1 + dy * t);
    const w = Math.round(w1 + (w2 - w1) * t);
    ctx.fillStyle = SKIN;
    ctx.fillRect(x - Math.floor(w / 2), y - Math.floor(w / 2), w, w);
    // shading strip along lower edge
    ctx.fillStyle = SKIN_SH;
    ctx.fillRect(x - Math.floor(w / 2), y + Math.floor(w / 2) - 1, w, 1);
  }
}

// --- HEAD ---
function drawHead(ctx) {
  // head base
  ctx.fillStyle = SKIN;
  ctx.fillRect(CX - 18, 54, 36, 38);
  // rounded top
  ctx.fillRect(CX - 15, 50, 30, 4);
  ctx.fillRect(CX - 12, 48, 24, 2);
  // chin taper
  ctx.fillRect(CX - 15, 88, 30, 4);

  // face shading
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 18, 54, 4, 38);
  ctx.fillRect(CX + 14, 54, 4, 38);
  ctx.fillRect(CX - 14, 88, 28, 4);
  // forehead highlight
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(CX - 10, 56, 20, 2);

  // hair front framing
  ctx.fillStyle = HAIR;
  ctx.fillRect(CX - 20, 50, 4, 34);
  ctx.fillRect(CX + 16, 50, 4, 34);
  ctx.fillRect(CX - 22, 58, 2, 24);
  ctx.fillRect(CX + 20, 58, 2, 24);

  // eyes
  ctx.fillStyle = '#f0e8d8';
  ctx.fillRect(CX - 11, 66, 7, 4);
  ctx.fillRect(CX + 4, 66, 7, 4);
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(CX - 9, 67, 3, 2);
  ctx.fillRect(CX + 6, 67, 3, 2);
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(CX - 8, 67, 1, 2);
  ctx.fillRect(CX + 7, 67, 1, 2);
  ctx.fillStyle = HAIR;
  ctx.fillRect(CX - 12, 64, 8, 1);
  ctx.fillRect(CX + 4, 64, 8, 1);

  // third eye
  ctx.fillStyle = '#f0e8d8';
  ctx.fillRect(CX - 1, 58, 2, 4);
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(CX - 1, 59, 2, 2);
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(CX - 1, 60, 2, 1);

  // nose
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(CX - 1, 72, 2, 4);

  // mouth + lolling tongue
  ctx.fillStyle = '#1a0a14';
  ctx.fillRect(CX - 6, 80, 12, 2);
  ctx.fillStyle = BONE;
  ctx.fillRect(CX - 4, 82, 1, 2);
  ctx.fillRect(CX + 3, 82, 1, 2);
  // tongue — single clean shape with a rounded tip (no lower flare)
  ctx.fillStyle = TONGUE;
  ctx.fillRect(CX - 2, 82, 4, 9);
  ctx.fillRect(CX - 1, 91, 2, 2);
  ctx.fillStyle = BLOOD;
  ctx.fillRect(CX - 1, 92, 2, 1);
  // tongue centerline shading (subtle depth)
  ctx.fillRect(CX - 2, 88, 1, 3);

  // crown of jewels (not skulls — corrected to devotional crown)
  ctx.fillStyle = GOLD;
  ctx.fillRect(CX - 20, 44, 40, 4);
  // crown points
  for (let i = 0; i < 5; i++) {
    const sx = CX - 16 + i * 8;
    ctx.fillRect(sx, 40, 4, 4);
  }
  // crown jewels
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(CX - 1, 41, 2, 2);
  ctx.fillStyle = '#3a8a8e';
  ctx.fillRect(CX - 13, 41, 2, 2);
  ctx.fillRect(CX + 11, 41, 2, 2);
  // crescent at top center
  ctx.fillStyle = GOLD_HI;
  ctx.fillRect(CX - 2, 37, 4, 1);
  ctx.fillRect(CX - 3, 38, 2, 2);
  ctx.fillRect(CX + 1, 38, 2, 2);
}

// --- ITEMS ---
function drawHandSkin(ctx, hx, hy) {
  ctx.fillStyle = SKIN;
  ctx.fillRect(hx - 4, hy - 3, 8, 7);
  ctx.fillStyle = SKIN_HI;
  ctx.fillRect(hx - 3, hy - 3, 6, 1);
}

function drawAbhayaMudra(ctx, hx, hy) {
  // palm up, fingers foreshortened toward viewer (varada-ish)
  // palm block dropped 1px so the hand reads as outstretched, thumb unchanged
  ctx.fillStyle = SKIN;
  ctx.fillRect(hx - 3, hy - 4, 8, 10);
  // red palm — extended 1 col LEFT (was hx-2..hx+3, now hx-3..hx+3)
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx - 3, hy - 3, 7, 6);
  // finger divisions cutting up into the red palm from the bottom
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(hx - 2, hy, 1, 3);
  ctx.fillRect(hx,     hy, 1, 3);
  ctx.fillRect(hx + 2, hy, 1, 3);
  ctx.fillRect(hx + 4, hy, 1, 3);
  // finger stubs poking toward viewer below the palm
  ctx.fillRect(hx - 2, hy + 3, 1, 3);
  ctx.fillRect(hx,     hy + 3, 1, 3);
  ctx.fillRect(hx + 2, hy + 3, 1, 3);
  ctx.fillRect(hx + 4, hy + 3, 1, 3);
  // red fingers extended 1 pixel further down between the stubs
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx - 3, hy + 3, 1, 1);
  ctx.fillRect(hx - 1, hy + 3, 1, 1);
  ctx.fillRect(hx + 1, hy + 3, 1, 1);
  ctx.fillRect(hx + 3, hy + 3, 1, 1);
  // thumb on viewer's left
  ctx.fillStyle = SKIN;
  ctx.fillRect(hx - 6, hy - 2, 2, 4);
  // diagonal bridge from thumb up into the palm (sells the thumb angle)
  ctx.fillRect(hx - 5, hy - 3, 2, 1);
  // skin top closing off the hand above the thumb bridge
  ctx.fillRect(hx - 5, hy - 4, 2, 1);
  // skin filling the vertical gap between thumb and palm (col hx-4)
  ctx.fillRect(hx - 4, hy - 2, 1, 8);
  // skin pixel above the thumb top, closing off the upper-left corner
  ctx.fillRect(hx - 6, hy - 3, 1, 1);
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx - 5, hy - 1, 1, 2);
  ctx.fillRect(hx - 5, hy - 2, 1, 1); // square above thumb red, corner-touches palm
  ctx.fillRect(hx - 4, hy - 3, 1, 1);
  ctx.fillRect(hx - 3, hy - 3, 1, 1);
}

// Mirrored abhaya — same hand, thumb on viewer's RIGHT instead of left.
// Used for the lower-right hand so it reads as a real cradling hand.
function drawAbhayaMudraMirrored(ctx, hx, hy) {
  ctx.fillStyle = SKIN;
  ctx.fillRect(hx - 4, hy - 4, 8, 10);
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx - 3, hy - 3, 7, 6);
  // finger divisions cutting up
  ctx.fillStyle = SKIN_SH;
  ctx.fillRect(hx + 2, hy, 1, 3);
  ctx.fillRect(hx,     hy, 1, 3);
  ctx.fillRect(hx - 2, hy, 1, 3);
  ctx.fillRect(hx - 4, hy, 1, 3);
  // finger stubs
  ctx.fillRect(hx + 2, hy + 3, 1, 3);
  ctx.fillRect(hx,     hy + 3, 1, 3);
  ctx.fillRect(hx - 2, hy + 3, 1, 3);
  ctx.fillRect(hx - 4, hy + 3, 1, 3);
  // red fingers extended down between stubs
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx + 3, hy + 3, 1, 1);
  ctx.fillRect(hx + 1, hy + 3, 1, 1);
  ctx.fillRect(hx - 1, hy + 3, 1, 1);
  ctx.fillRect(hx - 3, hy + 3, 1, 1);
  // thumb on viewer's right
  ctx.fillStyle = SKIN;
  ctx.fillRect(hx + 5, hy - 2, 2, 4);
  ctx.fillRect(hx + 4, hy - 3, 2, 1);
  ctx.fillRect(hx + 4, hy - 4, 2, 1);
  ctx.fillRect(hx + 3, hy - 2, 1, 8);
  ctx.fillRect(hx + 5, hy - 3, 1, 1);
  ctx.fillStyle = RED_PALM;
  ctx.fillRect(hx + 5, hy - 1, 1, 2);
  ctx.fillRect(hx + 5, hy - 2, 1, 1);
  ctx.fillRect(hx + 4, hy - 3, 1, 1);
  ctx.fillRect(hx + 3, hy - 3, 1, 1);
}

function drawKapala(ctx, hx, hy) {
  // mirrored open palm holds the bowl from below
  drawAbhayaMudraMirrored(ctx, hx, hy);
  // skull bowl resting on the palm — bowl rim sits just above the palm top
  const by = hy - 9; // shift bowl up so it sits ON the palm, not in it
  ctx.fillStyle = BONE;
  ctx.fillRect(hx - 7, by + 2, 14, 7);
  ctx.fillRect(hx - 5, by + 9, 10, 2);
  // rim
  ctx.fillStyle = BONE_SH;
  ctx.fillRect(hx - 7, by + 2, 14, 1);
  // blood filling
  ctx.fillStyle = BLOOD;
  ctx.fillRect(hx - 6, by + 3, 12, 2);
  // eye sockets
  ctx.fillStyle = '#1a1014';
  ctx.fillRect(hx - 4, by + 6, 2, 2);
  ctx.fillRect(hx + 2, by + 6, 2, 2);
  // drips down the sides of the bowl
  ctx.fillStyle = BLOOD;
  ctx.fillRect(hx - 4, by + 11, 1, 2);
  ctx.fillRect(hx + 3, by + 11, 1, 2);
}

function drawCurvedSword(ctx, hx, hy) {
  drawHandSkin(ctx, hx, hy);
  // hilt (1px taller)
  ctx.fillStyle = GOLD;
  ctx.fillRect(hx - 2, hy - 6, 4, 6);
  // crossguard (flared)
  ctx.fillRect(hx - 6, hy - 7, 12, 1);
  ctx.fillRect(hx - 5, hy - 6, 10, 1);
  // pommel jewel (shifted down 1 to sit below the extended hilt)
  ctx.fillStyle = '#c92a2a';
  ctx.fillRect(hx - 1, hy, 2, 2);

  // curved blade — khadga scimitar: longer straight section, then curve at top
  ctx.fillStyle = SILVER;
  // long straight lower blade (above the crossguard)
  ctx.fillRect(hx - 1, hy - 24, 3, 17);
  // curve begins higher up
  ctx.fillRect(hx - 3, hy - 30, 3, 6);
  ctx.fillRect(hx - 6, hy - 34, 3, 5);
  // hooked tip
  ctx.fillRect(hx - 9, hy - 37, 3, 4);
  ctx.fillRect(hx - 12, hy - 35, 2, 3);
  // blade edge highlight (silver → white front edge)
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(hx, hy - 24, 1, 17);
  ctx.fillRect(hx - 2, hy - 30, 1, 5);
  ctx.fillRect(hx - 5, hy - 33, 1, 4);
  ctx.fillRect(hx - 8, hy - 36, 1, 3);
  // gold inlay along back of blade
  ctx.fillStyle = GOLD_HI;
  ctx.fillRect(hx + 1, hy - 22, 1, 12);
  ctx.fillRect(hx - 1, hy - 29, 1, 4);
  // blood dripping from the underside of the curved tip
  ctx.fillStyle = BLOOD;
  ctx.fillRect(hx - 9, hy - 32, 1, 2);
}

// --- BITCOIN ITEMS ---
const BITCOIN_ITEMS = {
  burning_fiat: (ctx, hx, hy, rng) => {
    drawHandSkin(ctx, hx, hy);
    // Wide thin bill (16x6), held roughly horizontal
    const bx = hx - 8;
    const by = hy - 1;
    ctx.fillStyle = '#2e7a3a';
    ctx.fillRect(bx, by, 16, 6);
    // border frame
    ctx.fillStyle = '#5aaa6a';
    ctx.fillRect(bx, by, 16, 1);
    ctx.fillRect(bx, by + 5, 16, 1);
    ctx.fillRect(bx, by, 1, 6);
    ctx.fillRect(bx + 15, by, 1, 6);
    // portrait head silhouette (left side) — oval head over shoulders
    ctx.fillStyle = '#0a3012';
    ctx.fillRect(bx + 3, by + 1, 2, 2); // head
    ctx.fillRect(bx + 2, by + 3, 4, 1); // shoulders
    // central seal/wreath ring (not a button)
    ctx.fillStyle = '#1a4a22';
    ctx.fillRect(bx + 8, by + 2, 3, 2);
    ctx.fillStyle = '#5aaa6a';
    ctx.fillRect(bx + 9, by + 2, 1, 1);
    // serial-number ticks on the right
    ctx.fillStyle = '#1a4a22';
    ctx.fillRect(bx + 12, by + 2, 1, 1);
    ctx.fillRect(bx + 13, by + 2, 1, 1);
    ctx.fillRect(bx + 12, by + 3, 1, 1);
    ctx.fillRect(bx + 14, by + 3, 1, 1);
    // charred top edge
    ctx.fillStyle = '#1a0a08';
    ctx.fillRect(bx, by - 1, 16, 1);
    ctx.fillRect(bx + 2, by, 1, 1);
    ctx.fillRect(bx + 7, by, 1, 1);
    ctx.fillRect(bx + 12, by, 1, 1);
    // flames as 3 organic teardrops along the top edge
    // each: wide base, narrowing to a point, slightly asymmetric
    const drawFlame = (fx, fy, h) => {
      // outer red base
      ctx.fillStyle = '#c91818';
      ctx.fillRect(fx - 2, fy, 5, 2);
      ctx.fillRect(fx - 1, fy - 2, 3, 2);
      // orange middle
      ctx.fillStyle = '#ff7a18';
      ctx.fillRect(fx - 1, fy - 1, 3, 2);
      ctx.fillRect(fx, fy - 3, 2, 2);
      // yellow core / tip
      ctx.fillStyle = '#ffd060';
      ctx.fillRect(fx, fy - 2, 1, 2);
      ctx.fillRect(fx + (rng() < 0.5 ? 0 : 1), fy - h, 1, h - 3);
    };
    drawFlame(bx + 3,  by - 1, 7);
    drawFlame(bx + 8,  by - 1, 9);
    drawFlame(bx + 13, by - 1, 6);
    // embers drifting up
    ctx.fillStyle = '#ffeaa0';
    ctx.fillRect(bx - 2, by - 9, 1, 1);
    ctx.fillRect(bx + 17, by - 7, 1, 1);
    ctx.fillRect(bx + 6, by - 12, 1, 1);
  },

  banker_head: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    // sparse hair grasped
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(hx - 4, hy - 4, 8, 2);
    // pale banker flesh
    ctx.fillStyle = '#d8b090';
    ctx.fillRect(hx - 6, hy + 4, 12, 10);
    // top hat
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(hx - 7, hy + 2, 14, 1);
    ctx.fillRect(hx - 5, hy - 3, 10, 5);
    // hat band
    ctx.fillStyle = '#5a1818';
    ctx.fillRect(hx - 5, hy + 1, 10, 1);
    // closed eyes
    ctx.fillStyle = '#1a1014';
    ctx.fillRect(hx - 4, hy + 7, 2, 1);
    ctx.fillRect(hx + 2, hy + 7, 2, 1);
    // mustache
    ctx.fillRect(hx - 3, hy + 9, 6, 1);
    // jowls shading
    ctx.fillStyle = '#a87060';
    ctx.fillRect(hx - 6, hy + 12, 2, 2);
    ctx.fillRect(hx + 4, hy + 12, 2, 2);
    // blood drips
    ctx.fillStyle = BLOOD;
    ctx.fillRect(hx - 5, hy + 14, 1, 4);
    ctx.fillRect(hx + 4, hy + 14, 1, 3);
    ctx.fillRect(hx, hy + 14, 1, 5);
  },

  broken_press: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    // Gutenberg press: tall frame, top crossbar with HORIZONTAL LEVER ARM
    // sticking out (the iconic press handle), vertical screw down to platen,
    // paper sheet, plus a missing chunk + flying fragments for "shattered".
    const WOOD = '#6a3e18';
    const WOOD_HI = '#8a5a28';
    const WOOD_SH = '#3a200a';

    // --- top crossbar (thick) ---
    ctx.fillStyle = WOOD;
    ctx.fillRect(hx - 7, hy - 18, 14, 3);
    ctx.fillStyle = WOOD_HI;
    ctx.fillRect(hx - 7, hy - 18, 14, 1);
    ctx.fillStyle = WOOD_SH;
    ctx.fillRect(hx - 7, hy - 16, 14, 1);

    // --- horizontal lever arm sticking out to viewer's right ---
    // (the iconic press handle that operators pull down)
    ctx.fillStyle = WOOD;
    ctx.fillRect(hx + 6, hy - 14, 10, 2);
    ctx.fillStyle = WOOD_HI;
    ctx.fillRect(hx + 6, hy - 14, 10, 1);
    // lever knob at the end
    ctx.fillStyle = GOLD;
    ctx.fillRect(hx + 15, hy - 15, 2, 3);

    // --- vertical screw shaft down the middle ---
    ctx.fillStyle = GOLD;
    ctx.fillRect(hx - 1, hy - 15, 2, 9);
    // screw threads
    ctx.fillStyle = '#8a6018';
    ctx.fillRect(hx - 1, hy - 13, 2, 1);
    ctx.fillRect(hx - 1, hy - 11, 2, 1);
    ctx.fillRect(hx - 1, hy - 9,  2, 1);

    // --- vertical posts (frame sides) ---
    ctx.fillStyle = WOOD;
    ctx.fillRect(hx - 7, hy - 15, 2, 16);
    // viewer-right post: SHATTERED — only top fragment remains
    ctx.fillRect(hx + 5, hy - 15, 2, 4);
    ctx.fillStyle = WOOD_HI;
    ctx.fillRect(hx - 7, hy - 15, 1, 16);
    ctx.fillRect(hx + 5, hy - 15, 1, 4);
    // jagged break edge on the broken post
    ctx.fillStyle = WOOD_SH;
    ctx.fillRect(hx + 5, hy - 11, 1, 1);
    ctx.fillRect(hx + 6, hy - 12, 1, 1);

    // --- platen (the flat plate the screw drives down) ---
    ctx.fillStyle = WOOD;
    ctx.fillRect(hx - 5, hy - 6, 10, 2);
    ctx.fillStyle = WOOD_HI;
    ctx.fillRect(hx - 5, hy - 6, 10, 1);
    // platen is cracked diagonally
    ctx.fillStyle = '#0a0408';
    ctx.fillRect(hx - 1, hy - 5, 1, 2);
    ctx.fillRect(hx,     hy - 4, 1, 1);

    // --- paper sheet emerging from under the platen ---
    ctx.fillStyle = '#f0e8d0';
    ctx.fillRect(hx - 5, hy - 3, 10, 4);
    // text lines
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(hx - 4, hy - 2, 8, 1);
    ctx.fillRect(hx - 4, hy,     7, 1);
    // torn corner
    ctx.fillStyle = '#1a1014';
    ctx.fillRect(hx + 4, hy + 1, 1, 1);

    // --- flying wood fragments (shattered) ---
    ctx.fillStyle = WOOD;
    ctx.fillRect(hx + 8, hy - 6, 2, 2);
    ctx.fillRect(hx + 11, hy - 9, 1, 2);
    ctx.fillRect(hx - 10, hy - 8, 2, 1);
    ctx.fillStyle = WOOD_HI;
    ctx.fillRect(hx + 8, hy - 6, 1, 1);

    // --- gold sparks from the broken screw mechanism ---
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(hx + 2, hy - 17, 1, 1);
    ctx.fillRect(hx - 4, hy - 19, 1, 1);
    ctx.fillRect(hx + 9, hy - 17, 1, 1);
  },

  broken_chain: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    const LINK = '#4a4a55';
    const LINK_HI = '#80808a';
    const LINK_SH = '#181820';

    // --- Top link (held, vertical oval, intact, thicker ring, hole = sky) ---
    ctx.fillStyle = LINK;
    ctx.fillRect(hx - 2, hy - 12, 4, 2);  // top edge (2 thick)
    ctx.fillRect(hx - 3, hy - 11, 2, 7);  // left side (2 wide)
    ctx.fillRect(hx + 1, hy - 11, 2, 7);  // right side (2 wide)
    ctx.fillRect(hx - 2, hy - 5,  4, 2);  // bottom edge (2 thick)
    // highlight on upper-left
    ctx.fillStyle = LINK_HI;
    ctx.fillRect(hx - 2, hy - 12, 2, 1);
    ctx.fillRect(hx - 3, hy - 10, 1, 2);

    // --- Middle link: BROKEN, two halves with a visible gap (thicker) ---
    // Left half
    ctx.fillStyle = LINK;
    ctx.fillRect(hx - 7, hy, 2, 5);
    ctx.fillRect(hx - 5, hy - 1, 2, 1);
    ctx.fillRect(hx - 5, hy + 5, 2, 1);
    ctx.fillRect(hx - 4, hy + 2, 1, 1);
    // Right half
    ctx.fillRect(hx + 5, hy, 2, 5);
    ctx.fillRect(hx + 3, hy - 1, 2, 1);
    ctx.fillRect(hx + 3, hy + 5, 2, 1);
    ctx.fillRect(hx + 3, hy + 2, 1, 1);

    // Break point gleam in the gap (highlight the fracture)
    ctx.fillStyle = '#ffeaa0';
    ctx.fillRect(hx - 3, hy + 2, 1, 1);
    ctx.fillRect(hx + 2, hy + 2, 1, 1);
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(hx - 2, hy + 1, 1, 1);
    ctx.fillRect(hx + 1, hy + 3, 1, 1);

    // --- Bottom link: intact oval, falling away (thicker, hole = sky) ---
    ctx.fillStyle = LINK;
    ctx.fillRect(hx - 2, hy + 9,  4, 2);
    ctx.fillRect(hx - 3, hy + 10, 2, 7);
    ctx.fillRect(hx + 1, hy + 10, 2, 7);
    ctx.fillRect(hx - 2, hy + 16, 4, 2);
    ctx.fillStyle = LINK_HI;
    ctx.fillRect(hx - 2, hy + 9, 2, 1);

    // Motion lines suggesting it's falling
    ctx.fillStyle = LINK_SH;
    ctx.fillRect(hx - 4, hy + 7, 1, 1);
    ctx.fillRect(hx + 4, hy + 8, 1, 1);
    ctx.fillRect(hx - 5, hy + 14, 1, 1);
  },

  hourglass: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    // wood frame top + bottom
    ctx.fillStyle = GOLD;
    ctx.fillRect(hx - 7, hy - 11, 14, 2);
    ctx.fillRect(hx - 7, hy + 9, 14, 2);
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(hx - 7, hy - 11, 14, 1);
    // top bulb glass outline
    ctx.fillStyle = '#a8c8d8';
    ctx.fillRect(hx - 6, hy - 9, 1, 6);
    ctx.fillRect(hx + 5, hy - 9, 1, 6);
    ctx.fillRect(hx - 5, hy - 9, 10, 1);
    // narrow neck
    ctx.fillRect(hx - 1, hy - 3, 2, 4);
    // bottom bulb outline
    ctx.fillRect(hx - 6, hy + 3, 1, 6);
    ctx.fillRect(hx + 5, hy + 3, 1, 6);
    ctx.fillRect(hx - 5, hy + 8, 10, 1);
    // sand top (mostly empty — a thin layer)
    ctx.fillStyle = '#e8c878';
    ctx.fillRect(hx - 3, hy - 5, 6, 1);
    ctx.fillRect(hx - 2, hy - 4, 4, 1);
    ctx.fillRect(hx - 1, hy - 3, 2, 1);
    // falling stream
    ctx.fillRect(hx, hy, 1, 3);
    // sand piled at bottom
    ctx.fillRect(hx - 4, hy + 6, 8, 2);
    ctx.fillRect(hx - 3, hy + 4, 6, 2);
    ctx.fillRect(hx - 2, hy + 3, 4, 1);
  },

  bitcoin_coin: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    // gold coin — 16×16 octagon: keeps run19's height (B has room) and adds
    // side bumps mirroring the top/bottom steps, so it reads as round.
    ctx.fillStyle = GOLD;
    ctx.fillRect(hx - 4, hy - 8, 8, 1);
    ctx.fillRect(hx - 6, hy - 7, 12, 1);
    ctx.fillRect(hx - 7, hy - 6, 14, 1);
    ctx.fillRect(hx - 8, hy - 5, 16, 10);
    ctx.fillRect(hx - 7, hy + 5, 14, 1);
    ctx.fillRect(hx - 6, hy + 6, 12, 1);
    ctx.fillRect(hx - 4, hy + 7, 8, 1);
    // top + left highlight
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(hx - 4, hy - 8, 8, 1);
    ctx.fillRect(hx - 6, hy - 7, 8, 1);
    ctx.fillRect(hx - 7, hy - 6, 1, 1);
    ctx.fillRect(hx - 8, hy - 5, 1, 10);
    // bottom + right shadow
    ctx.fillStyle = '#8a6818';
    ctx.fillRect(hx + 7, hy - 5, 1, 10);
    ctx.fillRect(hx + 6, hy - 6, 1, 1);
    ctx.fillRect(hx - 4, hy + 7, 8, 1);
    ctx.fillRect(hx - 2, hy + 6, 8, 1);

    // Bitcoin "B" symbol in white, with the characteristic top/bottom serifs
    ctx.fillStyle = '#f0f0f0';
    // vertical stem
    ctx.fillRect(hx - 2, hy - 4, 1, 9);
    // top horizontal
    ctx.fillRect(hx - 2, hy - 4, 4, 1);
    // top-right bulge
    ctx.fillRect(hx + 2, hy - 3, 1, 2);
    ctx.fillRect(hx - 2, hy - 1, 4, 1);
    // bottom-right bulge
    ctx.fillRect(hx + 2, hy, 1, 3);
    // bottom horizontal
    ctx.fillRect(hx - 2, hy + 3, 4, 1);
    // characteristic Bitcoin serifs: two ticks above and two below the B,
    // each connected to the body by a bridging pixel
    ctx.fillRect(hx - 2, hy - 6, 1, 2);  // top-left serif + bridge
    ctx.fillRect(hx,     hy - 6, 1, 2);  // top-right serif + bridge
    ctx.fillRect(hx - 2, hy + 5, 1, 1);  // bottom-left (already connects)
    ctx.fillRect(hx,     hy + 4, 1, 2);  // bottom-right serif + bridge

    // shine glint
    ctx.fillStyle = '#fff8d8';
    ctx.fillRect(hx - 5, hy - 4, 1, 1);
    ctx.fillRect(hx - 4, hy - 5, 1, 1);
  },

  whitepaper_scroll: (ctx, hx, hy) => {
    drawHandSkin(ctx, hx, hy);
    // scroll body
    ctx.fillStyle = '#f0e8d0';
    ctx.fillRect(hx - 7, hy - 8, 14, 15);
    ctx.fillStyle = '#c8c0a8';
    ctx.fillRect(hx - 7, hy + 5, 14, 2);
    // text lines
    ctx.fillStyle = '#1a1014';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(hx - 5, hy - 6 + i * 2, 10, 1);
    }
    // thick rolled ends — the emphasized curls
    ctx.fillStyle = GOLD;
    ctx.fillRect(hx - 9, hy - 10, 18, 3);
    ctx.fillRect(hx - 9, hy + 7, 18, 3);
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(hx - 9, hy - 10, 18, 1);
    ctx.fillRect(hx - 9, hy + 7, 18, 1);
    // roll cap ends
    ctx.fillStyle = '#8a6a28';
    ctx.fillRect(hx - 9, hy - 9, 1, 1);
    ctx.fillRect(hx + 8, hy - 9, 1, 1);
    ctx.fillRect(hx - 9, hy + 8, 1, 1);
    ctx.fillRect(hx + 8, hy + 8, 1, 1);
  },
};

// --- COLOR HELPERS ---
function hexToRgb(hex) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}
function lerpHex(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return `rgb(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)})`;
}

// --- SCENE ASSEMBLY ---
const BACKGROUND_KINDS = ['void', 'fire', 'mandala', 'arch', 'moon', 'ground', 'silver_halo'];
const BITCOIN_ITEM_KEYS = Object.keys(BITCOIN_ITEMS);

function generateScene(seed, opts = {}) {
  const canvas = createCanvas(BASE, BASE);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const rng = makeRng(seed);

  const bgKind = opts.bg || pick(rng, BACKGROUND_KINDS);
  const palette = PALETTES[bgKind];
  const bitcoinItem = opts.item || pick(rng, BITCOIN_ITEM_KEYS);

  // 1. Background
  drawBackground(ctx, rng, palette, bgKind);

  // 2. Shiva (under Kali's feet)
  drawShiva(ctx);

  // 3. Hair rear-mass (behind figure)
  drawHairRear(ctx);

  // 4. Kali body
  drawKaliBody(ctx, rng);

  // 5. Breasts
  drawBreasts(ctx);

  // 6. Skirt of arms
  drawSkirt(ctx, rng);

  // 7. Long head-garland down torso
  drawHeadGarland(ctx, rng);

  // 8. Pearl necklace at neck
  drawPearlNecklace(ctx);

  // 9. Arms
  const hands = drawArms(ctx);

  // 10. Head details (face, crown)
  drawHead(ctx);

  // 11. Items in hands (canonical slot assignment)
  drawCurvedSword(ctx, hands.upperL.x, hands.upperL.y);
  BITCOIN_ITEMS[bitcoinItem](ctx, hands.upperR.x, hands.upperR.y, rng);
  drawAbhayaMudra(ctx, hands.lowerL.x, hands.lowerL.y);
  drawKapala(ctx, hands.lowerR.x, hands.lowerR.y);

  return { canvas, bgKind, bitcoinItem };
}

// --- UPSCALE ---
function upscale(srcCanvas, factor) {
  const out = createCanvas(BASE * factor, BASE * factor);
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = false;
  octx.drawImage(srcCanvas, 0, 0, BASE * factor, BASE * factor);
  return out;
}

// --- MAIN ---
const OUT_DIR = 'output/run50';
mkdirSync(OUT_DIR, { recursive: true });

const count = parseInt(process.argv[2]) || 7;
const startSeed = parseInt(process.argv[3]) || 100;

console.log(`Generating ${count} Bitcoin Kali portraits at ${FINAL}×${FINAL}  (generate-kali v${GENERATOR_VERSION})...`);

for (let i = 0; i < count; i++) {
  const seed = startSeed + i * 31;
  // Force one-of-each: cycle through items and backgrounds so the first 7
  // runs cover all 6 bitcoin items + all 7 backgrounds for evaluation.
  const forcedItem = BITCOIN_ITEM_KEYS[i % BITCOIN_ITEM_KEYS.length];
  const forcedBg = BACKGROUND_KINDS[i % BACKGROUND_KINDS.length];
  const { canvas, bgKind, bitcoinItem } = generateScene(seed, { item: forcedItem, bg: forcedBg });
  const final = upscale(canvas, FINAL / BASE);
  const buf = final.toBuffer('image/png');
  const filename = `${OUT_DIR}/${IDENTITY_NAMES[i]}.png`;
  writeFileSync(filename, buf);
  console.log(`  ${filename}  (${(buf.length / 1024).toFixed(1)}KB)  [seed=${seed} | ${bitcoinItem} | ${bgKind}]`);
}

console.log('Done.');
