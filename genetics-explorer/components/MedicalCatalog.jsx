'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './MedicalCatalog.css';

const PAGE_SIZE = 20;
const TURKISH_TERMS = { grip: ['flu', 'influenza'], diyabet: ['diabetes'], şeker: ['diabetes'], kanser: ['cancer'], astım: ['asthma'], alzheimer: ['alzheimer'], hipertansiyon: ['high blood pressure'], tansiyon: ['blood pressure'], kalp: ['heart'], böbrek: ['kidney'], karaciğer: ['liver'], hepatit: ['hepatitis'], zatürre: ['pneumonia'], verem: ['tuberculosis'], tüberküloz: ['tuberculosis'], lösemi: ['leukemia'], anemi: ['anemia'], migren: ['migraine'], epilepsi: ['epilepsy'], depresyon: ['depression'], artrit: ['arthritis'], obezite: ['obesity'], tiroid: ['thyroid'], kistik: ['cystic'], fibrozis: ['fibrosis'] };
const normalize = value => String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const termEntries = Object.entries(TURKISH_TERMS).map(([key, value]) => [normalize(key), value]);
const safeUrl = url => { try { const parsed = new URL(url); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null; } catch { return null; } };
const supportsSimulation = topic => /^(flu|influenza)$/i.test(topic?.title || '');

