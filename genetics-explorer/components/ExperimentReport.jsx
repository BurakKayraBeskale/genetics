'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { AP_EXPLANATION, ORIGINAL, REGION_DEFINITIONS, codingSequence, sequenceOf, transcribedSequence } from '../lib/experiment';
import { dnaToMrna, translateMrna } from '../lib/genetics';

const ACTION_NAMES = { damage: 'Baz çıkarma (AP hasarı)', delete: 'Nükleotid silme', insert: 'Baz ekleme', substitute: 'Baz değiştirme' };
const REGION_NAMES = Object.fromEntries(REGION_DEFINITIONS.map(region => [region.id, region.label]));
const MODEL_NOTE = 'Bu 27 baz çiftlik başlangıç dizisi bir eğitim mini-genidir; gerçek bir gen veya klinik tahmin değildir. Kodlayan zincir 5′ → 3′ yönünde gösterilir. Olgun mRNA, yalnızca ekzonların normal splicing ile birleştiği varsayımıyla hesaplanır. Çeviri ilk kodondan başlar ve ilk dur kodonunda sonlanır; eksik son kodon çevrilmez.';

function snapshot(tokens) {
  const codingDNA = codingSequence(tokens);
  const mrna = dnaToMrna(codingDNA);
  return {
    dna: sequenceOf(tokens),
    codingDNA,
    preMrna: dnaToMrna(transcribedSequence(tokens)),
    matureMrna: mrna,
    codons: mrna.match(/.{1,3}/g) || [],
    translation: translateMrna(mrna),
    incompleteFinalCodon: mrna.length % 3 ? mrna.slice(-(mrna.length % 3)) : null,
    regions: REGION_DEFINITIONS.map(region => ({ id: region.id, name: region.label, dna: sequenceOf(tokens.filter(token => token.regionId === region.id)) })),
  };
}

function buildReport(current, mutation) {
  return {
    formatVersion: 1,
    title: 'Genetik Keşif — Deney Raporu',
    exportedAt: new Date().toISOString(),
    modelNote: MODEL_NOTE,
    original: snapshot(ORIGINAL),
    current: snapshot(current.tokens),
    analysis: {
      type: mutation.type,
      effect: mutation.effect,
      proteinChanged: mutation.proteinChanged,
      explanation: mutation.explanation,
      notes: mutation.notes || [],
      sequenceInterpretation: mutation.damage ? 'AP hasarında gösterilen diziler ve çeviri, kayıtlı baz kimliklerine aittir; hasarlı DNA için gerçekleşecek biyolojik sonucu göstermez.' : 'Kodlayan ekzon dizisi üzerinden hesaplanan model sonucu.',
    },
    apDamage: {
      explanation: AP_EXPLANATION,
      sites: current.tokens.flatMap((token, index) => token.ap.flatMap((damaged, side) => damaged ? [{ tokenId: token.id, position: index + 1, strand: side === 0 ? 'Kodlayan zincir' : 'Tamamlayıcı zincir', region: REGION_NAMES[token.regionId], recordedCodingBase: token.base }] : [])),
    },
    history: current.events.map((event, index) => ({
      step: index + 1,
      action: ACTION_NAMES[event.kind] || event.kind,
      positionAtOperation: event.index + 1,
      strand: event.side === 0 ? 'Kodlayan zincir' : 'Tamamlayıcı zincir',
      region: REGION_NAMES[event.regionId],
      beforeBase: event.base,
      targetBase: event.target || null,
    })),
    historyNote: 'İşlem konumları işlem anındaki dizide 1’den başlar. Geçmiş yalnızca geçerli deney dalındaki uygulanmış işlemleri içerir; geri alınmış işlemler dahil değildir. Eklemede yeni baz, seçilen konumun önüne eklenir.',
  };
}

function proteinText(value) {
  return value.translation.map(item => item.aminoAcid === 'Stop' ? 'Dur' : item.aminoAcid).join(' – ') || '(Çevrilebilir tam kodon yok)';
}

