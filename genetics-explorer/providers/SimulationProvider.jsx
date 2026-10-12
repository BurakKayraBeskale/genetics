'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useDiseaseSimulation from '../hooks/useDiseaseSimulation';
import { computeOutbreak } from '../lib/outbreak';
import * as archive from '../services/savedCases';
const SimulationContext = createContext(null);
export function useSimulation() {
  const value = useContext(SimulationContext);
  if (!value) throw new Error('Simülasyon sağlayıcısı bulunamadı.');
  return value;
}
export default function SimulationProvider({ children }) {
  const sim = useDiseaseSimulation();
  const [cases, setCases] = useState([]);
  const [error, setError] = useState('');
  const [previewDay, setPreviewDay] = useState(null);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const attempt = useCallback((action) => { try { const result = action(); setError(''); return result; } catch (cause) { setError(cause instanceof Error ? cause.message : 'İşlem tamamlanamadı.'); return null; } }, []);
  const refreshCases = useCallback(() => attempt(() => { const next = archive.getAllCases(); setCases(next); return next; }), [attempt]);
  useEffect(() => { refreshCases(); const handler = (event) => { if (event.key === archive.STORAGE_KEY || event.key === null) refreshCases(); }; window.addEventListener('storage', handler); return () => window.removeEventListener('storage', handler); }, [refreshCases]);
  const saveCase = useCallback((input = {}) => attempt(() => { const saved = archive.saveCase({ ...input, state: sim.state }); setCases(archive.getAllCases()); setActiveCaseId(saved.id); return saved; }), [attempt, sim.state]);
  const updateCase = useCallback((id, changes) => attempt(() => { const saved = archive.updateCase(id, changes); setCases(archive.getAllCases()); return saved; }), [attempt]);
  const starCase = useCallback((id) => attempt(() => { const saved = archive.toggleStar(id); setCases(archive.getAllCases()); return saved; }), [attempt]);
  const deleteCase = useCallback((id) => attempt(() => { const removed = archive.deleteCase(id); setCases(archive.getAllCases()); setActiveCaseId((current) => current === id ? null : current); return removed; }), [attempt]);
  const loadCase = useCallback((value) => attempt(() => { const saved = typeof value === 'string' ? archive.getCase(value) : value; if (!saved) throw new Error('Vaka bulunamadı.'); sim.restore(saved.snapshot); setPreviewDay(null); setActiveCaseId(saved.id); return saved; }), [attempt, sim.restore]);
  const restartCase = useCallback((value) => attempt(() => { const saved = typeof value === 'string' ? archive.getCase(value) : value; if (!saved) throw new Error('Vaka bulunamadı.'); sim.restart(archive.restoreSnapshot(saved.snapshot)); setPreviewDay(null); setActiveCaseId(null); return saved; }), [attempt, sim.restart]);
  const start = useCallback((...args) => attempt(() => { sim.start(...args); setPreviewDay(null); setActiveCaseId(null); return true; }), [attempt, sim.start]);
  const restart = useCallback((snapshot = sim.state) => attempt(() => { sim.restart(snapshot); setPreviewDay(null); setActiveCaseId(null); return true; }), [attempt, sim.restart, sim.state]);
  const selectDay = useCallback((day) => { setPreviewDay(day === null || day === undefined ? null : Number.isInteger(Number(day)) ? Number(day) : null); }, []);
  const previewState = useMemo(() => { const point = sim.state.timeline.find((item) => item.day === previewDay); return point ? { ...sim.state, ...point, timeline: sim.state.timeline.filter((item) => item.day <= point.day), publicHealthDecisions: sim.state.publicHealthDecisions.filter((item) => item.day <= point.day), doctorNotes: sim.state.doctorNotes.filter((item) => item.day <= point.day), bulletinHistory: sim.state.bulletinHistory.filter((item) => item.day <= point.day), events: sim.state.events.filter((item) => item.day <= point.day), finalOutcome: point.day === sim.state.day ? sim.state.finalOutcome : null, running: false, paused: true, status: 'paused' } : sim.state; }, [sim.state, previewDay]);
  const publicHealth = useMemo(() => computeOutbreak(sim.state), [sim.state]);
  const clearError = useCallback(() => setError(''), []);
  return <SimulationContext.Provider value={{ ...sim, start, restart, cases, error, refreshCases, saveCase, updateCase, starCase, toggleStar: starCase, deleteCase, loadCase, restoreCase: loadCase, restartCase, activeCaseId, publicHealth, outbreak: publicHealth, previewDay, previewState, selectDay, clearError }}>{children}</SimulationContext.Provider>;
}

