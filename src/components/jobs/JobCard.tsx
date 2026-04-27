import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '@/types';
import { useJobStore, useApplicationStore } from '@/store';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  compact?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, showActions = true, compact = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, addBrowseHistory, applyJob } = useJobStore();
  const { addApplication } = useApplicationStore();
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const handleCardClick = () => {
    addBrowseHistory('job', job.id);
    navigate(`/jobs/${job.id}`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite('job', job.id);
    setAlertConfig({
      title: job.isFavorite ? '已取消收藏' : '收藏成功',
      message: job.isFavorite ? '该职位已从收藏夹移除' : '该职位已添加到收藏夹',
      type: 'success',
    });
    setShowAlert(true);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    await applyJob(job.id);
    addApplication(job.id, {
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
    });
    setShowApplyConfirm(false);
    setAlertConfig({
      title: '投递成功',
      message: '您的简历已成功投递，请耐心等待 HR 查看。',
      type: 'success',
    });
    setShowAlert(true);
  };

  if (compact) {
    return (
      <div
        onClick={handleCardClick}
        className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-ellipsis flex-1">{job.title}</h3>
          <span className="text-orange-500 font-bold ml-2">
            {job.salaryMin}-{job.salaryMax}{job.salaryUnit}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{job.companyName}</span>
          <span className="mx-2">·</span>
          <span>{job.experience}</span>
          <span className="mx-2">·</span>
          <span>{job.education}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="card p-5 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {job.isApplied && (
        <div className="absolute top-0 right-0">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
            已投递
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">
          {job.matchScore && (
            <span className="inline-block bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full mr-2 align-middle">
              匹配度 {job.matchScore}%
            </span>
          )}
          <span className="align-middle">{job.title}</span>
        </h3>
        <span className="text-orange-500 font-bold text-lg">
          {job.salaryMin}-{job.salaryMax}{job.salaryUnit}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-3">
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
        {job.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
            +{job.tags.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <img
            src={job.companyLogo}
            alt={job.companyName}
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/40/40';
            }}
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{job.companyName}</p>
            <p className="text-xs text-gray-500">
              {job.companyIndustry} · {job.companySize}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                job.isFavorite
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <svg className="w-5 h-5" fill={job.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              onClick={handleApply}
              disabled={job.isApplied}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                job.isApplied
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {job.isApplied ? '已投递' : '一键投递'}
            </button>
          </div>
        )}
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

export default JobCard;
