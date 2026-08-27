"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/design/tokens";
import { journeyScroll } from "./scrollState";
import { stations } from "./journeyStations";

/**
 * The line. A single continuous path receding into fog — the customer journey
 * as one connected run rather than six disconnected boxes. The camera travels
 * along it as the section scrolls; the copy lives in the DOM overlay above.
 *
 * Everything here is deliberately abstract: geometry carries depth and
 * movement, type carries meaning. Baking words into textures is what makes 3D
 * look cheap.
 */

const PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.1, 4),
    new THREE.Vector3(0.9, 0.5, -3),
    new THREE.Vector3(-0.8, -0.2, -10),
    new THREE.Vector3(0.7, 0.6, -17),
    new THREE.Vector3(-0.9, 0.0, -24),
    new THREE.Vector3(0.8, -0.3, -31),
    new THREE.Vector3(-0.2, 0.4, -38),
    new THREE.Vector3(0.1, 0.2, -45),
  ],
  false,
  "catmullrom",
  0.5,
);

/** Where along the path each station sits, and how far off it stands. */
const STATION_T = stations.map((_, i) => 0.12 + i * 0.145);
const OFFSET = new THREE.Vector3(1.35, 0.55, 0);

const stationPoints = STATION_T.map((t) =>
  PATH.getPointAt(t).clone().add(OFFSET),
);

/** A soft radial falloff, baked once. A flat disc reads as a plate; this glows. */
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.28, "rgba(255,255,255,0.42)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

let sharedGlow: THREE.Texture | null = null;
const glowTexture = () => (sharedGlow ??= makeGlowTexture());

const accent = new THREE.Color(colors.accent);
const cream = new THREE.Color(colors.deepInk);

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

function Path() {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(PATH, 420, 0.012, 8, false),
    [],
  );
  const halo = useMemo(
    () => new THREE.TubeGeometry(PATH, 420, 0.032, 8, false),
    [],
  );

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={cream} transparent opacity={0.55} />
      </mesh>
      <mesh geometry={halo}>
        <meshBasicMaterial
          color={cream}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Signals travelling the line — the work moving through the system. */
function Pulses() {
  const count = 7;
  const meshes = useRef<THREE.Sprite[]>([]);
  const glowMap = useMemo(() => glowTexture(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      const t = ((time * 0.045 + i / count) % 1) * 0.98;
      mesh.position.copy(PATH.getPointAt(t));
      const fade = Math.sin(t * Math.PI);
      // Fade out anything about to pass through the lens — a signal the size of
      // the screen stops reading as a signal.
      const near = THREE.MathUtils.smoothstep(
        mesh.position.distanceTo(state.camera.position),
        1.4,
        5.0,
      );
      mesh.scale.setScalar(0.26 + fade * 0.34);
      (mesh.material as THREE.SpriteMaterial).opacity =
        (0.3 + fade * 0.7) * near;
    }
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <sprite
          key={i}
          scale={0.42}
          ref={(node) => {
            if (node) meshes.current[i] = node;
          }}
        >
          <spriteMaterial
            map={glowMap}
            color={accent}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function StationMarker({ index }: { index: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const position = stationPoints[index];

  const connector = useMemo(() => {
    const anchor = PATH.getPointAt(STATION_T[index]);
    return new THREE.BufferGeometry().setFromPoints([
      anchor.clone().sub(stationPoints[index]),
      new THREE.Vector3(0, 0, 0),
    ]);
  }, [index]);

  const glowMap = useMemo(() => glowTexture(), []);
  const active = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const current = journeyScroll.progress * (stations.length - 1);
    const target = Math.max(0, 1 - Math.abs(current - index) * 1.35);
    active.current = damp(active.current, target, 5, dt);

    const a = active.current;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.1 + index) * 0.03;

    if (ring.current) {
      ring.current.scale.setScalar((0.72 + a * 0.42) * breathe);
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.2 + a * 0.8;
      m.color.copy(cream).lerp(accent, a);
    }
    if (glow.current) {
      glow.current.scale.setScalar((0.85 + a * 0.5) * breathe);
      (glow.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + a * 0.34;
    }
    if (core.current) {
      core.current.scale.setScalar(0.5 + a * 0.9);
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.4 + a * 0.6;
      m.color.copy(cream).lerp(accent, a * 0.85);
    }
  });

  return (
    <group position={position}>
      <lineSegments geometry={connector}>
        <lineBasicMaterial color={cream} transparent opacity={0.16} />
      </lineSegments>

      <Billboard>
        <mesh ref={glow}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial
            map={glowMap}
            color={accent}
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring}>
          <ringGeometry args={[0.26, 0.272, 64]} />
          <meshBasicMaterial color={cream} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.52, 0.526, 64]} />
          <meshBasicMaterial
            color={cream}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh ref={core}>
          <circleGeometry args={[0.055, 32]} />
          <meshBasicMaterial color={cream} transparent />
        </mesh>
      </Billboard>
    </group>
  );
}

/** Scattered once, outside render — the field never needs to change. */
function buildMotes() {
  const count = 420;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = -Math.random() * 52 + 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

let sharedMotes: THREE.BufferGeometry | null = null;
const motesGeometry = () => (sharedMotes ??= buildMotes());

/** Slow drifting motes. Depth cue, nothing more. */
function Motes() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => motesGeometry(), []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.z = state.clock.elapsedTime * 0.006;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color={cream}
        size={0.028}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Rig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const travelled = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, 0, -10), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const wanted = journeyScroll.progress;
    travelled.current = reduced
      ? wanted
      : damp(travelled.current, wanted, 3.2, dt);

    const p = travelled.current;
    const t = THREE.MathUtils.clamp(0.055 + p * 0.79, 0, 0.999);
    const point = PATH.getPointAt(t);

    // Ride above the line, looking down it, so the path recedes to a horizon
    // instead of sweeping past the lens.
    const drift = reduced ? 0 : pointer.x * 0.16;
    const lift = reduced ? 0 : pointer.y * 0.08;
    camera.position.set(
      point.x - 0.18 + drift,
      point.y + 0.82 + lift,
      point.z + 0.35,
    );

    // Look ahead down the line, glancing toward whichever station is closest.
    const ahead = PATH.getPointAt(Math.min(t + 0.11, 1));
    const nearest =
      stationPoints[
        Math.round(THREE.MathUtils.clamp(p, 0, 1) * (stations.length - 1))
      ];
    target.copy(ahead).lerp(nearest, 0.24);
    look.lerp(target, 1 - Math.exp(-4 * dt));
    camera.lookAt(look);
  });

  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={[colors.deep, 0.052]} />
      <color attach="background" args={[colors.deep]} />
      <Path />
      <Pulses />
      <Motes />
      {stations.map((station, i) => (
        <StationMarker key={station.id} index={i} />
      ))}
      <Rig reduced={reduced} />
    </>
  );
}

export default function JourneyScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4], fov: 46, near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <Scene reduced={reduced} />
    </Canvas>
  );
}
