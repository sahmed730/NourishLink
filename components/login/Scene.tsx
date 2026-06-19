'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const RADIUS = 3.2;
const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ─── GEO → 3D ─────────────────────────────────────────────────────────────────
function geoToVec3(lon: number, lat: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── INLINE TopoJSON DECODER ──────────────────────────────────────────────────
// Returns a Float32Array of XYZ triples with NaN breaks between line strips.
function decodeCountryBorders(topo: any): Float32Array {
  const positions: number[] = [];
  const { scale, translate } = topo.transform;

  // Step 1: delta-decode arcs → [lon, lat] pairs
  const rawArcs: [number, number][][] = (topo.arcs as [number, number][][]).map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as [number, number];
    });
  });

  // Step 2: walk every ring of every country geometry
  function addRing(ringArcIdxs: number[]) {
    const pts: THREE.Vector3[] = [];
    for (const idx of ringArcIdxs) {
      const neg     = idx < 0;
      const realIdx = neg ? ~idx : idx;
      const arc     = neg ? [...rawArcs[realIdx]].reverse() : rawArcs[realIdx];
      for (const [lon, lat] of arc) {
        pts.push(geoToVec3(lon, lat, RADIUS + 0.013));
      }
    }
    if (pts.length < 2) return;
    for (let i = 0; i < pts.length - 1; i++) {
      positions.push(pts[i].x, pts[i].y, pts[i].z);
      positions.push(pts[i+1].x, pts[i+1].y, pts[i+1].z);
    }
    // Close the ring back to first point
    const first = pts[0];
    const last = pts[pts.length - 1];
    positions.push(last.x, last.y, last.z);
    positions.push(first.x, first.y, first.z);
  }

  for (const geom of topo.objects.countries.geometries) {
    if (geom.type === 'Polygon') {
      for (const ring of geom.arcs) addRing(ring);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.arcs) for (const ring of poly) addRing(ring);
    }
  }

  return new Float32Array(positions);
}

// ─── COUNTRY BORDER LINES (single draw call) ──────────────────────────────────
function CountryBorders({ posArr }: { posArr: Float32Array }) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.55,
    });
    return new THREE.LineSegments(geo, mat);
  }, [posArr]);

  // Cleanup on unmount
  useEffect(() => () => {
    (lineObj.geometry as THREE.BufferGeometry).dispose();
    (lineObj.material as THREE.Material).dispose();
  }, [lineObj]);

  return <primitive object={lineObj} />;
}

// ─── GRATICULE LINES (lat/lon grid) ───────────────────────────────────────────
function Graticule() {
  const lineObj = useMemo(() => {
    const positions: number[] = [];

    // Latitude parallels
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 2) {
        const p1 = geoToVec3(lon, lat, RADIUS + 0.005);
        const p2 = geoToVec3(lon + 2, lat, RADIUS + 0.005);
        positions.push(p1.x, p1.y, p1.z);
        positions.push(p2.x, p2.y, p2.z);
      }
    }
    // Longitude meridians
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -90; lat < 90; lat += 2) {
        const p1 = geoToVec3(lon, lat, RADIUS + 0.005);
        const p2 = geoToVec3(lon, lat + 2, RADIUS + 0.005);
        positions.push(p1.x, p1.y, p1.z);
        positions.push(p2.x, p2.y, p2.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: '#444466',
      transparent: true,
      opacity: 0.25,
    });
    return new THREE.LineSegments(geo, mat);
  }, []);

  useEffect(() => () => {
    (lineObj.geometry as THREE.BufferGeometry).dispose();
    (lineObj.material as THREE.Material).dispose();
  }, [lineObj]);

  return <primitive object={lineObj} />;
}

// ─── GLOBE SURFACE DOTS (faint texture layer) ─────────────────────────────────
function GlobeDots() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      pts.push(new THREE.Vector3(
        RADIUS * r * Math.cos(theta),
        RADIUS * y,
        RADIUS * r * Math.sin(theta)
      ));
    }
    return pts;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(0.016);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 5000]}>
      <circleGeometry args={[1, 5]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── CITY ARCS ────────────────────────────────────────────────────────────────
const ARCS: { from: [number,number]; to: [number,number]; delay: number }[] = [
  { from: [51.5,  -0.1],  to: [28.6,  77.2],  delay: 0.0 },
  { from: [40.7, -74.0],  to: [-23.5,-46.6],  delay: 1.2 },
  { from: [35.6, 139.7],  to: [1.3,  103.8],  delay: 0.6 },
  { from: [48.8,   2.4],  to: [30.0,  31.2],  delay: 2.1 },
  { from: [-33.9, 18.4],  to: [52.5,  13.4],  delay: 0.4 },
  { from: [19.4, -99.1],  to: [55.7,  37.6],  delay: 1.8 },
  { from: [31.2, 121.5],  to: [-37.8,144.9],  delay: 2.7 },
  { from: [60.2,  24.9],  to: [-1.3,  36.8],  delay: 1.5 }, // Helsinki → Nairobi
];

function buildArcPositions(
  from: [number,number], to: [number,number], segments = 64
): Float32Array {
  const s = geoToVec3(from[1], from[0], RADIUS);
  const e = geoToVec3(to[1],   to[0],   RADIUS);
  const mid = s.clone().lerp(e, 0.5).normalize().multiplyScalar(RADIUS * 1.45);
  const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
  const pts = curve.getPoints(segments);
  const arr = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => { arr[i*3]=p.x; arr[i*3+1]=p.y; arr[i*3+2]=p.z; });
  return arr;
}

