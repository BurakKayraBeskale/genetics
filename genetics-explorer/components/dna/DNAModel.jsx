"use client";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import HolographicRim from "./HolographicRim";
import { COMPLEMENT } from "../../lib/genetics";
import RemovalLabel, { useRemovalLabels } from "./RemovalLabel";
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
function dampProgress(value, enabled, reduced, delta) {
  const target = Number(enabled);
  if (reduced || Math.abs(value - target) < 0.00001) return target;
  return THREE.MathUtils.damp(value, target, 3.8, delta);
}
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
  const segments = Math.max(120, total * 16);
  // Region selection only changes vertex colors; the tube topology stays cached.
  const geometry = useMemo(() => new THREE.TubeGeometry(
    makeHelixCurve(total, side), segments, DNA.tube, 20, false,
  ), [total, side, segments]);
  const outerGlow = useMemo(() => new THREE.TubeGeometry(
    makeHelixCurve(total, side), segments, DNA.tube * 2.05, 10, false,
  ), [total, side, segments]);
  const accent = useMemo(() => new THREE.TubeGeometry(
    makeHelixCurve(total, side, DNA.radius + DNA.tube * 0.94),
    segments, 0.021, 6, false,
  ), [total, side, segments]);
  useLayoutEffect(() => {
    const color = new THREE.Color();
    for (const [tube, radialSegments, isAccent] of [[geometry, 20, false], [accent, 6, true]]) {
      let attribute = tube.getAttribute("color");
      if (!attribute) {
        attribute = new THREE.BufferAttribute(new Float32Array(tube.attributes.position.count * 3), 3);
        tube.setAttribute("color", attribute);
      }
      for (let ring = 0; ring <= segments; ring++) {
        const index = Math.round((ring / segments) * (total - 1));
        const region = isAccent && regions.find((r) => index >= r.from && index <= r.to);
        color.set(isAccent ? REGION_COLORS[region?.kind] || "#9af3ff" : "#2fa4f0")
          .multiplyScalar(inRegion(index, activeRegion) ? 1 : isAccent ? 0.15 : 0.22);
        for (let radial = 0; radial <= radialSegments; radial++) {
          color.toArray(attribute.array, (ring * (radialSegments + 1) + radial) * 3);
        }
      }
      attribute.needsUpdate = true;
    }
  }, [geometry, accent, segments, total, activeRegion, regions]);
  // Own each lifetime separately: replacing one geometry must not dispose another.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => accent.dispose(), [accent]);
  useEffect(() => () => outerGlow.dispose(), [outerGlow]);
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
      {/* İç cam katmanı: gerçek kırılma/derinlik hisси veren fiziksel cam gövde */}
      <mesh geometry={geometry} onClick={select}>
        <meshPhysicalMaterial
          vertexColors
          metalness={0.04}
          roughness={0.07}
          transmission={0.7}
          thickness={0.55}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor="#2f8fe0"
          attenuationDistance={1.3}
          emissive="#0d7fcf"
          emissiveIntensity={0.24}
          envMapIntensity={1.6}
          specularIntensity={1}
        />
      </mesh>
      {/* Kenarlarda ince fresnel/edge highlight — camın kıvrımını belli eder */}
      <HolographicRim geometry={geometry} />
      {/* Dış glow shell: yumuşak, düşük opaklı hologram halesi (detayı boğmaz) */}
      <mesh geometry={outerGlow} raycast={NO_RAYCAST}>
        <meshBasicMaterial
          color="#6fd4ff"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
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
const Nucleotide = memo(function Nucleotide({
  index,
  total,
  side,
  base,
  selected,
  dimmed,
  progress,
  texture,
  removalTexture,
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
  const radialX = Math.cos(angle), radialZ = Math.sin(angle);
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
  const dirty = useRef(true), lastExplosion = useRef(-1);
  useLayoutEffect(() => { dirty.current = true; }, [refPosition, angle, selected, hovered, dimmed, removing]);
  useFrame((_, delta) => {
    const explosion = progress.current.explosion;
    if (!dirty.current && explosion === lastExplosion.current) return;
    lastExplosion.current = explosion;
    extraction.current = THREE.MathUtils.clamp(extraction.current + (removing ? 1 : -1) * delta / 0.95, 0, 1);
    const t = extraction.current;
    // Glow, release, a small inward withdrawal, then an eased outward flight.
    const flight = THREE.MathUtils.smoothstep(t, 0.22, 1);
    const withdrawal = t < 0.3 ? -0.12 * Math.sin(t / 0.3 * Math.PI) : 0;
    const displacement = withdrawal + flight * 2.65;
    const smoothing = 1 - Math.exp(-delta * 7);
    basePosition.current.lerp(refPosition, smoothing);
    const rotationDelta = THREE.MathUtils.euclideanModulo(-angle - orientation.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    orientation.current.rotation.y += rotationDelta * smoothing;
    const fade = 1 - THREE.MathUtils.smoothstep(t, 0.78, 1);
    material.current.opacity = (dimmed ? 0.2 : 1) * fade;
    letterMaterial.current.opacity = (dimmed ? 0.25 : 1) * fade;
    material.current.emissiveIntensity = t > 0 && t < 0.3 ? 0.6 + Math.sin(t / 0.3 * Math.PI) * 1.2 : dimmed ? 0.025 : selected ? 0.62 : hovered ? 0.5 : 0.3;
    const expansion = explosion * DNA.baseExplosion + displacement;
    group.current.position.set(
      basePosition.current.x + radialX * expansion,
      basePosition.current.y + flight * 0.3,
      basePosition.current.z + radialZ * expansion,
    );
    const scale = THREE.MathUtils.damp(
      capsule.current.scale.y,
      selected ? 1.32 : hovered ? 1.16 : 1,
      9,
      delta,
    );
    capsule.current.scale.set(1, scale, scale);
    dirty.current = t !== Number(Boolean(removing)) || basePosition.current.distanceToSquared(refPosition) > 1e-10 || Math.abs(rotationDelta) > 1e-5 || Math.abs(scale - (selected ? 1.32 : hovered ? 1.16 : 1)) > 1e-5;
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
              roughness={0.14}
              clearcoat={1}
              transmission={0.24}
              thickness={0.2}
              envMapIntensity={1.3}
              emissive={BASE_COLORS[base]}
              emissiveIntensity={
                dimmed ? 0.025 : selected ? 0.62 : hovered ? 0.5 : 0.3
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
      {removing && <RemovalLabel texture={removalTexture} position={[0, 0.35, 0]} />}
    </group>
    {abasic && <group position={refPosition} onClick={e => { e.stopPropagation(); onSelect(index, side); }} onContextMenu={e => onBaseContext(index, side, e)}>
      <Billboard><mesh><ringGeometry args={[0.09, 0.12, 20]} /><meshBasicMaterial color="#efc65e" transparent opacity={0.65} /></mesh></Billboard>
    </group>}
    </>
  );
});
function Strand({
  side,
  sequence,
  progress,
  letters,
  removalLabels,
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
          removalTexture={removalLabels[side ? COMPLEMENT[base] : base]}
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
  const meshes = useRef([]);
  const releases = useRef(new Map());
  const dirty = useRef(true);
  const lastProgress = useRef({ separation: -1, explosion: -1 });
  const rows = useMemo(() => sequence.split("").map((base, index) => ({
    count: "AT".includes(base) ? 2 : 3, index,
  })), [sequence]);
  const capacity = sequence.length * 3;
  const scratch = useMemo(() => ({
    start: new THREE.Vector3(), end: new THREE.Vector3(), direction: new THREE.Vector3(),
    center: new THREE.Vector3(), axis: new THREE.Vector3(1, 0, 0),
    quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(),
    parent: new THREE.Matrix4(), instance: new THREE.Matrix4(),
    local: new THREE.Matrix4(),
    cylinderRotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2),
    offset: new THREE.Vector3(), unitScale: new THREE.Vector3(1, 1, 1),
  }), []);
  const materials = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: "#caeefa", transparent: true, opacity: 0.7, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: "#caeefa", transparent: true, opacity: 0.12, depthWrite: false }),
  ], []);
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);
  useLayoutEffect(() => {
    dirty.current = true;
    const ids = new Set(tokens.map(token => token.id));
    for (const id of releases.current.keys()) if (!ids.has(id)) releases.current.delete(id);
  }, [tokens, pending, activeRegion, sequence]);
  useLayoutEffect(() => {
    for (const mesh of meshes.current) mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, [capacity]);
  useFrame((_, delta) => {
    const { separation, explosion } = progress.current;
    if (!dirty.current && separation === lastProgress.current.separation && explosion === lastProgress.current.explosion) return;
    lastProgress.current.separation = separation;
    lastProgress.current.explosion = explosion;
    const fade = Math.max(0, 1 - separation * 2.2 - explosion * 1.8);
    materials[0].opacity = fade * 0.7;
    materials[1].opacity = fade * 0.12;
    const counts = [0, 0];
    let animating = false;
    for (const { index, count } of rows) {
      const token = tokens[index];
      const damaged = token.ap.some(Boolean) || pending?.id === token.id;
      const target = damaged ? 1 : 0;
      let release = THREE.MathUtils.damp(releases.current.get(token.id) || 0, target, 18, delta);
      if (Math.abs(release - target) < 0.0001) release = target;
      else animating = true;
      releases.current.set(token.id, release);
      const bondScale = 1 - release;
      if (fade <= 0.01 || bondScale <= 0.01) continue;
      nucleotideInnerPoint(index, sequence.length, 0, separation, explosion, scratch.start);
      nucleotideInnerPoint(index, sequence.length, 1, separation, explosion, scratch.end);
      scratch.direction.subVectors(scratch.end, scratch.start);
      const length = scratch.direction.length();
      if (length <= 0.0001) continue;
      scratch.center.copy(scratch.start).add(scratch.end).multiplyScalar(0.5);
      scratch.quaternion.setFromUnitVectors(scratch.axis, scratch.direction.multiplyScalar(1 / length));
      scratch.scale.set(length, bondScale, bondScale);
      scratch.parent.compose(scratch.center, scratch.quaternion, scratch.scale);
      const batch = inRegion(index, activeRegion) ? 0 : 1;
      for (let n = 0; n < count; n++) {
        scratch.offset.set(0, (n - (count - 1) / 2) * 0.045, 0);
        scratch.local.compose(scratch.offset, scratch.cylinderRotation, scratch.unitScale);
        scratch.instance.multiplyMatrices(scratch.parent, scratch.local);
        meshes.current[batch].setMatrixAt(counts[batch]++, scratch.instance);
      }
    }
    for (let batch = 0; batch < 2; batch++) {
      const mesh = meshes.current[batch];
      mesh.count = counts[batch];
      mesh.visible = counts[batch] > 0;
      mesh.instanceMatrix.needsUpdate = true;
    }
    dirty.current = animating;
  });
  return <group>
    {materials.map((material, batch) => <instancedMesh
      key={batch + ":" + capacity}
      ref={mesh => { meshes.current[batch] = mesh; }}
      args={[geometry, material, capacity]}
      frustumCulled={false}
      raycast={NO_RAYCAST}
    />)}
  </group>;
}
export default function DNAModel({ separated, exploded, reduced, ...props }) {
  const letters = useLetters(),
    removalLabels = useRemovalLabels(),
    geometries = useModelGeometries(),
    progress = useRef({ separation: 0, explosion: 0 });
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    progress.current.separation = dampProgress(progress.current.separation, separated, reduced, step);
    progress.current.explosion = dampProgress(progress.current.explosion, exploded, reduced, step);
  });
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    [],
  );
  return (
    <group>
      <Strand {...props} side={0} progress={progress} letters={letters} removalLabels={removalLabels} geometries={geometries} />
      <Strand {...props} side={1} progress={progress} letters={letters} removalLabels={removalLabels} geometries={geometries} />
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
