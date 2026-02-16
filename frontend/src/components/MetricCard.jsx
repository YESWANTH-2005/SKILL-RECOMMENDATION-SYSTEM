export const MetricCard = ({ label, value, tone = "default" }) => (
  <article className={`metric-card ${tone}`}>
    <p>{label}</p>
    <h3>{value}</h3>
  </article>
);
