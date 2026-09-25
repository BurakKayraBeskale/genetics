import { dnaToMrna, translateMrna } from '../lib/genetics';

function proteinText(dna) {
  return translateMrna(dnaToMrna(dna)).map(x => x.aminoAcid === 'Stop' ? 'Dur' : x.aminoAcid).join(' – ');
}

export default function MutationAnalysis({ mutation, original, mutated }) {
  return (
    <div className="analysisCard">
      <div className={`impactAnswer ${mutation.proteinChanged ? 'yes' : 'no'}`}>
        <span>Bu mutasyon proteini değiştirdi mi?</span>
        <strong>{mutation.proteinChanged === null ? 'ÖNGÖRÜLEMEZ' : mutation.proteinChanged ? 'EVET' : 'HAYIR'}</strong>
      </div>
      <div className="analysisDetails">
        <div className="analysisGrid">
          <div><span className="microLabel">Mutasyon türü</span><b>{mutation.type}</b></div>
          <div><span className="microLabel">Moleküler etki</span><b>{mutation.effect}</b></div>
        </div>
        <p className="explanationText">{mutation.explanation}</p>{mutation.notes?.map(note => <p className="regionEffectNote" key={note}>{note}</p>)}
        <div className="proteinCompare">
          <div><span>Önce</span><code>{proteinText(original)}</code></div>
          <div><span>{mutation.damage ? "Kayıtlı dizi (AP hasarı sonucu değildir)" : "Sonra"}</span><code>{proteinText(mutated)}</code></div>
        </div>
      </div>
      <div className="effectLegend">
        <span><b>Sessiz</b> aminoasit değişmez</span>
        <span><b>Missense</b> aminoasit değişir</span>
        <span><b>Nonsense</b> erken dur kodonu oluşur</span>
        <span><b>Frameshift</b> okuma çerçevesi kayar</span>
      </div>
    </div>
  );
}
