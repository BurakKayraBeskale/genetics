export default function GenomeRegion({ regions, activeRegion, onSelect, sequenceLength }) {
  const length = Math.max(1, sequenceLength);
  return (
    <div className="regionExplorer">
      <div className="regionTrack" aria-label="DNA bölge haritası">
        {regions.map((region) => {
          const left = (region.from / length) * 100;
          const width = ((region.to - region.from + 1) / length) * 100;
          return (
            <button
              key={region.id}
              className={`regionSegment region-${region.kind} ${activeRegion?.id === region.id ? 'active' : ''}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              onClick={() => onSelect(region)}
              title={`${region.label}: ${region.from + 1}-${region.to + 1}. bazlar`}
            >
              <span>{region.shortLabel}</span>
            </button>
          );
        })}
      </div>
      <div className="regionLegend">
        {regions.map((region) => (
          <button key={region.id} className={activeRegion?.id === region.id ? 'active' : ''} onClick={() => onSelect(region)}>
            <i className={`regionDot region-${region.kind}`} />
            {region.label}
          </button>
        ))}
      </div>
      <div className="regionDetail">
        <div>
          <span className="microLabel">Seçili bölge</span>
          <strong>{activeRegion?.label}</strong>
        </div>
        <p>{activeRegion?.info}</p>
        <span className="coordinateReadout">Bazlar {activeRegion?.from + 1}–{activeRegion?.to + 1}</span>
      </div>
    </div>
  );
}
