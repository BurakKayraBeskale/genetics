"use client";
import { memo, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BASE_INFO } from "../../lib/genetics";

const NO_RAYCAST = () => null;

// One texture per base for the model's lifetime, shared by both strands.
// Keeping labels inside WebGL avoids separate DOM roots during extraction/reset.
export function useRemovalLabels() {
  const textures = useMemo(() => Object.fromEntries(
    Object.entries(BASE_INFO).map(([base, info]) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 88;
      const context = canvas.getContext("2d");
      context.fillStyle = "rgba(6, 21, 34, 0.94)";
      context.strokeStyle = "rgba(239, 198, 94, 0.75)";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(2, 2, 508, 84, 16);
      context.fill();
      context.stroke();
      context.fillStyle = "#ffe6a4";
      context.font = "500 36px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(info.name.toLocaleUpperCase("tr-TR") + " ÇIKARILDI", 256, 46);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      return [base, texture];
    }),
  ), []);
  useEffect(() => () => Object.values(textures).forEach(texture => texture.dispose()), [textures]);
  return textures;
}

const RemovalLabel = memo(function RemovalLabel({ texture, position }) {
  const height = useThree(state => state.size.height);
  const camera = useThree(state => state.camera);
  // Match the former DOM label's readable pixel size, including when zooming.
  const pixel = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(1, height);
  return <sprite position={position} scale={[156 * pixel, 27 * pixel, 1]} renderOrder={1000} raycast={NO_RAYCAST}>
    <spriteMaterial map={texture} sizeAttenuation={false} transparent depthTest={false} depthWrite={false} toneMapped={false} />
  </sprite>;
});

export default RemovalLabel;
