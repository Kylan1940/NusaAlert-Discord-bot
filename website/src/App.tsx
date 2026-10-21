import { getMockEarthquakes } from './data/mockEarthquakes';
import { Dashboard } from './pages/Dashboard';

/**
 * The only place that knows where earthquake data comes from.
 * To use a real source later, replace this with data from that source
 * (and pass a `status` of 'loading' or 'unavailable' when appropriate).
 */
const earthquakes = getMockEarthquakes();

export default function App() {
  return <Dashboard earthquakes={earthquakes} status="ready" />;
}
