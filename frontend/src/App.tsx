import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DataSeries } from './types';
import { dataSeriesApi } from './services/api';
import { AnimatedChart } from './components/AnimatedChart';
import { CreateSeriesForm } from './components/CreateSeriesForm';
import { CreateSeriesRequest } from './types';

function App() {
  const [series, setSeries] = useState<DataSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<DataSeries[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInflectionPoints, setShowInflectionPoints] = useState(true);
  const [showPeakPoints, setShowPeakPoints] = useState(true);
  const [showOutliers, setShowOutliers] = useState(true);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const data = await dataSeriesApi.getAll();
      setSeries(data);
      if (data.length > 0) {
        setSelectedSeries([data[0]]);
      }
    } catch (error) {
      console.error('Failed to load series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async (data: CreateSeriesRequest) => {
    try {
      const newSeries = await dataSeriesApi.create(data);
      setSeries([newSeries, ...series]);
      setSelectedSeries([newSeries]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create series:', error);
      alert('Failed to create series. Please check your formula syntax.');
    }
  };

  const toggleSeriesSelection = (s: DataSeries) => {
    if (selectedSeries.find((sel) => sel.id === s.id)) {
      setSelectedSeries(selectedSeries.filter((sel) => sel.id !== s.id));
    } else {
      setSelectedSeries([...selectedSeries, s]);
    }
  };

  const deleteSeries = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this series?')) {
      try {
        await dataSeriesApi.delete(id);
        setSeries(series.filter((s) => s.id !== id));
        setSelectedSeries(selectedSeries.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete series:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Data Visualization</h1>
                  <p className="text-xs text-gray-400">Real-time Analytics & Visualization</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Series
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="chart-container p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Data Series</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {series.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => toggleSeriesSelection(s)}
                      className={`series-card p-4 rounded-lg cursor-pointer ${
                        selectedSeries.find((sel) => sel.id === s.id) ? 'border-indigo-500/50 bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white text-sm">{s.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{s.points.length} points</p>
                          {s.formula && (
                            <p className="text-xs text-indigo-400 mt-1 font-mono truncate max-w-48">
                              {s.formula}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => deleteSeries(s.id, e)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {series.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No data series yet. Create one to get started!
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Display Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInflectionPoints}
                        onChange={(e) => setShowInflectionPoints(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="text-sm text-gray-400">Inflection Points</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPeakPoints}
                        onChange={(e) => setShowPeakPoints(e.target.checked)}
                        className="w-4 h-4 accent-red-500"
                      />
                      <span className="text-sm text-gray-400">Peak/Valley Points</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOutliers}
                        onChange={(e) => setShowOutliers(e.target.checked)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-400">Outliers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="chart-container" style={{ height: '500px' }}>
                {selectedSeries.length > 0 ? (
                  <AnimatedChart
                    series={selectedSeries}
                    showInflectionPoints={showInflectionPoints}
                    showPeakPoints={showPeakPoints}
                    showOutliers={showOutliers}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg">Select a data series to visualize</p>
                    <p className="text-sm mt-1">Create a new series or select from the list</p>
                  </div>
                )}
              </div>

              {selectedSeries.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedSeries.map((s) => (
                    <div key={s.id} className="chart-container p-4">
                      <h3 className="font-medium text-white mb-3">{s.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Points</span>
                          <span className="text-white font-medium">{s.points.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Inflection Points</span>
                          <span className="text-amber-400 font-medium">
                            {s.points.filter((p) => p.isInflection).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Peaks/Valleys</span>
                          <span className="text-red-400 font-medium">
                            {s.points.filter((p) => p.isPeak).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Outliers</span>
                          <span className="text-red-500 font-medium">
                            {s.points.filter((p) => p.isOutlier).length}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                        <button
                          onClick={() => dataSeriesApi.exportExcel(s.id)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg text-white btn-secondary flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Excel
                        </button>
                        <button
                          onClick={() => dataSeriesApi.exportPDF(s.id)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg text-white btn-secondary flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create New Data Series</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CreateSeriesForm
                onSubmit={handleCreateSeries}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
