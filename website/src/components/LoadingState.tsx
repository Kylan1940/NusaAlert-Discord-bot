interface LoadingStateProps {
  /** `card` mimics the latest-earthquake card, `table` mimics history rows */
  variant?: 'card' | 'table';
  rows?: number;
}

/** Visual-only skeleton. No request is made or simulated. */
export function LoadingState({ variant = 'table', rows = 5 }: LoadingStateProps) {
  if (variant === 'card') {
    return (
      <div className="loading" role="status" aria-live="polite">
        <span className="sr-only">Loading earthquake records</span>
        <div className="skeleton skeleton--hero" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
      </div>
    );
  }

  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="sr-only">Loading earthquake records</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton skeleton--row" key={i} />
      ))}
    </div>
  );
}
