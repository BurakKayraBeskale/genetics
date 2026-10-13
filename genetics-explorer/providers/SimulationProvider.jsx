'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useDiseaseSimulation from '../hooks/useDiseaseSimulation';
import { SCENARIOS } from '../lib/simulation';
import { computeOutbreak } from '../lib/outbreak';
import { getCaseAtDay } from '../lib/caseView';
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
  const [studentView, setStudentView] = useState(false);
  const isMystery = !!sim.state.scenarioConfig.teaching?.mystery;
  const attempt = useCallback((action) => { try { const result = action(); setError(''); return result; } catch (cause) { setError(cause instanceof Error ? cause.message : 'İşlem tamamlanamadı.'); return null; } }, []);
  const refreshCases = useCallback(() => attempt(() => { const next = archive.getAllCases(); setCases(next); return next; }), [attempt]);
  useEffect(() => { refreshCases(); const handler = (event) => { if (event.key === archive.STORAGE_KEY || event.key === null) refreshCases(); }; window.addEventListener('storage', handler); return () => window.removeEventListener('storage', handler); }, [refreshCases]);
  const saveCase = useCallback((input = {}) => attempt(() => { const saved = archive.saveCase({ ...input, state: sim.state }); setCases(archive.getAllCases()); setActiveCaseId(saved.id); return saved; }), [attempt, sim.state]);
  const updateCase = useCallback((id, changes) => attempt(() => { const saved = archive.updateCase(id, changes); setCases(archive.getAllCases()); return saved; }), [attempt]);
  const starCase = useCallback((id) => attempt(() => { const saved = archive.toggleStar(id); setCases(archive.getAllCases()); return saved; }), [attempt]);
  const deleteCase = useCallback((id) => attempt(() => { const removed = archive.deleteCase(id); setCases(archive.getAllCases()); setActiveCaseId((current) => current === id ? null : current); return removed; }), [attempt]);
  const loadCase = useCallback((value) => attempt(() => { const saved = typeof value === 'string' ? archive.getCase(value) : value; if (!saved) throw new Error('Vaka bulunamadı.'); sim.restore(saved.snapshot); setStudentView(!!saved.snapshot.scenarioConfig.teaching?.mystery); setPreviewDay(null); setActiveCaseId(saved.id); return saved; }), [attempt, sim.restore]);
  const restartCase = useCallback((value) => attempt(() => { const saved = typeof value === 'string' ? archive.getCase(value) : value; if (!saved) throw new Error('Vaka bulunamadı.'); sim.restart(archive.restoreSnapshot(saved.snapshot)); setStudentView(!!saved.snapshot.scenarioConfig.teaching?.mystery); setPreviewDay(null); setActiveCaseId(null); return saved; }), [attempt, sim.restart]);
  const start = useCallback((...args) => attempt(() => { sim.start(...args); setStudentView(false); setPreviewDay(null); setActiveCaseId(null); return true; }), [attempt, sim.start]);
  const startVirtual = useCallback(profile => attempt(() => {
    sim.start(profile.id, {durationDays: profile.educationalParameters?.durationSteps || 14}, profile); sim.pause();
    setStudentView(!!profile.teaching?.mystery); setPreviewDay(null); setActiveCaseId(null); return true;
  }), [attempt, sim.start, sim.pause]);
  const startMystery = useCallback(id => attempt(() => {
    const profile = SCENARIOS.find(item => item.id === id); if (!profile) throw new Error('Profil bulunamadı.');
    sim.start(id, undefined, {...profile, teaching:{mystery:true}}); sim.pause(); setStudentView(true);setPreviewDay(null);setActiveCaseId(null);return true;
  }), [attempt, sim.start, sim.pause]);
  const restart = useCallback((snapshot = sim.state) => attempt(() => { sim.restart(snapshot); setPreviewDay(null); setActiveCaseId(null); return true; }), [attempt, sim.restart, sim.state]);
  const selectDay = useCallback((day) => { setPreviewDay(day === null || day === undefined ? null : Number.isInteger(Number(day)) ? Number(day) : null); }, []);
  const previewState = useMemo(() => getCaseAtDay(sim.state, previewDay), [sim.state, previewDay]);
  const publicHealth = useMemo(() => computeOutbreak(sim.state), [sim.state]);
  const clearError = useCallback(() => setError(''), []);
  return <SimulationContext.Provider value={{ ...sim, start, restart, startVirtual, startMystery, studentView, setStudentView, isMystery, cases, error, refreshCases, saveCase, updateCase, starCase, toggleStar: starCase, deleteCase, loadCase, restoreCase: loadCase, restartCase, activeCaseId, publicHealth, outbreak: publicHealth, previewDay, previewState, selectDay, clearError }}>{children}</SimulationContext.Provider>;
}

