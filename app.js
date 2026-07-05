/* TripTrail — a free travel map animator.
   Stack: MapLibre GL v5 (render, globe) + OpenFreeMap/VersaTiles/CARTO (tiles)
        + Nominatim (geocode) + OSRM (roads). No API keys. */

'use strict';

/* ----------------------------- Vector icons -----------------------------
   All glyphs are hand-drawn 24×24 stroke/fill primitives (no emoji anywhere).
   Same source is used for sidebar buttons (inline SVG) and the canvas
   compositor (rasterized via data-URL images, tinted per accent color). */
const ICONS = {
  plane: '<path fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1.2" d="M12 2 L12.9 3 12.9 9 20.5 13.4 20.5 15.2 12.9 12.8 12.9 17.6 15 19.2 15 20.8 12 19.9 9 20.8 9 19.2 11.1 17.6 11.1 12.8 3.5 15.2 3.5 13.4 11.1 9 11.1 3 Z"/>',
  car: '<path d="M5.4 10.8 6.8 6.9 C7 6.35 7.5 6 8.1 6 H15.9 C16.5 6 17 6.35 17.2 6.9 L18.6 10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3.4" y="10.8" width="17.2" height="5.2" rx="1.7" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7.4" cy="17.3" r="1.8" fill="currentColor"/><circle cx="16.6" cy="17.3" r="1.8" fill="currentColor"/>',
  train: '<rect x="6" y="3" width="12" height="13" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="8.2" y="5.6" width="7.6" height="3.6" rx="1" fill="currentColor"/><circle cx="9.2" cy="12.9" r="1.25" fill="currentColor"/><circle cx="14.8" cy="12.9" r="1.25" fill="currentColor"/><path d="M8.5 16.5 6.6 20.4 M15.5 16.5 17.4 20.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  bus: '<rect x="4.2" y="3.5" width="15.6" height="13" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.2 9.6 H19.8" stroke="currentColor" stroke-width="1.8"/><path d="M7.2 13.2 H8.4 M15.6 13.2 H16.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="18.4" r="1.8" fill="currentColor"/><circle cx="16" cy="18.4" r="1.8" fill="currentColor"/>',
  boat: '<path d="M4 14.6 H20 L17.2 19 H6.8 Z" fill="currentColor"/><path d="M12 3 V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12.9 4.4 C16.3 6 17.8 8.6 18 12.2 L12.9 12.2 Z" fill="currentColor"/><path d="M11.1 5.4 C8.7 7 7.7 9.4 7.5 12.2 L11.1 12.2 Z" fill="currentColor"/>',
  bike: '<circle cx="6" cy="16" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="16" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 16 10 8 15 8 18 16 M10 8 12.8 16 6 16 M15 8 14.2 6.2 M12.9 6.2 H15.5 M8.9 8 H11.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  walk: '<circle cx="13" cy="4.4" r="2" fill="currentColor"/><path d="M13 7.4 12.2 12.2 9.4 20.6 M12.2 12.2 14.6 15 15 20.6 M12.8 8.4 9.6 10.8 M12.8 8.4 16.2 10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  camper: '<path d="M3 15.4 V8.2 C3 7.3 3.7 6.6 4.6 6.6 H13.6 L20.6 11.2 C20.9 11.4 21 11.7 21 12 V15.4 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.6 6.6 V11.2 H20.6 M3 11.2 H13.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.4" cy="16.9" r="1.8" fill="currentColor"/><circle cx="16.6" cy="16.9" r="1.8" fill="currentColor"/>',
  motorcycle: '<circle cx="5.6" cy="16.4" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18.4" cy="16.4" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5.6 16.4 9.6 12.6 H13.6 L16 9.4 H18.2 L18.4 16.4 M13.6 12.6 15.2 16.4 M9.4 9.4 H12.4 L13.6 12.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  tuktuk: '<path d="M4.6 15.2 V9.4 C4.6 6.9 6.6 5 9.1 5 H14.2 C15.1 5 15.9 5.5 16.3 6.3 L18.2 10 H19.4 C20 10 20.4 10.4 20.4 11 V15.2 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 5 V10 H18.2 M9.5 10 H4.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.6" cy="16.9" r="1.8" fill="currentColor"/><circle cx="15.8" cy="16.9" r="1.8" fill="currentColor"/>',
  camera: '<path d="M4 7.6 H7.4 L9 5.6 H15 L16.6 7.6 H20 C20.66 7.6 21.2 8.14 21.2 8.8 V18 C21.2 18.66 20.66 19.2 20 19.2 H4 C3.34 19.2 2.8 18.66 2.8 18 V8.8 C2.8 8.14 3.34 7.6 4 7.6 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="13.2" r="3.3" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  up: '<path d="M6 14.5 12 8.5 18 14.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="M6 9.5 12 15.5 18 9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M7 7 17 17 M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};

function svgIcon(name) {
  return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

const iconCache = {};
function iconImage(name, color, px = 64) {
  const key = `${name}|${color}`;
  if (iconCache[key]) return iconCache[key];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}">${ICONS[name].split('currentColor').join(color)}</svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  iconCache[key] = img;
  return img;
}
function preloadIcons(names, color) {
  return Promise.all(names.map(n => new Promise(res => {
    const im = iconImage(n, color);
    if (im.complete) res(); else { im.onload = res; im.onerror = res; }
  })));
}

/* ----------------------------- Transport modes -----------------------------
   route: how a realistic path is computed when "Real routes" is on —
   'osrm' follows the road network (rail corridors track it closely, so trains
   use it too, just with a longer range), 'sea' follows real shipping lanes,
   'air' always flies a great circle / arc. */
const MODES = {
  plane:      { label: 'Plane',        dashed: true,  route: 'air',                bend: 0.18 },
  car:        { label: 'Car',          dashed: false, route: 'osrm', maxKm: 1500,  bend: 0.07 },
  train:      { label: 'Train',        dashed: true,  route: 'osrm', maxKm: 3000,  bend: 0.05 },
  bus:        { label: 'Bus',          dashed: false, route: 'osrm', maxKm: 1500,  bend: 0.07 },
  boat:       { label: 'Boat / Ferry', dashed: true,  route: 'sea',                bend: 0.14 },
  bike:       { label: 'Bike',         dashed: false, route: 'osrm', maxKm: 800,   bend: 0.05 },
  walk:       { label: 'Walk',         dashed: false, route: 'osrm', maxKm: 300,   bend: 0.04 },
  camper:     { label: 'Camper',       dashed: false, route: 'osrm', maxKm: 1500,  bend: 0.07 },
  motorcycle: { label: 'Motorcycle',   dashed: false, route: 'osrm', maxKm: 1500,  bend: 0.07 },
  tuktuk:     { label: 'Tuk-tuk',      dashed: false, route: 'osrm', maxKm: 500,   bend: 0.07 },
};
const MODE_ALIASES = {
  plane: 'plane', flight: 'plane', fly: 'plane', airplane: 'plane', 飞机: 'plane',
  car: 'car', drive: 'car', driving: 'car', 汽车: 'car', 自驾: 'car',
  train: 'train', rail: 'train', 火车: 'train', 高铁: 'train', 新干线: 'train',
  bus: 'bus', coach: 'bus', 巴士: 'bus', 大巴: 'bus',
  boat: 'boat', ferry: 'boat', ship: 'boat', cruise: 'boat', 船: 'boat', 轮渡: 'boat',
  bike: 'bike', bicycle: 'bike', cycle: 'bike', cycling: 'bike', 单车: 'bike', 自行车: 'bike',
  walk: 'walk', walking: 'walk', hike: 'walk', foot: 'walk', 步行: 'walk', 徒步: 'walk',
  camper: 'camper', campervan: 'camper', rv: 'camper', 房车: 'camper',
  motorcycle: 'motorcycle', motorbike: 'motorcycle', moto: 'motorcycle', 摩托: 'motorcycle',
  tuktuk: 'tuktuk', 'tuk-tuk': 'tuktuk', rickshaw: 'tuktuk', 嘟嘟车: 'tuktuk',
};

