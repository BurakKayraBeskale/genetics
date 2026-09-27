import { useState } from 'react';
import { DISEASE_PRESETS } from '../lib/diseases';

export default function DiseaseScenarios({ activeDiseaseId, busy, onApply, onRevert, modelEffect }) {
  const [selectedId, setSelectedId] = useState(DISEASE_PRESETS[0].id);
  const selected = DISEASE_PRESETS.find(d => d.id === selectedId) || DISEASE_PRESETS[0];
  const isApplied = activeDiseaseId === selected.id;

  return (
    <div className="diseaseScenarios">
      <div className="diseaseGrid">
        {DISEASE_PRESETS.map(disease => (
          <button
            key={disease.id}
            className={`diseaseCard ${selectedId === disease.id ? 'active' : ''} ${activeDiseaseId === disease.id ? 'applied' : ''}`}
            onClick={() => setSelectedId(disease.id)}
          >
            <span className="diseaseTag">{disease.tag}</span>
            <b>{disease.name}</b>
            {activeDiseaseId === disease.id && <small className="appliedBadge">MODELDE UYGULANIYOR</small>}
          </button>
        ))}
      </div>

      <div className="diseaseDetail">
        <div className="diseaseDetailHeader">
          <span className="microLabel">{selected.tag}</span>
          <h3>{selected.name}</h3>
        </div>
        <div className="diseaseFactGrid">
          <div><span>Gen</span><b>{selected.gene}</b></div>
          <div><span>Gerçek mutasyon</span><b>{selected.realMutation}</b></div>
        </div>
        <p className="diseaseModelNote"><span className="microLabel">MODELDE NE YAPIYORUZ</span>{selected.modelExplanation}</p>
        <div className="diseaseImpactGrid">
          <div><span className="microLabel">Protein etkisi</span><p>{selected.proteinEffect}</p></div>
          <div><span className="microLabel">Hastalık etkisi</span><p>{selected.diseaseEffect}</p></div>
        </div>

        {isApplied && (
          <p className="regionEffectNote">Modelin hesapladığı sınıflandırma: <b>{modelEffect}</b></p>
        )}

        <div className="diseaseActions">
          <button className="dangerAction" disabled={busy} onClick={() => onApply(selected)}>
            {isApplied ? 'Yeniden Uygula' : 'Bu Senaryoyu Uygula'}
          </button>
          <button disabled={busy || !activeDiseaseId} onClick={onRevert}>Orijinale Dön</button>
        </div>
      </div>
    </div>
  );
}
