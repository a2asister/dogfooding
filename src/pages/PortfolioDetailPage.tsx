import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Info,
  Sparkles,
  MessageSquare,
  Grid,
  Play
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getPortfolioById,
  getPortfolios,
  incrementPortfolioView
} from '../data/services';
import type { Portfolio } from '../../types';

const PortfolioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [relatedPortfolios, setRelatedPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      setIsLoading(true);

      try {
        const portfolioData = await getPortfolioById(id);

        if (portfolioData) {
          setPortfolio(portfolioData);
          await incrementPortfolioView(id);

          const allPortfolios = await getPortfolios({ isPublished: true, sortBy: 'views' });
          const related = allPortfolios
            .filter(p => p.id !== id && p.categoryId === portfolioData.categoryId)
            .slice(0, 3);
          setRelatedPortfolios(related);
        }
      } catch (error) {
        console.error('Failed to load portfolio detail:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, setIsLoading]);

  const allImages = portfolio?.images || [];
  const totalImages = allImages.length;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
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

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">作品不存在</h2>
          <p className="text-gray-500 mb-6">您访问的作品可能已被删除或不存在</p>
          <Link
            to="/portfolio"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回作品列表</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
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
            src={allImages[currentImageIndex] || `https://picsum.photos/seed/${portfolio.id}/1200/800`}
            alt={portfolio.title}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">首页</Link>
            <span className="text-gray-400">/</span>
            <Link to="/portfolio" className="text-gray-500 hover:text-gray-700">作品</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{portfolio.title}</span>
          </div>
        </div>
      </div>

      {/* Main Image Gallery */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative">
            {/* Main Image */}
            <div
              className="relative aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={allImages[currentImageIndex] || `https://picsum.photos/seed/${portfolio.id}/1200/675`}
                alt={portfolio.title}
                className="w-full h-full object-cover"
              />
              {/* Navigation Overlay */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg">
                {currentImageIndex + 1} / {totalImages}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {totalImages > 1 && (
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${currentImageIndex === index ? 'ring-2 ring-purple-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <img
                      src={img || `https://picsum.photos/seed/${portfolio.id}-${index}/200/150`}
                      alt={`缩略图 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Basic Info */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {portfolio.isTop && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      置顶作品
                    </span>
                  )}
                  {portfolio.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{portfolio.title}</h1>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">{portfolio.description}</p>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Eye className="w-5 h-5" />
                      <span>{portfolio.viewCount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={toggleLike}
                      className="flex items-center space-x-2 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
                      />
                      <span className={isLiked ? 'text-red-500' : 'text-gray-500'}>
                        {portfolio.likeCount + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <Link
                      to="/portfolio"
                      className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>返回列表</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Concept */}
              {portfolio.concept && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">创作理念</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{portfolio.concept}</p>
                </div>
              )}

              {/* Parameters */}
              {portfolio.parameters.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">项目参数</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {portfolio.parameters.map((param, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{param.key}</p>
                          <p className="font-medium text-gray-900">{param.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail Images */}
              {portfolio.detailImages.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center space-x-2 mb-6">
                    <Grid className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">细节展示</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.detailImages.map((img, index) => (
                      <div
                        key={index}
                        className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => setShowLightbox(true)}
                      >
                        <img
                          src={img || `https://picsum.photos/seed/detail-${index}/400/300`}
                          alt={`细节图 ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {portfolio.videos.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center space-x-2 mb-6">
                    <Play className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">视频素材</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {portfolio.videos.map((video, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative group cursor-pointer"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 text-white text-sm">
                          视频 {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">作品信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">发布时间</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(portfolio.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">浏览量</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {portfolio.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">喜欢数</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {portfolio.likeCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* All Tags */}
                {portfolio.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <Link
                    to="/services"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>咨询类似项目</span>
                  </Link>
                  <Link
                    to="/portfolio"
                    className="w-full inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>浏览更多作品</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Portfolios */}
      {relatedPortfolios.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">相关作品</h2>
                <p className="text-gray-600">更多同类型的精彩设计</p>
              </div>
              <Link
                to="/portfolio"
                className="hidden md:inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPortfolios.map((item) => (
                <Link
                  key={item.id}
                  to={`/portfolio/${item.id}`}
                  className="group block"
                >
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.images[0] || `https://picsum.photos/seed/${item.id}/600/400`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{item.likeCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PortfolioDetailPage;
