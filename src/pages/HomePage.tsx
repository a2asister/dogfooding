import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Palette,
  Layers,
  TrendingUp,
  Users,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getDesigner,
  getPortfolios,
  getCaseStudies,
  getServicePackages,
  getReviews,
  getDailyStats
} from '../data/services';
import type { Portfolio, CaseStudy, ServicePackage, Review, Designer, DailyStats } from '../types';

const HomePage: React.FC = () => {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const [
          designerData,
          portfoliosData,
          caseStudiesData,
          packagesData,
          reviewsData,
          statsData
        ] = await Promise.all([
          getDesigner(),
          getPortfolios({ isPublished: true, limit: 6, sortBy: 'views' }),
          getCaseStudies({ isFeatured: true, limit: 3 }),
          getServicePackages(true),
          getReviews({ isFeatured: true, limit: 5 }),
          getDailyStats()
        ]);

        setDesigner(designerData);
        setPortfolios(portfoliosData);
        setCaseStudies(caseStudiesData);
        setPackages(packagesData);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

  // 轮播图自动播放
  useEffect(() => {
    if (portfolios.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(portfolios.length, 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [portfolios.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(portfolios.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(portfolios.length, 3)) % Math.min(portfolios.length, 3));
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

  return (
    <div className="min-h-screen">
      {/* Hero Banner 设计师个人形象展示 */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">资深设计师 · 8年经验</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                创意设计
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  改变世界
                </span>
              </h1>

              <p className="text-lg text-gray-100 mb-8 max-w-lg">
                {designer?.bio || '专注于用户体验设计和品牌视觉设计，将复杂的产品需求转化为优雅的用户界面。'}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/portfolio"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <span>浏览作品</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center space-x-2 border border-white/30 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <span>了解服务</span>
                </Link>
              </div>

              {/* Skills Tags */}
              <div className="mt-10">
                <p className="text-sm text-gray-200 mb-3">擅长领域</p>
                <div className="flex flex-wrap gap-2">
                  {designer?.skills?.slice(0, 5).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Designer Avatar */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden">
                    <img
                      src={designer?.avatar || 'https://i.pravatar.cc/400?img=1'}
                      alt="设计师头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating Stats Cards */}
                <div className="absolute -top-4 -right-4 bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || '10K+'}</p>
                      <p className="text-xs text-gray-500">作品浏览</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalPortfolios || 50}+</p>
                      <p className="text-xs text-gray-500">设计作品</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 作品精选轮播陈列 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">精选作品</h2>
              <p className="text-gray-600">探索我的最新设计作品</p>
            </div>
            <Link
              to="/portfolio"
              className="hidden md:inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Carousel */}
          {portfolios.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {portfolios.slice(0, 3).map((portfolio) => (
                    <div key={portfolio.id} className="w-full flex-shrink-0">
                      <Link to={`/portfolio/${portfolio.id}`} className="block group">
                        <div className="relative aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden">
                          <img
                            src={portfolio.images[0] || 'https://picsum.photos/seed/portfolio/1200/600'}
                            alt={portfolio.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {portfolio.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{portfolio.title}</h3>
                            <p className="text-gray-100 line-clamp-2 max-w-2xl">
                              {portfolio.description}
                            </p>
                            <div className="flex items-center space-x-6 mt-4 text-gray-200">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{portfolio.viewCount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">{portfolio.likeCount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {portfolios.slice(0, 3).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'w-8 bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {portfolios.slice(0, 6).map((portfolio) => (
              <Link
                key={portfolio.id}
                to={`/portfolio/${portfolio.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={portfolio.images[0] || 'https://picsum.photos/seed/portfolio/600/400'}
                    alt={portfolio.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {portfolio.isTop && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
                      置顶
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {portfolio.title}
                </h3>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{portfolio.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{portfolio.likeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="text-center mt-10 md:hidden">
            <Link
              to="/portfolio"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <span>查看全部作品</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 服务品类快捷入口 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">设计服务</h2>
            <p className="text-gray-600">专业的设计服务，满足您的各种需求</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: 'UI设计', desc: '移动应用和网站界面设计', color: 'purple' },
              { icon: Layers, title: '品牌设计', desc: '品牌视觉识别系统设计', color: 'pink' },
              { icon: Briefcase, title: '网页设计', desc: '企业官网和电商平台设计', color: 'blue' },
              { icon: Eye, title: 'UX设计', desc: '用户体验研究和交互设计', color: 'green' },
            ].map((service, index) => (
              <Link
                key={index}
                to="/services"
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${service.color}-100 flex items-center justify-center group-hover:bg-${service.color}-200 transition-colors`}>
                  <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </Link>
            ))}
          </div>

          {/* Service Packages */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">服务套餐</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-2xl p-8 ${index === 1 ? 'border-2 border-purple-600 shadow-xl scale-105' : 'border border-gray-200 shadow-sm'}`}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        最受欢迎
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                    <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">¥{pkg.price.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">/项目</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/services"
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${index === 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    立即预约
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 最新动态及合作案例数据统计展示 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Eye, label: '作品浏览', value: stats?.totalViews?.toLocaleString() || '12,500+', color: 'purple' },
              { icon: Users, label: '合作客户', value: stats?.totalOrders?.toLocaleString() || '200+', color: 'blue' },
              { icon: ShoppingCart, label: '完成订单', value: stats?.totalOrders?.toLocaleString() || '156', color: 'green' },
              { icon: Star, label: '用户好评', value: '98%', color: 'yellow' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Featured Case Studies */}
          <div className="mb-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">成功案例</h2>
                <p className="text-gray-600">了解我们的项目经验</p>
              </div>
              <Link
                to="/cases"
                className="hidden md:inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy.id}
                  to={`/cases/${caseStudy.id}`}
                  className="group block"
                >
                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                    <img
                      src={caseStudy.processSteps[0]?.images[0] || 'https://picsum.photos/seed/case/600/400'}
                      alt={caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {caseStudy.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
                        热门推荐
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {caseStudy.projectType}
                    </span>
                    <span className="text-xs text-gray-500">{caseStudy.client}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                    {caseStudy.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{caseStudy.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{caseStudy.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">客户评价</h2>
              <p className="text-gray-600">听听客户怎么说</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">{review.content}</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={review.clientAvatar || 'https://i.pravatar.cc/40?img=1'}
                      alt={review.clientName}
                      className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{review.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {review.reply && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">设计师回复：</p>
                      <p className="text-sm text-gray-700">{review.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            准备好开始您的项目了吗？
          </h2>
          <p className="text-lg text-white mb-8">
            无论是品牌设计、UI设计还是用户体验优化，我都能帮助您实现目标
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <span>查看服务</span>
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

export default HomePage;
