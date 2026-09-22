'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMPLEMENT } from '../lib/genetics';

const BASE_COLORS = {
  A: '#ff4fd8',
  T: '#ffc857',
  G: '#4da3ff',
  C: '#52f5b2'
};

const REGION_COLORS = {
  promoter: '#4be6ff',
  exon: '#9a7cff',
  intron: '#ff62c7',
  gene: '#6dffbd'
};

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpMid = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

function getEndpoint(index, total, side, separation = 0, explosion = 0) {
  const angle = index * 0.58;
  const y = (index - (total - 1) / 2) * 0.36;
  const layerOffset = ((index % 3) - 1) * 0.13;
  const radial = 1.12 + separation * 0.98 + explosion * (0.76 + (index % 4) * 0.11);
  const sideAngle = angle + (side > 0 ? 0 : Math.PI) + explosion * layerOffset * side;
  const horizontalKick = explosion * side * (0.20 + (index % 2) * 0.12);
  const explodeY = explosion * (layerOffset * 1.2 + (index - total / 2) * 0.012);
  return [
    Math.cos(sideAngle) * radial + horizontalKick,
    y + explodeY,
    Math.sin(sideAngle) * radial + explosion * layerOffset * 0.6
  ];
}

function updateCylinder(mesh, start, end, radiusScale = 1) {
  if (!mesh) return;
  tmpA.set(...start);
  tmpB.set(...end);
  tmpMid.copy(tmpA).add(tmpB).multiplyScalar(0.5);
  tmpDir.copy(tmpB).sub(tmpA);
  const length = Math.max(0.001, tmpDir.length());
  tmpQuat.setFromUnitVectors(UP, tmpDir.normalize());
  mesh.position.copy(tmpMid);
  mesh.quaternion.copy(tmpQuat);
  mesh.scale.set(radiusScale, length, radiusScale);
}

function makeLetterTexture(letter, color) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.font = '900 76px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(letter, 64, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function HologramPlatform() {
  const root = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  useFrame((_, delta) => {
    if (root.current) root.current.rotation.z += delta * 0.04;
    if (ring1.current) ring1.current.rotation.z += delta * 0.22;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.15;
  });

  return (
    <group ref={root} position={[0, -4.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[2.45, 0.035, 12, 128]} />
        <meshBasicMaterial color="#41dcff" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring1}>
        <torusGeometry args={[1.95, 0.018, 10, 128]} />
        <meshBasicMaterial color="#826dff" transparent opacity={0.72} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[2.95, 0.014, 8, 128]} />
        <meshBasicMaterial color="#41dcff" transparent opacity={0.36} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[2.30, 72]} />
        <meshBasicMaterial color="#0a5b79" transparent opacity={0.11} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (Math.PI * 2 * i) / 16]} position={[0, 0, 0.01]}>
          <boxGeometry args={[0.025, i % 4 === 0 ? 0.42 : 0.20, 0.01]} />
          <meshBasicMaterial color="#65e9ff" transparent opacity={i % 4 === 0 ? 0.65 : 0.28} />
        </mesh>
      ))}
    </group>
  );
}

function BaseBlock({ innerRef, base, selected, dimmed, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => makeLetterTexture(base, BASE_COLORS[base]), [base]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <group ref={innerRef}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        scale={selected ? 1.22 : hovered ? 1.10 : 1}
      >
        <boxGeometry args={[0.56, 0.22, 0.34]} />
        <meshPhysicalMaterial
          color={BASE_COLORS[base]}
          emissive={BASE_COLORS[base]}
          emissiveIntensity={selected ? 3.1 : hovered ? 2.25 : 1.25}
          roughness={0.16}
          metalness={0.24}
          transmission={0.10}
          transparent
          opacity={dimmed ? 0.25 : 0.96}
        />
      </mesh>
      {texture && (
        <sprite position={[0, 0, 0.20]} scale={[0.32, 0.32, 0.32]}>
          <spriteMaterial map={texture} transparent opacity={dimmed ? 0.26 : 0.98} depthTest={false} />
        </sprite>
      )}
      {selected && (
        <mesh>
          <boxGeometry args={[0.72, 0.34, 0.47]} />
          <meshBasicMaterial color={BASE_COLORS[base]} transparent opacity={0.09} wireframe />
        </mesh>
      )}
    </group>
  );
}

