"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import HolographicRim from "./HolographicRim";
import { COMPLEMENT, BASE_INFO } from "../../lib/genetics";
import {
  DNA,
  BASE_COLORS,
  REGION_COLORS,
  helixPoint,
  makeHelixCurve,
  nucleotideInnerPoint,
  inRegion,
} from "../../lib/dnaGeometry";

const NO_RAYCAST = () => null;
function useModelGeometries() {
  const geometries = useMemo(() => {
    const length = DNA.radius - DNA.baseOuterInset - DNA.baseInner;
    return {
      capsule: new THREE.CapsuleGeometry(DNA.baseRadius, length - 2 * DNA.baseRadius, 6, 16),
      selection: new THREE.CapsuleGeometry(DNA.baseRadius + 0.03, length - 2 * DNA.baseRadius, 4, 12),
      letter: new THREE.PlaneGeometry(0.3, 0.3),
      bond: new THREE.CylinderGeometry(0.009, 0.009, 1, 6),
    };
  }, []);
  useEffect(
    () => () => Object.values(geometries).forEach((geometry) => geometry.dispose()),
    [geometries],
  );
  return geometries;
}
function useLetters() {
  const maps = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(BASE_COLORS).map((base) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 128;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.font = "bold 92px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(base, 64, 69);
          const map = new THREE.CanvasTexture(canvas);
          map.colorSpace = THREE.SRGBColorSpace;
          return [base, map];
        }),
      ),
    [],
  );
  useEffect(
    () => () => Object.values(maps).forEach((map) => map.dispose()),
    [maps],
  );
  return maps;
}
function ContinuousBackbone({
  total,
  side,
  progress,
  activeRegion,
  regions,
  onSelect,
}) {
  const group = useRef();
  const geometry = useMemo(() => {
    const segments = Math.max(120, total * 16);
    const tube = new THREE.TubeGeometry(
      makeHelixCurve(total, side),
      segments,
      DNA.tube,
      20,
      false,
    );
    const colors = new Float32Array(tube.attributes.position.count * 3);
    const color = new THREE.Color();
    for (let ring = 0; ring <= segments; ring++) {
      const index = Math.round((ring / segments) * (total - 1));
      color
        .set("#1686cb")
        .multiplyScalar(inRegion(index, activeRegion) ? 1 : 0.22);
      for (let radial = 0; radial <= 20; radial++)
        color.toArray(colors, (ring * 21 + radial) * 3);
    }
    tube.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return tube;
  }, [total, side, activeRegion]);
  const accent = useMemo(() => {
    const segments = Math.max(120, total * 16);
    const tube = new THREE.TubeGeometry(
      makeHelixCurve(total, side, DNA.radius + DNA.tube * 0.94),
      segments,
      0.021,
      6,
      false,
    );
    const colors = new Float32Array(tube.attributes.position.count * 3),
      color = new THREE.Color();
    for (let ring = 0; ring <= segments; ring++) {
      const index = Math.round((ring / segments) * (total - 1));
      const region = regions.find((r) => index >= r.from && index <= r.to);
      color
        .set(REGION_COLORS[region?.kind] || "#9af3ff")
        .multiplyScalar(inRegion(index, activeRegion) ? 1 : 0.15);
      for (let radial = 0; radial <= 6; radial++)
        color.toArray(colors, (ring * 7 + radial) * 3);
    }
    tube.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return tube;
  }, [total, side, activeRegion, regions]);
  useEffect(
    () => () => {
      geometry.dispose();
      accent.dispose();
    },
    [geometry, accent],
  );
  useFrame(() => {
    const expansion = 1 + progress.current.explosion * 0.48;
    group.current?.scale.set(expansion, 1, expansion);
  });
  const select = (e) => {
    e.stopPropagation();
    const local = e.object.worldToLocal(e.point.clone());
    onSelect(
      THREE.MathUtils.clamp(
        Math.round(local.y / DNA.rise + (total - 1) / 2),
        0,
        total - 1,
      ), side,
    );
  };
  return (
    <group ref={group}>
      <mesh geometry={geometry} onClick={select}>
        <meshPhysicalMaterial
          vertexColors
          metalness={0.22}
          roughness={0.12}
          transmission={0.58}
          thickness={0.42}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.09}
          emissive="#05629c"
          emissiveIntensity={0.38}
          envMapIntensity={1.2}
        />
      </mesh>
      <HolographicRim geometry={geometry} />
      <mesh geometry={accent} raycast={NO_RAYCAST}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      {[0, total - 1].map((index, key) => (
        <mesh
          key={key}
          position={helixPoint(index === 0 ? -0.15 : index + 0.15, total, side)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index, side);
          }}
        >
          <sphereGeometry args={[DNA.tube, 20, 16]} />
          <meshPhysicalMaterial
            color="#1686cb"
            metalness={0.25}
            roughness={0.12}
            transmission={0.2}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}
function Nucleotide({
  index,
  total,
  side,
  base,
  selected,
  dimmed,
  progress,
  texture,
  geometries,
  onSelect,
  onBaseContext,
  removing,
  abasic,
  arriving,
}) {
  const group = useRef(),
    capsule = useRef(), material = useRef(), letterMaterial = useRef(), orientation = useRef();
  const extraction = useRef(arriving ? 1 : 0);
  const [hovered, setHovered] = useState(false);
  const point = useMemo(
    () => helixPoint(index, total, side),
    [index, total, side],
  );
  const angle = Math.atan2(point.z, point.x);
  const inner = DNA.baseInner,
    outer = DNA.radius - DNA.baseOuterInset;
  const center = (inner + outer) / 2;
  const refPosition = useMemo(
    () =>
      new THREE.Vector3(
        Math.cos(angle) * center,
        point.y,
        Math.sin(angle) * center,
      ),
    [angle, center, point],
  );
  const basePosition = useRef(refPosition.clone());
  const initialPosition = useRef(refPosition.clone());
  const initialAngle = useRef(angle);
  useFrame((_, delta) => {
    extraction.current = THREE.MathUtils.clamp(extraction.current + (removing ? 1 : -1) * delta / 0.95, 0, 1);
    const t = extraction.current;
    // Glow, release, a small inward withdrawal, then an eased outward flight.
    const flight = THREE.MathUtils.smoothstep(t, 0.22, 1);
    const withdrawal = t < 0.3 ? -0.12 * Math.sin(t / 0.3 * Math.PI) : 0;
    const displacement = withdrawal + flight * 2.65;
    basePosition.current.lerp(refPosition, 1 - Math.exp(-delta * 7));
    const rotationDelta = Math.atan2(Math.sin(-angle - orientation.current.rotation.y), Math.cos(-angle - orientation.current.rotation.y));
    orientation.current.rotation.y += rotationDelta * (1 - Math.exp(-delta * 7));
    const fade = 1 - THREE.MathUtils.smoothstep(t, 0.78, 1);
    material.current.opacity = (dimmed ? 0.2 : 1) * fade;
    letterMaterial.current.opacity = (dimmed ? 0.25 : 1) * fade;
    material.current.emissiveIntensity = t > 0 && t < 0.3 ? 0.6 + Math.sin(t / 0.3 * Math.PI) * 1.2 : dimmed ? 0.025 : selected ? 0.5 : hovered ? 0.4 : 0.14;
    const expansion = progress.current.explosion * DNA.baseExplosion + displacement;
    group.current.position.set(
      basePosition.current.x + Math.cos(angle) * expansion,
      basePosition.current.y + flight * 0.3,
      basePosition.current.z + Math.sin(angle) * expansion,
    );
    const scale = THREE.MathUtils.damp(
      capsule.current.scale.y,
      selected ? 1.32 : hovered ? 1.16 : 1,
      9,
      delta,
    );
    capsule.current.scale.set(1, scale, scale);
  });
  const select = (e) => {
    e.stopPropagation();
    if (!removing) onSelect(index, side);
  };
  return (
    <>
    <group
      ref={group}
      position={initialPosition.current}
      onContextMenu={(event) => { if (!removing) onBaseContext(index, side, event); }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={orientation} rotation={[0, -initialAngle.current, 0]}>
        <group ref={capsule}>
          <mesh geometry={geometries.capsule} rotation={[0, 0, Math.PI / 2]} onClick={select}>
            <meshPhysicalMaterial ref={material}
              color={BASE_COLORS[base]}
              metalness={0.1}
              roughness={0.22}
              clearcoat={1}
              transmission={0.16}
              thickness={0.2}
              emissive={BASE_COLORS[base]}
              emissiveIntensity={
                dimmed ? 0.025 : selected ? 0.5 : hovered ? 0.4 : 0.14
              }
              transparent
              opacity={dimmed ? 0.2 : 1}
            />
          </mesh>
          {selected && !removing && (
            <mesh geometry={geometries.selection} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
              <meshBasicMaterial
                color={BASE_COLORS[base]}
                transparent
                opacity={0.1}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      </group>
      <Billboard>
        <mesh geometry={geometries.letter} position={[0, 0, 0.17]} onClick={select}>
          <meshBasicMaterial ref={letterMaterial}
            map={texture}
            transparent
            alphaTest={0.1}
            opacity={dimmed ? 0.25 : 1}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      {removing && <Html center position={[0, 0.35, 0]} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}><span className="removedBaseLabel">{BASE_INFO[base].name.toLocaleUpperCase('tr-TR')} ÇIKARILDI</span></Html>}
    </group>
    {abasic && <group position={refPosition} onClick={e => { e.stopPropagation(); onSelect(index, side); }} onContextMenu={e => onBaseContext(index, side, e)}>
      <Billboard><mesh><ringGeometry args={[0.09, 0.12, 20]} /><meshBasicMaterial color="#efc65e" transparent opacity={0.65} /></mesh></Billboard>
    </group>}
    </>
  );
}
function Strand({
  side,
  sequence,
  progress,
  letters,
  geometries,
  selectedIndex,
  selectedSide,
  tokens,
  pending,
  arrivals,
  activeRegion,
  ...props
}) {
  const root = useRef();
  useFrame(() => {
    root.current.position.x =
      (side ? 1 : -1) * progress.current.separation *
      (DNA.strandSeparation + progress.current.explosion * DNA.combinedSeparation);
  });
  return (
    <group ref={root}>
      <ContinuousBackbone
        total={sequence.length}
        side={side}
        progress={progress}
        activeRegion={activeRegion}
        {...props}
      />
      {sequence.split("").map((base, index) => (
        <Nucleotide
          key={tokens[index].id}
          index={index}
          total={sequence.length}
          side={side}
          base={side ? COMPLEMENT[base] : base}
          texture={letters[side ? COMPLEMENT[base] : base]}
          selected={selectedIndex === index && selectedSide === side}
          dimmed={!inRegion(index, activeRegion)}
          progress={progress}
          geometries={geometries}
          onSelect={props.onSelect}
          onBaseContext={props.onBaseContext}
          removing={tokens[index].ap[side] || (pending?.id === tokens[index].id && pending.side === side)}
          abasic={tokens[index].ap[side]}
          arriving={arrivals?.includes(tokens[index].id)}
        />
      ))}
    </group>
  );
}
function HydrogenBonds({ sequence, tokens, pending, progress, activeRegion, geometry }) {
  const group = useRef();
  const rows = useMemo(
    () => sequence.split("").map((base, index) => ({
      count: "AT".includes(base) ? 2 : 3,
      index,
    })),
    [sequence],
  );
  const scratch = useMemo(() => ({
    start: new THREE.Vector3(),
    end: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    axis: new THREE.Vector3(1, 0, 0),
  }), []);
  const materials = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: "#caeefa", transparent: true, opacity: 0.7, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: "#caeefa", transparent: true, opacity: 0.12, depthWrite: false }),
  ], []);
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);
  useFrame((_, delta) => {
    const { separation, explosion } = progress.current;
    const fade = Math.max(0, 1 - separation * 2.2 - explosion * 1.8);
    group.current.visible = fade > 0.01;
    materials[0].opacity = fade * 0.7;
    materials[1].opacity = fade * 0.12;
    if (!group.current.visible) return;
    for (const row of group.current.children) {
      const index = row.userData.index;
      nucleotideInnerPoint(index, sequence.length, 0, separation, explosion, scratch.start);
      nucleotideInnerPoint(index, sequence.length, 1, separation, explosion, scratch.end);
      scratch.direction.subVectors(scratch.end, scratch.start);
      const length = scratch.direction.length();
      row.position.copy(scratch.start).add(scratch.end).multiplyScalar(0.5);
      const damaged = tokens[index].ap.some(Boolean) || pending?.id === tokens[index].id;
      row.userData.release = THREE.MathUtils.damp(row.userData.release || 0, damaged ? 1 : 0, 18, delta);
      const bondScale = 1 - row.userData.release;
      row.visible = length > 0.0001 && bondScale > 0.01;
      if (row.visible) {
        row.quaternion.setFromUnitVectors(scratch.axis, scratch.direction.multiplyScalar(1 / length));
        row.scale.set(length, bondScale, bondScale);
      }
    }
  });
  return (
    <group ref={group}>
      {rows.map(({ count, index }) => (
        <group key={index} userData={{ index }}>
          {Array.from({ length: count }, (_, n) => (
            <mesh
              key={n}
              position={[0, (n - (count - 1) / 2) * 0.045, 0]}
              rotation={[0, 0, Math.PI / 2]}
              geometry={geometry}
              material={materials[inRegion(index, activeRegion) ? 0 : 1]}
              raycast={NO_RAYCAST}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
export default function DNAModel({ separated, exploded, reduced, ...props }) {
  const letters = useLetters(),
    geometries = useModelGeometries(),
    progress = useRef({ separation: 0, explosion: 0 });
  useFrame((_, delta) => {
    for (const [key, enabled] of [
      ["separation", separated],
      ["explosion", exploded],
    ])
      progress.current[key] = reduced
        ? Number(enabled)
        : THREE.MathUtils.damp(
            progress.current[key],
            Number(enabled),
            3.8,
            Math.min(delta, 0.05),
          );
  });
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    [],
  );
  return (
    <group>
      <Strand {...props} side={0} progress={progress} letters={letters} geometries={geometries} />
      <Strand {...props} side={1} progress={progress} letters={letters} geometries={geometries} />
      <HydrogenBonds
        sequence={props.sequence}
        progress={progress}
        activeRegion={props.activeRegion}
        geometry={geometries.bond}
        tokens={props.tokens}
        pending={props.pending}
      />
    </group>
  );
}
