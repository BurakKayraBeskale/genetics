export default function HologramPanel({ title, eyebrow, className = '', children, id }) {
  return (
    <section id={id} className={`holoPanel ${className}`}>
      <span className="corner cornerTL" />
      <span className="corner cornerTR" />
      <span className="corner cornerBL" />
      <span className="corner cornerBR" />
      {eyebrow && <div className="panelEyebrow">{eyebrow}</div>}
      {title && <h2 className="panelTitle">{title}</h2>}
      {children}
    </section>
  );
}