function BasePair({ index, total, base, selected, progressRef, onSelect, dimmed, regionKind }) {
  const left = useRef();
  const right = useRef();
  const bond = useRef();
  const leftStub = useRef();
  const rightStub = useRef();
  const marker = useRef();
  const pair = COMPLEMENT[base] || 'T';
  const currentLeft = useRef(new THREE.Vector3(...getEndpoint(index, total, 1, 0, 0)));
  const currentRight = useRef(new THREE.Vector3(...getEndpoint(index, total, -1, 0, 0)));

  useFrame((_, delta) => {
    const separation = progressRef.current.separation;
    const explosion = progressRef.current.explosion;
    const targetLeft = tmpA.set(...getEndpoint(index, total, 1, separation, explosion));
    const targetRight = tmpB.set(...getEndpoint(index, total, -1, separation, explosion));
    const factor = 1 - Math.exp(-delta * 6.4);
    currentLeft.current.lerp(targetLeft, factor);
    currentRight.current.lerp(targetRight, factor);

    if (left.current) {
      left.current.position.copy(currentLeft.current);
      left.current.rotation.y = index * 0.58 + Math.PI / 2;
    }
    if (right.current) {
      right.current.position.copy(currentRight.current);
      right.current.rotation.y = index * 0.58 - Math.PI / 2;
    }

    const c1 = [currentLeft.current.x, currentLeft.current.y, currentLeft.current.z];
    const c2 = [currentRight.current.x, currentRight.current.y, currentRight.current.z];
    const radialLeft = currentLeft.current.clone().multiply(new THREE.Vector3(1.13, 1, 1.13));
    const radialRight = currentRight.current.clone().multiply(new THREE.Vector3(1.13, 1, 1.13));
    updateCylinder(bond.current, c1, c2, 1);
    updateCylinder(leftStub.current, c1, [radialLeft.x, radialLeft.y, radialLeft.z], 1);
    updateCylinder(rightStub.current, c2, [radialRight.x, radialRight.y, radialRight.z], 1);

    if (bond.current) bond.current.visible = separation < 0.83 && explosion < 0.70;

    if (marker.current) {
      marker.current.position.copy(currentLeft.current).add(currentRight.current).multiplyScalar(0.5);
      marker.current.rotation.z += delta * 0.32;
    }
  });

  return (
    <group>
      <BaseBlock innerRef={left} base={base} selected={selected} dimmed={dimmed} onSelect={onSelect} />
      <BaseBlock innerRef={right} base={pair} selected={selected} dimmed={dimmed} onSelect={onSelect} />

      <mesh ref={bond}>
        <cylinderGeometry args={[0.021, 0.021, 1, 8]} />
        <meshStandardMaterial color="#9af0ff" emissive="#9af0ff" emissiveIntensity={1.5} transparent opacity={dimmed ? 0.10 : 0.70} />
      </mesh>
      <mesh ref={leftStub}>
        <cylinderGeometry args={[0.045, 0.045, 1, 10]} />
        <meshStandardMaterial color={BASE_COLORS[base]} emissive={BASE_COLORS[base]} emissiveIntensity={1.35} transparent opacity={dimmed ? 0.20 : 0.88} />
      </mesh>
      <mesh ref={rightStub}>
        <cylinderGeometry args={[0.045, 0.045, 1, 10]} />
        <meshStandardMaterial color={BASE_COLORS[pair]} emissive={BASE_COLORS[pair]} emissiveIntensity={1.35} transparent opacity={dimmed ? 0.20 : 0.88} />
      </mesh>

      {selected && (
        <mesh ref={marker} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.028, 8, 72]} />
          <meshBasicMaterial color="#e4fcff" transparent opacity={0.86} />
        </mesh>
      )}

      {!dimmed && regionKind && (
        <pointLight position={[0, (index - (total - 1) / 2) * 0.36, 0]} intensity={selected ? 0.85 : 0.10} distance={2.4} color={REGION_COLORS[regionKind] || '#4be6ff'} />
      )}
    </group>
  );
}

function BackboneSegment({ index, total, side, progressRef, dimmed, color }) {
  const mesh = useRef();
  useFrame(() => {
    const separation = progressRef.current.separation;
    const explosion = progressRef.current.explosion;
    const start = getEndpoint(index, total, side, separation, explosion);
    const end = getEndpoint(index + 1, total, side, separation, explosion);
    const s = new THREE.Vector3(...start).multiply(new THREE.Vector3(1.18, 1, 1.18));
    const e = new THREE.Vector3(...end).multiply(new THREE.Vector3(1.18, 1, 1.18));
    updateCylinder(mesh.current, [s.x, s.y, s.z], [e.x, e.y, e.z], 1);
  });

  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[0.095, 0.095, 1, 14]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.55}
        transparent
        opacity={dimmed ? 0.16 : 0.82}
        roughness={0.16}
        metalness={0.20}
      />
    </mesh>
  );
}

