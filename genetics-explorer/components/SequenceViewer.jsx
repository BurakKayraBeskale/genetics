import { memo, useRef } from 'react';
import { BASE_INFO, changedIndices } from '../lib/genetics';

function SequenceRow({ label, value, changed, originalLength, tokens, coding, onSelect, selectedIndex }) {
  const sequenceRef = useRef(null);
  const interactive = typeof onSelect === 'function';
  const focusIndex = Math.min(Math.max(selectedIndex ?? 0, 0), Math.max(value.length - 1, 0));

  function handleKeyDown(event, index) {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = Math.min(index + 1, value.length - 1);
    else if (event.key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0);
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = value.length - 1;
    else return;
    event.preventDefault();
    sequenceRef.current?.querySelector(`[data-sequence-index="${nextIndex}"]`)?.focus();
    onSelect(nextIndex, 0);
  }

  return (
    <div className="sequenceRow">
      <div className="sequenceMeta">
        <span>{label}</span>
        <small>{value.length} baz çifti</small>
      </div>
      {interactive && <p className="microNote">Bir bazı seçerek 3B modelde incele. Klavye: ← → · başa/sona: Home/End.</p>}
      <div className="codonSequence" ref={sequenceRef} role={interactive ? 'group' : undefined} aria-label={interactive ? 'DNA üzerinde incelenecek bazı seç' : undefined}>
        {Array.from({ length: Math.ceil(value.length / 3) }).map((_, codonIndex) => {
          const start = codonIndex * 3;
          const chunk = value.slice(start, start + 3);
          return (
            <div className="codonChunk" key={`${label}-${codonIndex}`}>
              <small>{coding ? 'KODON' : 'ÜÇLÜ'} {String(codonIndex + 1).padStart(2, '0')}</small>
              <div>
                {chunk.split('').map((base, offset) => {
                  const index = start + offset;
                  const isChanged = changed.has(index) || (tokens && index >= originalLength);
                  const ap = tokens?.[index]?.ap;
                  const apDescription = ap?.some(Boolean)
                    ? `AP bölge; kayıtlı baz ${base}, zincir ${ap[0] && ap[1] ? '1 ve 2' : ap[0] ? '1' : '2'}`
                    : '';
                  const display = `${ap?.[0] ? '∅' : base}${ap?.[1] ? '°' : ''}`;
                  const className = `${isChanged ? 'changed' : ''} baseText-${base} base-${base}`;
                  const key = tokens?.[index]?.id ?? index;
                  if (!interactive) {
                    return <span title={apDescription || undefined} data-ap={ap?.some(Boolean) || undefined} className={className} key={key}>{display}</span>;
                  }
                  return (
                    <button
                      type="button"
                      className={`sequenceBase ${className}`}
                      key={key}
                      data-sequence-index={index}
                      data-ap={ap?.some(Boolean) || undefined}
                      aria-label={`${index + 1}. baz: ${BASE_INFO[base]?.name ?? base} (${base})${isChanged ? ', değişmiş konum' : ''}${apDescription ? `, ${apDescription}` : ''}`}
                      aria-pressed={selectedIndex === index}
                      title={`${index + 1}. baz · ${BASE_INFO[base]?.name ?? base}${apDescription ? ` · ${apDescription}` : ''}`}
                      tabIndex={index === focusIndex ? 0 : -1}
                      onClick={() => onSelect(index, 0)}
                      onKeyDown={event => handleKeyDown(event, index)}
                    >{display}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .sequenceBase {
          width: 24px;
          height: 28px;
          padding: 0;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, .12);
          border-radius: 3px;
          font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace;
          background: rgba(255, 255, 255, .025);
          cursor: pointer;
          transition: background .15s, box-shadow .15s;
        }
        .sequenceBase.changed {
          border-color: #ff6780;
          color: white;
          background: rgba(255, 70, 105, .18);
        }
        .sequenceBase:hover { background: rgba(75, 230, 255, .15); }
        .sequenceBase[aria-pressed="true"] {
          box-shadow: 0 0 0 2px #4be6ff;
          background: rgba(75, 230, 255, .2);
        }
        .sequenceBase:focus-visible {
          outline: 2px solid white;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}

function SequenceViewer({ original, mutated, tokens, compact, onSelect, selectedIndex }) {
  const changed = changedIndices(original, mutated);
  return (
    <div className="sequenceViewer">
      <SequenceRow coding={compact} label={compact ? 'Orijinal kodlayan DNA' : 'Orijinal DNA'} value={original} changed={changed} originalLength={original.length} />
      {tokens?.some(t => t.ap?.some(Boolean)) && <p className="microNote">∅: 1. zincirde AP · °: eş zincirde AP. Baz kaybı hasar olarak işaretlendi; kayıtlı dizi uzunluğu değişmedi.</p>}
      <div className="sequenceDivider"><span>{changed.size || 0} farklı konum</span></div>
      <SequenceRow coding={compact} tokens={tokens} label={compact ? 'Değişmiş kodlayan DNA' : 'Mutasyona Uğramış DNA'} value={mutated} changed={changed} originalLength={original.length} onSelect={onSelect} selectedIndex={selectedIndex} />
    </div>
  );
}

export default memo(SequenceViewer);
