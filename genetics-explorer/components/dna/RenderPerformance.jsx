"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const MIN_DPR = 0.85;
const MAX_DPR = 1.5;

// Sampling does not request extra renders or update React state. Frame intervals
// include browser scheduling and rendering work; they are not GPU timings.
export default function RenderPerformance({ adaptive = true, transmissionScale = 0.75, onDprChange }) {
  const { gl, setDpr, get } = useThree();
  const samples = useRef({ elapsed: 0, values: [], good: 0, bad: 0, lastChange: 0 });
  const telemetry = useRef(null);
  const hudSamples = useRef({ elapsed: 0, values: [], calls: 0, triangles: 0 });

  useEffect(() => {
    const previousScale = gl.transmissionResolutionScale;
    gl.transmissionResolutionScale = transmissionScale;
    return () => { gl.transmissionResolutionScale = previousScale; };
  }, [gl, transmissionScale]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("perf") !== "1") return;
    const previousAutoReset = gl.info.autoReset;
    gl.info.autoReset = false;
    const node = document.createElement("output");
    node.dataset.renderPerformance = "true";
    node.setAttribute("aria-label", "3B performans ölçümü");
    Object.assign(node.style, {
      position: "absolute", left: "12px", top: "58px", zIndex: "10",
      padding: "7px 10px", color: "#b8edf5", background: "#020914df",
      border: "1px solid #347e8c", borderRadius: "7px", font: "11px monospace",
      whiteSpace: "pre-line", pointerEvents: "none",
    });
    node.textContent = "3B performans · örnekler toplanıyor…";
    gl.domElement.parentElement.appendChild(node);
    telemetry.current = node;
    return () => {
      telemetry.current = null;
      node.remove();
      gl.info.autoReset = previousAutoReset;
      gl.info.reset();
    };
  }, [gl]);

  useFrame((state, delta) => {
    const ms = delta * 1000;
    const visible = document.visibilityState === "visible";
    const valid = visible && ms > 0 && ms < 250;
    const node = telemetry.current;
    if (node) {
      const window = hudSamples.current;
      if (valid) {
        window.elapsed += delta;
        window.values.push(ms);
        // All passes from the previous frame, including transmission and Bloom.
        window.calls += gl.info.render.calls;
        window.triangles += gl.info.render.triangles;
      }
      if (window.elapsed >= 1 && window.values.length) {
        const sorted = [...window.values].sort((a, b) => a - b);
        const count = sorted.length;
        const mean = sorted.reduce((sum, value) => sum + value, 0) / count;
        const p95 = sorted[Math.ceil(count * 0.95) - 1];
        const calls = Math.round(window.calls / count);
        const triangles = Math.round(window.triangles / count);
        const dpr = gl.getPixelRatio();
        Object.assign(node.dataset, {
          meanMs: mean.toFixed(2), p95Ms: p95.toFixed(2), samples: String(count),
          calls: String(calls), triangles: String(triangles), dpr: dpr.toFixed(2),
          adaptive: String(adaptive),
        });
        node.textContent = "Kare aralığı: " + mean.toFixed(1) + " ms · p95 " + p95.toFixed(1) + " ms\n" +
          "Çizim: " + calls + " · Üçgen: " + triangles.toLocaleString("tr-TR") + " · DPR " + dpr.toFixed(2) + "\n" +
          "Tarayıcı kare aralığı; GPU süresi değildir · " + count + " örnek";
        window.elapsed = 0;
        window.values.length = 0;
        window.calls = 0;
        window.triangles = 0;
      }
      gl.info.reset();
    }
    if (!adaptive) return;
    const window = samples.current;
    if (!valid) {
      window.elapsed = 0;
      window.values.length = 0;
      window.good = 0;
      window.bad = 0;
      return;
    }
    window.elapsed += delta;
    window.values.push(ms);
    if (window.elapsed < 2 || window.values.length < 30) return;
    const mean = window.values.reduce((sum, value) => sum + value, 0) / window.values.length;
    window.good = mean < 17.5 ? window.good + 1 : 0;
    window.bad = mean > 22 ? window.bad + 1 : 0;
    const now = state.clock.elapsedTime;
    if (now - window.lastChange > 8) {
      const current = get().viewport.dpr;
      const ceiling = Math.min(windowDeviceDpr(), MAX_DPR);
      const next = window.bad >= 2 ? Math.max(MIN_DPR, current - 0.15) :
        window.good >= 4 ? Math.min(ceiling, current + 0.1) : current;
      if (Math.abs(next - current) > 0.01) {
        (onDprChange ?? setDpr)(Math.round(next * 100) / 100);
        window.lastChange = now;
        window.good = 0;
        window.bad = 0;
      }
    }
    window.elapsed = 0;
    window.values.length = 0;
  }, -100);
  return null;
}

function windowDeviceDpr() {
  return window.devicePixelRatio || 1;
}