/* ----------------------------- Demo journey ----------------------------- */
let stops = [
  { id: id(), name: 'Lisbon',    lng: -9.1393, lat: 38.7223, mode: 'plane' },
  { id: id(), name: 'Madrid',    lng: -3.7038, lat: 40.4168, mode: 'train' },
  { id: id(), name: 'Barcelona', lng:  2.1734, lat: 41.3851, mode: 'train' },
  { id: id(), name: 'Marseille', lng:  5.3698, lat: 43.2965, mode: 'car'   },
  { id: id(), name: 'Rome',      lng: 12.4964, lat: 41.9028, mode: 'plane' },
];

/* ----------------------------- Settings ----------------------------- */
const settings = {
  style: 'satellite',
  aspect: '16:9',
  accent: '#ff5a3c',
  globe: false,
  pitch: false,
  labels: true,
  roads: true,
  glow: true,
  pace: 1,
  title: 'My European Adventure',
  subtitle: 'Spring 2026 · 5 cities',
  watermark: '',
  format: 'mp4',      // mp4 | webm
  quality: 1,         // 1 | 2 (render pixel-ratio multiplier)
};

/* ----------------------------- Animation state ----------------------------- */
const anim = {
  playing: false,
  recording: false,
  phase: 'idle',          // idle | intro | leg | pause | outro
  marker: null,           // [lng,lat]
  markerMode: 'plane',
  reached: 0,
  legIndex: -1,
  caption: '',
  titleAlpha: 0,
  photo: null,
  photoLabel: '',
  photoAlpha: 0,
  pulse: null,            // { lng, lat, start } arrival ripple
  fullCoords: [],
  legs: [],
};

let map, mediaRecorder, recordedChunks = [], cancelToken = 0;
let photoTargetId = null;
let basePixelRatio = window.devicePixelRatio || 1;

/* ============================================================ helpers */
function id() { return Math.random().toString(36).slice(2, 9); }
function $(s) { return document.querySelector(s); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// rAF that degrades to setTimeout when the tab is hidden, so a recording
// never freezes forever if the user switches tabs mid-render.
function tick(fn) {
  if (document.hidden) { setTimeout(() => fn(performance.now()), 33); return; }
  requestAnimationFrame(fn);
}

function haversine(a, b) { // [lng,lat] -> km
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toR, dLng = (b[0] - a[0]) * toR;
  const la1 = a[1] * toR, la2 = b[1] * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}
function loading(on, text = 'Working…') {
  $('#loading-text').textContent = text;
  $('#loading').classList.toggle('hidden', !on);
}

/* ============================================================ geometry */
// Shortest longitudinal delta, so routes never take the long way around the
// antimeridian (Tokyo → LA crosses the Pacific, not Eurasia).
function shortestDelta(fromLng, toLng) {
  let d = toLng - fromLng;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

// Great-circle interpolation (slerp on the unit sphere) — matches how real
// long-haul flights curve toward the poles.
function greatCircle(a, b, n = 96) {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const vec = p => {
    const la = p[1] * toR, lo = p[0] * toR;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  };
  const va = vec(a), vb = vec(b);
  const dot = clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1);
  const om = Math.acos(dot);
  if (om < 1e-6) return [a.slice(), b.slice()];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
    const x = s1 * va[0] + s2 * vb[0], y = s1 * va[1] + s2 * vb[1], z = s1 * va[2] + s2 * vb[2];
    pts.push([Math.atan2(y, x) * toD, Math.atan2(z, Math.hypot(x, y)) * toD]);
  }
  // unwrap longitudes so the polyline is continuous across ±180
  pts[0][0] = a[0];
  for (let i = 1; i < pts.length; i++) {
    pts[i][0] = pts[i - 1][0] + shortestDelta(pts[i - 1][0], pts[i][0]);
  }
  return pts;
}

// Fallback leg geometry: great circle for long hops, decorative bezier arc
// otherwise — always via the short side of the world.
function legCoords(A, B, m) {
  const b2 = [A[0] + shortestDelta(A[0], B[0]), B[1]];
  const dist = haversine(A, b2);
  if (dist > 1500) return greatCircle(A, b2);
  return arcLine(A, b2, m.bend);
}

/* ---- real shipping lanes (Eurostat SeaRoute marine network) ---- */
let seaNetPromise = null;
function loadSeaNet() {
  if (!seaNetPromise) {
    seaNetPromise = fetch('marnet.json')
      .catch(() => fetch('https://cdn.jsdelivr.net/npm/searoute-js@0.1.0/data/marnet_densified.json'))
      .then(r => r.json())
      .then(buildSeaGraph);
  }
  return seaNetPromise;
}

function buildSeaGraph(geojson) {
  const nodes = new Map();
  // merge ±180 so lanes connect across the antimeridian
  const normLng = l => { let x = ((l % 360) + 540) % 360 - 180; return x === 180 ? -180 : x; };
  const keyOf = c => `${normLng(c[0]).toFixed(3)},${c[1].toFixed(3)}`;
  const addNode = c => {
    const k = keyOf(c);
    if (!nodes.has(k)) nodes.set(k, { lng: normLng(c[0]), lat: c[1], adj: [] });
    return k;
  };
  for (const f of geojson.features) {
    const g = f.geometry;
    const lines = g.type === 'LineString' ? [g.coordinates] : (g.type === 'MultiLineString' ? g.coordinates : []);
    for (const ln of lines) {
      for (let i = 1; i < ln.length; i++) {
        const a = addNode(ln[i - 1]), b = addNode(ln[i]);
        if (a === b) continue;
        const w = haversine(ln[i - 1], ln[i]);
        nodes.get(a).adj.push({ k: b, w });
        nodes.get(b).adj.push({ k: a, w });
      }
    }
  }
  return nodes;
}

function nearestSeaNode(nodes, p) {
  let best = null, bd = Infinity;
  for (const [k, n] of nodes) {
    const d = haversine(p, [n.lng, n.lat]);
    if (d < bd) { bd = d; best = k; }
  }
  return best;
}

// Dijkstra over the shipping-lane graph with a small binary heap.
function seaDijkstra(nodes, src, dst) {
  const dist = new Map([[src, 0]]), prev = new Map(), done = new Set();
  const heap = [[0, src]];
  const swap = (i, j) => { const t = heap[i]; heap[i] = heap[j]; heap[j] = t; };
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; swap(i, p); i = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break; swap(i, m); i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, k] = pop();
    if (k === dst) break;
    if (done.has(k)) continue;
    done.add(k);
    for (const e of nodes.get(k).adj) {
      const nd = d + e.w;
      if (nd < (dist.get(e.k) ?? Infinity)) { dist.set(e.k, nd); prev.set(e.k, k); push([nd, e.k]); }
    }
  }
  if (!prev.has(dst) && src !== dst) return null;
  const path = [dst];
  while (path[path.length - 1] !== src) path.push(prev.get(path[path.length - 1]));
  return path.reverse();
}

