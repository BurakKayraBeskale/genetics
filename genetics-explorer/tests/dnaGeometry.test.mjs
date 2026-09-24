import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { DNA, helixPoint, makeHelixCurve, modelHeight, nucleotideInnerPoint } from '../lib/dnaGeometry.js';

test('every base pair joins opposite points at exactly the same height', () => {
  for (const total of [3,27,28,60]) for (let i=0;i<total;i++) {
    const a=helixPoint(i,total,0), b=helixPoint(i,total,1);
    assert.ok(Math.abs(a.x+b.x)<1e-10 && Math.abs(a.z+b.z)<1e-10);
    assert.equal(a.y,b.y);
    assert.ok(Math.abs(Math.hypot(a.x,a.z)-DNA.radius)<1e-10);
  }
});
test('Catmull-Rom spine passes through nucleotide attachment locations', () => {
  for (const total of [3,27,60]) for (const side of [0,1]) {
    const curve=makeHelixCurve(total,side);
    for(let i=0;i<total;i++) {
      const t=(i+0.15)/(total-1+0.3);
      assert.ok(curve.getPoint(t).distanceTo(helixPoint(i,total,side))<0.012);
    }
  }
});
test('continuous tubes have finite vertices and a stable upright footprint', () => {
  for(const total of [3,27,60]) {
    const geometry=new THREE.TubeGeometry(makeHelixCurve(total,0),total*16,DNA.tube,20,false);
    assert.ok([...geometry.attributes.position.array].every(Number.isFinite));
    geometry.computeBoundingBox();
    const bounds=geometry.boundingBox;
    assert.ok(Math.abs(bounds.max.y+bounds.min.y)<0.02);
    assert.ok(bounds.max.y-bounds.min.y>=modelHeight(total)-0.5);
    geometry.dispose();
  }
});
test('curve tangents turn smoothly without polygonal backbone joints', () => {
  const curve=makeHelixCurve(27,0);
  for(let i=1;i<=432;i++) assert.ok(curve.getTangent(i/432).angleTo(curve.getTangent((i-1)/432))<0.08);
});

test('hydrogen endpoints follow the base tips during separation and explosion', () => {
  for (const total of [3, 27, 60]) for (let index = 0; index < total; index++) {
    for (const [separation, explosion] of [[0, 0], [0.15, 0], [0.4, 0], [0, 0.5], [0.3, 0.6], [1, 1]]) {
      const tips = [0, 1].map((side) => nucleotideInnerPoint(index, total, side, separation, explosion));
      for (const side of [0, 1]) {
        // Independently reproduce the actual capsule transform: its radial center
        // moves outwards, while the entire strand translates horizontally.
        const spine = helixPoint(index, total, side);
        const radial = new THREE.Vector3(spine.x, 0, spine.z).normalize();
        const outer = DNA.radius - DNA.baseOuterInset;
        const halfLength = (outer - DNA.baseInner) / 2;
        const centerRadius = (outer + DNA.baseInner) / 2 + explosion * DNA.baseExplosion;
        const tip = radial.clone().multiplyScalar(centerRadius).addScaledVector(radial, -halfLength);
        tip.y = spine.y;
        tip.x += (side ? 1 : -1) * separation * (DNA.strandSeparation + explosion * DNA.combinedSeparation);
        assert.ok(tips[side].distanceTo(tip) < 1e-10);
      }
      const midpoint = tips[0].clone().add(tips[1]).multiplyScalar(0.5);
      const direction = tips[1].clone().sub(tips[0]);
      const length = direction.length();
      assert.ok(Math.abs(midpoint.x) < 1e-10 && Math.abs(midpoint.z) < 1e-10);
      if (length > 0.0001) {
        const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize());
        // A unit bond at the computed midpoint must end on both real base tips,
        // including rows rotated away from the global separation direction.
        for (const side of [0, 1]) {
          const end = new THREE.Vector3(side ? length / 2 : -length / 2, 0, 0)
            .applyQuaternion(rotation).add(midpoint);
          assert.ok(end.distanceTo(tips[side]) < 1e-10);
        }
      }
    }
  }
});

test('endpoint animation reuses a supplied vector and capsules overlap the backbone', () => {
  const target = new THREE.Vector3();
  assert.equal(nucleotideInnerPoint(4, 27, 1, 0.3, 0.5, target), target);
  assert.ok(DNA.baseOuterInset < DNA.tube);
  assert.ok(DNA.radius - DNA.baseOuterInset - DNA.baseInner > 2 * DNA.baseRadius);
});
test('separated strands remain apart while the backbone expands into exploded view', () => {
  for (const total of [3, 27, 60]) for (const explosion of [0, 0.25, 0.5, 0.75, 1]) {
    const offset = DNA.strandSeparation + explosion * DNA.combinedSeparation;
    const expansion = 1 + explosion * 0.48;
    let leftBoundary = -Infinity;
    let rightBoundary = Infinity;
    for (let step = 0; step <= total * 20; step++) {
      const index = -0.15 + step / (total * 20) * (total - 1 + 0.3);
      const left = helixPoint(index, total, 0);
      const right = helixPoint(index, total, 1);
      leftBoundary = Math.max(leftBoundary, (left.x + DNA.tube) * expansion - offset);
      rightBoundary = Math.min(rightBoundary, (right.x - DNA.tube) * expansion + offset);
    }
    assert.ok(leftBoundary < 0 && rightBoundary > 0, 'each backbone must remain on its own side');
    assert.ok(rightBoundary - leftBoundary > 0.4, 'expanded tubes need a visible center gap');
  }
});