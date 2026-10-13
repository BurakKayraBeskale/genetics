'use client';
import { useMemo, useState } from 'react';
import { deriveSocietyView } from '../lib/societyView.js';
import './SocietyPeople.css';
const STATUS = {
  sick: { label: 'Hasta', note: 'Kırmızı figürler modeldeki aktif vaka payının 10 kişiye yuvarlanmış temsilidir.' },
  healthy: { label: 'Sağlıklı / diğer', note: 'Mavi figürler hasta, iyileşmiş veya temsili risk grubunda gösterilmeyen nüfus payıdır; klinik sağlık tanısı değildir.' },
  risk: { label: 'Temsili risk', note: 'Sarı figür sayısı yeni vaka varsa yayılım göstergesine göre 1–3 olarak seçilir ve kalan kapasiteyle sınırlanır. Gerçek temas veya maruziyet verisi değildir.' },
  recovered: { label: 'İyileşmiş', note: 'Gri figürler modeldeki iyileşmiş nüfus payının 10 kişiye yuvarlanmış temsilidir.' },
};
const percent = value => value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
function HumanFigure() {
  return <svg viewBox="0 0 64 164" aria-hidden="true"><circle cx="32" cy="15" r="11"/><path d="M23 31Q32 27 41 31L49 38Q52 40 53 47L59 83Q60 91 53 92Q47 92 46 86L41 61V99L40 152Q40 162 32 162Q25 162 25 152L26 104H25L23 152Q23 162 16 162Q9 161 10 152L13 98V61L9 85Q8 93 2 92Q-4 90-2 83L5 47Q6 40 12 37Z" transform="translate(5 0) scale(.85 1)"/></svg>;
}
export default function SocietyPeople({ outbreak, day }) {
  const view = useMemo(() => deriveSocietyView(outbreak), [outbreak]);
  const [selected, setSelected] = useState(null);
  const selectedStatus = selected === null ? null : view.people[selected];
  if (!view.contagious) return <section className="society-people society-people--inactive" aria-label="Toplum görünümü"><span className="society-eyebrow">TOPLUM ÖLÇEĞİ · GÜN {day ?? 0}</span><h2>{outbreak?.populationSpreadUnsupported?'Bu toplum modeli bu profile uygulanmıyor':'Bu hastalık kişiler arasında bulaşmaz'}</h2><p>{outbreak?.disclaimer||'Bu mekanizma için enfeksiyon yayılımı ve temas riski gösterilmez. Organ ve hücre görünümlerinden bireysel hastalık sürecini inceleyin.'}</p></section>;
  return <section className="society-people" aria-label="On kişilik toplum modeli">
    <header><div><span className="society-eyebrow">TOPLUM ÖLÇEĞİ · GÜN {day ?? 0}</span><h2>10 kişide toplum görünümü</h2></div><span className="society-scale">1 figür = %10</span></header>
    <div className="society-figures">{view.people.map((status, index) => <button type="button" key={index} className={`society-person society-person--${status}`} aria-label={`Kişi ${index + 1}: ${STATUS[status].label}`} aria-pressed={selected === index} title={STATUS[status].label} onClick={() => setSelected(index)}><HumanFigure/><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>
    <div className="society-legend">{Object.entries(STATUS).map(([status, info]) => <span key={status}><i className={`society-dot society-dot--${status}`}/>{info.label} <b>{view.counts[status]}</b></span>)}</div>
    <div className="society-selection" role="status">{selectedStatus ? <><strong>{STATUS[selectedStatus].label} · Kişi {selected + 1}</strong><p>{STATUS[selectedStatus].note}</p></> : <p>Durum bilgisini görmek için bir insan figürüne dokunun.</p>}</div>
    <div className="society-stats"><div><span>Gösterilen hasta oranı</span><strong>%{view.sickPercent}</strong><small>{view.counts.sick}/10 figür</small></div><div><span>Model nüfusunda hasta oranı</span><strong>%{percent(view.actualSickPercent)}</strong><small>{Number(outbreak?.activeCases || 0).toLocaleString('tr-TR')} / {view.population.toLocaleString('tr-TR')}</small></div><div><span>Model nüfusunda iyileşmiş</span><strong>%{percent(view.actualRecoveredPercent)}</strong><small>Görsel: {view.counts.recovered}/10 (%{view.recoveredPercent})</small></div><div><span>Yeni vaka · model</span><strong>{view.newCases.toLocaleString('tr-TR')}</strong><small>Nüfusun %{percent(view.population ? view.newCases / view.population * 100 : 0)} kadarı · Yayılım farkı: {view.spreadDelta === null ? 'Başlangıç' : `${view.spreadDelta >= 0 ? '+' : ''}${percent(view.spreadDelta)} puan`}</small></div></div>
    <p className="society-caption">10 figür eğitim amaçlı yuvarlanmış bir gösterimdir; küçük paylar 0 figür olabilir. Sarı risk grubu soyut yayılım göstergesinden türetilir. Sayılar klinik tahmin veya gerçek temas ağı değildir.</p>
  </section>;
}

