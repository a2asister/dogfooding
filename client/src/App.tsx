import { useState, useEffect, useCallback } from 'react';
import { Plant, CareRecord, CareType, MonthlyStats } from './types';
import { plantApi, recordApi, statsApi } from './api';
import { useTheme } from './contexts/ThemeContext';
import { getMonthLabel, careTypeLabels, careTypeIcons, formatDateTime } from './utils';
import { PlantCard } from './components/PlantCard';
import { Timeline } from './components/Timeline';
import { CircularChart } from './components/CircularChart';
import { Modal } from './components/Modal';
import { PlantForm } from './components/PlantForm';

type Tab = 'plants' | 'records' | 'stats';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('plants');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [allRecords, setAllRecords] = useState<CareRecord[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [plantFormModal, setPlantFormModal] = useState<{
    isOpen: boolean;
    plant: Plant | null;
  }>({ isOpen: false, plant: null });
  
  const [recordsModal, setRecordsModal] = useState<{
    isOpen: boolean;
    plantId: string | null;
    plantName: string;
    records: CareRecord[];
  }>({ isOpen: false, plantId: null, plantName: '', records: [] });
  
  const [reminderModal, setReminderModal] = useState<{
    isOpen: boolean;
    plant: Plant | null;
    type: Exclude<CareType, 'photo'> | null;
  }>({ isOpen: false, plant: null, type: null });
  
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    plantId: string | null;
    note: string;
    photoUrl: string;
  }>({ isOpen: false, plantId: null, note: '', photoUrl: '' });

  const loadPlants = useCallback(async () => {
    try {
      const data = await plantApi.getAll();
      setPlants(data);
    } catch (error) {
      console.error('加载绿植失败:', error);
    }
  }, []);

  const loadAllRecords = useCallback(async () => {
    try {
      const data = await statsApi.getMonthly();
      setAllRecords(data.records);
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await statsApi.getMonthly();
      setStats(data);
      setAllRecords(data.records);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  }, []);

  useEffect(() => {
    loadPlants();
    loadStats();
  }, [loadPlants, loadStats]);

  const handleCare = (plantId: string, type: Exclude<CareType, 'photo'>) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      setReminderModal({ isOpen: true, plant, type });
    }
  };

  const confirmCare = async () => {
    if (!reminderModal.plant || !reminderModal.type) return;
    
    setIsLoading(true);
    try {
      await recordApi.create({
        plantId: reminderModal.plant.id,
        type: reminderModal.type
      });
      await loadPlants();
      await loadStats();
      setReminderModal({ isOpen: false, plant: null, type: null });
    } catch (error) {
      console.error('记录养护失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecords = async (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;

    try {
      const records = await plantApi.getRecords(plantId);
      setRecordsModal({
        isOpen: true,
        plantId,
        plantName: plant.name,
        records
      });
    } catch (error) {
      console.error('加载记录失败:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!recordsModal.plantId) return;
    
    try {
      await recordApi.delete(recordId);
      const records = await plantApi.getRecords(recordsModal.plantId);
      setRecordsModal(prev => ({ ...prev, records }));
      await loadPlants();
      await loadStats();
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  };

  const handleEditPlant = (plant: Plant) => {
    setPlantFormModal({ isOpen: true, plant });
  };

  const handleDeletePlant = async (plantId: string) => {
    if (!confirm('确定要删除这个绿植吗？相关的养护记录也会被删除。')) return;
    
    try {
      await plantApi.delete(plantId);
      await loadPlants();
      await loadStats();
    } catch (error) {
      console.error('删除绿植失败:', error);
    }
  };

  const handlePlantFormSubmit = async (data: Parameters<typeof plantApi.create>[0]) => {
    setIsLoading(true);
    try {
      if (plantFormModal.plant) {
        await plantApi.update(plantFormModal.plant.id, data);
      } else {
        await plantApi.create(data);
      }
      await loadPlants();
      setPlantFormModal({ isOpen: false, plant: null });
    } catch (error) {
      console.error('保存绿植失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!photoModal.plantId || !photoModal.photoUrl.trim()) return;
    
    setIsLoading(true);
    try {
      await recordApi.create({
        plantId: photoModal.plantId,
        type: 'photo',
        note: photoModal.note.trim(),
        photoUrl: photoModal.photoUrl.trim()
      });
      
      const records = await plantApi.getRecords(photoModal.plantId);
      setRecordsModal(prev => ({ ...prev, records }));
      await loadStats();
      
      setPhotoModal({ isOpen: false, plantId: null, note: '', photoUrl: '' });
    } catch (error) {
      console.error('添加照片失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverduePlants = () => {
    const now = Date.now();
    return plants.filter(plant => {
      const schedule = plant.careSchedule;
      const latest = plant.latestCareTime || {};
      
      if (schedule.watering.enabled && latest.watering) {
        const next = new Date(latest.watering).getTime() + schedule.watering.days * 24 * 60 * 60 * 1000;
        if (next < now) return true;
      }
      if (schedule.fertilizing.enabled && latest.fertilizing) {
        const next = new Date(latest.fertilizing).getTime() + schedule.fertilizing.days * 24 * 60 * 60 * 1000;
        if (next < now) return true;
      }
      if (schedule.pruning.enabled && latest.pruning) {
        const next = new Date(latest.pruning).getTime() + schedule.pruning.days * 24 * 60 * 60 * 1000;
        if (next < now) return true;
      }
      
      return false;
    });
  };

  const overduePlants = getOverduePlants();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-plant-950/80 backdrop-blur-md border-b border-plant-100 dark:border-plant-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h1 className="text-xl font-bold text-plant-800 dark:text-plant-100">
                绿植养护
              </h1>
              <p className="text-xs text-plant-500 dark:text-plant-400">
                记录每一次精心呵护
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-plant-100 dark:hover:bg-plant-800 transition-colors text-plant-600 dark:text-plant-300"
            title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {overduePlants.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  需要养护提醒
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {overduePlants.map(p => p.name).join('、')} 的养护时间已到
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'plants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-plant-800 dark:text-plant-100">
                我的绿植 ({plants.length})
              </h2>
              <button
                onClick={() => setPlantFormModal({ isOpen: true, plant: null })}
                className="primary-btn flex items-center gap-2 py-2 px-4 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加绿植
              </button>
            </div>

            {plants.length === 0 ? (
              <div className="plant-card p-12 text-center">
                <span className="text-5xl mb-4 block">🌿</span>
                <h3 className="text-lg font-medium text-plant-700 dark:text-plant-200 mb-2">
                  还没有添加绿植
                </h3>
                <p className="text-sm text-plant-500 dark:text-plant-400 mb-6">
                  点击上方按钮添加你的第一株绿植吧
                </p>
                <button
                  onClick={() => setPlantFormModal({ isOpen: true, plant: null })}
                  className="primary-btn"
                >
                  开始添加
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {plants.map(plant => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onCare={handleCare}
                    onViewRecords={handleViewRecords}
                    onEdit={handleEditPlant}
                    onDelete={handleDeletePlant}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            <h2 className="text-lg font-semibold text-plant-800 dark:text-plant-100 mb-6">
              养护记录时间轴
            </h2>
            <Timeline
              records={allRecords}
              plants={plants}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-lg font-semibold text-plant-800 dark:text-plant-100 mb-6">
              {stats ? getMonthLabel(stats.month) : '月度统计'}
            </h2>

            {stats ? (
              <div className="space-y-6">
                <div className="plant-card p-8 text-center">
                  <CircularChart 
                    percentage={stats.completionRate} 
                    label="养护完成率"
                  />
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
                      <p className="text-2xl font-bold text-plant-600 dark:text-plant-300">
                        {stats.totalTasks}
                      </p>
                      <p className="text-xs text-plant-500 dark:text-plant-400">
                        计划任务
                      </p>
                    </div>
                    <div className="p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
                      <p className="text-2xl font-bold text-plant-600 dark:text-plant-300">
                        {stats.completedTasks}
                      </p>
                      <p className="text-xs text-plant-500 dark:text-plant-400">
                        已完成
                      </p>
                    </div>
                    <div className="p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
                      <p className="text-2xl font-bold text-plant-600 dark:text-plant-300">
                        {stats.records.length}
                      </p>
                      <p className="text-xs text-plant-500 dark:text-plant-400">
                        总记录
                      </p>
                    </div>
                  </div>
                </div>

                <div className="plant-card p-6">
                  <h3 className="font-medium text-plant-700 dark:text-plant-200 mb-4">
                    按类型统计
                  </h3>
                  <div className="space-y-3">
                    {(['watering', 'fertilizing', 'pruning', 'photo'] as CareType[]).map(type => {
                      const count = stats.byType[type];
                      const total = Object.values(stats.byType).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span>{careTypeIcons[type]}</span>
                              <span className="text-sm text-plant-600 dark:text-plant-300">
                                {careTypeLabels[type]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-plant-600 dark:text-plant-300">
                              {count} 次 ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-plant-100 dark:bg-plant-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-plant-500 dark:bg-plant-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {stats.records.length > 0 && (
                  <div className="plant-card p-6">
                    <h3 className="font-medium text-plant-700 dark:text-plant-200 mb-4">
                      本月记录
                    </h3>
                    <Timeline
                      records={stats.records}
                      plants={plants}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="plant-card p-12 text-center">
                <span className="text-5xl mb-4 block">📊</span>
                <p className="text-plant-500 dark:text-plant-400">
                  加载统计数据中...
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-plant-950/90 backdrop-blur-md border-t border-plant-100 dark:border-plant-800">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'plants' as Tab, label: '绿植', icon: '🪴' },
              { id: 'records' as Tab, label: '记录', icon: '📝' },
              { id: 'stats' as Tab, label: '统计', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-6 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'text-plant-600 dark:text-plant-300'
                    : 'text-plant-400 dark:text-plant-500 hover:text-plant-500 dark:hover:text-plant-400'
                }`}
              >
                <span className="text-xl mb-0.5">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <Modal
        isOpen={plantFormModal.isOpen}
        onClose={() => setPlantFormModal({ isOpen: false, plant: null })}
        title={plantFormModal.plant ? '编辑绿植' : '添加绿植'}
      >
        <PlantForm
          plant={plantFormModal.plant}
          onSubmit={handlePlantFormSubmit}
          onCancel={() => setPlantFormModal({ isOpen: false, plant: null })}
          isLoading={isLoading}
        />
      </Modal>

      <Modal
        isOpen={recordsModal.isOpen}
        onClose={() => setRecordsModal({ isOpen: false, plantId: null, plantName: '', records: [] })}
        title={`${recordsModal.plantName} - 养护记录`}
      >
        <div className="space-y-4">
          <button
            onClick={() => setPhotoModal({
              isOpen: true,
              plantId: recordsModal.plantId,
              note: '',
              photoUrl: ''
            })}
            className="w-full primary-btn flex items-center justify-center gap-2"
          >
            <span>📸</span>
            添加照片打卡
          </button>
          
          <Timeline
            records={recordsModal.records}
            plants={plants}
            onDelete={handleDeleteRecord}
          />
        </div>
      </Modal>

      <Modal
        isOpen={reminderModal.isOpen}
        onClose={() => setReminderModal({ isOpen: false, plant: null, type: null })}
        title="养护确认"
      >
        {reminderModal.plant && reminderModal.type && (
          <div className="text-center">
            <span className="text-5xl mb-4 block">
              {careTypeIcons[reminderModal.type]}
            </span>
            <h3 className="text-lg font-medium text-plant-700 dark:text-plant-200 mb-2">
              已完成{careTypeLabels[reminderModal.type]}？
            </h3>
            <p className="text-sm text-plant-500 dark:text-plant-400 mb-6">
              为「{reminderModal.plant.name}」记录一次
              {careTypeLabels[reminderModal.type]}
              <br />
              <span className="text-xs">
                时间：{formatDateTime(new Date())}
              </span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setReminderModal({ isOpen: false, plant: null, type: null })}
                className="secondary-btn"
              >
                取消
              </button>
              <button
                onClick={confirmCare}
                className="primary-btn"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '确认完成'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={photoModal.isOpen}
        onClose={() => setPhotoModal({ isOpen: false, plantId: null, note: '', photoUrl: '' })}
        title="添加照片打卡"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
              照片URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={photoModal.photoUrl}
              onChange={(e) => setPhotoModal(prev => ({ ...prev, photoUrl: e.target.value }))}
              className="input-field"
              placeholder="https://..."
              required
            />
          </div>
          {photoModal.photoUrl && (
            <div className="rounded-xl overflow-hidden bg-plant-50 dark:bg-plant-800/30">
              <img 
                src={photoModal.photoUrl} 
                alt="预览" 
                className="w-full max-h-48 object-contain"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
              备注（可选）
            </label>
            <textarea
              value={photoModal.note}
              onChange={(e) => setPhotoModal(prev => ({ ...prev, note: e.target.value }))}
              className="input-field resize-none"
              rows={2}
              placeholder="记录一下生长状态..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setPhotoModal({ isOpen: false, plantId: null, note: '', photoUrl: '' })}
              className="secondary-btn"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              onClick={handlePhotoSubmit}
              className="primary-btn"
              disabled={!photoModal.photoUrl.trim() || isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;