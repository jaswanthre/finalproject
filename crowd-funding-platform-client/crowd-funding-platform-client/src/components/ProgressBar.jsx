export default function ProgressBar({ current = 0, goal = 1 }) {
  const pct = Math.min(100, Math.round((current / Math.max(goal, 1)) * 100));
  return (
    <div className="progress">
      <div className="progress__bar" style={{ width: pct + "%" }} />
      <div className="progress__label">{pct}% funded</div>
    </div>
  );
}