function textReport(report) {
  const answer = report.analysis.proteinChanged === null ? 'ÖNGÖRÜLEMEZ' : report.analysis.proteinChanged ? 'EVET' : 'HAYIR';
  const sequenceBlock = (label, value) => [
    label,
    `DNA (5′ → 3′): ${value.dna || '(Boş)'}`,
    `Kodlayan ekzonlar: ${value.codingDNA || '(Boş)'}`,
    `Öncül mRNA: ${value.preMrna || '(Boş)'}`,
    `Olgun mRNA: ${value.matureMrna || '(Boş)'}`,
    `Kodonlar: ${value.codons.join(' | ') || '(Boş)'}`,
    `Protein: ${proteinText(value)}`,
    ...(value.incompleteFinalCodon ? [`Çevrilmeyen eksik son kodon: ${value.incompleteFinalCodon}`] : []),
    ...value.regions.map(region => `${region.name}: ${region.dna || '(Boş)'}`),
  ].join('\n');
  return [
    report.title,
    `Tarih: ${new Date(report.exportedAt).toLocaleString('tr-TR')}`,
    report.modelNote,
    sequenceBlock('ORİJİNAL', report.original),
    sequenceBlock('GÜNCEL KAYITLI DİZİ', report.current),
    [
      'SONUÇ',
      `Mutasyon türü: ${report.analysis.type}`,
      `Moleküler etki: ${report.analysis.effect}`,
      `Bu mutasyon proteini değiştirdi mi? ${answer}`,
      report.analysis.explanation,
      report.analysis.sequenceInterpretation,
      ...report.analysis.notes,
    ].join('\n'),
    ['AP HASARI', report.apDamage.sites.length ? report.apDamage.sites.map(site => `${site.position}. konum · ${site.strand} · ${site.region}`).join('\n') : 'AP bölgesi yok.', ...(report.apDamage.sites.length ? [report.apDamage.explanation] : [])].join('\n'),
    ['İŞLEM GEÇMİŞİ', report.historyNote, ...report.history.map(event => `${event.step}. ${event.action} · ${event.region} · ${event.positionAtOperation}. konum · ${event.strand} · ${event.beforeBase}${event.targetBase ? ' → ' + event.targetBase : ''}`), ...(!report.history.length ? ['Henüz işlem uygulanmadı.'] : [])].join('\n'),
  ].join('\n\n');
}

function ExperimentReport({ current, mutation, busy = false }) {
  const [status, setStatus] = useState('');
  const downloads = useRef(new Map());
  useEffect(() => () => {
    downloads.current.forEach((timer, url) => { clearTimeout(timer); URL.revokeObjectURL(url); });
    downloads.current.clear();
  }, []);

  function download(format) {
    if (busy) return;
    let url;
    try {
      const report = buildReport(current, mutation);
      const contents = format === 'json' ? JSON.stringify(report, null, 2) : '\uFEFF' + textReport(report);
      url = URL.createObjectURL(new Blob([contents], { type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `genetik-deney-${report.exportedAt.replace(/[:.]/g, '-')}.${format}`;
      document.body.appendChild(anchor);
      try { anchor.click(); } finally { anchor.remove(); }
      downloads.current.set(url, setTimeout(() => { URL.revokeObjectURL(url); downloads.current.delete(url); }, 30000));
      setStatus(`${format === 'json' ? 'JSON' : 'Metin'} raporunun indirilmesi başlatıldı.`);
    } catch {
      if (url) URL.revokeObjectURL(url);
      setStatus('Rapor indirilemedi. Lütfen tekrar deneyin.');
    }
  }

  return (
    <div className="reportExport">
      <div><strong>Deney raporu</strong><p>Diziler, protein karşılaştırması, AP hasarı ve işlem geçmişi.</p></div>
      <div className="reportExportActions">
        <button type="button" disabled={busy} onClick={() => download('txt')}>Metin indir</button>
        <button type="button" disabled={busy} onClick={() => download('json')}>JSON indir</button>
      </div>
      <span className="reportExportStatus" role="status" aria-live="polite">{busy ? 'Animasyon tamamlanınca rapor indirilebilir.' : status}</span>
      <style jsx>{`
        .reportExport { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 16px 0; color: #9cc0ca; }
        .reportExport strong { color: #dffaff; font-size: 12px; }
        .reportExport p { margin: 5px 0 0; font-size: 11px; line-height: 1.5; }
        .reportExportActions { display: flex; gap: 8px; margin-left: auto; }
        .reportExport button { border: 1px solid #4be6ff40; border-radius: 5px; background: #092b43; padding: 9px 12px; font-size: 11px; cursor: pointer; }
        .reportExport button:hover:not(:disabled) { border-color: #4be6ff; }
        .reportExport button:disabled { opacity: .4; cursor: default; }
        .reportExportStatus { flex-basis: 100%; font-size: 11px; line-height: 1.5; }
        .reportExportStatus:empty { display: none; }
        @media (max-width: 540px) { .reportExportActions { margin-left: 0; } }
      `}</style>
    </div>
  );
}

export default memo(ExperimentReport);
