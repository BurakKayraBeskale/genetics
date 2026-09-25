"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Sparkles,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import BaseContextMenu from "./BaseContextMenu";
import { displayedBase } from "../lib/experiment";
import DNAModel from "./dna/DNAModel";
import HologramPlatform from "./dna/HologramPlatform";
import LaboratoryBackdrop from "./dna/LaboratoryBackdrop";
import { modelHeight } from "../lib/dnaGeometry";

function Scene({ resetSignal, autoRotate, reduced, ...props }) {
  const controls = useRef(),
    cameraTween = useRef(null);
  const { camera, size } = useThree();
  const initial = useRef(true);
  useEffect(() => {
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const height = modelHeight(props.sequence.length) + 3.5;
    const width = 6.6 + (props.separated ? 3.7 : 0) + (props.exploded ? 1.3 : 0) + (props.separated && props.exploded ? 1.9 : 0);
    const distance = Math.max(
      height / (2 * Math.tan(halfFov)),
      width / (2 * (size.width / size.height) * Math.tan(halfFov)),
    );
    const destination = new THREE.Vector3(0, 1.1, distance);
    if (initial.current || reduced) {
      camera.position.copy(destination);
      initial.current = false;
    }
    cameraTween.current = destination;
    controls.current?.target.set(0, -0.5, 0);
    controls.current?.update();
  }, [
    camera,
    size.width,
    size.height,
    props.sequence.length,
    props.separated,
    props.exploded,
    resetSignal,
    reduced,
  ]);
  useFrame((_, delta) => {
    if (cameraTween.current) {
      camera.position.lerp(cameraTween.current, 1 - Math.exp(-delta * 5));
      if (camera.position.distanceTo(cameraTween.current) < 0.008)
        cameraTween.current = null;
      controls.current?.update();
    }
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={2.5} color="#dcf5ff" />
      <pointLight position={[-4, 1, 4]} intensity={18} color="#598eff" />
      <pointLight position={[3, -2, -3]} intensity={12} color="#37dcff" />
      <Environment resolution={64} frames={1}>
        <Lightformer
          intensity={3}
          position={[-4, 3, 4]}
          scale={[2, 9, 1]}
          rotation={[0, Math.PI / 4, 0]}
          color="#c2efff"
        />
        <Lightformer
          intensity={2}
          position={[4, 2, 1]}
          scale={[1, 8, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#448dff"
        />
        <Lightformer
          intensity={1.5}
          position={[0, 6, -3]}
          scale={[7, 1, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#ffffff"
        />
      </Environment>
      <LaboratoryBackdrop total={props.sequence.length} />
      <DNAModel {...props} reduced={reduced} />
      <HologramPlatform total={props.sequence.length} reduced={reduced} />
      <Sparkles
        count={28}
        scale={[7, modelHeight(props.sequence.length) + 2, 5]}
        size={1.2}
        speed={reduced ? 0 : 0.12}
        opacity={0.18}
        color="#69cbe8"
      />
      <OrbitControls
        ref={controls}
        makeDefault
        enableZoom
        enableRotate
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        autoRotate={
          autoRotate && !reduced && !props.exploded && !props.separated
        }
        autoRotateSpeed={0.25}
        minDistance={6}
        maxDistance={70}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
        onStart={() => {
          cameraTween.current = null;
        }}
      />
      <EffectComposer multisampling={2}>
        <Bloom
          intensity={0.38}
          luminanceThreshold={1.05}
          luminanceSmoothing={0.25}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.25} darkness={0.35} />
      </EffectComposer>
    </>
  );
}
export default function DNAViewer({ exploded, onToggleExplode, onAction, menuRequest, ...props }) {
  const [menu, setMenu] = useState(null);
  const handled = useRef(false);
  const closeMenu = useCallback(() => setMenu(null), []);
  const menuToken = menu && props.tokens.find(t => t.id === menu.id);
  const openBaseMenu = (index, side, event) => {
    event.stopPropagation();
    event.nativeEvent?.preventDefault();
    event.sourceEvent?.preventDefault();
    handled.current = true;
    props.onSelect(index, side);
    setMenu({ id: props.tokens[index].id, side, x: event.clientX, y: event.clientY });
  };
  useEffect(() => {
    if (menuRequest) setMenu({ ...menuRequest, id: props.tokens[props.selectedIndex]?.id, side: props.selectedSide });
  }, [menuRequest]);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    change();
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  return (
    <div
      className="viewerShell productViewer"
      onContextMenu={(event) => {
        event.preventDefault();
        if (handled.current) { handled.current = false; return; }
        closeMenu();
        onToggleExplode?.();
      }}
    >
      <div className="viewerTopLabel">
        <span>CANLI MOLEKÜLER MODEL</span>
        <b>DNA // CAM SARMAL</b>
      </div>
      <Canvas
        camera={{ position: [0, 1.55, 17], fov: 36 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        fallback={<p>3B görünüm için WebGL destekli bir tarayıcı gerekiyor.</p>}
      >
        <color attach="background" args={["#020914"]} />
        <Scene {...props} exploded={exploded} reduced={reduced} onBaseContext={openBaseMenu} autoRotate={props.autoRotate && !menu && !props.pending} />
      </Canvas>
      {menuToken && <BaseContextMenu key={menu.id + ':' + menu.side} menu={menu} token={menuToken} side={menu.side} base={displayedBase(menuToken, menu.side)} busy={!!props.pending} canDelete={props.sequence.length > 3} onAction={onAction} onPair={() => props.onSelect(props.tokens.findIndex(t => t.id === menu.id), 1 - menu.side)} onClose={closeMenu} />}
      {props.pending && <div className="extractionStatus" role="status">{props.pending.removedBase} · {props.pending.kind === 'damage' ? 'Baz çıkarılıyor · AP hasarı' : 'Nükleotid siliniyor · Dizi yeniden kurulacak'}</div>}
      <div className="productMode" aria-live="polite">
        {exploded
          ? "SÖKÜM · SİMETRİK KATMANLAR"
          : props.separated
            ? "İKİ ZİNCİR · AYRILMIŞ"
            : "ÇİFT SARMAL · BÜTÜN YAPI"}
      </div>
      <div className="viewerHint">
        SOL SÜRÜKLE: DÖNDÜR <i /> TEKERLEK: ZOOM <i /> SAĞ TIK: BAZ MENÜSÜ / BOŞ ALANDA SÖK
      </div>
    </div>
  );
}
