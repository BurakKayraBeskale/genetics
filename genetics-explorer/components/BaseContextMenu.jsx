'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BASE_INFO } from '../lib/genetics';

export default function BaseContextMenu({ menu, token, side, base, busy, canDelete, onAction, onPair, onClose }) {
  const root = useRef();
  const restoreFocus = useRef(true);
  const [changing, setChanging] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8, maxHeight: 'calc(100dvh - 16px)' });

  // Measure the current menu instead of assuming a fixed height. The visual
  // viewport also accounts for zoom and the on-screen keyboard on phones.
  useLayoutEffect(() => {
    const place = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const rect = root.current.getBoundingClientRect();
      setPosition({
        left: Math.max(left + 8, Math.min(menu.x, left + width - rect.width - 8)),
        top: Math.max(top + 8, Math.min(menu.y, top + height - rect.height - 8)),
        maxHeight: Math.max(44, height - 16),
        maxWidth: Math.max(44, width - 16),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [menu.x, menu.y, changing]);

  useEffect(() => {
    const previous = document.activeElement;
    restoreFocus.current = true;
    const outside = event => {
      if (!root.current?.contains(event.target)) {
        // Let a tapped/clicked control keep its own focus.
        restoreFocus.current = false;
        onClose();
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      if (restoreFocus.current && previous?.isConnected) previous.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    root.current?.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  }, [changing, busy]);

  const key = event => {
    if (event.key === 'Escape' || (event.key === 'ArrowLeft' && changing)) {
      event.preventDefault();
      event.stopPropagation();
      if (changing) setChanging(false);
      else onClose();
      return;
    }
    if (event.key === 'Tab') {
      restoreFocus.current = false;
      onClose();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
    const index = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (index + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  const act = (kind, nextBase) => { onAction(kind, nextBase, { id: token.id, side }); onClose(); };
  const item = { role: 'menuitem', tabIndex: -1, type: 'button', style: { minHeight: 44 } };
  return createPortal(
    <div ref={root} role="menu" aria-label={changing ? `${BASE_INFO[base].name} bazını değiştir` : 'Baz işlemleri'} className="baseContextMenu"
      style={{ ...position, overflowY: 'auto', overscrollBehavior: 'contain' }} onKeyDown={key}
      onContextMenu={event => { event.preventDefault(); event.stopPropagation(); }}>
      <div className="contextTitle" role="presentation">{BASE_INFO[base].name} ({base}) · Zincir {side + 1}<small>{token.ap[side] ? 'Abazik (AP) bölge' : 'Tek baz üzerinde işlem'}</small></div>
      {!changing ? <>
        <button {...item} disabled={busy || token.ap[side]} onClick={() => act('damage')}>Bazı Çıkar</button>
        <button {...item} disabled={busy || !canDelete} onClick={() => act('delete')}>Nükleotidi Sil</button>
        <button {...item} disabled={busy || token.ap[side]} onClick={() => setChanging(true)}>Bazı Değiştir</button>
        <button {...item} onClick={() => { onPair(); onClose(); }}>Eş Bazı Göster</button>
      </> : <>
        {['A', 'T', 'G', 'C'].filter(nextBase => nextBase !== base).map(nextBase => <button {...item} key={nextBase} disabled={busy}
          aria-label={`${BASE_INFO[base].name} yerine ${BASE_INFO[nextBase].name}`}
          onClick={() => act('substitute', nextBase)}>{base} → {nextBase}</button>)}
        <button {...item} onClick={() => setChanging(false)}>Geri</button>
      </>}
      <button {...item} onClick={onClose}>İptal</button>
    </div>, document.body);
}
