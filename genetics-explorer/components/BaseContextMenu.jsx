'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BASE_INFO } from '../lib/genetics';

export default function BaseContextMenu({ menu, token, side, base, busy, canDelete, onAction, onPair, onClose }) {
  const root = useRef();
  const [changing, setChanging] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    root.current?.querySelector('button:not(:disabled)')?.focus();
    const outside = e => { if (!root.current?.contains(e.target)) onClose(); };
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
        const i = buttons.indexOf(document.activeElement);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', onClose);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); window.removeEventListener('resize', onClose); previous?.focus?.(); };
  }, [onClose]);
  const act = (kind, nextBase) => { onAction(kind, nextBase, { id: token.id, side }); onClose(); };
  return createPortal(
    <div ref={root} role="menu" aria-label="Baz işlemleri" className="baseContextMenu"
      style={{ left: Math.max(8, Math.min(menu.x, window.innerWidth - 258)), top: Math.max(8, Math.min(menu.y, window.innerHeight - 310)) }}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}>
      <div className="contextTitle">{BASE_INFO[base].name} ({base}) · Zincir {side + 1}<small>{token.ap[side] ? 'Abazik (AP) bölge' : 'Tek baz üzerinde işlem'}</small></div>
      {!changing ? <>
        <button role="menuitem" disabled={busy || token.ap[side]} onClick={() => act('damage')}>Bazı Çıkar</button>
        <button role="menuitem" disabled={busy || !canDelete} onClick={() => act('delete')}>Nükleotidi Sil</button>
        <button role="menuitem" disabled={busy || token.ap[side]} onClick={() => setChanging(true)}>Bazı Değiştir</button>
        <button role="menuitem" onClick={() => { onPair(); onClose(); }}>Eş Bazı Göster</button>
      </> : <>
        {['A','T','G','C'].filter(b => b !== base).map(b => <button role="menuitem" key={b} disabled={busy} onClick={() => act('substitute', b)}>{base} → {b}</button>)}
        <button role="menuitem" onClick={() => setChanging(false)}>Geri</button>
      </>}
      <button role="menuitem" onClick={onClose}>İptal</button>
    </div>, document.body);
}
