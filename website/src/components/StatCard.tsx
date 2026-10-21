import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <div className="card stat-card">
      <span className="stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint ? <p className="stat-card__hint">{hint}</p> : null}
      </div>
    </div>
  );
}
