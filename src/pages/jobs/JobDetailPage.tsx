import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobStore, useApplicationStore } from '@/store';
import type { Job, Company } from '@/types';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';
import JobCard from '@/components/jobs/JobCard';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchJobById, fetchCompanyById, fetchSimilarJobs, toggleFavorite, addBrowseHistory, applyJob } = useJobStore();
  const { addApplication } = useApplicationStore();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  useEffect(() => {
    if (id) {
      loadJobDetail(id);
    }
  }, [id]);

  const loadJobDetail = async (jobId: string) => {
    setLoading(true);
    try {
      const jobData = await fetchJobById(jobId);
      if (jobData) {
        setJob(jobData);
        addBrowseHistory('job', jobId);
        const companyData = await fetchCompanyById(jobData.companyId);
        setCompany(companyData);
        const similar = await fetchSimilarJobs(jobId);
        setSimilarJobs(similar);
      }
    } catch (error) {
      console.error('Failed to load job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!job) return;
    await toggleFavorite('job', job.id);
    setJob((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    setAlertConfig({
      title: job.isFavorite ? '已取消收藏' : '收藏成功',
      message: job.isFavorite ? '该职位已从收藏夹移除' : '该职位已添加到收藏夹',
      type: 'success',
    });
    setShowAlert(true);
  };

  const handleApply = () => {
    if (!job) return;
    if (job.isApplied) {
      setAlertConfig({
        title: '提示',
        message: '您已经投递过这个职位了',
        type: 'warning',
      });
      setShowAlert(true);
      return;
    }
    setShowApplyConfirm(true);
  };

  const confirmApply = async () => {
    if (!job) return;
    await applyJob(job.id);
    addApplication(job.id, {
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
    });
    setJob((prev) => prev ? { ...prev, isApplied: true } : null);
    setShowApplyConfirm(false);
    setAlertConfig({
      title: '投递成功',
      message: '您的简历已成功投递，请耐心等待 HR 查看。',
      type: 'success',
    });
    setShowAlert(true);
  };

  const handleReport = () => {
    setAlertConfig({
      title: '举报提交成功',
      message: '感谢您的反馈，我们会尽快处理。',
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-gray-700 font-medium mb-2">职位不存在</h3>
          <p className="text-gray-500 text-sm mb-4">该职位可能已下架或不存在</p>
          <button onClick={() => navigate('/jobs')} className="btn-primary px-6 py-2">
            返回职位列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
          <h1 className="text-lg font-bold text-gray-900 flex-1">职位详情</h1>
          <button
            onClick={handleReport}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-5 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <span className="text-orange-500 font-bold text-xl">
              {job.salaryMin}-{job.salaryMax}{job.salaryUnit}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.location}</span>
            <span className="mx-2">·</span>
            <span>{job.experience}</span>
            <span className="mx-2">·</span>
            <span>{job.education}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {job.isApplied && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              您已投递该职位
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 mb-4 cursor-pointer" onClick={() => navigate(`/company/${job.companyId}`)}>
          <div className="flex items-center gap-3">
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="w-14 h-14 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/56/56';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {job.companyName}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </h3>
              <p className="text-sm text-gray-500">
                {job.companyIndustry} · {job.companySize} · 招聘 {job.recruitCount} 人
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">岗位职责</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">任职要求</h3>
          <ul className="space-y-2">
            {job.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span className="text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">工作信息</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">工作时间：{job.workTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600">工作地址：{job.workAddress}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">福利待遇</h3>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">HR 信息</h3>
          <div className="flex items-center gap-3">
            <img
              src={job.hrAvatar}
              alt={job.hrName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/48/48';
              }}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{job.hrName}</p>
              <p className="text-sm text-gray-500">{job.hrTitle}</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              在线沟通
            </button>
          </div>
        </div>

        {similarJobs.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">相似职位推荐</h3>
            <div className="space-y-4">
              {similarJobs.slice(0, 3).map((similarJob) => (
                <JobCard key={similarJob.id} job={similarJob} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={handleFavorite}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              job.isFavorite
                ? 'text-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-6 h-6" fill={job.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs">{job.isFavorite ? '已收藏' : '收藏'}</span>
          </button>

          <button className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">在线沟通</span>
          </button>

          <button
            onClick={handleApply}
            disabled={job.isApplied}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              job.isApplied
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {job.isApplied ? '已投递' : '立即投递'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showApplyConfirm}
        onClose={() => setShowApplyConfirm(false)}
        title="确认投递"
        message={`确定要投递「${job.title}」这个职位吗？`}
        confirmText="确认投递"
        onConfirm={confirmApply}
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

export default JobDetailPage;
