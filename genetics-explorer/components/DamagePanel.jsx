import { AP_EXPLANATION } from '../lib/experiment';
export default function DamagePanel({ tokens, pending, onUndo, canUndo }) {
  const count = tokens.reduce((n,t) => n + t.ap.filter(Boolean).length, 0);
  if (!count && pending?.kind !== 'damage') return null;
  return <div className="damagePanel" role="status">
    <strong>{pending?.kind === 'damage' ? 'Baz çıkarılıyor…' : 'Abazik (AP) bölge oluştu'}</strong>
    <p>{AP_EXPLANATION}</p>
    <small>{count} AP bölge · Dizi uzunluğu korunur · Delesyon değildir</small>
    <button onClick={onUndo} disabled={!canUndo}>Son işlemi geri al</button>
    <a href="https://www.ncbi.nlm.nih.gov/books/NBK21114/" target="_blank" rel="noreferrer">DNA hasarı ve onarımı hakkında</a>
  </div>;
}