// Real sea route between two (possibly unwrapped) points, following global
// shipping lanes; longitudes come back unwrapped and anchored at A.
async function seaRoute(A, B) {
  const nodes = await loadSeaNet();
  const norm = l => ((l % 360) + 540) % 360 - 180;
  const a = [norm(A[0]), A[1]], b = [norm(B[0]), B[1]];
  const src = nearestSeaNode(nodes, a), dst = nearestSeaNode(nodes, b);
  if (!src || !dst) throw new Error('no sea nodes');
  const keys = seaDijkstra(nodes, src, dst);
  if (!keys) throw new Error('no sea path');
  const raw = keys.map(k => { const n = nodes.get(k); return [n.lng, n.lat]; });
  // stitch city → lane → city and unwrap for antimeridian continuity
  const pts = [[A[0], A[1]]];
  for (const c of raw) {
    const prevPt = pts[pts.length - 1];
    pts.push([prevPt[0] + shortestDelta(prevPt[0], c[0]), c[1]]);
  }
  const lastPt = pts[pts.length - 1];
  pts.push([lastPt[0] + shortestDelta(lastPt[0], norm(B[0])), B[1]]);
  return pts;
}

function arcLine(a, b, bend, n = 72) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const ctrl = [mid[0] - dy * bend, mid[1] + dx * bend];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([
      u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1],
    ]);
  }
  return pts;
}

async function osrmRoute(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a[0]},${a[1]};${b[0]},${b[1]}?overview=full&geometries=geojson`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.code === 'Ok' && j.routes && j.routes[0]) return j.routes[0].geometry.coordinates;
  throw new Error('no route');
}

function buildPath(coords) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + haversine(coords[i - 1], coords[i]));
  return { coords, cum, total: cum[cum.length - 1] || 0.0001 };
}
function pointAt(path, frac) {
  const d = clamp(frac, 0, 1) * path.total;
  let i = 1;
  while (i < path.cum.length && path.cum[i] < d) i++;
  if (i >= path.cum.length) { const last = path.coords[path.coords.length - 1]; return { pos: last, idx: path.coords.length - 1 }; }
  const seg = path.cum[i] - path.cum[i - 1] || 1;
  const t = (d - path.cum[i - 1]) / seg;
  const a = path.coords[i - 1], b = path.coords[i];
  return { pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], idx: i };
}
function sliceTo(path, frac) {
  const { idx, pos } = pointAt(path, frac);
  return path.coords.slice(0, idx).concat([pos]);
}
function line(coords) { return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }; }
const EMPTY = { type: 'FeatureCollection', features: [] };

/* ============================================================ map setup */
// Free satellite imagery (Esri World Imagery) as a self-contained style spec,
// with glyphs so our (compositor) labels aren't needed on the GL side.
const SATELLITE_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256, maxzoom: 18,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#06101f' } },
    { id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-fade-duration': 0 } },
  ],
};
// Resolve a style menu value to a URL or an inline spec.
function styleSpec(value) { return value === 'satellite' ? SATELLITE_STYLE : value; }

function initMap() {
  const initial = styleSpec(settings.style);
  const inline = typeof initial !== 'string';
  map = new maplibregl.Map({
    container: 'map',
    // An inline style object passed to the constructor can silently fail to
    // fire `load` in this build, so start from a trivial style that always
    // loads and swap to the real one below.
    style: inline ? { version: 8, sources: {}, layers: [] } : initial,
    center: [5, 44],
    zoom: 4,
    pitch: settings.pitch ? 50 : 0,
    preserveDrawingBuffer: true,
    attributionControl: { compact: true },
    maxTileCacheSize: 4096,   // keep prewarmed route tiles in memory
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  // style.load fires for every style (initial + each switch) — always (re)add our layers
  map.on('style.load', () => { applyProjection(); addLayers(); refreshRoutePreview(); fitToStops(true); });
  map.on('click', (e) => addStopAt(e.lngLat.lng, e.lngLat.lat));
  // diff:false forces a full (re)load so style.load fires and our layers re-add
  if (inline) map.once('load', () => map.setStyle(initial, { diff: false }));
}

function applyProjection() {
  try { map.setProjection({ type: settings.globe ? 'globe' : 'mercator' }); } catch (e) { /* older browsers */ }
  applySky();
}

// Subtle atmosphere so the globe (and tilted views) read as a lit planet.
function applySky() {
  try {
    if (!map.setSky) return;
    map.setSky({
      'sky-color': '#0a1626',
      'horizon-color': '#16324c',
      'fog-color': '#0e1116',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.5,
      'fog-ground-blend': 0.4,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.9, 4, 0.5, 6, 0.2, 8, 0],
    });
  } catch (e) { /* sky unsupported on this build */ }
}

// Resolves when the current viewport's tiles are in (or after a timeout).
function waitForTiles(timeoutMs = 5000) {
  return new Promise(resolve => {
    if (map.areTilesLoaded() && map.loaded()) return resolve();
    let t = setTimeout(done, timeoutMs);
    function check() { if (map.areTilesLoaded()) done(); }
    function done() {
      clearTimeout(t);
      map.off('sourcedata', check); map.off('idle', done);
      resolve();
    }
    map.on('sourcedata', check);
    map.on('idle', done);
  });
}

// Route layers. The full journey lives in ONE `trail` source (set once) and is
// revealed with a line-gradient — no per-frame geometry updates, which is the
// key to flicker-free playback. Three stacked layers give a glowing path.
const TRAIL_LAYERS = ['trail-glow', 'trail-casing', 'trail-core'];
function addLayers() {
  const a = settings.accent;
  if (!map.getSource('route-bg')) map.addSource('route-bg', { type: 'geojson', data: EMPTY });
  if (!map.getSource('trail')) map.addSource('trail', { type: 'geojson', data: EMPTY, lineMetrics: true });

  const ensure = (lid, def) => { if (!map.getLayer(lid)) map.addLayer(def); };

  // faint dashed plan of the whole route (edit mode only)
  ensure('route-bg', { id: 'route-bg', type: 'line', source: 'route-bg',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#9aa6b2', 'line-width': 2, 'line-opacity': 0.28, 'line-dasharray': [1.5, 2.5] } });

  if (settings.glow)
    ensure('trail-glow', { id: 'trail-glow', type: 'line', source: 'trail',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': a, 'line-width': 14, 'line-opacity': 0.32, 'line-blur': 5 } });
  ensure('trail-casing', { id: 'trail-casing', type: 'line', source: 'trail',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': a, 'line-opacity': 0.5, 'line-width': 7.2, 'line-blur': 1.4 } });
  ensure('trail-core', { id: 'trail-core', type: 'line', source: 'trail',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': a, 'line-opacity': 1, 'line-width': 4.2 } });

  applySky();
}

function setSrc(sid, data) { const s = map.getSource(sid); if (s) s.setData(data); }

// Reveal the trail up to `progress` (0..1 of total length) via a gradient step.
function setTrailReveal(progress) {
  const p = clamp(progress, 0.0001, 1);
  const grad = ['step', ['line-progress'], settings.accent, p, 'rgba(0,0,0,0)'];
  for (const id of TRAIL_LAYERS) {
    try { if (map.getLayer(id)) map.setPaintProperty(id, 'line-gradient', grad); } catch (e) { /* layer not ready */ }
  }
}

function refreshRoutePreview() {
  if (!map || !map.getSource('route-bg')) return;
  const feats = [];
  for (let i = 1; i < stops.length; i++) {
    const m = MODES[stops[i].mode] || MODES.plane;
    feats.push(line(legCoords([stops[i - 1].lng, stops[i - 1].lat], [stops[i].lng, stops[i].lat], m)));
  }
  setSrc('route-bg', { type: 'FeatureCollection', features: feats });
}

// Padding that never exceeds what the canvas can absorb (small preview panes).
function fitPadding(want) {
  const c = map.getCanvas();
  const cap = Math.floor(Math.min(c.clientWidth, c.clientHeight) * 0.18);
  return clamp(Math.min(want, cap), 12, 140);
}

// Stop coordinates with longitudes unwrapped along travel order, so bounds
// around a dateline-crossing trip frame the short side of the world.
function unwrappedStops() {
  if (!stops.length) return [];
  let lng = stops[0].lng;
  const out = [[lng, stops[0].lat]];
  for (let i = 1; i < stops.length; i++) {
    lng += shortestDelta(lng, stops[i].lng);
    out.push([lng, stops[i].lat]);
  }
  return out;
}

function fitToStops(instant) {
  if (!map || stops.length === 0) return;
  if (stops.length === 1) { map.jumpTo({ center: [stops[0].lng, stops[0].lat], zoom: 8 }); return; }
  const b = new maplibregl.LngLatBounds();
  unwrappedStops().forEach(c => b.extend(c));
  map.fitBounds(b, { padding: fitPadding(90), duration: instant ? 0 : 700, pitch: settings.pitch ? 50 : 0 });
}

/* ============================================================ stops UI */
function renderStops() {
  const ol = $('#stops'); ol.innerHTML = '';
  stops.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'stop';
    const legSelect = i === 0 ? '' : `
      <div class="leg">
        <span>via</span>
        <select data-mode="${s.id}">
          ${Object.entries(MODES).map(([k, m]) => `<option value="${k}" ${s.mode === k ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>`;
    li.innerHTML = `
      <div class="top">
        <div class="idx">${i + 1}</div>
        ${s.photoUrl ? `<img class="thumb" src="${s.photoUrl}" alt="" />` : ''}
        <div class="name" title="${s.name}">${s.name}</div>
        <button class="mini ${s.photoUrl ? 'on' : ''}" data-photo="${s.id}" title="Attach photo">${svgIcon('camera')}</button>
        <button class="mini" data-up="${s.id}" title="Move up">${svgIcon('up')}</button>
        <button class="mini" data-down="${s.id}" title="Move down">${svgIcon('down')}</button>
        <button class="mini" data-del="${s.id}" title="Remove">${svgIcon('x')}</button>
      </div>${legSelect}`;
    ol.appendChild(li);
  });
  $('#stop-count').textContent = stops.length;

  ol.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { stops = stops.filter(s => s.id !== b.dataset.del); afterStopsChange(); });
  ol.querySelectorAll('[data-up]').forEach(b => b.onclick = () => move(b.dataset.up, -1));
  ol.querySelectorAll('[data-down]').forEach(b => b.onclick = () => move(b.dataset.down, 1));
  ol.querySelectorAll('[data-mode]').forEach(sel => sel.onchange = () => {
    const s = stops.find(x => x.id === sel.dataset.mode); if (s) { s.mode = sel.value; refreshRoutePreview(); }
  });
  ol.querySelectorAll('[data-photo]').forEach(b => b.onclick = () => {
    photoTargetId = b.dataset.photo;
    $('#file-photo').click();
  });
}
function move(sid, dir) {
  const i = stops.findIndex(s => s.id === sid); const j = i + dir;
  if (j < 0 || j >= stops.length) return;
  [stops[i], stops[j]] = [stops[j], stops[i]];
  afterStopsChange();
}
function afterStopsChange() { renderStops(); refreshRoutePreview(); fitToStops(false); }

