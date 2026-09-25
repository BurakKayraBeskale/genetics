import { changedIndices } from '../lib/genetics';

function SequenceRow({ label, value, changed, originalLength, tokens, coding }) {
  return (
    <div className="sequenceRow">
      <div className="sequenceMeta">
        <span>{label}</span>
        <small>{value.length} baz çifti</small>
      </div>
      <div className="codonSequence">
        {Array.from({ length: Math.ceil(value.length / 3) }).map((_, codonIndex) => {
          const start = codonIndex * 3;
          const chunk = value.slice(start, start + 3);
          return (
            <div className="codonChunk" key={`${label}-${codonIndex}`}>
              <small>{coding ? 'KODON' : 'ÜÇLÜ'} {String(codonIndex + 1).padStart(2, '0')}</small>
              <div>
                {chunk.split('').map((base, offset) => {
                  const index = start + offset;
                  const isChanged = changed.has(index) || (label === 'Mutasyona Uğramış DNA' && index >= originalLength);
                  const ap = tokens?.[index]?.ap;
                  return <span title={ap?.some(Boolean) ? 'AP bölge; kayıtlı baz ' + base + ', zincir ' + (ap[0] ? 1 : 2) : undefined} data-ap={ap?.some(Boolean) || undefined} className={`${isChanged ? 'changed' : ''} baseText-${base}`} key={`${base}-${index}`}>{ap?.[0] ? "∅" : base}{ap?.[1] ? "°" : ""}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SequenceViewer({ original, mutated, tokens, compact }) {
  const changed = changedIndices(original, mutated);
  return (
    <div className="sequenceViewer">
      <SequenceRow coding={compact} label={compact ? "Orijinal kodlayan DNA" : "Orijinal DNA"} value={original} changed={changed} originalLength={original.length} />
      {tokens?.some(t => t.ap.some(Boolean)) && <p className="microNote">∅: 1. zincirde AP · °: eş zincirde AP. Baz kaybı hasar olarak işaretlendi; kayıtlı dizi uzunluğu değişmedi.</p>}
      <div className="sequenceDivider"><span>{changed.size || 0} farklı konum</span></div>
      <SequenceRow coding={compact} tokens={tokens} label={compact ? "Değişmiş kodlayan DNA" : "Mutasyona Uğramış DNA"} value={mutated} changed={changed} originalLength={original.length} />
    </div>
  );
}
