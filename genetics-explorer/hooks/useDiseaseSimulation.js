'use client';
import { useCallback, useEffect, useState } from 'react';
import { createSimulation, advanceSimulation, applyIntervention, setSimulationStatus } from '../lib/simulation';

export default function useDiseaseSimulation() {
  const [state, setState] = useState(() => createSimulation());
  useEffect(() => {
    if (!state.running || state.finalOutcome) return undefined;
    const timer = setInterval(() => setState((current) => current.running ? advanceSimulation(current) : current), state.config.speedMs);
    return () => clearInterval(timer);
  }, [state.running, state.finalOutcome, state.config.speedMs]);
  const start = useCallback((id = 'influenza', config) => setState(setSimulationStatus(createSimulation(id, config), 'running')), []);
  const pause = useCallback(() => setState((current) => setSimulationStatus(current, 'paused')), []);
  const resume = useCallback(() => setState((current) => setSimulationStatus(current, 'running')), []);
  const step = useCallback(() => setState((current) => advanceSimulation(setSimulationStatus(current, 'paused'))), []);
  const intervene = useCallback((kind) => setState((current) => applyIntervention(current, kind)), []);
  const restore = useCallback((snapshot) => setState(setSimulationStatus(JSON.parse(JSON.stringify(snapshot)), 'paused')), []);
  const restart = useCallback((snapshot) => setState(createSimulation(snapshot.diseaseScenarioId, snapshot.config, snapshot.initialScenarioConfig || snapshot.scenarioConfig)), []);
  return { state, start, pause, resume, step, intervene, restore, restart };
}
