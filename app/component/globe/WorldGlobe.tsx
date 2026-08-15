"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildLandDotPositions, makeDotSprite, latLonToVector3, CITY_MARKERS, CityMarker } from "./geo";

const RADIUS = 2.2;
const ACCENT = "#FFA500";

function LandDots({ color }: { color: string }) {
  const positions = useMemo(() => buildLandDotPositions(RADIUS), []);
  const sprite = useMemo(() => makeDotSprite(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        color={color}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Fresnel rim glow — a back-facing sphere whose shader brightens toward the silhouette edge. */
function Atmosphere({ color }: { color: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(color) } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vPos = mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying vec3 vPos;
          void main() {
            vec3 viewDir = normalize(-vPos);
            float rim = 1.0 - abs(dot(vNormal, viewDir));
            float intensity = pow(rim, 4.2) * 0.8;
            gl_FragColor = vec4(uColor, intensity);
          }
        `,
      }),
    [color],
  );

  return (
    <mesh>
      <sphereGeometry args={[RADIUS * 1.12, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function makeCurve(from: THREE.Vector3, to: THREE.Vector3): THREE.QuadraticBezierCurve3 {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  // Kept low/close to the surface ("compact") rather than a tall dramatic
  // arc — reads as a tight network hugging the globe, not flight paths.
  mid.normalize().multiplyScalar(RADIUS * (1.03 + from.distanceTo(to) * 0.025));
  return new THREE.QuadraticBezierCurve3(from, mid, to);
}

/** The faint connecting line between two members of the network. */
function NetworkLink({ curve, color }: { curve: THREE.QuadraticBezierCurve3; color: string }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
    return new THREE.Line(geometry, material);
  }, [curve, color]);

  return <primitive object={line} />;
}

/** A small light travelling along a link and looping — the network reads as active, not a static diagram. */
function NetworkPulse({ curve, offset, color }: { curve: THREE.QuadraticBezierCurve3; offset: number; color: string }) {
  const dot = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!dot.current) return;
    const t = (clock.elapsedTime * 0.18 + offset) % 1;
    dot.current.position.copy(curve.getPoint(t));
    const fade = Math.sin(t * Math.PI);
    (dot.current.material as THREE.MeshBasicMaterial).opacity = fade;
    dot.current.scale.setScalar(0.6 + fade * 0.6);
  });

  return (
    <mesh ref={dot}>
      <sphereGeometry args={[0.028, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** A compact network connecting the community-member markers. Nearest-
 * neighbor linking bunched everything together wherever markers happened to
 * be geographically dense (e.g. the African cluster) — this instead builds
 * a ring ordered by longitude, so the connections wrap all the way around
 * the globe, plus a handful of long cross-globe chords so it still reads as
 * a network rather than a single loop. */
function UserNetwork({ color }: { color: string }) {
  const nodes = useMemo(() => CITY_MARKERS.map((c) => latLonToVector3(c.lat, c.lon, RADIUS * 1.03)), []);

  const links = useMemo(() => {
    const n = nodes.length;
    const order = CITY_MARKERS.map((c, i) => ({ i, lon: c.lon })).sort((a, b) => a.lon - b.lon);

    const pairs: [number, number][] = [];
    // Ring around the whole world, in longitude order.
    for (let k = 0; k < order.length; k++) {
      const a = order[k].i;
      const b = order[(k + 1) % order.length].i;
      pairs.push([a, b]);
    }
    // A few chords crossing to the opposite side of the ring, for genuine
    // network texture instead of a single loop.
    for (let k = 0; k < order.length; k += 4) {
      const a = order[k].i;
      const b = order[(k + Math.floor(order.length / 2)) % order.length].i;
      pairs.push([a, b]);
    }
    return pairs;
  }, [nodes]);

  const curves = useMemo(() => links.map(([a, b]) => makeCurve(nodes[a], nodes[b])), [nodes, links]);

  return (
    <>
      {curves.map((c, i) => (
        <NetworkLink key={`link-${i}`} curve={c} color={color} />
      ))}
      {curves.map((c, i) => (
        <group key={`pulse-${i}`}>
          <NetworkPulse curve={c} offset={i * 0.17} color={color} />
          <NetworkPulse curve={c} offset={i * 0.17 + 0.5} color={color} />
        </group>
      ))}
    </>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const n = 350;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(7 + Math.random() * 7);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/** Imperatively projects each city's rotated 3D position onto DOM card refs
 * every frame — cheaper than re-rendering React state 60x/sec. Cards fade
 * based on how far around the back of the globe they are, rather than a
 * hard cut, for a smoother reveal as the globe spins. */
function CityMarkers({ groupRef, cardRefs }: { groupRef: React.RefObject<THREE.Group>; cardRefs: React.RefObject<(HTMLDivElement | null)[]> }) {
  const { camera, size } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(() => CITY_MARKERS.map((c) => latLonToVector3(c.lat, c.lon, RADIUS * 1.03)), []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || size.width === 0) return;
    positions.forEach((localPos, i) => {
      const el = cardRefs.current?.[i];
      if (!el) return;

      tmp.copy(localPos).applyMatrix4(group.matrixWorld);
      const facing = tmp.clone().normalize().dot(camera.position.clone().normalize());

      const projected = tmp.clone().project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;

      const frontness = THREE.MathUtils.clamp((facing - 0.05) / 0.35, 0, 1);
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      el.style.opacity = String(frontness);
      el.style.pointerEvents = frontness > 0.5 ? "auto" : "none";
    });
  });

  return null;
}

/**
 * Drives the Canvas's size/camera-aspect from a ResizeObserver on the real
 * container element, and — critically — pushes the result into R3F's own
 * `size` store via `set()`, not just `gl.setSize`. In testing, R3F's
 * built-in auto-resize sometimes never fired (canvas stuck at the browser's
 * 300x150 default), which left `useThree().size` stale — the exact value
 * <CityMarkers> uses to project cards onto the page, so the cards were
 * being positioned against the wrong coordinate space. This makes the size
 * authoritative regardless of whether the built-in mechanism cooperates.
 */
function ForceCanvasSize({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { gl, camera, set, size } = useThree();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = (w: number, h: number) => {
      if (w === 0 || h === 0) return;
      if (size.width === w && size.height === h) return;
      gl.setSize(w, h);
      set({ size: { width: w, height: h, top: 0, left: 0, updateStyle: true } } as any);
      const cam = camera as THREE.PerspectiveCamera;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      apply(Math.round(width), Math.round(height));
    });
    ro.observe(el);
    apply(el.clientWidth, el.clientHeight);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera, set]);

  return null;
}

function GlobeScene({
  dark,
  groupRef,
  cardRefs,
}: {
  dark: boolean;
  groupRef: React.RefObject<THREE.Group>;
  cardRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  // Dark mode: dark ocean + glowing orange continents (matches the
  // reference image). Light mode: white ocean + grey continents, so the
  // globe reads as a clean, neutral object rather than clashing with the
  // light background.
  const coreColor = dark ? "#14161d" : "#ffffff";
  const dotColor = dark ? ACCENT : "#8b8f99";

  return (
    <group ref={groupRef} rotation={[0.28, 0.3, 0.08]}>
      {/* Ocean — also hides dots + markers on the far side */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 64, 64]} />
        <meshBasicMaterial color={coreColor} />
      </mesh>

      <LandDots color={dotColor} />
      <UserNetwork color={ACCENT} />
      <CityMarkers groupRef={groupRef} cardRefs={cardRefs} />
    </group>
  );
}

function GlobeCanvas({
  dark,
  groupRef,
  cardRefs,
  containerRef,
}: {
  dark: boolean;
  groupRef: React.RefObject<THREE.Group>;
  cardRefs: React.RefObject<(HTMLDivElement | null)[]>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <Canvas
      // pulled in close so the sphere overflows the frame and crops
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      resize={{ debounce: 0 }}
      style={{ background: "transparent", width: "100%", height: "100%", display: "block" }}
    >
      <ForceCanvasSize containerRef={containerRef} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.8} />
        <Stars />
        {/* Pushed down so the top of the world fills the hero and the
            bottom runs off-frame — deliberately never showing the whole
            sphere at once. Kept clear of the fixed navbar overlapping the
            top of the section. */}
        <group position={[0, -1.55, 0]}>
          <GlobeScene dark={dark} groupRef={groupRef} cardRefs={cardRefs} />
          <Atmosphere color={ACCENT} />
        </group>
      </Suspense>
    </Canvas>
  );
}

export default function WorldGlobe({ dark }: { dark: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <GlobeCanvas dark={dark} groupRef={groupRef} cardRefs={cardRefs} containerRef={containerRef} />

      {/* Floating community-member cards — plain DOM, positioned imperatively by CityMarkers above. Initials-avatars, not photos: no real person's likeness is used. */}
      {CITY_MARKERS.map((c: CityMarker, i: number) => (
        <div
          key={c.city}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-primaryColors-0/30 bg-white/90 dark:bg-secondaryColors-0/90 backdrop-blur-sm pl-1.5 pr-3 py-1.5 shadow-lg shadow-black/10"
          style={{ opacity: 0, willChange: "transform, opacity" }}
        >
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: c.color }}
          >
            {c.initials}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold text-lightBoldText-0 dark:text-white">{c.name}</span>
            <span className="text-[9px] text-lightBoldText-0/50 dark:text-textSlightDark-0/70">{c.role} · {c.city}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
