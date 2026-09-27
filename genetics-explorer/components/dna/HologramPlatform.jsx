"use client";
import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { modelHeight } from "../../lib/dnaGeometry";
// Reuse one box mesh per opacity group instead of 48 separate draw calls.
function PlatformMarkings({ major }) {
  const mesh = useRef();
  useLayoutEffect(() => {
    const transform = new THREE.Object3D();
    let instance = 0;
    for (let i = 0; i < 48; i++) {
      if ((i % 4 === 0) !== major) continue;
      const angle = (i * Math.PI * 2) / 48;
      transform.position.set(Math.cos(angle) * 2.61, 0.027, Math.sin(angle) * 2.61);
      transform.rotation.set(0, -angle, 0);
      transform.updateMatrix();
      mesh.current.setMatrixAt(instance++, transform.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [major]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, major ? 12 : 36]} raycast={() => null}>
      <boxGeometry args={[major ? 0.19 : 0.075, 0.008, 0.014]} />
      <meshBasicMaterial color="#68c9e9" transparent opacity={major ? 0.7 : 0.3} />
    </instancedMesh>
  );
}

export default function HologramPlatform({ total, reduced }) {
  const markings = useRef();
  useFrame((_, dt) => {
    if (markings.current && !reduced) markings.current.rotation.y += dt * 0.055;
  });
  const y = -modelHeight(total) / 2 - 0.65;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[3.05, 3.22, 0.25, 96]} />
        <meshPhysicalMaterial
          color="#081727"
          metalness={0.8}
          roughness={0.42}
          clearcoat={1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 96]} />
        <meshPhysicalMaterial
          color="#071727"
          metalness={0.55}
          roughness={0.38}
          clearcoat={1}
        />
      </mesh>
      {[1.95, 2.35, 2.78, 3.07].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <torusGeometry args={[r, i === 1 ? 0.026 : 0.014, 8, 128]} />
          <meshStandardMaterial
            color="#278fca"
            emissive="#39cafa"
            emissiveIntensity={i === 1 ? 2 : 0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
      <group ref={markings}>
        <PlatformMarkings major />
        <PlatformMarkings major={false} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[1.5, 2.0, 96]} />
        <meshBasicMaterial
          color="#1289b6"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
