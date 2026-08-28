"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/design/tokens";
import { journeyScroll } from "./scrollState";
import { stations } from "./journeyStations";

/**
 * 3D Fluid Pipeline:
 * A high-tech translucent glass pipeline through which glowing reactive fluid
 * pumps forward as the user scrolls. As the fluid reaches each station point,
 * the fluid color shifts to match that point and the station node activates
 * with an icon, glowing halo, and 2.5D perspective tracking.
 */

export const PIPELINE_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.5, 0.6, 5.0),
    new THREE.Vector3(1.1, 0.4, 0.0),
    new THREE.Vector3(-0.9, -0.2, -7.0),
    new THREE.Vector3(0.9, 0.7, -15.0),
    new THREE.Vector3(-1.0, 0.1, -23.0),
    new THREE.Vector3(0.8, -0.4, -31.0),
    new THREE.Vector3(-0.3, 0.5, -39.0),
    new THREE.Vector3(0.2, 0.2, -47.0),
  ],
  false,
  "catmullrom",
  0.5,
);

// Station positions along the normalized curve (0 to 1)
export const STATION_T = [0.08, 0.24, 0.42, 0.60, 0.78, 0.94];

// Station 3D points
export const stationPoints = STATION_T.map((t) =>
  PIPELINE_PATH.getPointAt(t),
);

// Station colors converted to THREE.Color
const stationThreeColors = stations.map((s) => new THREE.Color(s.color));

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

