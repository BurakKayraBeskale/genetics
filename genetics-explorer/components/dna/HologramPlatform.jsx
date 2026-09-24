"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { modelHeight } from "../../lib/dnaGeometry";
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
        {Array.from({ length: 48 }, (_, i) => {
          const a = (i * Math.PI * 2) / 48;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 2.61, 0.027, Math.sin(a) * 2.61]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[i % 4 === 0 ? 0.19 : 0.075, 0.008, 0.014]} />
              <meshBasicMaterial
                color="#68c9e9"
                transparent
                opacity={i % 4 === 0 ? 0.7 : 0.3}
              />
            </mesh>
          );
        })}
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
