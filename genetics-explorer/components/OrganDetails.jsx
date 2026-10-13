'use client';
import { memo } from 'react';
import { ORGAN_EDUCATION, getOrganEffect } from '../lib/organEducation';
import './OrganDetails.css';
function Meter({label,value,accent}) { return <div className={`organ-meter ${accent ? 'is-warm' : ''}`}><div><span>{label}</span><b>{value.toFixed(0)}<small>/100</small></b></div><meter min="0" max="100" value={value} aria-label={`${label}, eğitimsel birim`}/></div>; }
function OrganDetails({organ, profile = {}, metrics = {}, hiddenProfile = false}) {
 const info = ORGAN_EDUCATION[organ];
 if (!info) return null;
 const effect = getOrganEffect(profile, metrics, organ);
 const profileSource = profile.sources?.find(source => /^https:\/\//.test(source.url || ''));
 return <section className="organ-details" aria-label="Organ inceleme paneli" aria-live="polite">
  <header><div className="organ-monitor-title"><span>ORGAN MONİTÖRÜ</span><span className={`organ-status ${effect.affected ? 'is-affected' : ''}`}><i/>{effect.affected ? 'Hedef sistem' : 'Anatomik keşif'}</span></div><h3>{info.name}</h3></header>
  <p className="organ-function">{info.function}</p><div className="organ-tissue"><strong>HEDEF DOKU</strong><span>{info.tissue}</span></div>
  <h4>Biyolojik bağlantı</h4><p>{hiddenProfile ? 'Renkler vaka gözlemlerinin temsili sistem dağılımını gösterir. Tanıyı belirtiler ve günlük notları karşılaştırarak araştırın.' : effect.explanation}</p>
  <div className="organ-biometric"><span>GENEL MODEL · EĞİTİMSEL BİRİM</span><Meter label="İnflamasyon" value={effect.inflammation} accent={effect.affected}/><Meter label="Doku stresi / işlev kaybı" value={effect.tissueStress} accent={effect.affected}/></div>
  <div className={`organ-effect ${effect.affected ? 'is-affected' : ''}`}><div><strong>{effect.damageLevel}</strong><b>{effect.severity.toFixed(0)}<small>/100</small></b></div><span>Seçili sistemin temsili renk yoğunluğu</span></div>
  <p className="organ-scope">Genel vaka göstergeleridir; organa özgü ölçüm, hasar yüzdesi veya klinik prognoz değildir.</p>
  <footer><a href={info.sourceUrl} target="_blank" rel="noopener noreferrer">Anatomi kaynağı ↗</a>{!hiddenProfile && profileSource && <a href={profileSource.url} target="_blank" rel="noopener noreferrer">Vaka kaynağı ↗</a>}</footer>
 </section>;
}
export default memo(OrganDetails);