/** Generate sharp canvas textures for station icons */
function createStationIconTexture(iconType: string, colorHex: string) {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  // Soft glowing background circle
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.15,
    size / 2,
    size / 2,
    size * 0.48,
  );
  grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  grad.addColorStop(0.5, colorHex);
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
  ctx.fill();

  // Draw crisp icon in the center
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const scale = 3.2;
  ctx.scale(scale, scale);

  switch (iconType) {
    case "mail": // Envelope
      ctx.beginPath();
      ctx.strokeRect(-13, -9, 26, 18);
      ctx.beginPath();
      ctx.moveTo(-13, -9);
      ctx.lineTo(0, 2);
      ctx.lineTo(13, -9);
      ctx.stroke();
      break;

    case "send": // Paper plane / instant reply
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(13, 0);
      ctx.lineTo(-12, 10);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(13, 0);
      ctx.stroke();
      break;

    case "calendar": // Calendar
      ctx.beginPath();
      ctx.strokeRect(-12, -10, 24, 20);
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(12, -4);
      ctx.moveTo(-6, -13);
      ctx.lineTo(-6, -9);
      ctx.moveTo(6, -13);
      ctx.lineTo(6, -9);
      ctx.stroke();
      // small checkmark inside
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      ctx.lineTo(-1, 7);
      ctx.lineTo(5, 1);
      ctx.stroke();
      break;

    case "database": // Database / CRM record
      ctx.beginPath();
      // top cylinder
      ctx.ellipse(0, -7, 12, 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      // middle
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 4.5, 0, 0, Math.PI);
      ctx.moveTo(-12, -7);
      ctx.lineTo(-12, 0);
      ctx.moveTo(12, -7);
      ctx.lineTo(12, 0);
      ctx.stroke();
      // bottom
      ctx.beginPath();
      ctx.ellipse(0, 7, 12, 4.5, 0, 0, Math.PI);
      ctx.moveTo(-12, 0);
      ctx.lineTo(-12, 7);
      ctx.moveTo(12, 0);
      ctx.lineTo(12, 7);
      ctx.stroke();
      break;

    case "sync": // Automation loop
      ctx.beginPath();
      ctx.arc(0, 0, 9, -Math.PI * 0.7, Math.PI * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(10, 6);
      ctx.lineTo(4, 5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 9, Math.PI * 0.3, Math.PI * 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-10, -6);
      ctx.lineTo(-4, -5);
      ctx.stroke();
      break;

    case "chart": // Analytics bar chart
      ctx.beginPath();
      ctx.moveTo(-12, 10);
      ctx.lineTo(12, 10);
      ctx.stroke();
      // 3 bars
      ctx.fillRect(-9, 2, 4, 8);
      ctx.fillRect(-2, -4, 4, 14);
      ctx.fillRect(5, -10, 4, 20);
      break;

    default:
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Fluid Shader for the dynamic filling pipeline with color transitions */
const FluidShader = {
  uniforms: {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uColors: {
      value: stationThreeColors.map((c) => new THREE.Vector3(c.r, c.g, c.b)),
    },
    uStationTs: { value: STATION_T },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform float uTime;
    uniform vec3 uColors[6];
    uniform float uStationTs[6];

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Helper to calculate fluid color based on progress position
    vec3 getFluidColor(float t) {
      if (t <= uStationTs[0]) return uColors[0];
      if (t <= uStationTs[1]) {
        float f = smoothstep(uStationTs[0], uStationTs[1], t);
        return mix(uColors[0], uColors[1], f);
      }
      if (t <= uStationTs[2]) {
        float f = smoothstep(uStationTs[1], uStationTs[2], t);
        return mix(uColors[1], uColors[2], f);
      }
      if (t <= uStationTs[3]) {
        float f = smoothstep(uStationTs[2], uStationTs[3], t);
        return mix(uColors[2], uColors[3], f);
      }
      if (t <= uStationTs[4]) {
        float f = smoothstep(uStationTs[3], uStationTs[4], t);
        return mix(uColors[3], uColors[4], f);
      }
      float f = smoothstep(uStationTs[4], uStationTs[5], t);
      return mix(uColors[4], uColors[5], f);
    }

    void main() {
      float t = vUv.x; // Normalized position along the tube (0.0 to 1.0)
      
      // Empty portion of the tube
      if (t > uProgress) {
        // Faint translucent inner core guide
        vec3 emptyColor = vec3(0.08, 0.22, 0.18);
        float rim = 1.0 - max(0.0, dot(vNormal, normalize(vViewPosition)));
        float alpha = 0.05 + 0.12 * pow(rim, 2.0);
        gl_FragColor = vec4(emptyColor, alpha);
        return;
      }

      // Filled portion of the fluid
      vec3 baseColor = getFluidColor(t);

      // Liquid turbulence & pulses
      float wave = sin(t * 120.0 - uTime * 6.0) * 0.12 + cos(vUv.y * 18.0 + uTime * 4.0) * 0.08;
      vec3 fluidColor = baseColor + vec3(wave);

      // Meniscus / leading fluid edge glow
      float distToHead = uProgress - t;
      float headGlow = smoothstep(0.045, 0.0, distToHead);
      fluidColor += vec3(1.0, 1.0, 1.0) * headGlow * 0.85;

      // Fresnel rim highlight for 3D volume
      float rim = 1.0 - max(0.0, dot(vNormal, normalize(vViewPosition)));
      fluidColor += baseColor * pow(rim, 2.5) * 0.6;

      float alpha = 0.88 + headGlow * 0.12;
      gl_FragColor = vec4(fluidColor, alpha);
    }
  `,
};

/** The 3D Glass Pipeline Enclosure & Fluid Core */
function Pipeline() {
  const outerGeo = useMemo(
    () => new THREE.TubeGeometry(PIPELINE_PATH, 500, 0.065, 20, false),
    [],
  );
  const fluidGeo = useMemo(
    () => new THREE.TubeGeometry(PIPELINE_PATH, 500, 0.048, 20, false),
    [],
  );
  const glowGeo = useMemo(
    () => new THREE.TubeGeometry(PIPELINE_PATH, 500, 0.085, 16, false),
    [],
  );

  const fluidMatRef = useRef<THREE.ShaderMaterial>(null);
  const currentProgress = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = THREE.MathUtils.clamp(journeyScroll.progress * 1.02, 0.02, 1.0);
    currentProgress.current = damp(currentProgress.current, target, 4.5, dt);

    if (fluidMatRef.current) {
      fluidMatRef.current.uniforms.uProgress.value = currentProgress.current;
      fluidMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Outer Glass Pipeline Shell */}
      <mesh geometry={outerGeo}>
        <meshPhysicalMaterial
          color="#a8d5c4"
          transparent
          opacity={0.35}
          roughness={0.12}
          metalness={0.1}
          transmission={0.6}
          ior={1.3}
          thickness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dynamic Fluid Flow Inside Pipe */}
      <mesh geometry={fluidGeo}>
        <shaderMaterial
          ref={fluidMatRef}
          args={[FluidShader]}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Ambient Pipe Soft Glow Halo */}
      <mesh geometry={glowGeo}>
        <meshBasicMaterial
          color="#34d399"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Station Node on the Pipeline with 3D Ring Collar & Reactive Icon */
function StationNode({ index }: { index: number }) {
  const station = stations[index];
  const position = stationPoints[index];
  const stationT = STATION_T[index];
  const stationColor = useMemo(() => new THREE.Color(station.color), [station.color]);
  const defaultColor = useMemo(() => new THREE.Color("#184e3f"), []);

  const ringRef = useRef<THREE.Mesh>(null);
  const iconMeshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const connectorRef = useRef<THREE.LineSegments>(null);
  const activeLevel = useRef(0);

  // Icon texture
  const iconTexture = useMemo(
    () => createStationIconTexture(station.icon, station.color),
    [station.icon, station.color],
  );

  // Coupling collar geometry
  const collarGeo = useMemo(() => new THREE.CylinderGeometry(0.085, 0.085, 0.09, 24), []);
  const pulseGeo = useMemo(() => new THREE.RingGeometry(0.24, 0.28, 32), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const scrollP = journeyScroll.progress;
    
    // Check if fluid has reached or passed this station
    const isReached = scrollP >= stationT - 0.03;
    const isCurrentlyFocused = Math.abs(scrollP * (stations.length - 1) - index) < 0.6;
    
    const targetActivation = isReached ? (isCurrentlyFocused ? 1.0 : 0.7) : 0.0;
    activeLevel.current = damp(activeLevel.current, targetActivation, 5, dt);
    const a = activeLevel.current;

    const breathe = 1 + Math.sin(state.clock.elapsedTime * 2.5 + index) * 0.04;

    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.color.copy(defaultColor).lerp(stationColor, a);
      mat.emissive.copy(stationColor).multiplyScalar(a * 0.8);
      ringRef.current.scale.setScalar(1 + a * 0.25);
    }

    if (iconMeshRef.current) {
      const mat = iconMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + a * 0.8;
      iconMeshRef.current.scale.setScalar((0.55 + a * 0.35) * breathe);
    }

    if (pulseRef.current) {
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = a * 0.4;
      mat.color.copy(stationColor);
      pulseRef.current.scale.setScalar((1.0 + a * 0.5) * breathe);
    }
  });

  return (
    <group position={position}>
      {/* 3D Pipe Collar Coupling */}
      <mesh ref={ringRef} geometry={collarGeo}>
        <meshStandardMaterial
          color="#184e3f"
          roughness={0.3}
          metalness={0.8}
          emissive="#000000"
        />
      </mesh>

      {/* Floating 2.5D Activated Station Icon Billboard */}
      <Billboard position={[0, 0.28, 0]}>
        {/* Glowing Pulse Ring */}
        <mesh ref={pulseRef} geometry={pulseGeo}>
          <meshBasicMaterial
            color={station.color}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Station Icon Disc */}
        {iconTexture && (
          <mesh ref={iconMeshRef}>
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial
              map={iconTexture}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        )}
      </Billboard>
    </group>
  );
}

/** Fluid Flowing Bubbles / Droplets along active section */
function FluidBubbles() {
  const count = 12;
  const meshes = useRef<THREE.Mesh[]>([]);
  const bubbleGeo = useMemo(() => new THREE.SphereGeometry(0.018, 12, 12), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const progress = journeyScroll.progress;

    for (let i = 0; i < count; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      if (progress < 0.05) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      const t = (((time * 0.08 + i / count) % 1) * progress * 0.98);
      const point = PIPELINE_PATH.getPointAt(THREE.MathUtils.clamp(t, 0.01, 0.99));
      
      // Determine active fluid color
      const stationIdx = Math.min(
        stations.length - 1,
        Math.floor(t * (stations.length - 1)),
      );
      const color = stationThreeColors[stationIdx] || stationThreeColors[0];
      (mesh.material as THREE.MeshBasicMaterial).color.copy(color);

      mesh.position.copy(point);
      const scale = 0.8 + Math.sin(time * 3 + i) * 0.3;
      mesh.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          geometry={bubbleGeo}
          ref={(node) => {
            if (node) meshes.current[i] = node;
          }}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Ambient Atmospheric Dust Particles in the Forest Chamber */
function DustMotes() {
  const count = 350;
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = -Math.random() * 52 + 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.005;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#a7f3d0"
        size={0.024}
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Smooth Camera Rig Following Pipeline Progress with 2.5D Depth */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const travelled = useRef(0);
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0, -10), []);
  const tempTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetProgress = journeyScroll.progress;
    travelled.current = reduced
      ? targetProgress
      : damp(travelled.current, targetProgress, 3.2, dt);

    const p = travelled.current;
    const t = THREE.MathUtils.clamp(0.04 + p * 0.84, 0, 0.99);
    const pipePoint = PIPELINE_PATH.getPointAt(t);

    // Camera rides alongside the pipeline in 2.5D perspective
    const driftX = reduced ? 0 : pointer.x * 0.22;
    const driftY = reduced ? 0 : pointer.y * 0.12;

    camera.position.set(
      pipePoint.x - 0.25 + driftX,
      pipePoint.y + 0.65 + driftY,
      pipePoint.z + 0.55,
    );

    // Look ahead toward the next segment and the active station node
    const aheadPoint = PIPELINE_PATH.getPointAt(Math.min(t + 0.1, 0.999));
    const activeIdx = Math.round(
      THREE.MathUtils.clamp(p, 0, 1) * (stations.length - 1),
    );
    const currentStationPoint = stationPoints[activeIdx];

    tempTarget.copy(aheadPoint).lerp(currentStationPoint, 0.35);
    lookTarget.lerp(tempTarget, 1 - Math.exp(-4.5 * dt));
    camera.lookAt(lookTarget);
  });

  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={[colors.deep, 0.048]} />
      <color attach="background" args={[colors.deep]} />

      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#f0fdf4" />
      <pointLight position={[0, 2, -10]} intensity={1.5} color="#34d399" distance={25} />

      {/* 3D Pipeline & Fluid Simulation */}
      <Pipeline />
      <FluidBubbles />
      <DustMotes />

      {/* 6 Interactive Station Nodes along the Pipeline */}
      {stations.map((_, i) => (
        <StationNode key={i} index={i} />
      ))}

      <CameraRig reduced={reduced} />
    </>
  );
}

export default function JourneyScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 48, near: 0.1, far: 90 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <Scene reduced={reduced} />
    </Canvas>
  );
}