function addStopAt(lng, lat, name, mode) {
  const s = { id: id(), name: name || `${lat.toFixed(3)}, ${lng.toFixed(3)}`, lng, lat, mode: mode || 'plane' };
  stops.push(s);
  afterStopsChange();
  if (!name) reverseName(s);
  return s;
}
async function reverseName(s) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${s.lat}&lon=${s.lng}`, { headers: { 'Accept-Language': 'en' } });
    const j = await r.json();
    const a = j.address || {};
    s.name = a.city || a.town || a.village || a.county || a.state || j.name || s.name;
    renderStops();
  } catch (e) { /* keep coords as name */ }
}

/* ---- search / geocode ---- */
async function geocodeOne(q) {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } });
  const j = await r.json();
  return j[0];
}

async function doSearch() {
  const q = $('#inp-search').value.trim();
  if (!q) return;
  loading(true, 'Searching…');
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } });
    const list = await r.json();
    loading(false);
    if (!list.length) { toast('No places found.'); return; }
    const box = $('#search-results'); box.innerHTML = '';
    list.forEach(p => {
      const d = document.createElement('div');
      d.textContent = p.display_name;
      d.onclick = () => {
        box.classList.add('hidden');
        $('#inp-search').value = '';
        addStopAt(parseFloat(p.lon), parseFloat(p.lat), p.display_name.split(',')[0]);
      };
      box.appendChild(d);
    });
    box.classList.remove('hidden');
  } catch (e) { loading(false); toast('Search failed — check your connection.'); }
}

/* ============================================================ route builders */
async function buildFromText() {
  const raw = $('#inp-trip').value.trim();
  if (!raw) { toast('Type a trip first, e.g. "Lisbon to Madrid by train".'); return; }
  const tokens = raw
    .split(/\n|→|->|—>|,|;|、|，|\bthen\b|\bto\b|到|去|再到/i)
    .map(t => t.trim()).filter(Boolean);
  if (!tokens.length) return;

  const parsed = tokens.map(tok => {
    let mode = null;
    let place = tok;
    const m = tok.match(/\bby\s+([a-z-]+)\b/i) || tok.match(/(?:坐|乘|搭)\s*(\S+?)(?:\s|$)/);
    if (m) {
      const key = m[1].toLowerCase();
      mode = MODE_ALIASES[key] || MODE_ALIASES[m[1]] || null;
      place = tok.replace(m[0], '').trim();
    }
    return { place, mode };
  }).filter(p => p.place);

  loading(true, `Geocoding 0/${parsed.length}…`);
  const found = [];
  for (let i = 0; i < parsed.length; i++) {
    loading(true, `Geocoding ${i + 1}/${parsed.length} — ${parsed[i].place}`);
    try {
      const hit = await geocodeOne(parsed[i].place);
      if (hit) found.push({ ...parsed[i], lng: parseFloat(hit.lon), lat: parseFloat(hit.lat), name: hit.display_name.split(',')[0] });
      else toast(`Couldn't find "${parsed[i].place}" — skipped.`);
    } catch (e) { toast(`Lookup failed for "${parsed[i].place}".`); }
    if (i < parsed.length - 1) await sleep(1050); // Nominatim: max 1 req/s
  }
  loading(false);
  if (found.length < 2) { toast('Need at least two recognizable places.'); return; }

  stops = found.map(f => ({ id: id(), name: f.name, lng: f.lng, lat: f.lat, mode: f.mode || 'plane' }));
  afterStopsChange();
  toast(`Built ${stops.length} stops from your text.`);
}

