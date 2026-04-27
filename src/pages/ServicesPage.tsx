import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Clock,
  Star,
  ArrowRight,
  MessageSquare,
  Palette,
  Layers,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getServicePackages,
  getReviews
} from '../data/services';
import type { ServicePackage, Review } from '../../types';

const ServicesPage: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const [packagesData, reviewsData] = await Promise.all([
          getServicePackages(true),
          getReviews({ limit: 6 })
        ]);

        setPackages(packagesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load services data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

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
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">专业设计服务 · 品质保证</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              专业设计服务
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              提供全方位的设计解决方案，从品牌设计到用户体验优化，
              每一项服务都经过精心设计，帮助您的产品脱颖而出
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold mb-1">{packages.length}</p>
                <p className="text-sm text-gray-400">服务套餐</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold mb-1">8+</p>
                <p className="text-sm text-gray-400">从业年限</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold mb-1">200+</p>
                <p className="text-sm text-gray-400">满意客户</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold mb-1">98%</p>
                <p className="text-sm text-gray-400">好评率</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">服务品类</h2>
            <p className="text-gray-600">专业的设计服务，满足您的各种需求</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Palette,
                title: 'UI设计',
                desc: '移动应用和网站界面设计，打造美观易用的用户界面',
                features: ['移动应用UI', '网站界面', '响应式设计', '交互原型']
              },
              {
                icon: Layers,
                title: '品牌设计',
                desc: '品牌视觉识别系统设计，建立独特的品牌形象',
                features: ['Logo设计', 'VI系统', '品牌手册', '物料设计']
              },
              {
                icon: Eye,
                title: 'UX设计',
                desc: '用户体验研究和交互设计，提升产品用户体验',
                features: ['用户研究', '信息架构', '交互设计', '可用性测试']
              },
              {
                icon: TrendingUp,
                title: '网页设计',
                desc: '企业官网和电商平台设计，打造专业的线上形象',
                features: ['企业官网', '电商平台', '营销页面', '后台管理']
              }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <service.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">服务套餐</h2>
            <p className="text-gray-600">透明的价格体系，灵活的服务选择</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl overflow-hidden transition-all hover:shadow-xl ${index === 1 ? 'border-2 border-purple-600 shadow-lg scale-105 z-10' : 'border border-gray-200'}`}
              >
                {/* Popular Badge */}
                {index === 1 && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-l from-purple-600 to-pink-600 text-white px-6 py-1.5 text-sm font-medium">
                      最受欢迎
                    </div>
                  </div>
                )}

                <div className={`p-8 ${index === 1 ? 'pt-12' : ''}`}>
                  {/* Package Name */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-500 text-sm">{pkg.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">¥{pkg.price.toLocaleString()}</span>
                      <span className="text-gray-500 ml-2">/项目</span>
                    </div>
                    <div className="flex items-center justify-center space-x-6 mt-3 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{pkg.deliveryDays} 天交付</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="w-4 h-4" />
                        <span>{pkg.revisionLimit} 次修改</span>
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <p className="text-sm font-medium text-gray-700 mb-3">包含服务：</p>
                    {pkg.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${index === 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>立即咨询</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Flow */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">服务流程</h2>
            <p className="text-gray-600">标准化的服务流程，确保项目顺利交付</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: '需求沟通', desc: '深入了解您的需求和期望', icon: MessageSquare },
              { step: '02', title: '方案确认', desc: '制定详细的设计方案', icon: Check },
              { step: '03', title: '设计执行', desc: '按计划推进设计工作', icon: Palette },
              { step: '04', title: '修改优化', desc: '根据反馈进行修改优化', icon: RefreshCw },
              { step: '05', title: '交付验收', desc: '交付源文件，项目验收', icon: Check }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-purple-600 font-bold text-sm mb-2">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>

                {/* Arrow */}
                {index < 4 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">常见问题</h2>
            <p className="text-gray-600">了解更多关于服务的细节</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: '如何开始一个设计项目？',
                answer: '您可以通过页面上的咨询按钮联系我，我们会先进行一次免费的需求沟通，了解您的具体需求后提供报价和时间表。确认合作后签署合同并支付定金，然后开始项目执行。'
              },
              {
                question: '设计修改次数有限制吗？',
                answer: '是的，每个套餐都包含一定次数的免费修改。基础套餐包含2次修改，专业套餐包含3次修改，企业定制套餐包含5次修改。如果需要额外的修改，会根据工作量收取额外费用。'
              },
              {
                question: '交付时会提供哪些文件？',
                answer: '项目完成后会交付完整的源文件，包括：Figma/Sketch源文件、PNG/JPG预览图、标注切图（如需要）、使用规范文档。所有文件都会打包发送给您。'
              },
              {
                question: '如果对设计不满意可以退款吗？',
                answer: '我们承诺确保客户满意。如果在设计过程中对方向有异议，我们会根据您的反馈进行调整。如果经过3次修改后仍不满意，我们会根据已完成的工作量进行协商退款。'
              },
              {
                question: '可以加急完成项目吗？',
                answer: '可以的，我们提供加急服务。加急项目需要额外支付30%-50%的费用，具体取决于项目复杂度和时间要求。请在咨询时说明您的时间要求。'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">
                      Q
                    </span>
                    {faq.question}
                  </span>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed pl-11">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Reviews */}
      {reviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">客户评价</h2>
              <p className="text-gray-600">听听客户怎么说</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-2xl p-6">
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

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <img
                      src={review.clientAvatar || 'https://i.pravatar.cc/40?img=3'}
                      alt={review.clientName}
                      className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.clientName}</p>
                    </div>
                  </div>

                  {review.reply && (
                    <div className="mt-4 p-4 bg-white rounded-xl">
                      <p className="text-xs text-purple-600 font-medium mb-1">设计师回复：</p>
                      <p className="text-sm text-gray-700">{review.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
              to="/about"
              className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>立即咨询</span>
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center justify-center space-x-2 border border-white/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              <span>浏览作品</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// RefreshCw icon
const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export default ServicesPage;
