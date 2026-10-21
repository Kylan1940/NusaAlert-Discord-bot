import { TIME_ZONE_LABEL } from '../utils/earthquakeUtils';

export function Hero() {
  return (
    <div className="hero">
      <h1 id="page-title" className="hero__title">
        <span>Nusa</span>
        <span className="hero__pill">Alert</span>
      </h1>
      <p className="hero__subtitle">
        Track recent earthquakes across <span className="hero__underline">Indonesia</span>
      </p>
      <p className="hero__description">
        UI preview using demonstration data. Times are shown in {TIME_ZONE_LABEL} (UTC+7).
      </p>
    </div>
  );
}