/* ---- GPX / KML / GeoJSON import ---- */
function importRouteFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const text = rd.result;
      let pts = [];
      if (/\.gpx$/i.test(file.name)) pts = parseGPX(text);
      else if (/\.kml$/i.test(file.name)) pts = parseKML(text);
      else pts = parseGeoJSON(text);
      if (!pts.length) { toast('No usable points found in that file.'); return; }
      pts = samplePoints(pts, 30);
      stops = pts.map(p => ({ id: id(), name: p.name || `${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}`, lng: p.lng, lat: p.lat, mode: p.mode || 'car' }));
      afterStopsChange();
      stops.filter(s => /^[\d.,\s-]+$/.test(s.name)).slice(0, 5).forEach((s, i) => setTimeout(() => reverseName(s), i * 1100));
      toast(`Imported ${stops.length} stops from ${file.name}.`);
    } catch (e) { toast('Could not parse that file.'); }
  };
  rd.readAsText(file);
}
function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  let els = [...doc.querySelectorAll('wpt')];
  if (!els.length) els = [...doc.querySelectorAll('trkpt')];
  if (!els.length) els = [...doc.querySelectorAll('rtept')];
  return els.map(e => ({
    lat: parseFloat(e.getAttribute('lat')), lng: parseFloat(e.getAttribute('lon')),
    name: e.querySelector('name') ? e.querySelector('name').textContent.trim() : '',
  })).filter(p => isFinite(p.lat) && isFinite(p.lng));
}
function parseKML(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const out = [];
  doc.querySelectorAll('Placemark').forEach(pm => {
    const nameEl = pm.querySelector('name');
    const name = nameEl ? nameEl.textContent.trim() : '';
    const point = pm.querySelector('Point > coordinates');
    if (point) {
      const [lng, lat] = point.textContent.trim().split(',').map(parseFloat);
      if (isFinite(lat) && isFinite(lng)) out.push({ lat, lng, name });
      return;
    }
    const lineEl = pm.querySelector('LineString > coordinates');
    if (lineEl) {
      lineEl.textContent.trim().split(/\s+/).forEach(c => {
        const [lng, lat] = c.split(',').map(parseFloat);
        if (isFinite(lat) && isFinite(lng)) out.push({ lat, lng, name: '' });
      });
    }
  });
  return out;
}
function parseGeoJSON(text) {
  const j = JSON.parse(text);
  const feats = j.type === 'FeatureCollection' ? j.features : [j];
  const out = [];
  feats.forEach(f => {
    const g = f.geometry || f;
    const p = f.properties || {};
    const name = p.name || p.title || '';
    const rawMode = (p.mode || p.transport || '').toString().toLowerCase();
    const mode = MODES[rawMode] ? rawMode : (MODE_ALIASES[rawMode] || null);
    if (!g) return;
    if (g.type === 'Point') out.push({ lng: g.coordinates[0], lat: g.coordinates[1], name, mode });
    if (g.type === 'LineString') g.coordinates.forEach(c => out.push({ lng: c[0], lat: c[1], name: '' }));
    if (g.type === 'MultiPoint') g.coordinates.forEach(c => out.push({ lng: c[0], lat: c[1], name, mode }));
  });
  return out.filter(p => isFinite(p.lat) && isFinite(p.lng));
}
function samplePoints(pts, max) {
  if (pts.length <= max) return pts;
  const out = [];
  for (let i = 0; i < max; i++) out.push(pts[Math.round(i * (pts.length - 1) / (max - 1))]);
  return out;
}

/* ============================================================ precompute legs */
async function precomputeLegs() {
  anim.legs = [];
  const unwrapped = unwrappedStops();
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1], to = stops[i];
    const m = MODES[to.mode] || MODES.plane;
    const A = unwrapped[i - 1], B = unwrapped[i];
    let coords = null;
    if (settings.roads) {
      if (m.route === 'osrm' && haversine(A, B) < m.maxKm) {
        try { coords = await osrmRoute([from.lng, from.lat], [to.lng, to.lat]); } catch (e) { /* fall back */ }
      } else if (m.route === 'sea') {
        loading(true, `Routing ${to.name} by sea…`);
        try { coords = await seaRoute(A, B); } catch (e) { /* fall back */ }
      }
    }
    if (!coords) coords = legCoords(A, B, m);
    // Anchor every leg at the journey's unwrapped longitude and keep it
    // continuous — OSRM returns raw ±180 coords, and a jump against the
    // accumulated trail would draw a line wrapping the whole globe.
    {
      let prevLng = A[0];
      coords = coords.map(c => {
        prevLng += shortestDelta(prevLng, c[0]);
        return [prevLng, c[1]];
      });
    }
    const path = buildPath(coords);
    const b = new maplibregl.LngLatBounds(); coords.forEach(c => b.extend(c));
    const cam = map.cameraForBounds(b, { padding: fitPadding(settings.aspect === '9:16' ? 120 : 90) });
    anim.legs.push({ from, to, mode: m, modeKey: to.mode, path, zoom: clamp((cam && cam.zoom ? cam.zoom : 5) + 0.15, 2, 11), dist: path.total });
  }
  // Full concatenated route. Reveal fractions use the SAME Mercator metric as
  // MapLibre's line-progress, so the gradient head and the icon stay locked
  // together regardless of latitude.
  anim.fullCoords = [];
  const legStart = [];
  for (const leg of anim.legs) { legStart.push(anim.fullCoords.length); anim.fullCoords.push(...leg.path.coords); }
  const merc = anim.fullCoords.map(c => { const m = maplibregl.MercatorCoordinate.fromLngLat([c[0], c[1]]); return [m.x, m.y]; });
  const mcum = [0];
  for (let i = 1; i < merc.length; i++) mcum.push(mcum[i - 1] + Math.hypot(merc[i][0] - merc[i - 1][0], merc[i][1] - merc[i - 1][1]));
  anim.mcum = mcum;
  anim.mtotal = mcum[mcum.length - 1] || 1;
  anim.legs.forEach((leg, k) => {
    const s = legStart[k], e = s + leg.path.coords.length - 1;
    leg.pf0 = mcum[s] / anim.mtotal;
    leg.pf1 = mcum[e] / anim.mtotal;
  });
}

// Point at a global Mercator fraction of the full trail — matches line-progress,
// so the icon sits exactly on the revealed head.
function trailPointAt(frac) {
  const cum = anim.mcum, d = clamp(frac, 0, 1) * anim.mtotal;
  let lo = 1, hi = cum.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < d) lo = mid + 1; else hi = mid; }
  const seg = cum[lo] - cum[lo - 1] || 1, t = (d - cum[lo - 1]) / seg;
  const a = anim.fullCoords[lo - 1], b = anim.fullCoords[lo];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/* ============================================================ tile prewarm */
