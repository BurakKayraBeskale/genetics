'use client';
import { useCallback, useEffect, useState } from 'react';
import { createSimulation, advanceSimulation, applyIntervention, setSimulationStatus } from '../lib/simulation';
import { applyPublicHealthDecision, enrichObservations } from '../lib/outbreak';
import { restoreSnapshot } from '../services/savedCases';
const advance = (current) => enrichObservations(current, advanceSimulation(current));
export default function useDiseaseSimulation() {
  const [state, setState] = useState(() => createSimulation());
  useEffect(() => {
    if (!state.running || state.finalOutcome) return undefined;
    const timer = setInterval(() => setState((current) => current.running ? advance(current) : current), state.config.speedMs);
    return () => clearInterval(timer);
  }, [state.running, state.finalOutcome, state.config.speedMs]);
  const start = useCallback((id = 'influenza', config) => { const next = setSimulationStatus(createSimulation(id, config), 'running'); setState(next); }, []);
  const pause = useCallback(() => setState((current) => setSimulationStatus(current, 'paused')), []);
  const resume = useCallback(() => setState((current) => setSimulationStatus(current, 'running')), []);
  const step = useCallback(() => setState((current) => advance(setSimulationStatus(current, 'paused'))), []);
  const intervene = useCallback((kind) => setState((current) => applyIntervention(current, kind)), []);
  const decide = useCallback((kind) => setState((current) => applyPublicHealthDecision(current, kind)), []);
  const setSpeed = useCallback((speedMs) => { const value = Number(speedMs); if (!Number.isFinite(value)) return; setState((current) => ({ ...current, config: { ...current.config, speedMs: Math.max(500, Math.min(10000, value)) } })); }, []);
  const restore = useCallback((snapshot) => { const next = setSimulationStatus(restoreSnapshot(snapshot), 'paused'); setState(next); }, []);
  const restart = useCallback((snapshot) => { const next = createSimulation(snapshot.diseaseScenarioId, snapshot.config, snapshot.initialScenarioConfig || snapshot.scenarioConfig); setState(next); }, []);
  return { state, start, pause, resume, step, intervene, restore, restart, setSpeed, decide };
}
