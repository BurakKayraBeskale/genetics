import * as THREE from "three";

export const DNA = {
  radius: 1.85,
  rise: 0.275,
  twist: (Math.PI * 2) / 11.5,
  tube: 0.24,
  baseInner: 0.105,
  baseOuterInset: 0.075,
  baseRadius: 0.115,
  baseExplosion: 0.53,
  strandSeparation: 2.35,
  combinedSeparation: 0.95,
};
export const BASE_COLORS = {
  A: "#e861ca",
  T: "#efc65e",
  G: "#4ca6ff",
  C: "#42dcb0",
};
export const REGION_COLORS = {
  promoter: "#4be6ff",
  exon: "#8a72ff",
  intron: "#ff4fd8",
  gene: "#77e8c7",
};
export function helixPoint(index, total, side, radius = DNA.radius, target = new THREE.Vector3()) {
  const angle =
    index * DNA.twist - ((total - 1) * DNA.twist) / 2 + (side ? Math.PI : 0);
  return target.set(
    Math.cos(angle) * radius,
    (index - (total - 1) / 2) * DNA.rise,
    Math.sin(angle) * radius,
  );
}
// The base tips and their hydrogen bonds share the same model-space transform.
// Supply a target during animation to avoid allocating vectors on every frame.
export function nucleotideInnerPoint(
  index,
  total,
  side,
  separation = 0,
  explosion = 0,
  target = new THREE.Vector3(),
) {
  helixPoint(index, total, side, DNA.baseInner + explosion * DNA.baseExplosion, target);
  target.x += (side ? 1 : -1) * separation * (DNA.strandSeparation + explosion * DNA.combinedSeparation);
  return target;
}
export function makeHelixCurve(total, side, radius = DNA.radius) {
  const count = Math.max(24, total * 10);
  return new THREE.CatmullRomCurve3(
    Array.from({ length: count + 1 }, (_, i) =>
      helixPoint(
        -0.15 + (i / count) * (Math.max(total - 1, 0) + 0.3),
        total,
        side,
        radius,
      ),
    ),
    false,
    "centripetal",
  );
}
export const inRegion = (index, region) =>
  !region || (index >= region.from && index <= region.to);
export const modelHeight = (total) => Math.max(1, (total - 1) * DNA.rise);