// "Temporarily offline": before recording, sweep the camera along every leg
// at its cruise zoom so all tiles land in the cache. The real pass then pans
// over already-cached tiles and never stalls.
async function prewarmTiles(token) {
  const c = map.getCanvas();
  // total steps across all legs, for a single smooth progress readout
  const plan = [];
  for (const leg of anim.legs) {
    // km covered by one viewport width at this leg's zoom (web-mercator approx)
    const midLat = leg.path.coords[Math.floor(leg.path.coords.length / 2)][1];
    const kmPerScreen = 40075 * Math.cos(midLat * Math.PI / 180) / Math.pow(2, leg.zoom) * (c.clientWidth / 512);
    const steps = clamp(Math.ceil(leg.path.total / (kmPerScreen * 0.9)), 1, 14);
    plan.push({ leg, steps });
  }
  const total = plan.reduce((s, p) => s + p.steps + 1, 0);
  let done = 0;
  for (const { leg, steps } of plan) {
    for (let j = 0; j <= steps; j++) {
      if (token !== cancelToken) return;
      const { pos } = pointAt(leg.path, j / steps);
      map.jumpTo({ center: pos, zoom: leg.zoom, pitch: settings.pitch ? 40 : 0, bearing: 0 });
      await waitForTiles(700);
      done++;
      loading(true, `Caching map along route… ${Math.round(done / total * 100)}%`);
    }
  }
}

/* ============================================================ animation timeline */
async function play(record) {
  if (stops.length < 2) { toast('Add at least two stops.'); return; }
  if (anim.playing) return;
  syncSettingsFromUI();

  loading(true, 'Plotting your route…');
  if (record && settings.quality > 1) {
    map.setPixelRatio(Math.max(basePixelRatio, 1) * settings.quality);
    await sleep(250);
  }
  await precomputeLegs();
  await preloadIcons(Object.keys(MODES), settings.accent);
  loading(false);

  anim.playing = true;
  anim.recording = record;
  anim.reached = 0; anim.legIndex = -1; anim.marker = null;
  anim.photo = null; anim.photoAlpha = 0; anim.pulse = null;
  const token = ++cancelToken;
  setControls(true);

  // Load the full route once; the story reveals it via a gradient (no per-frame
  // geometry churn). Hide the dashed plan while playing.
  setSrc('route-bg', EMPTY);
  setSrc('trail', line(anim.fullCoords));
  setTrailReveal(0);

  // For recording, sweep the route once so tiles are cached and the export is
  // pristine. Preview skips this — motion is constant-speed and tiles pop in
  // cleanly (raster-fade-duration 0), so playback starts immediately.
  if (record) {
    loading(true, 'Caching map along route… 0%');
    await prewarmTiles(token);
    if (token !== cancelToken) { loading(false); return; }
  }
  fitToStops(true);
  loading(true, 'Loading overview…');
  await waitForTiles(record ? 6000 : 2500);
  loading(false);
  if (token !== cancelToken) return;

  $('#output').classList.add('show');
  startCompositor();
  startMusic();
  if (record) startRecorder();

  // INTRO — overview, title fades in
  anim.phase = 'intro';
  await fadeProp('titleAlpha', 1, 600, token);
  await sleep(1500);
  if (token !== cancelToken) return;
  await fadeProp('titleAlpha', 0, 600, token);

  anim.reached = 1;
  await showPhoto(stops[0], token);

  // LEGS
  for (let i = 0; i < anim.legs.length; i++) {
    if (token !== cancelToken) return;
    const leg = anim.legs[i];
    anim.legIndex = i;
    anim.markerMode = leg.modeKey;
    anim.caption = `${leg.from.name}  →  ${leg.to.name}   ·   ${leg.mode.label}   ·   ${Math.round(leg.dist)} km`;

    anim.phase = 'pause';
    await easeTo({ center: [leg.from.lng, leg.from.lat], zoom: leg.zoom, pitch: settings.pitch ? 32 : 0 }, 800, token);
    await waitForTiles(3500);           // let the leg's start view render fully
    await sleep(250);

    anim.phase = 'leg';
    const dur = clamp(2200 + leg.dist * 1.1, 2200, 7000) / settings.pace;
    await animateLeg(leg, dur, token);
    if (token !== cancelToken) return;

    setTrailReveal(leg.pf1);
    anim.reached = i + 2;
    firePulse(leg.to);

    anim.phase = 'pause';
    await sleep(450);
    await showPhoto(leg.to, token);
    if (token !== cancelToken) return;
  }

  // OUTRO
  anim.phase = 'outro';
  anim.caption = '';
  fitToStops(false);
  await waitForTiles(2500);
  await sleep(1700);

  if (token === cancelToken) endPlay();
}

async function showPhoto(stop, token) {
  if (!stop || !stop.img || token !== cancelToken) return;
  anim.photo = stop.img;
  anim.photoLabel = stop.name;
  await fadeProp('photoAlpha', 1, 320, token);
  await sleep(1600 / settings.pace);
  await fadeProp('photoAlpha', 0, 320, token);
  anim.photo = null;
}

// Cinematic leg animation. Constant wall-clock speed (no tile-braking, which
// oscillated and read as stutter) — prewarmed tiles just pop in. The icon and
// the gradient head are driven from the same Mercator fraction so they never
// separate. Zoom stays fixed per leg (no mid-leg zoom-in that would fetch new
// tiles); only a gentle pitch and forward look-ahead add motion.
function animateLeg(leg, durMs, token) {
  return new Promise(resolve => {
    const t0 = performance.now();
    const pMax = settings.pitch ? 48 : 6, pMin = settings.pitch ? 32 : 0;
    const span = leg.pf1 - leg.pf0;
    function step(now) {
      if (token !== cancelToken || !anim.playing) return resolve();
      const f = clamp((now - t0) / durMs, 0, 1);
      const ef = easeInOut(f);
      const wave = Math.sin(Math.PI * f);
      const frac = leg.pf0 + span * ef;
      anim.marker = trailPointAt(frac);
      setTrailReveal(frac);
      const leadFrac = clamp(frac + 0.22 * wave * span, 0, 1);
      map.jumpTo({ center: trailPointAt(leadFrac), zoom: leg.zoom, pitch: pMin + (pMax - pMin) * wave, bearing: 0 });
      if (f < 1) tick(step); else resolve();
    }
    tick(step);
  });
}

function easeTo(opts, durMs, token) {
  return new Promise(resolve => {
    if (token !== cancelToken) return resolve();
    map.easeTo({ ...opts, duration: durMs });
    map.once('moveend', resolve);
    setTimeout(resolve, durMs + 250);
  });
}

function fadeProp(key, to, durMs, token) {
  return new Promise(resolve => {
    const from = anim[key], t0 = performance.now();
    function step(now) {
      if (token !== cancelToken) return resolve();
      const f = clamp((now - t0) / durMs, 0, 1);
      anim[key] = from + (to - from) * f;
      if (f < 1) tick(step); else resolve();
    }
    tick(step);
  });
}

function endPlay() {
  loading(false);
  anim.playing = false; anim.phase = 'idle';
  stopCompositor();
  if (anim.recording) stopRecorder();
  anim.recording = false;
  anim.titleAlpha = 0; anim.caption = ''; anim.photo = null; anim.photoAlpha = 0; anim.pulse = null;
  stopMusic();
  map.setPixelRatio(basePixelRatio);
  $('#output').classList.remove('show');
  setControls(false);
  setSrc('trail', EMPTY);
  refreshRoutePreview();
}

