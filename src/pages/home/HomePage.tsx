import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '@/components/jobs/JobCard';
import { useJobStore } from '@/store';
import type { Job, FilterOptions, SortOptions } from '@/types';
import Modal from '@/components/common/Modal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchJobs, fetchRecommendedJobs } = useJobStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('全国');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeJobType, setActiveJobType] = useState('全部');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOptions['field']>('relevance');

  const cities = [
    '全国', '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉',
    '成都', '西安', '重庆', '苏州', '天津', '长沙', '郑州', '东莞',
    '青岛', '合肥', '福州', '厦门', '宁波', '无锡', '昆明', '大连'
  ];

  const jobTypes = ['全部', '全职', '兼职', '实习'];

  const salaryRanges = [
    { label: '不限', value: null },
    { label: '5K以下', value: [0, 5] },
    { label: '5K-10K', value: [5, 10] },
    { label: '10K-20K', value: [10, 20] },
    { label: '20K-30K', value: [20, 30] },
    { label: '30K-50K', value: [30, 50] },
    { label: '50K以上', value: [50, 100] },
  ];

  const experienceOptions = [
    { label: '不限', value: null },
    { label: '应届生', value: '应届生' },
    { label: '1-3年', value: '1-3年' },
    { label: '3-5年', value: '3-5年' },
    { label: '5-10年', value: '5-10年' },
    { label: '10年以上', value: '10年以上' },
  ];

  const educationOptions = [
    { label: '不限', value: null },
    { label: '大专', value: '大专' },
    { label: '本科', value: '本科' },
    { label: '硕士', value: '硕士' },
    { label: '博士', value: '博士' },
  ];

  const sortOptions: { label: string; value: SortOptions['field'] }[] = [
    { label: '综合排序', value: 'relevance' },
    { label: '最新发布', value: 'newest' },
    { label: '薪资从高到低', value: 'salary_desc' },
    { label: '薪资从低到高', value: 'salary_asc' },
  ];

  useEffect(() => {
    loadJobs();
  }, [filters, sortOption]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetchJobs(1, filters, {
        field: sortOption,
        order: sortOption === 'salary_asc' ? 'asc' : 'desc',
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: searchKeyword }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setFilters((prev) => ({ ...prev, city: city === '全国' ? undefined : city }));
    setShowCityModal(false);
  };

  const handleJobTypeSelect = (type: string) => {
    setActiveJobType(type);
    let jobTypeFilter;
    switch (type) {
      case '全职':
        jobTypeFilter = ['fulltime'];
        break;
      case '兼职':
        jobTypeFilter = ['parttime'];
        break;
      case '实习':
        jobTypeFilter = ['internship'];
        break;
      default:
        jobTypeFilter = undefined;
    }
    setFilters((prev) => ({ ...prev, jobType: jobTypeFilter }));
  };

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value as FilterOptions[keyof FilterOptions];
      }
      return newFilters;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowCityModal(true)}
              className="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{selectedCity}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="搜索职位、公司、关键词"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>筛选</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {jobTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleJobTypeSelect(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeJobType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">为你推荐</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              查看更多
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-gray-700 font-medium mb-2">暂无推荐职位</h3>
              <p className="text-gray-500 text-sm">请完善您的简历以获取更精准的推荐</p>
              <button
                onClick={() => navigate('/resume')}
                className="btn-primary px-6 py-2 mt-4"
              >
                完善简历
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">热门企业</h2>
            <button
              onClick={() => {}}
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              更多企业
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['字节跳动', '阿里巴巴', '腾讯科技', '美团', '京东', '百度'].map((company, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/company/comp_00${index + 1}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{company}</h3>
                    <p className="text-xs text-gray-500">互联网 · 10000人以上</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">快速筛选</h2>
          <div className="flex flex-wrap gap-2">
            {['高薪职位', '急聘岗位', '周末双休', '五险一金', '弹性工作', '免费班车', '年终奖金', '股票期权'].map((tag, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchKeyword(tag);
                  handleSearch();
                }}
                className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="选择城市"
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCity === city
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="筛选条件"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilters({});
                setSortOption('relevance');
              }}
              className="btn-outline px-6 py-2.5 flex-1"
            >
              重置
            </button>
            <button
              onClick={() => {
                setShowFilterModal(false);
                loadJobs();
              }}
              className="btn-primary px-6 py-2.5 flex-1"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">薪资范围</h4>
            <div className="flex flex-wrap gap-2">
              {salaryRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleFilterChange('salaryRange', range.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.salaryRange === range.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">工作经验</h4>
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map((exp) => (
                <button
                  key={exp.label}
                  onClick={() => handleFilterChange('experience', exp.value ? [exp.value] : undefined)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.experience?.includes(exp.value || '')
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">学历要求</h4>
            <div className="flex flex-wrap gap-2">
              {educationOptions.map((edu) => (
                <button
                  key={edu.label}
                  onClick={() => handleFilterChange('education', edu.value ? [edu.value] : undefined)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.education?.includes(edu.value || '')
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {edu.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">排序方式</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortOption(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortOption === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
