import { useEffect, useMemo, useState } from 'react';
import { dnaToMrna, translateMrna } from '../lib/genetics';

export default function ProteinSimulator({ dna, preDna, damaged }) {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(2);
  const mrna = useMemo(() => dnaToMrna(dna), [dna]);
  const protein = useMemo(() => translateMrna(mrna), [mrna]);

  useEffect(() => {
    if (!running) return undefined;
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 650);
    const t2 = setTimeout(() => setStage(2), 1300);
    const t3 = setTimeout(() => setRunning(false), 1850);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [running, dna]);

  return (
    <div className="proteinSimulator">
      <div className="centralDogma">
        <div className={`dogmaNode ${stage >= 0 ? 'active' : ''}`}><span>01</span><b>DNA</b><small>genetik bilgi</small></div>
        <div className={`dogmaArrow ${stage >= 1 ? 'active' : ''}`}><i>→</i><small>Transkripsiyon</small></div>
        <div className={`dogmaNode ${stage >= 1 ? 'active' : ''}`}><span>02</span><b>mRNA</b><small>haberci kopya</small></div>
        <div className={`dogmaArrow ${stage >= 2 ? 'active' : ''}`}><i>→</i><small>Translasyon</small></div>
        <div className={`dogmaNode ${stage >= 2 ? 'active' : ''}`}><span>03</span><b>Protein</b><small>aminoasit zinciri</small></div>
      </div>

      <button className="simulateButton" onClick={() => setRunning(true)} disabled={running}>{running ? 'Simülasyon çalışıyor…' : 'Protein sentezini simüle et'}</button>

      {damaged && <p className="regionEffectNote">AP hasarı için üretilecek protein öngörülmez. Aşağıdaki hesap, kayıtlı baz dizisine ve normal splicing varsayımına aittir.</p>}
      {preDna && <div className="mrnaReadout"><span>Ön-mRNA (intron dahil)</span><code>{dnaToMrna(preDna)}</code></div>}
      <div className="mrnaReadout"><span>Olgun mRNA (kodlayan ekzonlar)</span><code>{mrna.match(/.{1,3}/g)?.join(' · ') || ''}</code></div>
      <div className="aminoStrip">
        {protein.map((item) => (
          <div key={`${item.codon}-${item.index}`} className={item.aminoAcid === 'Stop' ? 'stopCodon' : ''}>
            <b>{item.codon}</b>
            <span>{item.aminoAcid === 'Stop' ? 'Dur' : item.aminoAcid}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
