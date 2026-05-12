import { AssetProvider } from '../context/AssetContext';
import PieChartComponent from './PieChartComponent';
import AssetManager from './AssetManager';

export default function AssetProviderWrapper() {
  return (
    <AssetProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PieChartComponent />
        </div>
        <div style={{ minHeight: '600px' }}>
          <AssetManager />
        </div>
      </div>
    </AssetProvider>
  );
}
