import { formatMagnitude, getMagnitudeLevel } from '../utils/earthquakeUtils';

interface MagnitudeBadgeProps {
  magnitude: number;
  size?: 'sm' | 'md';
}

export function MagnitudeBadge({ magnitude, size = 'md' }: MagnitudeBadgeProps) {
  const level = getMagnitudeLevel(magnitude);
  return (
    <span
      className={`mag-badge mag-badge--${size} mag--${level.key}`}
      title={`${level.label} · M ${formatMagnitude(magnitude)}`}
    >
      {formatMagnitude(magnitude)}
    </span>
  );
}
