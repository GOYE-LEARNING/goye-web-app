import * as THREE from "three";
import { feature } from "topojson-client";
import land110m from "world-atlas/land-110m.json";

/**
 * Real-world landmass geometry for the hero globe, sourced from Natural
 * Earth data (via the `world-atlas` package, 1:110m scale — light enough to
 * point-sample densely, detailed enough to read as actual continents).
 */

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

type Ring = [number, number][];
interface PolygonWithBBox {
  rings: Ring[]; // rings[0] = exterior, rest = holes
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function pointInRing(lon: number, lat: number, ring: Ring): boolean {
  // Standard ray-casting point-in-polygon test.
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon: number, lat: number, poly: PolygonWithBBox): boolean {
  if (lon < poly.minLon || lon > poly.maxLon || lat < poly.minLat || lat > poly.maxLat) return false;
  if (!pointInRing(lon, lat, poly.rings[0])) return false;
  for (let h = 1; h < poly.rings.length; h++) {
    if (pointInRing(lon, lat, poly.rings[h])) return false; // inside a hole
  }
  return true;
}

let cachedPolygons: PolygonWithBBox[] | null = null;

function getLandPolygons(): PolygonWithBBox[] {
  if (cachedPolygons) return cachedPolygons;
  const topology = land110m as any;
  const collection = feature(topology, topology.objects.land) as any;

  const polygons: PolygonWithBBox[] = [];
  collection.features.forEach((f: any) => {
    const geom = f.geometry;
    if (!geom) return;
    const polys: Ring[][] = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
    polys.forEach((rings) => {
      let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
      rings[0].forEach(([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
      polygons.push({ rings, minLon, maxLon, minLat, maxLat });
    });
  });

  cachedPolygons = polygons;
  return polygons;
}

/**
 * Dense dot-field sampling of every landmass — the "dotted globe" look.
 * Points are laid out with a Fibonacci sphere distribution (evenly spaced
 * across the whole sphere, no pole-clustering the way a lat/lon grid gets),
 * then each candidate is tested against the real coastline polygons so only
 * points that land on actual continents survive.
 */
export function buildLandDotPositions(radius: number, sampleCount = 12000): Float32Array {
  const polygons = getLandPolygons();
  const positions: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < sampleCount; i++) {
    const y = 1 - (i / (sampleCount - 1)) * 2;
    const r = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const lat = (Math.asin(y) * 180) / Math.PI;
    let lon = (Math.atan2(z, -x) * 180) / Math.PI - 180;
    if (lon < -180) lon += 360;

    for (const poly of polygons) {
      if (pointInPolygon(lon, lat, poly)) {
        positions.push(x * radius, y * radius, z * radius);
        break;
      }
    }
  }

  return new Float32Array(positions);
}

/** Soft radial-gradient sprite used as the point material's texture — gives each dot a gentle glow instead of a hard square pixel. */
export function makeDotSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export interface CityMarker {
  city: string;
  lat: number;
  lon: number;
  name: string;
  role: string;
  initials: string;
  color: string;
}

// A large, deliberately global spread of community members — echoes the
// "every nation" framing of the hero copy rather than any single region.
// Initials-avatars rather than photos: no real person's likeness is used.
const NAMES_ROLES: { name: string; role: string }[] = [
  { name: "Ada", role: "Tutor" },
  { name: "James", role: "Student" },
  { name: "Maria", role: "Mentor" },
  { name: "Amara", role: "Student" },
  { name: "Liam", role: "Tutor" },
  { name: "Sofia", role: "Student" },
  { name: "Kwame", role: "Mentor" },
  { name: "Yuki", role: "Student" },
  { name: "Fatima", role: "Tutor" },
  { name: "Noah", role: "Student" },
  { name: "Grace", role: "Mentor" },
  { name: "Diego", role: "Tutor" },
  { name: "Aisha", role: "Student" },
  { name: "Lucas", role: "Student" },
  { name: "Priya", role: "Tutor" },
  { name: "Ethan", role: "Mentor" },
  { name: "Chidi", role: "Student" },
  { name: "Hana", role: "Tutor" },
  { name: "Samuel", role: "Student" },
  { name: "Zara", role: "Mentor" },
  { name: "Mateus", role: "Tutor" },
  { name: "Ingrid", role: "Student" },
  { name: "Omar", role: "Student" },
  { name: "Wei", role: "Tutor" },
  { name: "Naledi", role: "Mentor" },
  { name: "Elif", role: "Student" },
  { name: "Ravi", role: "Tutor" },
  { name: "Chloe", role: "Student" },
  { name: "Tunde", role: "Mentor" },
  { name: "Anya", role: "Student" },
];

const CITIES: { city: string; lat: number; lon: number }[] = [
  { city: "Lagos", lat: 6.5244, lon: 3.3792 },
  { city: "London", lat: 51.5072, lon: -0.1276 },
  { city: "New York", lat: 40.7128, lon: -74.006 },
  { city: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { city: "Manila", lat: 14.5995, lon: 120.9842 },
  { city: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { city: "Accra", lat: 5.6037, lon: -0.187 },
  { city: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { city: "Cairo", lat: 30.0444, lon: 31.2357 },
  { city: "Toronto", lat: 43.6532, lon: -79.3832 },
  { city: "Kampala", lat: 0.3476, lon: 32.5825 },
  { city: "Bogotá", lat: 4.711, lon: -74.0721 },
  { city: "Karachi", lat: 24.8607, lon: 67.0011 },
  { city: "Sydney", lat: -33.8688, lon: 151.2093 },
  { city: "Kigali", lat: -1.9441, lon: 30.0619 },
  { city: "Seoul", lat: 37.5665, lon: 126.978 },
  { city: "Berlin", lat: 52.52, lon: 13.405 },
  { city: "Johannesburg", lat: -26.2041, lon: 28.0473 },
  { city: "Mumbai", lat: 19.076, lon: 72.8777 },
  { city: "Mexico City", lat: 19.4326, lon: -99.1332 },
  { city: "Nicosia", lat: 35.1856, lon: 33.3823 },
  { city: "Dakar", lat: 14.7167, lon: -17.4677 },
  { city: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { city: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { city: "Gaborone", lat: -24.6282, lon: 25.9231 },
  { city: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { city: "Chennai", lat: 13.0827, lon: 80.2707 },
  { city: "Melbourne", lat: -37.8136, lon: 144.9631 },
  { city: "Abuja", lat: 9.0765, lon: 7.3986 },
  { city: "Vancouver", lat: 49.2827, lon: -123.1207 },
];

const AVATAR_COLORS = ["#FFA500", "#2C7FFF", "#34A853", "#EA4335", "#FBBC04", "#8E44AD", "#16A085"];

export const CITY_MARKERS: CityMarker[] = CITIES.map((c, i) => {
  const person = NAMES_ROLES[i % NAMES_ROLES.length];
  return {
    city: c.city,
    lat: c.lat,
    lon: c.lon,
    name: person.name,
    role: person.role,
    initials: person.name.charAt(0),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
});