function ResourceLinks({ label, resources }) {
  const valid = (resources || []).filter(item => safeUrl(item.url));
  return <section className="catalogResources"><h4>{label}</h4>{valid.length ? <ul>{valid.map((item, index) => <li key={`${item.url}-${index}`}><a href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer">{item.title}</a>{item.organization && <small>{item.organization}</small>}</li>)}</ul> : <p>Kaynak bu konu için ayrı bir bağlantı sunmuyor. Ana konu sayfasını inceleyebilirsiniz.</p>}</section>;
}

export default function MedicalCatalog({ onSimulate }) {
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setActive(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setActive(true); observer.disconnect(); } }, { rootMargin: '180px' });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    setError('');
    fetch('/data/medical-catalog.json', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Katalog yüklenemedi.'); return response.json(); }).then(result => { if (!Array.isArray(result.topics) || result.schemaVersion !== 1) throw new Error('Katalog biçimi desteklenmiyor.'); setData(result); }).catch(err => { if (err.name !== 'AbortError') setError(err.message || 'Katalog yüklenemedi.'); });
    return () => controller.abort();
  }, [active, attempt]);
  const groups = useMemo(() => [...new Set((data?.topics || []).flatMap(topic => topic.groups || []))].sort(), [data]);
  const filtered = useMemo(() => {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return (data?.topics || []).filter(topic => {
      if (group && !(topic.groups || []).includes(group)) return false;
      const haystack = normalize([topic.title, ...(topic.aliases || []), ...(topic.groups || [])].join(' '));
      return words.every(word => {
        const mapped = termEntries.find(([key]) => key === word)?.[1] || [];
        return haystack.includes(word) || mapped.some(term => haystack.split(/[^a-z0-9]+/).includes(normalize(term)) || (term.includes(' ') && haystack.includes(normalize(term))));
      });
    });
  }, [data, query, group]);
  const selected = data?.topics.find(topic => topic.id === selectedId);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const meta = data?.metadata;
  const updateQuery = value => { setQuery(value); setPage(0); };
  return <section id="hastalik-katalogu" className="medicalCatalog" ref={rootRef} aria-labelledby="catalog-title">
    <header className="catalogHeader"><div><span className="introKicker">KAYNAKLI SAĞLIK BİLGİSİ</span><h2 id="catalog-title">Hastalık ve Sağlık Konuları Kataloğu</h2></div>{data && <span className="catalogCount">{data.topics.length.toLocaleString('tr-TR')} konu</span>}</header>
    <p className="catalogIntro">MedlinePlus sağlık konularını keşfedin. Katalog hastalıkların yanında testleri ve sağlık başlıklarını da içerir; dünyadaki tüm hastalıkların eksiksiz listesi değildir. Kaynak metinleri İngilizcedir. Türkçe yaygın adlarla arama yapılabilir.</p>
    {!active && <button onClick={() => setActive(true)}>Kataloğu yükle</button>}
    {active && !data && !error && <p role="status">Kaynak kataloğu yükleniyor…</p>}
    {error && <div role="alert"><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Tekrar dene</button></div>}
    {data && <>
      <div className="catalogFilters"><label>Konu veya hastalık ara<input type="search" value={query} onChange={event => updateQuery(event.target.value)} placeholder="Örn. grip, diyabet, asthma" /></label><label>Konu grubu<select value={group} onChange={event => { setGroup(event.target.value); setPage(0); }}><option value="">Tüm gruplar</option>{groups.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div>
      <p className="catalogResultCount" role="status">{filtered.length.toLocaleString('tr-TR')} sonuç · Sayfa {safePage + 1} / {pages}</p>
      <div className="catalogLayout"><div>
        {visible.length ? <ul className="catalogList">{visible.map(topic => <li key={topic.id}><button aria-pressed={topic.id === selectedId} onClick={() => setSelectedId(topic.id)}><strong>{topic.title}</strong><small>{(topic.groups || []).join(' · ')}</small><span>{supportsSimulation(topic) ? 'Eğitim simülasyonu mevcut' : 'Bilgi kaydı'}</span></button></li>)}</ul> : <p>Aramanızla eşleşen konu bulunamadı. İngilizce adıyla veya daha kısa bir ifadeyle deneyin.</p>}
        <nav className="catalogPagination" aria-label="Katalog sayfaları"><button disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Önceki</button><span>{safePage + 1} / {pages}</span><button disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>Sonraki</button></nav>
      </div><article className="catalogDetail" aria-label="Seçilen sağlık konusu">
        {selected ? <><span className="catalogLanguage">KAYNAK METNİ İNGİLİZCE</span><h3>{selected.title}</h3><p className="catalogSummary">{selected.summaryPlainText || 'Bu konu için özet bulunmuyor. Resmî konu sayfasını inceleyebilirsiniz.'}</p>
          {safeUrl(selected.url) && <a className="catalogSourceLink" href={safeUrl(selected.url)} target="_blank" rel="noopener noreferrer">MedlinePlus konu sayfasını aç ↗</a>}
          <ResourceLinks label="Tedavi hakkında kaynaklar" resources={selected.sections?.treatment} />
          <ResourceLinks label="Olası sonuçlar ve komplikasyonlar hakkında kaynaklar" resources={selected.sections?.outcomes} />
          <ResourceLinks label="Tanı hakkında kaynaklar" resources={selected.sections?.diagnosis} />
          <div className="catalogSimulation">{supportsSimulation(selected) && onSimulate ? <><p>Influenza için sınırlı bir eğitim modeli bulunuyor. Klinik seyir veya tedavi başarısı tahmini üretmez.</p><button onClick={() => onSimulate('influenza')}>Influenza eğitim simülasyonunu aç</button></> : <p>Simülasyon modeli henüz desteklenmiyor. Bu konuya başka hastalıkların modeli uygulanmaz.</p>}</div>
        </> : <p>Özet, tedavi ve sonuç kaynaklarını görmek için listeden bir konu seçin.</p>}
      </article></div>
      <footer className="catalogAttribution"><p>Source: MedlinePlus, National Library of Medicine</p><p>Kaynak tarihi: {meta?.sourceDate || 'Belirtilmemiş'} · Veri alım tarihi: {meta?.fetchedAt ? new Date(meta.fetchedAt).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Belirtilmemiş'} · Katalog şeması: {data.schemaVersion}</p><p>Bağlantılar kaynakta listelenen sayfalardır; tüm tedavileri veya tüm olası sonuçları kapsadıkları iddia edilmez.</p>{safeUrl(meta?.sourceUrl) && <a href={safeUrl(meta.sourceUrl)} target="_blank" rel="noopener noreferrer">Veri kaynağı ve güncelleme bilgisi ↗</a>}</footer>
    </>}
  </section>;
}
