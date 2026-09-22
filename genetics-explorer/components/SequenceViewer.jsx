import { changedIndices } from '../lib/genetics';

function SequenceRow({ label, value, changed, originalLength }) {
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
              <small>KODON {String(codonIndex + 1).padStart(2, '0')}</small>
              <div>
                {chunk.split('').map((base, offset) => {
                  const index = start + offset;
                  const isChanged = changed.has(index) || (label === 'Mutasyona Uğramış DNA' && index >= originalLength);
                  return <span className={`${isChanged ? 'changed' : ''} baseText-${base}`} key={`${base}-${index}`}>{base}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SequenceViewer({ original, mutated }) {
  const changed = changedIndices(original, mutated);
  return (
    <div className="sequenceViewer">
      <SequenceRow label="Orijinal DNA" value={original} changed={changed} originalLength={original.length} />
      <div className="sequenceDivider"><span>{changed.size || 0} farklı konum</span></div>
      <SequenceRow label="Mutasyona Uğramış DNA" value={mutated} changed={changed} originalLength={original.length} />
    </div>
  );
}
