const BASES = ['A', 'T', 'G', 'C'];

const MODE_LABELS = {
  substitution: 'Değiştir',
  insertion: 'Ekle',
  deletion: 'Sil'
};

export default function MutationLab({
  selectedBase,
  selectedIndex,
  mode,
  setMode,
  onSubstitute,
  onInsert,
  onDelete,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  busy,
  missing
}) {
  return (
    <div className="mutationLab">
      <div className="selectedReadout">
        <div>
          <span className="microLabel">Seçili nükleotit</span>
          <strong>{selectedBase || '—'}</strong>
        </div>
        <span>Konum {selectedIndex + 1}</span>
      </div>

      <div className="segmentedControl">
        {['substitution', 'insertion', 'deletion'].map((item) => (
          <button key={item} onClick={() => setMode(item)} className={mode === item ? 'active' : ''}>
            {MODE_LABELS[item]}
          </button>
        ))}
      </div>

      {mode === 'substitution' && (
        <div className="mutationAction">
          <span className="microLabel">{selectedBase} bazını değiştir</span>
          <div className="baseChoiceGrid">
            {BASES.map(base => (
              <button key={base} className={`baseChoice base-${base}`} disabled={busy || missing || base === selectedBase} onClick={() => onSubstitute(base)}>
                <b>{base}</b><small>{base === selectedBase ? 'mevcut' : `${selectedBase} → ${base}`}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'insertion' && (
        <div className="mutationAction">
          <span className="microLabel">{selectedIndex + 1}. konumdan önce yeni baz ekle</span>
          <div className="baseChoiceGrid">
            {BASES.map(base => (
              <button key={base} className={`baseChoice base-${base}`} disabled={busy} onClick={() => onInsert(base)}>
                <b>+{base}</b><small>ekle</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'deletion' && (
        <div className="deleteBox">
          <p><strong>{selectedBase}</strong> bazı {selectedIndex + 1}. konumdan kaldırılır. Kodlayan ekzonda tek nükleotid silinirse okuma çerçevesi kayar. İntron ve promotör etkileri ayrı değerlendirilir.</p>
          <button className="dangerAction" disabled={busy} onClick={onDelete}>Nükleotidi sil</button>
        </div>
      )}

      <div className="historyControls">
        <button onClick={onUndo} disabled={!canUndo}>Geri al</button>
        <button onClick={onRedo} disabled={!canRedo}>Yinele</button>
        <button onClick={onReset}>Mutasyonları sıfırla</button>
      </div>
    </div>
  );
}
