'use client';
import { memo } from 'react';
import { ORGAN_EDUCATION, getOrganEffect } from '../lib/organEducation';
import './OrganDetails.css';
function Meter({label,value}) { return <div className="organ-meter"><div><span>{label}</span><b>{value.toFixed(0)} / 100</b></div><meter min="0" max="100" value={value} aria-label={label}/></div>; }
function OrganDetails({organ, profile = {}, metrics = {}, hiddenProfile = false}) {
 const info = ORGAN_EDUCATION[organ];
 if (!info) return null;
 const effect = getOrganEffect(profile, metrics, organ);
 const profileSource = profile.sources?.find(source => /^https:\/\//.test(source.url || ''));
 return <section className="organ-details" aria-label="Organ inceleme paneli" aria-live="polite">
  <header><span>ORGAN İNCELEMESİ</span><h3>{info.name}</h3><small>{effect.affected ? 'Vaka profilinde hedef sistem' : 'Anatomik keşif'}</small></header>
  <p>{info.function}</p><div className="organ-tissue"><strong>Hedef doku</strong><span>{info.tissue}</span></div>
  <h4>Neden bu sistem?</h4><p>{hiddenProfile ? 'Renkler vaka gözlemlerinin temsili sistem dağılımını gösterir. Tanıyı belirtiler ve günlük notları karşılaştırarak araştırın.' : effect.explanation}</p>
  {!hiddenProfile && effect.affected && profile.immuneResponseType && <p className="organ-context">Bağışıklık bağlamı: {profile.immuneResponseType}</p>}
  <h4>Genel model göstergeleri</h4><Meter label="Genel inflamasyon" value={effect.inflammation}/><Meter label="Genel doku stresi / işlev kaybı" value={effect.tissueStress}/>
  <div className={`organ-effect ${effect.affected ? 'is-affected' : ''}`}><strong>{effect.damageLevel}</strong><span>Seçili sistem için renk yoğunluğu: {effect.severity.toFixed(0)} / 100</span></div>
  <p className="organ-scope">Göstergeler tüm vaka için soyut eğitim birimleridir. Organa özgü ölçüm, hasar yüzdesi veya klinik prognoz değildir.</p>
  <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer">{info.sourceTitle} ↗</a>
  {!hiddenProfile && profileSource && <a href={profileSource.url} target="_blank" rel="noopener noreferrer">Vaka kaynağı ↗</a>}
 </section>;
}
export default memo(OrganDetails);
