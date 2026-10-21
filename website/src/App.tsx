import { useEarthquakes } from './hooks/useEarthquakes';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const { earthquakes, status } = useEarthquakes();
  return <Dashboard earthquakes={earthquakes} status={status} />;
}