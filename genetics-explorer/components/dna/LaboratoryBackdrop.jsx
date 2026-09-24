"use client";
import { modelHeight } from "../../lib/dnaGeometry";

// Dim architectural strips give the product depth without a light volume over it.
export default function LaboratoryBackdrop({ total }) {
  const floor = -modelHeight(total) / 2 - 0.95;
  return (
    <group>
      <gridHelper args={[32, 32, "#102838", "#081925"]} position={[0, floor, 0]} />
      {[-7.5, -5, 5, 7.5].map((x) => (
        <group key={x} position={[x, 0, -6]}>
          <mesh>
            <boxGeometry args={[1.55, 22, 0.2]} />
            <meshBasicMaterial color="#04111e" />
          </mesh>
          <mesh position={[-0.68, 0, 0.12]}>
            <planeGeometry args={[0.025, 22]} />
            <meshBasicMaterial color="#125078" />
          </mesh>
          {[-5, -2.5, 0, 2.5, 5].map((y) => (
            <mesh key={y} position={[0, y, 0.13]}>
              <planeGeometry args={[1.3, 0.025]} />
              <meshBasicMaterial color="#11344b" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
