'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitControls, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMPLEMENT } from '../lib/genetics';

const BASE_COLORS = {
  A: '#ff5bd8',
  T: '#ffd164',
  G: '#58a7ff',
  C: '#62ffbc'
};

const REGION_COLORS = {
  promoter: '#56ecff',
  exon: '#9976ff',
  intron: '#ff68cb',
  gene: '#69ffc9'
};

const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const tmpMid = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

function updateBetween(mesh, start, end, radius = 1) {
  if (!mesh) return;
  tmpA.copy(start);
  tmpB.copy(end);
  tmpMid.copy(tmpA).add(tmpB).multiplyScalar(0.5);
  tmpDir.copy(tmpB).sub(tmpA);
  const length = Math.max(0.0001, tmpDir.length());
  tmpQuat.setFromUnitVectors(UP, tmpDir.clone().normalize());
  mesh.position.copy(tmpMid);
  mesh.quaternion.copy(tmpQuat);
  mesh.scale.set(radius, length, radius);
}

function makeLetterTexture(letter, color) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.shadowColor = color;
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 150px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 128, 138);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function helixCore(index, total) {
  const t = index;
  const angle = t * 0.56;
  const y = (t - (total - 1) / 2) * 0.41;
  return { angle, y };
}

function getBasePosition(index, total, side, separation = 0, explosion = 0) {
  const { angle, y } = helixCore(index, total);
  const baseAngle = angle + (side === -1 ? Math.PI : 0);
  const radius = 1.18 + separation * 0.94;
  const localScatter = ((index % 4) - 1.5) * 0.10;
  const explodeRadial = explosion * (1.20 + (index % 3) * 0.22);
  const explodeY = explosion * (((index % 5) - 2) * 0.15);
  const explodeZ = explosion * side * localScatter * 0.8;

  return new THREE.Vector3(
    Math.cos(baseAngle) * (radius + explodeRadial),
    y + explodeY,
    Math.sin(baseAngle) * (radius + explodeRadial) + explodeZ
  );
}

function getBackbonePosition(index, total, side, separation = 0, explosion = 0) {
  const p = getBasePosition(index, total, side, separation, explosion).clone();
  const radialDir = p.clone().setY(0).normalize();
  return p.add(radialDir.multiplyScalar(0.55));
}

function HologramPlatform({ total }) {
  const root = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((_, delta) => {
    if (root.current) root.current.rotation.z += delta * 0.03;
    if (ring1.current) ring1.current.rotation.z += delta * 0.20;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.10;
    if (ring3.current) ring3.current.rotation.z += delta * 0.06;
  });

  return (
    <group ref={root} position={[0, -(total - 1) * 0.205 - 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[2.35, 2.80, 96]} />
        <meshBasicMaterial color="#37deff" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring1}>
        <torusGeometry args={[2.55, 0.03, 10, 128]} />
        <meshBasicMaterial color="#5df2ff" transparent opacity={0.85} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[2.08, 0.018, 10, 128]} />
        <meshBasicMaterial color="#9f83ff" transparent opacity={0.75} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[3.02, 0.015, 8, 128]} />
        <meshBasicMaterial color="#5df2ff" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[2.28, 72]} />
        <meshBasicMaterial color="#0b2137" transparent opacity={0.44} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[0, 0, 0.02]} rotation={[0, 0, (Math.PI * 2 * i) / 18]}>
          <boxGeometry args={[0.028, i % 3 === 0 ? 0.36 : 0.16, 0.01]} />
          <meshBasicMaterial color="#7af1ff" transparent opacity={i % 3 === 0 ? 0.65 : 0.22} />
        </mesh>
      ))}
    </group>
  );
}

