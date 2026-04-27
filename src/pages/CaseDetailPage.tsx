import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Calendar,
  Briefcase,
  Tag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getCaseStudyById,
  getCaseStudies
} from '../data/services';
import type { CaseStudy } from '../types';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [relatedCases, setRelatedCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'process' | 'comparison'>('process');

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      setIsLoading(true);

      try {
        const caseData = await getCaseStudyById(id);

        if (caseData) {
          setCaseStudy(caseData);

          const allCases = await getCaseStudies();
          const related = allCases
            .filter(c => c.id !== id && c.tags.some(tag => caseData.tags.includes(tag)))
            .slice(0, 3);
          setRelatedCases(related);
        }
      } catch (error) {
        console.error('Failed to load case study detail:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, setIsLoading]);

  // Get all images for lightbox
  const getAllImages = () => {
    if (!caseStudy) return [];
    const images: string[] = [];
    caseStudy.processSteps.forEach(step => {
      images.push(...step.images);
    });
    caseStudy.beforeAfter.forEach(ba => {
      images.push(...ba.beforeImages);
      images.push(...ba.afterImages);
    });
    return images.filter(img => img);
  };

  const openLightbox = (images: string[], index: number) => {
    const allImgs = getAllImages();
    const firstImage = images[index];
    const globalIndex = allImgs.indexOf(firstImage);
    setLightboxIndex(globalIndex >= 0 ? globalIndex : 0);
    setShowLightbox(true);
  };

  const nextLightboxImage = () => {
    const allImages = getAllImages();
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevLightboxImage = () => {
    const allImages = getAllImages();
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">案例不存在</h2>
          <p className="text-gray-500 mb-6">您访问的案例可能已被删除或不存在</p>
          <Link
            to="/cases"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回案例列表</span>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {showLightbox && allImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevLightboxImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextLightboxImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={allImages[lightboxIndex] || 'https://picsum.photos/1200/800'}
            alt="案例图片"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">首页</Link>
            <span className="text-gray-400">/</span>
            <Link to="/cases" className="text-gray-500 hover:text-gray-700">案例</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{caseStudy.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Badge */}
          {caseStudy.isFeatured && (
            <div className="flex items-center space-x-1 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-full flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>热门推荐案例</span>
              </span>
            </div>
          )}

          {/* Title & Meta */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {caseStudy.projectType}
              </span>
              <span className="flex items-center space-x-1 text-gray-500 text-sm">
                <Briefcase className="w-4 h-4" />
                <span>{caseStudy.client}</span>
              </span>
              <span className="flex items-center space-x-1 text-gray-500 text-sm">
                <Eye className="w-4 h-4" />
                <span>{caseStudy.viewCount.toLocaleString()} 浏览</span>
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {caseStudy.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
              {caseStudy.description}
            </p>
          </div>

          {/* Project Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                <Briefcase className="w-4 h-4" />
                <span>客户</span>
              </div>
              <p className="font-semibold text-gray-900">{caseStudy.client}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                <Tag className="w-4 h-4" />
                <span>项目类型</span>
              </div>
              <p className="font-semibold text-gray-900">{caseStudy.projectType}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>开始日期</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(caseStudy.startDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>完成日期</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(caseStudy.endDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {caseStudy.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-y border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('process')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'process' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              项目过程
            </button>
            {caseStudy.beforeAfter.length > 0 && (
              <button
                onClick={() => setActiveTab('comparison')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'comparison' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                前后对比
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Process Tab Content */}
      {activeTab === 'process' && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">项目过程详解</h2>
              <p className="text-gray-600">深入了解每个设计阶段的工作内容与成果</p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden lg:block"></div>

              <div className="space-y-12">
                {caseStudy.processSteps.map((step, index) => (
                  <div key={index} className="relative flex gap-6 lg:gap-12">
                    {/* Timeline Dot */}
                    <div className="hidden lg:flex items-start">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow">
                      {/* Mobile Step Badge */}
                      <div className="lg:hidden flex items-center space-x-3 mb-4">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {step.step}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>

                      {/* Desktop Title */}
                      <h3 className="hidden lg:block text-2xl font-semibold text-gray-900 mb-4">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Images */}
                      {step.images.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">阶段成果：</p>
                          <div className={`grid gap-4 ${step.images.length === 1 ? 'grid-cols-1' : step.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                            {step.images.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => openLightbox(step.images, imgIndex)}
                              >
                                <img
                                  src={img || `https://picsum.photos/seed/step-${index}-${imgIndex}/600/400`}
                                  alt={`${step.title} - 图片 ${imgIndex + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm font-medium text-gray-700">点击放大</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comparison Tab Content */}
      {activeTab === 'comparison' && caseStudy.beforeAfter.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">前后效果对比</h2>
              <p className="text-gray-600">直观展示设计前后的变化与提升</p>
            </div>

            <div className="space-y-12">
              {caseStudy.beforeAfter.map((comparison, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {comparison.description || `对比 ${index + 1}`}
                  </h3>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Before */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">前</span>
                        </div>
                        <span className="font-medium text-gray-700">设计前</span>
                      </div>
                      <div className="grid gap-4">
                        {comparison.beforeImages.slice(0, 2).map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(comparison.beforeImages, imgIndex)}
                          >
                            <img
                              src={img || `https://picsum.photos/seed/before-${index}-${imgIndex}/600/400`}
                              alt={`设计前 - ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* After */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">后</span>
                        </div>
                        <span className="font-medium text-gray-700">设计后</span>
                      </div>
                      <div className="grid gap-4">
                        {comparison.afterImages.slice(0, 2).map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(comparison.afterImages, imgIndex)}
                          >
                            <img
                              src={img || `https://picsum.photos/seed/after-${index}-${imgIndex}/600/400`}
                              alt={`设计后 - ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Success indicator */}
                            <div className="absolute top-3 right-3">
                              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>优化</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Cases */}
      {relatedCases.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">相关案例</h2>
                <p className="text-gray-600">更多同类型的精彩项目</p>
              </div>
              <Link
                to="/cases"
                className="hidden md:inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((item) => (
                <Link
                  key={item.id}
                  to={`/cases/${item.id}`}
                  className="group block"
                >
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.processSteps[0]?.images[0] || `https://picsum.photos/seed/related-${item.id}/600/400`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full">
                            热门
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {item.projectType}
                        </span>
                        <span className="text-xs text-gray-500">{item.client}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            想要类似的项目成果？
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            每个案例都经过精心设计，让您的项目也能实现显著的视觉提升
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <span>了解服务</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center space-x-2 border border-white/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>联系我</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaseDetailPage;
