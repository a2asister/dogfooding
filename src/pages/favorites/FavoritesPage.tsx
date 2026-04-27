import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '@/store';
import type { Job, Company } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import { ConfirmModal, AlertModal } from '@/components/common/Modal';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchFavorites, toggleFavorite } = useJobStore();
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
  const [favJobs, setFavJobs] = useState<Job[]>([]);
  const [favCompanies, setFavCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnfavoriteConfirm, setShowUnfavoriteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'job' | 'company'; id: string; name: string } | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favorites = await fetchFavorites();
      const jobs: Job[] = [];
      const companies: Company[] = [];
      favorites.forEach((fav) => {
        if (fav.type === 'job') {
          jobs.push(fav.targetData as Job);
        } else {
          companies.push(fav.targetData as Company);
        }
      });
      setFavJobs(jobs);
      setFavCompanies(companies);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (type: 'job' | 'company', id: string, name: string) => {
    setSelectedItem({ type, id, name });
    setShowUnfavoriteConfirm(true);
  };

  const confirmUnfavorite = async () => {
    if (!selectedItem) return;
    await toggleFavorite(selectedItem.type, selectedItem.id);
    if (selectedItem.type === 'job') {
      setFavJobs((prev) => prev.filter((j) => j.id !== selectedItem.id));
    } else {
      setFavCompanies((prev) => prev.filter((c) => c.id !== selectedItem.id));
    }
    setShowUnfavoriteConfirm(false);
    setAlertConfig({
      title: '已取消收藏',
      message: `「${selectedItem.name}」已从收藏夹移除`,
      type: 'info',
    });
    setShowAlert(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">我的收藏</h1>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`relative px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              收藏职位
              {favJobs.length > 0 && (
                <span className="ml-1 text-xs">({favJobs.length})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`relative px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'companies'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              关注企业
              {favCompanies.length > 0 && (
                <span className="ml-1 text-xs">({favCompanies.length})</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          favJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-gray-700 font-medium mb-2">暂无收藏职位</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有收藏任何职位</p>
              <button onClick={() => navigate('/jobs')} className="btn-primary px-6 py-2">
                去浏览职位
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favJobs.map((job) => (
                <div key={job.id} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <JobCard job={job} />
                  </div>
                  <button
                    onClick={() => handleToggleFavorite('job', job.id, job.title)}
                    className="flex-shrink-0 mt-4 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all"
                    title="取消收藏"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : favCompanies.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-2">暂无关注企业</h3>
            <p className="text-gray-500 text-sm">您还没有关注任何企业</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl p-4 flex items-start gap-4"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/company/${company.id}`)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/56/56';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {company.industry} · {company.size}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      在招: {company.jobCount} 个职位
                    </span>
                    <button
                      onClick={() => handleToggleFavorite('company', company.id, company.name)}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      取消关注
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showUnfavoriteConfirm}
        onClose={() => setShowUnfavoriteConfirm(false)}
        title="确认取消收藏"
        message={`确定要取消收藏「${selectedItem?.name}」吗？`}
        confirmText="确认取消"
        danger={true}
        onConfirm={confirmUnfavorite}
      />

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default FavoritesPage;
