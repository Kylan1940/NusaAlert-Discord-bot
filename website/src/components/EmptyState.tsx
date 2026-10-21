import { CloudOff, Inbox, MapPinOff, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

export type EmptyStateVariant =
  | 'no-history'
  | 'no-results'
  | 'unavailable'
  | 'map-no-key'
  | 'map-error';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  compact?: boolean;
  /** Optional action, e.g. resetting filters. Only rendered when provided. */
  actionLabel?: string;
  onAction?: () => void;
}

const CONTENT: Record<
  EmptyStateVariant,
  { icon: ReactNode; title: string; description: string }
> = {
  'no-history': {
    icon: <Inbox size={22} />,
    title: 'No earthquake history yet',
    description: 'Recorded earthquakes will appear here once data is available.',
  },
  'no-results': {
    icon: <SearchX size={22} />,
    title: 'No matching earthquakes',
    description: 'Try a different location, magnitude range, or date range.',
  },
  unavailable: {
    icon: <CloudOff size={22} />,
    title: 'Earthquake data unavailable',
    description: 'The records could not be loaded right now. Please try again later.',
  },
  'map-no-key': {
    icon: <MapPinOff size={22} />,
    title: 'Map unavailable',
    description:
      'Add VITE_GOOGLE_MAPS_API_KEY to your .env file, then restart npm run dev.',
  },
  'map-error': {
    icon: <MapPinOff size={22} />,
    title: 'Map could not be loaded',
    description:
      'Check that the API key is valid, the Maps JavaScript API is enabled, and this address is allowed by the key’s referrer restrictions.',
  },
};

export function EmptyState({ variant, compact = false, actionLabel, onAction }: EmptyStateProps) {
  const { icon, title, description } = CONTENT[variant];
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="button button--primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