function CityArcs() {
  const arcsData = useMemo(() =>
    ARCS.map(a => ({ ...a, posArr: buildArcPositions(a.from, a.to) })), []
  );

  const lineObjs = useMemo(() =>
    arcsData.map(a => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(a.posArr, 3));
      const mat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.0 });
      return { line: new THREE.Line(geo, mat), delay: a.delay };
    }), [arcsData]
  );

  useEffect(() => () => {
    lineObjs.forEach(({ line }) => {
      (line.geometry as THREE.BufferGeometry).dispose();
      (line.material as THREE.Material).dispose();
    });
  }, [lineObjs]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lineObjs.forEach(({ line, delay }) => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 0.7 + delay) * 0.5 + 0.3;
    });
  });

  return (
    <>
      {lineObjs.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}

// ─── PULSING CITY DOTS ────────────────────────────────────────────────────────
const CITIES: [number, number][] = [
  [51.5,-0.1], [40.7,-74.0], [35.6,139.7], [48.8,2.4],
  [-33.9,18.4], [19.4,-99.1], [31.2,121.5], [28.6,77.2],
  [1.3,103.8], [-23.5,-46.6], [30.0,31.2], [55.7,37.6],
  [-37.8,144.9], [52.5,13.4], [60.2,24.9], [-1.3,36.8],
];

function CityDots() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current?.children.forEach((c, i) => {
      const s = 1 + Math.sin(t * 1.6 + i * 0.8) * 0.45;
      c.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef}>
      {CITIES.map(([lat, lon], i) => {
        const pos = geoToVec3(lon, lat, RADIUS + 0.065);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── ORBITAL DATA RINGS ───────────────────────────────────────────────────────
function OrbitalRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (r1.current) r1.current.rotation.z =  t * 0.10;
    if (r2.current) r2.current.rotation.z = -t * 0.07;
    if (r3.current) r3.current.rotation.x =  t * 0.05;
  });

  return (
    <group>
      <mesh ref={r1} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[RADIUS+0.35, RADIUS+0.42, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.10} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI/3, 0.4, 0]}>
        <ringGeometry args={[RADIUS+0.65, RADIUS+0.70, 128]} />
        <meshBasicMaterial color="#aaaacc" transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r3} rotation={[-Math.PI/5, 0.9, 0]}>
        <ringGeometry args={[RADIUS+1.0, RADIUS+1.03, 128]} />
        <meshBasicMaterial color="#cccccc" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── ATMOSPHERE ───────────────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[RADIUS * 1.055, 64, 64]} />
      <meshBasicMaterial color="#1a1a3a" transparent opacity={0.14} side={THREE.BackSide} />
    </mesh>
  );
}

// ─── MAIN GLOBE GROUP ─────────────────────────────────────────────────────────
function Globe({ posArr }: { posArr: Float32Array | null }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * 0.12,
      0.04
    );
  });

  return (
    <group ref={groupRef} position={[1.5, 0, -1]}>
      {/* Opaque black core so dots don't bleed through */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <Atmosphere />
      <Graticule />
      <GlobeDots />
      {posArr && <CountryBorders posArr={posArr} />}
      <CityArcs />
      <CityDots />
      <OrbitalRings />
    </group>
  );
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x,  pointer.x * 1.2, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.5 + pointer.y * 0.8, 0.04);
    camera.lookAt(1.5, 0, -1);
  });
  return null;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function Scene() {
  const [posArr, setPosArr] = useState<Float32Array | null>(null);

  // Fetch real world country borders from CDN (cached after first load)
  useEffect(() => {
    fetch(WORLD_URL)
      .then(r => r.json())
      .then(topo => setPosArr(decodeCountryBorders(topo)))
      .catch(() => console.warn('Could not load world topology'));
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 9], fov: 44 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#000000']} />

      {/* Deep space starfield */}
      <Sparkles count={900} scale={32} size={0.7} speed={0.04} opacity={0.45} color="#ffffff" />
      {/* Soft blue glow around globe */}
      <Sparkles count={100} scale={9} position={[1.5, 0, -1]} size={3} speed={0.15} opacity={0.2} color="#8888ff" />

      <ambientLight intensity={0.06} />
      <pointLight position={[-8, 5,  4]} intensity={1.5} color="#ffffff" />
      <pointLight position={[ 8,-3,  3]} intensity={0.7} color="#7777bb" />
      <pointLight position={[ 0, 8, -2]} intensity={0.5} color="#ffffff" />

      <Globe posArr={posArr} />
      <CameraRig />
    </Canvas>
  );
}
