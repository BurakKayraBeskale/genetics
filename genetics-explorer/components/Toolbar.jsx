function ToolButton({ active, title, subtitle, onClick, accent = '' }) {
  return (
    <button className={`toolButton ${active ? 'active' : ''} ${accent}`} onClick={onClick}>
      <span className="toolGlyph" />
      <span><b>{title}</b><small>{subtitle}</small></span>
    </button>
  );
}

export default function Toolbar({ separated, exploded, autoRotate, onSeparate, onExplode, onAutoRotate, onResetCamera }) {
  return (
    <div className="dnaToolbar">
      <ToolButton active={autoRotate} title="DNA'yı Döndür" subtitle="otomatik dönüş" onClick={onAutoRotate} />
      <ToolButton active={exploded} title={exploded ? "DNA'yı Topla" : "DNA'yı Sök"} subtitle="sağ tık ile de aç/kapat" onClick={onExplode} accent="explodeTool" />
      <ToolButton active={separated} title={separated ? 'Zincirleri Birleştir' : 'Zincirleri Ayır'} subtitle="replikasyon görünümü" onClick={onSeparate} />
      <ToolButton title="Kamerayı Sıfırla" subtitle="modeli merkeze al" onClick={onResetCamera} />
    </div>
  );
}
