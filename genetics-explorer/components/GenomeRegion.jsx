export default function GenomeRegion({ regions, activeRegion, onSelect, sequenceLength }) {
  const length = Math.max(1, sequenceLength);
  return (
    <div className="regionExplorer">
      <div className="regionTrack" aria-label="DNA bölge haritası">
        {regions.map((region) => {
          const left = (Math.max(0, region.from) / length) * 100;
          const width = region.empty ? 0 : ((region.to - region.from + 1) / length) * 100;
          return (
            <button
              key={region.id} disabled={region.empty}
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
        <span className="coordinateReadout">{activeRegion?.empty ? "Bu bölgedeki nükleotidler silindi" : "Bazlar " + (activeRegion?.from + 1) + "–" + (activeRegion?.to + 1)}</span>
      </div>
    </div>
  );
}
