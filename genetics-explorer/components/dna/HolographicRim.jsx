"use client";
import * as THREE from "three";

const vertexShader = `
  varying vec3 vNormalView;
  varying vec3 vView;
  varying float vFocus;
  attribute vec3 color;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vView = -viewPosition.xyz;
    vFocus = clamp(max(max(color.r, color.g), color.b) * 2.0, 0.0, 1.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const fragmentShader = `
  varying vec3 vNormalView;
  varying vec3 vView;
  varying float vFocus;
  void main() {
    float edge = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vView))), 2.5);
    gl_FragColor = vec4(vec3(0.12, 0.64, 1.0) * 2.1, edge * 0.72 * vFocus);
  }
`;

// A view-dependent thin rim reveals glass curvature without washing out the bases.
export default function HolographicRim({ geometry }) {
  return (
    <mesh geometry={geometry} scale={1.002} raycast={() => null}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