function GlowColumn() {
  const mat = useRef();
  useFrame((state) => {
    if (mat.current) {
      mat.current.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });
  return (
    <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[1.9, 3.0, 9.2, 32, 1, true]} />
      <meshBasicMaterial ref={mat} color="#3ae6ff" transparent opacity={0.09} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Nucleotide({ base, selected, dimmed, positionRef, rotationY, onSelect }) {
  const group = useRef();
  const halo = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => makeLetterTexture(base, BASE_COLORS[base]), [base]);

  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.lerp(positionRef.current, 1 - Math.exp(-delta * 8));
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, rotationY.current, 7.5, delta);
    const targetScale = selected ? 1.12 : hovered ? 1.06 : 1;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-delta * 10));
    if (halo.current) {
      halo.current.material.opacity = dimmed ? 0.05 : selected ? 0.18 : hovered ? 0.12 : 0.08;
    }
  });

  return (
    <group ref={group}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <capsuleGeometry args={[0.12, 0.42, 6, 14]} />
        <meshPhysicalMaterial
          color={BASE_COLORS[base]}
          emissive={BASE_COLORS[base]}
          emissiveIntensity={selected ? 4.3 : hovered ? 3.0 : 2.1}
          roughness={0.08}
          metalness={0.10}
          transmission={0.30}
          transparent
          opacity={dimmed ? 0.22 : 0.95}
          thickness={0.4}
        />
      </mesh>

      <mesh ref={halo} rotation={[0, 0, Math.PI / 2]} scale={[1.28, 1.28, 1.28]}>
        <capsuleGeometry args={[0.12, 0.44, 4, 10]} />
        <meshBasicMaterial color={BASE_COLORS[base]} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {texture && (
        <sprite position={[0, 0, 0.16]} scale={[0.24, 0.24, 0.24]}>
          <spriteMaterial map={texture} transparent opacity={dimmed ? 0.25 : 1} depthTest={false} />
        </sprite>
      )}
    </group>
  );
}

