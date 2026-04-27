import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore } from '@/store';
import type { Company, Job } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';

const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchCompanyById, fetchJobsByCompany, toggleFavorite } = useJobStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'about'>('jobs');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  useEffect(() => {
    if (id) {
      loadCompanyData(id);
    }
  }, [id]);

  const loadCompanyData = async (companyId: string) => {
    setLoading(true);
    try {
      const companyData = await fetchCompanyById(companyId);
      if (companyData) {
        setCompany(companyData);
        const jobsData = await fetchJobsByCompany(companyId);
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!company) return;
    await toggleFavorite('company', company.id);
    setCompany((prev) => prev ? { ...prev, isFollowed: !prev.isFollowed } : null);
    setAlertConfig({
      title: company.isFollowed ? '已取消关注' : '关注成功',
      message: company.isFollowed ? '您已取消关注该企业' : '您已成功关注该企业，后续可在收藏中查看',
      type: 'success',
    });
    setShowAlert(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-gray-700 font-medium mb-2">企业不存在</h3>
          <p className="text-gray-500 text-sm mb-4">该企业可能已下架或不存在</p>
          <button onClick={() => navigate('/home')} className="btn-primary px-6 py-2">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">企业详情</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <img
              src={company.logo}
              alt={company.name}
              className="w-20 h-20 rounded-xl object-cover shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/80/80';
              }}
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>
              <p className="text-sm text-gray-500 mb-3">
                {company.industry} · {company.size} · {company.type}
              </p>
              <div className="flex items-center gap-4">
                {company.isAic && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    已认证
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  关注: {company.followCount}
                </span>
                <span className="text-sm text-gray-500">
                  在招: {company.jobCount}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleFollow}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                company.isFollowed
                  ? 'btn-outline'
                  : 'btn-primary'
              }`}
            >
              {company.isFollowed ? '已关注' : '+ 关注'}
            </button>
            <button className="flex-1 py-2.5 btn-outline rounded-lg font-medium">
              私信 HR
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white mt-2 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 font-medium transition-colors relative ${
                activeTab === 'jobs'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              在招职位
              {activeTab === 'jobs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 font-medium transition-colors relative ${
                activeTab === 'about'
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              企业介绍
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {activeTab === 'jobs' ? (
          jobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-gray-700 font-medium mb-2">暂无在招职位</h3>
              <p className="text-gray-500 text-sm">该企业目前没有开放招聘的职位</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">公司福利</h3>
              <div className="flex flex-wrap gap-2">
                {company.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">企业介绍</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{company.description}</p>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">工商信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">统一社会信用代码</span>
                  <span className="text-gray-700">91110000MA00XXXXX</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">企业类型</span>
                  <span className="text-gray-700">{company.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">成立日期</span>
                  <span className="text-gray-700">2015年03月15日</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">登记状态</span>
                  <span className="text-green-600">存续（在营、开业、在册）</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">办公地址</h3>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-700 text-sm">{company.address}</p>
                  <button className="text-primary-600 text-sm mt-2">查看地图</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default CompanyPage;
