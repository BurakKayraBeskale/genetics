'use client';
import { useEffect, useRef, useState } from 'react';
import { initialExperiment, editExperiment, displayedBase } from '../lib/experiment';

export default function useDNAExperiment() {
  const [timeline, setTimeline] = useState({ entries: [initialExperiment()], cursor: 0 });
  const [selection, setSelection] = useState({ id: 'exon-1:4', side: 0 });
  const [pending, setPending] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const serial = useRef(0);
  const lock = useRef(false);
  const current = timeline.entries[timeline.cursor];
  const index = Math.max(0, current.tokens.findIndex(t => t.id === selection.id));
  const token = current.tokens[index];
  const commit = action => {
    setTimeline(previous => {
      const state = previous.entries[previous.cursor];
      const next = editExperiment(state, action);
      if (next === state) return previous;
      const entries = [...previous.entries.slice(0, previous.cursor + 1), next];
      return { entries, cursor: entries.length - 1 };
    });
  };
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      commit(pending);
      setSelection({ id: pending.nextId || pending.id, side: pending.side });
      setPending(null); lock.current = false;
    }, 1050);
    return () => clearTimeout(timer);
  }, [pending]);
  const act = (kind, base, target = selection) => {
    if (lock.current) return;
    const hit = current.tokens.find(t => t.id === target.id);
    if (!hit) return;
    const action = { kind, id: hit.id, side: target.side, base, newId: 'insert:' + ++serial.current };
    if (kind === 'delete' || kind === 'damage') {
      if (kind === 'delete' && current.tokens.length <= 3 || kind === 'damage' && hit.ap[target.side]) return;
      lock.current = true;
      const at = current.tokens.indexOf(hit);
      setPending({ ...action, removedBase: displayedBase(hit, target.side), nextId: kind === 'damage' ? hit.id : current.tokens[at + 1]?.id || current.tokens[at - 1]?.id });
    } else {
      setArrivals([]);
      commit(action);
      if (kind === 'insert' && current.tokens.length < 60) setSelection({ id: action.newId, side: target.side });
    }
  };
  const travel = cursor => {
    if (lock.current) return;
    const next = timeline.entries[cursor];
    if (!next) return;
    setArrivals(next.tokens.filter(t => !current.tokens.some(old => old.id === t.id)).map(t => t.id));
    setTimeline({ ...timeline, cursor });
    if (!next.tokens.some(t => t.id === selection.id)) setSelection({ id: next.tokens[Math.min(index, next.tokens.length - 1)].id, side: selection.side });
  };
  const reset = () => {
    lock.current = false; setPending(null);
    setArrivals(initialExperiment().tokens.filter(t => !current.tokens.some(old => old.id === t.id)).map(t => t.id));
    setTimeline({ entries: [initialExperiment()], cursor: 0 });
    setSelection({ id: 'exon-1:4', side: 0 });
  };
  return { current, index, token, selection, setSelection, pending, arrivals, act, reset,
    canUndo: !pending && timeline.cursor > 0, canRedo: !pending && timeline.cursor < timeline.entries.length - 1,
    undo: () => travel(timeline.cursor - 1), redo: () => travel(timeline.cursor + 1),
    select: (index, side = 0) => setSelection({ id: current.tokens[index]?.id || token.id, side }),
  };
}