function DNAModel({ sequence, selectedIndex, onSelect, separated, exploded, activeRegion, regions }) {
  const root = useRef();
  const progressRef = useRef({ separation: 0, explosion: 0 });
  const visibleSequence = useMemo(() => sequence.slice(0, 30), [sequence]);
  const total = visibleSequence.length;

  useFrame((state, delta) => {
    const sepTarget = separated ? 1 : 0;
    const expTarget = exploded ? 1 : 0;
    progressRef.current.separation = THREE.MathUtils.damp(progressRef.current.separation, sepTarget, 5.2, delta);
    progressRef.current.explosion = THREE.MathUtils.damp(progressRef.current.explosion, expTarget, 4.3, delta);
    if (root.current) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.055;
      root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.28) * 0.015;
    }
  });

  const regionFor = (index) => regions.find(r => index >= r.from && index <= r.to);
  const isDimmed = (index) => activeRegion ? !(index >= activeRegion.from && index <= activeRegion.to) : false;

  return (
    <group ref={root} scale={0.88}>
      {visibleSequence.split('').map((base, index) => {
        const region = regionFor(index);
        return (
          <BasePair
            key={`${index}-${base}`}
            index={index}
            total={total}
            base={base}
            selected={selectedIndex === index}
            progressRef={progressRef}
            onSelect={() => onSelect(index)}
            dimmed={isDimmed(index)}
            regionKind={region?.kind}
          />
        );
      })}
      {Array.from({ length: Math.max(0, total - 1) }).flatMap((_, index) => {
        const region = regionFor(index);
        const dimmed = isDimmed(index);
        return [
          <BackboneSegment key={`l-${index}`} index={index} total={total} side={1} progressRef={progressRef} dimmed={dimmed} color={region ? REGION_COLORS[region.kind] : '#48dfff'} />,
          <BackboneSegment key={`r-${index}`} index={index} total={total} side={-1} progressRef={progressRef} dimmed={dimmed} color={region ? REGION_COLORS[region.kind] : '#8b72ff'} />
        ];
      })}
    </group>
  );
}

function Scene({ resetSignal, autoRotate, ...props }) {
  const controls = useRef();

  useEffect(() => {
    if (!controls.current) return;
    controls.current.reset();
  }, [resetSignal]);

  return (
    <>
      <ambientLight intensity={0.46} />
      <pointLight position={[4.5, 6, 5]} intensity={34} color="#35d8ff" />
      <pointLight position={[-5, -1, 4]} intensity={24} color="#7f55ff" />
      <pointLight position={[0, -5, 1]} intensity={14} color="#2ce9ff" />
      <Stars radius={70} depth={26} count={1050} factor={2.0} fade speed={0.22} />
      <DNAModel {...props} />
      <HologramPlatform />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={5.7}
        maxDistance={13}
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI - 0.22}
        autoRotate={autoRotate}
        autoRotateSpeed={0.50}
        dampingFactor={0.06}
        enableDamping
      />
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
      <div className="viewerTopLabel"><span>CANLI MOLEKÜLER MODEL</span><b>3B DNA // ETKİLEŞİMLİ</b></div>
      <Canvas camera={{ position: [0, 0.1, 8.8], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#020711']} />
        <fog attach="fog" args={['#020711', 12, 24]} />
        <Scene {...props} exploded={exploded} />
      </Canvas>
      <div className="viewerHud hudLeft"><span /><span /><span /></div>
      <div className="viewerHud hudRight"><span /><span /><span /></div>
      <div className="viewerHint">SOL SÜRÜKLE: DÖNDÜR <i /> TEKERLEK: YAKINLAŞTIR <i /> SAĞ TIK: SÖK / TOPLA</div>

      <div className={`disassemblyNotice ${exploded ? 'open' : ''}`}>
        <div className="disassemblyIcon"><span /><span /><span /></div>
        <div>
          <small>{exploded ? 'SÖKÜM MODU AÇIK' : 'YAPISAL SÖKÜM'}</small>
          <strong>{exploded ? 'DNA parçaları ayrılmış görünümde' : 'DNA üzerinde sağ tıkla'}</strong>
          <p>
            {exploded
              ? 'Bu görünüm öğretim amaçlıdır. Baz çiftlerini tutan hidrojen bağlarının ayrılması iki zincirin açılmasına benzer; şeker-fosfat omurgasındaki kovalent bağların gerçekten kopması ise DNA hasarıdır ve hücrede onarım mekanizmalarını tetikler.'
              : 'Sağ tık, çift sarmalı katmanlarına ayırır. Böylece baz çiftlerini ve omurga yapısını ayrı ayrı inceleyebilirsin.'}
          </p>
        </div>
      </div>
    </div>
  );
}
