'use client';
import { BASE_INFO } from '../lib/genetics';

export default function BaseNavigator({ index, total, side, base, missing, region, busy, onSelect, onMenu }) {
  return (
    <div className="baseNavigator" role="group" aria-label="Baz seçimi ve işlemleri">
      <button type="button" aria-label="Önceki bazı seç" disabled={busy || index === 0} onClick={() => onSelect(index - 1, side)}>←</button>
      <div className="navigatorReadout" aria-live="polite">
        <b>{missing ? 'AP' : base} · {index + 1}/{total}</b>
        <small>{BASE_INFO[base].name} · {region?.label}</small>
      </div>
      <button type="button" aria-label="Sonraki bazı seç" disabled={busy || index === total - 1} onClick={() => onSelect(index + 1, side)}>→</button>
      <button type="button" className="navigatorPair" disabled={busy} onClick={() => onSelect(index, 1 - side)} aria-label="Eş zincirdeki bazı seç">Zincir {side + 1} ⇄</button>
      <button type="button" className="navigatorActions" disabled={busy} aria-haspopup="menu" onClick={onMenu}>Baz işlemleri</button>
    </div>
  );
}