function BasePair({ index, total, base, selected, progress, onSelect, dimmed, regionKind }) {
  const pair = COMPLEMENT[base] || 'T';
  const leftRef = useRef(new THREE.Vector3());
  const rightRef = useRef(new THREE.Vector3());
  const leftRot = useRef(0);
  const rightRot = useRef(0);
  const bond = useRef();
  const leftAnchor = useRef();
  const rightAnchor = useRef();
  const selectedRing = useRef();

  useFrame((state, delta) => {
    const left = getBasePosition(index, total, 1, progress.current.separation, progress.current.explosion);
    const right = getBasePosition(index, total, -1, progress.current.separation, progress.current.explosion);
    const leftBack = getBackbonePosition(index, total, 1, progress.current.separation, progress.current.explosion);
    const rightBack = getBackbonePosition(index, total, -1, progress.current.separation, progress.current.explosion);

    leftRef.current.lerp(left, 1 - Math.exp(-delta * 8));
    rightRef.current.lerp(right, 1 - Math.exp(-delta * 8));
    leftRot.current = -index * 0.56;
    rightRot.current = -index * 0.56 - Math.PI;

    if (leftAnchor.current) updateBetween(leftAnchor.current, leftRef.current, leftBack, 1);
    if (rightAnchor.current) updateBetween(rightAnchor.current, rightRef.current, rightBack, 1);
    if (bond.current) {
      updateBetween(bond.current, leftRef.current, rightRef.current, 1);
      bond.current.material.opacity = dimmed ? 0.06 : THREE.MathUtils.lerp(0.58, 0.02, Math.min(1, progress.current.separation * 0.92 + progress.current.explosion * 0.5));
      bond.current.visible = progress.current.explosion < 0.95;
    }

    if (selectedRing.current) {
      selectedRing.current.position.copy(leftRef.current).lerp(rightRef.current, 0.5);
      selectedRing.current.rotation.z += delta * 0.24;
      selectedRing.current.visible = selected;
    }
  });

  return (
    <group>
      <Nucleotide base={base} selected={selected} dimmed={dimmed} positionRef={leftRef} rotationY={leftRot} onSelect={onSelect} />
      <Nucleotide base={pair} selected={selected} dimmed={dimmed} positionRef={rightRef} rotationY={rightRot} onSelect={onSelect} />

      <mesh ref={bond}>
        <cylinderGeometry args={[0.016, 0.016, 1, 12]} />
        <meshBasicMaterial color="#c0fbff" transparent opacity={0.58} />
      </mesh>

      <mesh ref={leftAnchor}>
        <cylinderGeometry args={[0.034, 0.034, 1, 12]} />
        <meshPhysicalMaterial color={BASE_COLORS[base]} emissive={BASE_COLORS[base]} emissiveIntensity={1.5} transparent opacity={dimmed ? 0.16 : 0.82} roughness={0.10} transmission={0.28} />
      </mesh>
      <mesh ref={rightAnchor}>
        <cylinderGeometry args={[0.034, 0.034, 1, 12]} />
        <meshPhysicalMaterial color={BASE_COLORS[pair]} emissive={BASE_COLORS[pair]} emissiveIntensity={1.5} transparent opacity={dimmed ? 0.16 : 0.82} roughness={0.10} transmission={0.28} />
      </mesh>

      <mesh ref={selectedRing} rotation={[Math.PI / 2, 0, 0]} visible={selected}>
        <torusGeometry args={[0.82, 0.025, 8, 60]} />
        <meshBasicMaterial color={regionKind ? (REGION_COLORS[regionKind] || '#e0ffff') : '#e0ffff'} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function BackboneSegment({ index, total, side, progress, dimmed, color }) {
  const mesh = useRef();
  const glow = useRef();

  useFrame(() => {
    const s = getBackbonePosition(index, total, side, progress.current.separation, progress.current.explosion);
    const e = getBackbonePosition(index + 1, total, side, progress.current.separation, progress.current.explosion);
    if (mesh.current) updateBetween(mesh.current, s, e, 1);
    if (glow.current) {
      updateBetween(glow.current, s, e, 1.1);
      glow.current.material.opacity = dimmed ? 0.06 : 0.12 + progress.current.explosion * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <cylinderGeometry args={[0.075, 0.075, 1, 16]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.75}
          roughness={0.08}
          metalness={0.05}
          transmission={0.45}
          transparent
          opacity={dimmed ? 0.16 : 0.78}
        />
      </mesh>
      <mesh ref={glow}>
        <cylinderGeometry args={[0.12, 0.12, 1, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function BackboneBundle({ total, side, progress, dimIndices, regions }) {
  return (
    <group>
      {Array.from({ length: Math.max(0, total - 1) }).map((_, index) => {
        const region = regions.find((r) => index >= r.from && index <= r.to);
        const dimmed = dimIndices(index);
        const color = region ? REGION_COLORS[region.kind] : side === 1 ? '#42e8ff' : '#7e85ff';
        return (
          <BackboneSegment
            key={`${side}-${index}`}
            index={index}
            total={total}
            side={side}
            progress={progress}
            dimmed={dimmed}
            color={color}
          />
        );
      })}
    </group>
  );
}

function DNAModel({ sequence, selectedIndex, onSelect, separated, exploded, activeRegion, regions }) {
  const root = useRef();
  const progress = useRef({ separation: 0, explosion: 0 });
  const visibleSequence = sequence;
  const total = visibleSequence.length;

  useFrame((state, delta) => {
    progress.current.separation = THREE.MathUtils.damp(progress.current.separation, separated ? 1 : 0, 4.6, delta);
    progress.current.explosion = THREE.MathUtils.damp(progress.current.explosion, exploded ? 1 : 0, 3.8, delta);

    if (root.current) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.28) * 0.012;
    }
  });

  const dimIndices = (index) => activeRegion ? !(index >= activeRegion.from && index <= activeRegion.to) : false;
  const regionFor = (index) => regions.find((r) => index >= r.from && index <= r.to);

  return (
    <group ref={root} scale={1.0}>
      <GlowColumn />
      <BackboneBundle total={total} side={1} progress={progress} dimIndices={dimIndices} regions={regions} />
      <BackboneBundle total={total} side={-1} progress={progress} dimIndices={dimIndices} regions={regions} />

      {visibleSequence.split('').map((base, index) => (
        <BasePair
          key={`${index}-${base}`}
          index={index}
          total={total}
          base={base}
          selected={selectedIndex === index}
          progress={progress}
          onSelect={() => onSelect(index)}
          dimmed={dimIndices(index)}
          regionKind={regionFor(index)?.kind}
        />
      ))}
    </group>
  );
}

function Scene({ resetSignal, autoRotate, ...props }) {
  const controls = useRef();
  const { camera, size } = useThree();
  useEffect(() => {
    controls.current?.reset();
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const sceneHeight = Math.max(7, (props.sequence.length - 1) * 0.41 + 3.2);
    const distance = Math.max(sceneHeight / (2 * Math.tan(halfFov)), 4.6 / ((size.width / size.height) * Math.tan(halfFov)));
    camera.position.set(0, 0.65, distance);
    controls.current?.target.set(0, -0.35, 0);
    controls.current?.update();
  }, [camera, size.width, size.height, props.sequence.length, resetSignal]);

  return (
    <>
      <ambientLight intensity={0.75} />
      <pointLight position={[3.6, 4.6, 3.2]} intensity={48} distance={20} color="#49ddff" />
      <pointLight position={[-3.6, 2.2, 5.5]} intensity={36} distance={20} color="#8e6bff" />
      <pointLight position={[0, -4, 2.2]} intensity={18} distance={16} color="#65f8ff" />
      <spotLight position={[0, 8, 5]} intensity={55} angle={0.34} penumbra={0.7} color="#95efff" />
      <Stars radius={75} depth={18} count={800} factor={3} saturation={0} fade speed={0.18} />
      <Sparkles size={3} scale={[6, 12, 6]} count={90} speed={0.25} color="#8ef4ff" opacity={0.35} />

      <DNAModel {...props} />
      <HologramPlatform total={props.sequence.length} />

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.42}
        minDistance={5.8}
        maxDistance={60}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI - 0.28}
      />

      <EffectComposer>
        <Bloom intensity={1.25} luminanceThreshold={0.14} luminanceSmoothing={0.75} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

export default function DNAViewer({ exploded, onToggleExplode, ...props }) {
  const handleContextMenu = (event) => {
    event.preventDefault();
    onToggleExplode?.();
  };

  return (
    <div className="viewerShell" onContextMenu={handleContextMenu}>
      <div className="viewerScanline" />
      <div className="viewerTopLabel"><span>CANLI MOLEKÜLER MODEL</span><b>3B DNA // HOLOGRAFİK SAHNE</b></div>
      <Canvas camera={{ position: [0, 0.15, 8.2], fov: 40 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#010611']} />
        <Scene {...props} exploded={exploded} />
      </Canvas>
      <div className="viewerHud hudLeft"><span /><span /><span /></div>
      <div className="viewerHud hudRight"><span /><span /><span /></div>
      <div className="viewerHint">SOL SÜRÜKLE: DÖNDÜR <i /> TEKERLEK: YAKINLAŞTIR <i /> SAĞ TIK: SÖK / TOPLA</div>

      <div className={`disassemblyNotice ${exploded ? 'open' : ''}`}>
        <div className="disassemblyIcon"><span /><span /><span /></div>
        <div>
          <small>{exploded ? 'SÖKÜM MODU AÇIK' : 'YAPISAL SÖKÜM'}</small>
          <strong>{exploded ? 'DNA kontrollü biçimde katmanlarına ayrıldı' : 'DNA üzerinde sağ tıkla'}</strong>
          <p>
            {exploded
              ? 'Bu görünüm eğitim amaçlı bir patlatılmış yerleşimdir. Baz çiftlerini ayıran hidrojen bağları açılabilir; fakat şeker-fosfat omurgasındaki kovalent bağların gerçekten kırılması DNA hasarı anlamına gelir ve onarım mekanizmalarını tetikler.'
              : 'Sağ tık, çift sarmalı öğretici bir patlatılmış görünüme taşır. Böylece baz çiftlerini, omurga yapısını ve zincir organizasyonunu daha net inceleyebilirsin.'}
          </p>
        </div>
      </div>
    </div>
  );
}
