import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Briefcase,
  Award,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  Palette
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getDesigner,
  getWorkExperiences,
  getServicePackages,
  getReviews
} from '../data/services';
import type { Designer, WorkExperience, ServicePackage, Review } from '../types';

const AboutPage: React.FC = () => {
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const [
          designerData,
          experiencesData,
          packagesData,
          reviewsData
        ] = await Promise.all([
          getDesigner(),
          getDesigner().then(d => d ? getWorkExperiences(d.id) : []),
          getServicePackages(true),
          getReviews({ limit: 5 })
        ]);

        setDesigner(designerData || null);
        setWorkExperiences(experiencesData);
        setPackages(packagesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load about page data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    });
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Avatar & Quick Info */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                    <img
                      src={designer?.avatar || 'https://i.pravatar.cc/400?img=1'}
                      alt={designer?.name || '设计师'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900"></div>
                </div>

                <h1 className="text-2xl font-bold mb-1">{designer?.name || '创意设计师'}</h1>
                <p className="text-purple-300 mb-4">{designer?.title || '资深UI/UX设计师'}</p>

                <div className="flex items-center justify-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-300">98% 好评率</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{designer?.experience || 8}+</p>
                    <p className="text-xs text-gray-400">从业年限</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-gray-400">完成项目</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">200+</p>
                    <p className="text-xs text-gray-400">合作客户</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/services"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>立即咨询</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-400" />
                    关于我
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {designer?.bio || '我是一名拥有8年经验的资深UI/UX设计师，专注于创造美观、实用且用户友好的数字产品体验。我相信设计不仅仅是视觉层面的工作，更是解决问题的艺术。在过去的职业生涯中，我有幸与众多知名品牌和创新型初创公司合作，帮助他们打造了一系列成功的产品。'}
                  </p>
                  <p className="text-gray-300 leading-relaxed mt-4">
                    我的设计理念是：以用户为中心，用简洁而有力的设计语言传达产品价值。无论是复杂的企业级应用还是精美的移动应用，我都能够根据项目需求提供定制化的设计解决方案。
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-400" />
                    专业技能
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(designer?.skills || ['UI设计', 'UX设计', '品牌设计', '网页设计', '移动应用设计', '交互设计', '视觉设计', '原型设计', '用户研究', '设计系统']).map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm hover:bg-white/20 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-purple-400" />
                    擅长风格
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(designer?.styles || ['极简主义', '现代简约', '企业商务', '科技感', '清新活泼', '高端奢华', '扁平化', '拟物化', '渐变风格', '赛博朋克']).map((style, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-600/30 backdrop-blur-sm rounded-full text-sm border border-purple-500/30"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-purple-400" />
                    联系方式
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">邮箱</p>
                        <p className="text-sm">{designer?.email || 'designer@example.com'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">电话</p>
                        <p className="text-sm">{designer?.phone || '138-0000-0000'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">所在地</p>
                        <p className="text-sm">{designer?.location || '北京市朝阳区'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">工作时间</p>
                        <p className="text-sm">周一至周五 9:00-18:00</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {designer?.socialLinks && designer.socialLinks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <ExternalLink className="w-5 h-5 mr-2 text-purple-400" />
                      社交链接
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {designer.socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">从业履历</h2>
            <p className="text-gray-600">丰富的行业经验，专业的项目积累</p>
          </div>

          {workExperiences.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden lg:block"></div>

              <div className="space-y-8">
                {workExperiences.map((exp) => (
                  <div key={exp.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className="hidden lg:flex items-start">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-purple-600 font-medium">{exp.company}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 lg:mt-0 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : '至今'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{exp.description}</p>

                      {exp.achievements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">主要成就：</p>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, aIndex) => (
                              <li key={aIndex} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-600 text-sm">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无从业履历信息</p>
            </div>
          )}
        </div>
      </section>

      {/* Services & Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'services' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                服务报价
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'reviews' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                客户评价
              </button>
            </div>
          </div>

          {/* Services Tab Content */}
          {activeTab === 'services' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">服务报价明细</h2>
                <p className="text-gray-600">透明的价格体系，专业的设计服务</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white rounded-2xl overflow-hidden transition-all hover:shadow-xl ${index === 1 ? 'border-2 border-purple-600 shadow-lg' : 'border border-gray-200'}`}
                  >
                    {index === 1 && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gradient-to-l from-purple-600 to-pink-600 text-white px-6 py-1 text-sm font-medium">
                          最受欢迎
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <p className="text-gray-500 text-sm mb-6">{pkg.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">¥{pkg.price.toLocaleString()}</span>
                          <span className="text-gray-500 ml-2">/项目</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {pkg.deliveryDays} 天交付
                          </span>
                          <span className="flex items-center">
                            <ArrowRight className="w-4 h-4 mr-1" />
                            {pkg.revisionLimit} 次修改
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-6 mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-3">包含服务：</p>
                        <ul className="space-y-3">
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
                      </div>

                      <Link
                        to="/services"
                        className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${index === 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        立即预约
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === 'reviews' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">客户评价</h2>
                <p className="text-gray-600">真实的客户反馈，专业的服务保障</p>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>

                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}

                      <p className="text-gray-600 text-sm mb-4 line-clamp-4">{review.content}</p>

                      {review.images.length > 0 && (
                        <div className="flex space-x-2 mb-4">
                          {review.images.slice(0, 3).map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="评价图片"
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                        <img
                          src={review.clientAvatar || 'https://i.pravatar.cc/40?img=2'}
                          alt={review.clientName}
                          className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{review.clientName}</p>
                        </div>
                      </div>

                      {review.reply && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                          <p className="text-xs text-purple-600 font-medium mb-1">设计师回复：</p>
                          <p className="text-sm text-gray-700">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无客户评价</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            准备好开始您的设计项目了吗？
          </h2>
          <p className="text-lg text-purple-100 mb-8">
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
              to="/portfolio"
              className="inline-flex items-center justify-center space-x-2 border border-white/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              <span>浏览作品</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