// arrival ripple, drawn by the compositor at a stop
function firePulse(stop) { anim.pulse = { lng: stop.lng, lat: stop.lat, start: performance.now() }; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function stopPlay() { cancelToken++; endPlay(); }

/* ============================================================ compositor
   The overlay canvas is composited INSIDE the map's `render` event, so the
   map bitmap we draw and the transform we project() with are always the same
   frame — no stale reads, no swimming pins, no flicker. A background fill
   makes it fully opaque so the live map underneath never shows through. */
let compositeFn = null, compositorGen = 0;

function styleBgColor() {
  try {
    const bg = (map.getStyle().layers || []).find(l => l.type === 'background');
    const c = bg && bg.paint && bg.paint['background-color'];
    if (typeof c === 'string') return c;
  } catch (e) { /* ignore */ }
  return '#0b0f14';
}

function startCompositor() {
  const out = $('#output');
  const ctx = out.getContext('2d');
  const bg = styleBgColor();

  compositeFn = () => {
    const m = map.getCanvas();
    if (out.width !== m.width || out.height !== m.height) { out.width = m.width; out.height = m.height; }
    const dpr = m.width / m.clientWidth || 1;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(m, 0, 0, out.width, out.height);
    drawScene(ctx, out.width, out.height, dpr);
  };
  map.on('render', compositeFn);

  // Keep the map (and thus the compositor) painting even during still pauses,
  // so title/photo/pulse fades stay smooth.
  const gen = ++compositorGen;
  const pump = () => { if (!anim.playing || gen !== compositorGen) return; map.triggerRepaint(); tick(pump); };
  tick(pump);
  compositeFn();

  if (anim.recording && document.hidden) toast('Keep this tab visible while recording for smooth video.');
}

function stopCompositor() {
  compositorGen++;
  if (compositeFn) { map.off('render', compositeFn); compositeFn = null; }
}

function project(lng, lat, dpr) { const p = map.project([lng, lat]); return [p.x * dpr, p.y * dpr]; }

// In globe mode, points on the far side of the earth still project to screen
// coordinates. Use MapLibre's exact camera-based occlusion test, falling back
// to an angular cutoff from the view center on older builds.
function occludedByGlobe(lng, lat) {
  if (!settings.globe) return false;
  try {
    const t = map.transform;
    if (typeof t.isLocationOccluded === 'function') {
      return t.isLocationOccluded(new maplibregl.LngLat(((lng % 360) + 540) % 360 - 180, lat));
    }
  } catch (e) { /* fall through */ }
  const c = map.getCenter();
  return haversine([c.lng, c.lat], [lng, lat]) / 6371 > 1.43; // radians (~82°)
}

function drawScene(ctx, W, H, dpr) {
  const s = dpr;
  const accent = settings.accent;

  // ---- city pins + labels (revealed only once a stop is reached) ----
  stops.forEach((st, i) => {
    const reached = anim.phase === 'idle' || i < anim.reached;
    if (!reached) return;
    if (occludedByGlobe(st.lng, st.lat)) return;
    const [x, y] = project(st.lng, st.lat, dpr);
    if (x < -50 || x > W + 50 || y < -50 || y > H + 50) return;
    ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = 2.5 * s; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 11 * s, 0, Math.PI * 2);
    ctx.strokeStyle = hexA(accent, 0.45); ctx.lineWidth = 2 * s; ctx.stroke();
    if (settings.labels) {
      const fs = 15 * s;
      ctx.font = `700 ${fs}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
      const tw = ctx.measureText(st.name).width;
      const px = 9 * s, py = 6 * s, lx = x + 12 * s, ly = y - fs - 4 * s;
      roundRect(ctx, lx, ly, tw + px * 2, fs + py * 2, 7 * s);
      ctx.fillStyle = 'rgba(12,16,21,.82)'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
      ctx.fillText(st.name, lx + px, ly + (fs + py * 2) / 2);
    }
  });

  // ---- arrival ripple ----
  if (anim.pulse) {
    const el = performance.now() - anim.pulse.start;
    if (el > 1100) { anim.pulse = null; }
    else if (!occludedByGlobe(anim.pulse.lng, anim.pulse.lat)) {
      const eo = easeOutCubic(el / 1100);
      const [px, py] = project(anim.pulse.lng, anim.pulse.lat, dpr);
      ctx.beginPath(); ctx.arc(px, py, (9 + 42 * eo) * s, 0, Math.PI * 2);
      ctx.strokeStyle = hexA(accent, 0.5 * (1 - eo)); ctx.lineWidth = 3 * s; ctx.stroke();
    }
  }

  // ---- moving transport marker (vector icon) ----
  if (anim.marker && anim.phase === 'leg') {
    const [x, y] = project(anim.marker[0], anim.marker[1], dpr);
    const r = 17 * s;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = 3 * s; ctx.strokeStyle = accent; ctx.stroke();
    const ic = iconImage(anim.markerMode, accent);
    if (ic.complete && ic.naturalWidth) {
      const side = r * 1.24;
      ctx.drawImage(ic, x - side / 2, y - side / 2, side, side);
    }
  }

  // ---- title card (intro) ----
  if (anim.titleAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = anim.titleAlpha;
    ctx.fillStyle = 'rgba(7,10,14,.45)'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = anim.titleAlpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18 * s;
    const tfs = (settings.aspect === '9:16' ? 46 : 54) * s;
    ctx.font = `800 ${tfs}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    wrapText(ctx, settings.title || '', W / 2, H / 2 - tfs * 0.2, W * 0.86, tfs * 1.15);
    if (settings.subtitle) {
      ctx.shadowBlur = 10 * s;
      ctx.font = `500 ${tfs * 0.42}px system-ui, sans-serif`;
      ctx.fillStyle = hexA(accent, 1);
      ctx.fillText(settings.subtitle, W / 2, H / 2 + tfs * 0.75);
    }
    ctx.restore();
    ctx.textAlign = 'left';
  }

  // ---- polaroid photo card ----
  if (anim.photo && anim.photoAlpha > 0.01) {
    const img = anim.photo, a = anim.photoAlpha;
    ctx.save();
    ctx.globalAlpha = a;
    const maxW = W * 0.46, maxH = H * 0.56;
    const sc = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * sc, h = img.height * sc;
    const frame = 12 * s, band = 40 * s;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.035 + 0.02 * (1 - a));
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30 * s; ctx.shadowOffsetY = 10 * s;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 - frame, -h / 2 - frame, w + frame * 2, h + frame * 2 + band);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.fillStyle = '#333';
    ctx.font = `600 ${16 * s}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(anim.photoLabel || '', 0, h / 2 + frame + band / 2 - 4 * s);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  // ---- lower-third caption ----
  if (anim.caption && (anim.phase === 'leg' || anim.phase === 'pause')) {
    const fs = (settings.aspect === '9:16' ? 17 : 19) * s;
    ctx.font = `600 ${fs}px system-ui, sans-serif`;
    const tw = ctx.measureText(anim.caption).width;
    const px = 16 * s, h = fs + 18 * s;
    const bx = 26 * s, by = H - h - 26 * s;
    roundRect(ctx, bx, by, tw + px * 2, h, 10 * s);
    ctx.fillStyle = hexA(accent, 0.92); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    ctx.fillText(anim.caption, bx + px, by + h / 2);
  }

  // ---- optional custom watermark (off by default) ----
  if (settings.watermark) {
    const fs = 14 * s;
    ctx.font = `600 ${fs}px system-ui, sans-serif`;
    ctx.globalAlpha = 0.8; ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    ctx.fillText(settings.watermark, W - 22 * s, H - 22 * s);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
}

/* small canvas helpers */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(ctx, text, cx, cy, maxW, lh) {
  const words = text.split(' '); let lineStr = '', lines = [];
  for (const w of words) {
    const test = lineStr ? lineStr + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && lineStr) { lines.push(lineStr); lineStr = w; }
    else lineStr = test;
  }
  if (lineStr) lines.push(lineStr);
  const startY = cy - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lh));
}
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ============================================================ music */
function startMusic() {
  const el = $('#music');
  if (!el.src) return;
  el.currentTime = 0;
  el.volume = 0.85;
  el.play().catch(() => {});
}
function stopMusic() { const el = $('#music'); if (el.src) el.pause(); }

/* ============================================================ recording */
function pickMime() {
  const wantMp4 = settings.format === 'mp4';
  const candidates = wantMp4
    ? ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4',
       'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm']
    : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

function startRecorder() {
  recordedChunks = [];
  const fps = 30;
  const stream = $('#output').captureStream(fps);

  const music = $('#music');
  if (music.src) {
    try {
      const as = music.captureStream ? music.captureStream() : (music.mozCaptureStream && music.mozCaptureStream());
      if (as) as.getAudioTracks().forEach(t => stream.addTrack(t));
    } catch (e) { /* record silent video */ }
  }

  const mime = pickMime();
  mediaRecorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 14_000_000 });
  mediaRecorder.ondataavailable = e => { if (e.data && e.data.size) recordedChunks.push(e.data); };
  mediaRecorder.onstop = () => {
    const type = mediaRecorder.mimeType || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(recordedChunks, { type });
    const url = URL.createObjectURL(blob);
    const a = $('#btn-download');
    a.href = url;
    a.download = `triptrail.${ext}`;
    $('#dl-label').textContent = `Download ${ext.toUpperCase()} (${(blob.size / 1048576).toFixed(1)} MB)`;
    a.classList.remove('hidden');
    toast(`Video ready as ${ext.toUpperCase()} — click "Download".`);
  };
  mediaRecorder.start();
}
function stopRecorder() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
}

/* ============================================================ layout / aspect */
function layoutStage() {
  const area = $('#stage-inner');
  const r = area.getBoundingClientRect();
  const [aw, ah] = settings.aspect.split(':').map(Number);
  const ar = aw / ah;
  let w = r.width, h = w / ar;
  if (h > r.height) { h = r.height; w = h * ar; }
  const box = $('#mapbox');
  box.style.width = Math.floor(w) + 'px';
  box.style.height = Math.floor(h) + 'px';
  if (map) map.resize();
}

/* ============================================================ wiring */
function setControls(playing) {
  $('#btn-play').disabled = playing;
  $('#btn-record').disabled = playing;
  $('#btn-stop').disabled = !playing;
}
function syncSettingsFromUI() {
  settings.title = $('#inp-title').value;
  settings.subtitle = $('#inp-subtitle').value;
  settings.watermark = $('#inp-watermark').value.trim();
  settings.accent = $('#inp-accent').value;
  settings.pace = parseFloat($('#rng-pace').value);
  settings.labels = $('#chk-labels').checked;
  settings.roads = $('#chk-roads').checked;
  settings.pitch = $('#chk-pitch').checked;
  settings.glow = $('#chk-glow').checked;
  settings.globe = $('#chk-globe').checked;
  settings.format = $('#sel-format').value;
  settings.quality = parseInt($('#sel-quality').value, 10);
}

function wire() {
  $('#btn-add').onclick = doSearch;
  $('#inp-search').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  $('#btn-clear').onclick = () => { stops = []; afterStopsChange(); };

  $('#btn-build').onclick = buildFromText;
  $('#btn-import').onclick = () => $('#file-route').click();
  $('#file-route').onchange = e => { if (e.target.files[0]) importRouteFile(e.target.files[0]); e.target.value = ''; };

  $('#file-photo').onchange = e => {
    const f = e.target.files[0]; e.target.value = '';
    const s = stops.find(x => x.id === photoTargetId);
    if (!f || !s) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { s.photoUrl = url; s.img = img; renderStops(); toast(`Photo attached to ${s.name}.`); };
    img.src = url;
  };

  $('#btn-music').onclick = () => $('#file-music').click();
  $('#file-music').onchange = e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    $('#music').src = URL.createObjectURL(f);
    $('#music-name').textContent = f.name;
    $('#btn-music-clear').classList.remove('hidden');
  };
  $('#btn-music-clear').onclick = () => {
    const m = $('#music'); m.pause(); m.removeAttribute('src'); m.load();
    $('#music-name').textContent = '(none)';
    $('#btn-music-clear').classList.add('hidden');
  };

  $('#btn-play').onclick = () => play(false);
  $('#btn-record').onclick = () => { $('#btn-download').classList.add('hidden'); play(true); };
  $('#btn-stop').onclick = stopPlay;

  $('#inp-accent').oninput = e => {
    settings.accent = e.target.value;
    document.documentElement.style.setProperty('--accent', settings.accent);
    TRAIL_LAYERS.forEach(lid => { if (map && map.getLayer(lid)) map.setPaintProperty(lid, 'line-color', settings.accent); });
  };
  $('#sel-style').onchange = e => { settings.style = e.target.value; map.setStyle(styleSpec(settings.style), { diff: false }); };
  $('#sel-aspect').onchange = e => { settings.aspect = e.target.value; layoutStage(); };
  $('#chk-globe').onchange = e => { settings.globe = e.target.checked; applyProjection(); };
  $('#chk-pitch').onchange = e => { settings.pitch = e.target.checked; map.easeTo({ pitch: settings.pitch ? 50 : 0, duration: 500 }); };
  $('#chk-labels').onchange = e => settings.labels = e.target.checked;
  $('#chk-roads').onchange = e => settings.roads = e.target.checked;
  $('#chk-glow').onchange = e => { settings.glow = e.target.checked; if (map) map.setStyle(styleSpec(settings.style), { diff: false }); };
  $('#rng-pace').oninput = e => {
    settings.pace = parseFloat(e.target.value);
    $('#pace-val').textContent = settings.pace < 0.8 ? 'Cinematic' : settings.pace > 1.4 ? 'Snappy' : 'Normal';
  };
  $('#sel-format').onchange = e => settings.format = e.target.value;
  $('#sel-quality').onchange = e => settings.quality = parseInt(e.target.value, 10);

  document.addEventListener('click', e => {
    if (!e.target.closest('.search')) $('#search-results').classList.add('hidden');
  });

  // collapsible sidebar + mobile overlay
  const setNav = hidden => document.body.classList.toggle('nav-hidden', hidden);
  $('#nav-toggle').onclick = () => document.body.classList.toggle('nav-hidden');
  $('#nav-close').onclick = () => setNav(true);
  $('#scrim').onclick = () => setNav(true);
  // resize the map once the slide animation settles (stage width changed on desktop)
  $('#sidebar').addEventListener('transitionend', e => {
    if (e.propertyName === 'margin-left' || e.propertyName === 'transform') layoutStage();
  });

  // keep a sensible default when crossing the mobile breakpoint
  const mq = window.matchMedia('(max-width:820px)');
  let wasMobile = mq.matches;
  window.addEventListener('resize', () => {
    if (mq.matches !== wasMobile) { wasMobile = mq.matches; setNav(mq.matches); }
    layoutStage();
  });
}

/* ============================================================ boot */
function boot() {
  document.documentElement.style.setProperty('--accent', settings.accent);
  if (window.matchMedia('(max-width:820px)').matches) document.body.classList.add('nav-hidden');
  wire();
  renderStops();
  initMap();
  layoutStage();
  setTimeout(layoutStage, 300);
}
boot();
