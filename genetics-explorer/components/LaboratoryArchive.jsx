'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './LaboratoryArchive.css';

const TYPES = { viral: ['Viral enfeksiyon', '#55dfff'], genetic: ['Genetik vaka', '#be8dff'], bacterial: ['Bakteriyel vaka', '#78f2ad'], mixed: ['Karma vaka', '#ffc076'] };
const FILTERS = [['all', 'Tümü'], ['starred', 'Yıldızlılar'], ['viral', 'Viral'], ['genetic', 'Genetik'], ['bacterial', 'Bakteriyel'], ['mixed', 'Karma'], ['recent', 'Son Eklenenler']];
const METRICS = { pathogenLoad: 'Patojen yükü', infectedCells: 'Enfekte hücreler', innateImmunity: 'Doğal bağışıklık', adaptiveImmunity: 'Edinilmiş bağışıklık', antibodyLevel: 'Antikor', inflammation: 'İnflamasyon', tissueDamage: 'Doku hasarı' };
function display(value) { return typeof value === 'string' || typeof value === 'number' ? value : value?.label || value?.name || value?.text || 'Henüz belirlenmedi'; }
function Specimen({ category }) {
  return <svg className="archiveSpecimen" viewBox="0 0 120 220" aria-hidden="true">
    {category === 'genetic' || category === 'mixed' ? <g fill="none" stroke="currentColor" strokeWidth="3"><path d="M35 20 C110 60 10 100 85 140 S10 190 80 205"/><path d="M85 20 C10 60 110 100 35 140 S110 190 40 205"/>{Array.from({ length: 12 }, (_, i) => { const y = 27 + i * 15; const spread = Math.cos(i * .67) * 24; return <path key={i} d={`M${60 - spread} ${y} L${60 + spread} ${y}`} strokeWidth="5" opacity=".75"/>; })}</g> : category === 'bacterial' ? <g fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2">{[55, 107, 160].map((y, i) => <g key={y} transform={`rotate(${i % 2 ? 28 : -28} 60 ${y})`}><rect x="36" y={y - 14} width="48" height="28" rx="14"/><path d={`M84 ${y} q26 -18 15 -27 M37 ${y} q-20 12 -15 30`}/><circle cx="51" cy={y} r="3"/><circle cx="67" cy={y} r="3"/></g>)}</g> : <g stroke="currentColor" fill="currentColor" fillOpacity=".14" strokeWidth="2">{[55, 119, 179].map((y, i) => <g key={y} transform={`translate(${i === 1 ? 73 : 49} ${y})`}><circle r="20"/>{Array.from({ length: 8 }, (_, j) => <path key={j} transform={`rotate(${j * 45})`} d="M0 -20V-28m-4 0h8"/>)}<path d="M-10 1Q0 -15 10 1T-10 7" fill="none"/></g>)}</g>}
  </svg>;
}
function ArchiveDialog({ children, title, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const previous = document.activeElement; const dialog = ref.current; dialog.showModal(); return () => { dialog.close(); previous?.focus?.(); }; }, []);
  return <dialog className="archiveDialog" ref={ref} onCancel={onClose} aria-label={title} onClick={e => { if (e.target === ref.current) onClose(); }}><header><span className="microLabel">LABORATUVAR ARŞİVİ</span><button type="button" className="archiveClose" onClick={onClose} aria-label="Paneli kapat">×</button><h3>{title}</h3></header>{children}</dialog>;
}
export default function LaboratoryArchive({ cases = [], onRestart, onResume, onUpdate, onToggleStar, onDelete }) {
  const [filter, setFilter] = useState('all'); const [query, setQuery] = useState(''); const [selectedId, setSelectedId] = useState(null); const [mode, setMode] = useState('detail'); const [note, setNote] = useState(''); const [error, setError] = useState('');
  const selected = cases.find(item => item.id === selectedId);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('tr-TR');
    const matches = cases.filter(item => (!term || `${item.name} ${item.code}`.toLocaleLowerCase('tr-TR').includes(term)) && (filter === 'all' || filter === 'recent' || (filter === 'starred' ? item.isStarred : item.category === filter))).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filter === 'recent' ? matches.slice(0, 8) : matches;
  }, [cases, query, filter]);
  const close = () => { setSelectedId(null); setError(''); };
  function action(fn) { try { fn(); setError(''); } catch (err) { setError(err.message || 'İşlem tamamlanamadı.'); } }
  function download() { const url = URL.createObjectURL(new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${selected.code}-vaka.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  const snapshot = selected?.snapshot || {};
  return <section className="laboratoryArchive" aria-labelledby="archiveTitle">
    <div className="archiveHeading"><div><span className="microLabel">NUMUNE KOLEKSİYONU</span><h2 id="archiveTitle">Laboratuvar Arşivi</h2><p>Kaydettiğiniz anı açın, sınıfınızla yeniden keşfedin.</p></div><span className="archiveCount">{cases.length} kayıtlı vaka</span></div>
    <div className="archiveTools"><label className="archiveSearch"><span className="sr-only">Vaka adı veya kodu ara</span><input type="search" placeholder="Vaka adı veya kodu ara…" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="archiveFilters" aria-label="Vaka filtreleri">{FILTERS.map(([id, label]) => <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
    {filtered.length ? <div className="archiveShelf">{filtered.map(item => <button type="button" key={item.id} aria-pressed={selectedId === item.id} className={`archiveTube ${item.isStarred ? 'isStarred' : ''}`} style={{ '--sample': (TYPES[item.category] || TYPES.mixed)[1] }} onClick={() => { setSelectedId(item.id); setMode('detail'); setNote(item.teacherNote || ''); setError(''); }} aria-label={`${item.code}, ${item.name}, gün ${item.snapshot?.day ?? 0}${item.isStarred ? ', yıldızlı' : ''}`}>
      <span className="tubeAssembly"><span className="tubeCap"/><span className="tubeGlass"><span className="tubeReflection"/><Specimen category={item.category}/><span className="tubeMeasurement">{[1,2,3,4,5,6].map(n => <i key={n}/>)}</span></span><span className="tubeBase"/></span>
      <span className="tubeLabel"><span className="tubeCode">{item.code}{item.isStarred && <span aria-label="Yıldızlı"> ★</span>}</span><strong>{item.name}</strong><span>{(TYPES[item.category] || TYPES.mixed)[0]} · Gün {item.snapshot?.day ?? 0}</span></span>
    </button>)}</div> : <div className="archiveEmpty"><span aria-hidden="true">⌬</span><h3>{cases.length ? 'Eşleşen vaka bulunamadı' : 'İlk numunenizi kaydedin'}</h3><p>{cases.length ? 'Arama metnini veya filtreyi değiştirin.' : 'Hastalık simülasyonundaki “Vakayı Kaydet” işlemiyle koleksiyonunuzu oluşturun.'}</p></div>}
    {selected && <ArchiveDialog title={mode === 'delete' ? 'Vaka silinsin mi?' : selected.name} onClose={close}>
      {error && <p role="alert" className="archiveError">{error}</p>}
      {mode === 'delete' ? <><p><b>{selected.code}</b> arşivden kalıcı olarak silinecek. Açık simülasyonunuz etkilenmez.</p><div className="archiveActions"><button type="button" onClick={() => setMode('detail')}>Vazgeç</button><button type="button" className="danger" onClick={() => action(() => { onDelete(selected.id); close(); })}>Vakayı Sil</button></div></> : <>
        <div className="archiveDetailCode">{selected.code}<span>{selected.isStarred ? '★ Yıldızlı' : 'Numune kaydı'}</span></div><p>{selected.description}</p>
        <dl className="archiveFacts"><div><dt>Kategori</dt><dd>{(TYPES[selected.category] || TYPES.mixed)[0]}</dd></div><div><dt>Kaydedilen gün</dt><dd>{snapshot.day ?? 0}</dd></div><div><dt>Başlangıç ön tanısı</dt><dd>{display(snapshot.preliminaryDiagnosis)}</dd></div><div><dt>Son durum</dt><dd>{display(snapshot.finalOutcome || snapshot.currentDiagnosis)}</dd></div><div><dt>Oluşturulma tarihi</dt><dd>{new Date(selected.createdAt).toLocaleString('tr-TR')}</dd></div></dl>
        {mode === 'analysis' && <div className="archiveAnalysis"><h4>Kayıt anındaki sonuç analizi</h4><dl className="archiveFacts">{Object.entries(snapshot.metrics || {}).map(([key, value]) => <div key={key}><dt>{METRICS[key] || key}</dt><dd>{typeof value === 'number' ? value.toFixed(1) : display(value)}</dd></div>)}</dl><p><b>Belirtiler: </b>{snapshot.symptoms?.length ? snapshot.symptoms.map(display).join(', ') : 'Belirti yok'}</p><p><b>Tanı güveni: </b>{snapshot.diagnosisConfidence ?? '—'}</p>{snapshot.doctorNotes?.length > 0 && <div><b>Doktor notları</b><ul>{snapshot.doctorNotes.map((text, i) => <li key={i}>{display(text)}</li>)}</ul></div>}<button type="button" onClick={download}>Vaka raporunu indir (JSON)</button></div>}
        <div className="archiveNote"><label htmlFor="archiveTeacherNote">Öğretmen notu</label>{mode === 'note' ? <><textarea id="archiveTeacherNote" value={note} maxLength={2000} rows={4} onChange={e => setNote(e.target.value)}/><div className="archiveActions"><button type="button" onClick={() => setMode('detail')}>Vazgeç</button><button type="button" onClick={() => action(() => { onUpdate(selected.id, { teacherNote: note }); setMode('detail'); })}>Notu Kaydet</button></div></> : <p>{selected.teacherNote || 'Henüz not eklenmedi.'}</p>}</div>
        <div className="archiveActions"><button type="button" className="primary" onClick={() => action(() => { onRestart(selected.id); close(); })}>▶ Baştan Simüle Et</button><button type="button" className="primary" onClick={() => action(() => { onResume(selected.id); close(); })}>↪ Kaldığı Yerden Devam Et</button><button type="button" aria-pressed={mode === 'analysis'} onClick={() => setMode(mode === 'analysis' ? 'detail' : 'analysis')}>Sonuç Analizi</button><button type="button" onClick={() => { setNote(selected.teacherNote || ''); setMode('note'); }}>Notu Düzenle</button><button type="button" onClick={() => action(() => onToggleStar(selected.id))}>{selected.isStarred ? '☆ Yıldızı Kaldır' : '★ Yıldızla'}</button><button type="button" className="danger" onClick={() => setMode('delete')}>Sil</button></div>
      </>}
    </ArchiveDialog>}
  </section>;
}

