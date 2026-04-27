import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';

const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });
  const [privacySetting, setPrivacySetting] = useState<'public' | 'delivery' | 'private'>('delivery');

  const resumeSections = [
    {
      id: 'basic',
      title: '基本信息',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      content: {
        name: '张三',
        phone: '138****8888',
        email: 'zhangsan@example.com',
        age: '28岁',
        workYears: '5年',
      },
    },
    {
      id: 'intent',
      title: '求职意向',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      content: {
        position: '前端开发工程师',
        salary: '25K-35K',
        city: '北京',
        status: '在职，考虑机会',
      },
    },
    {
      id: 'experience',
      title: '工作经历',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      items: [
        {
          company: '某知名互联网公司',
          position: '高级前端工程师',
          period: '2022.03 - 至今',
          description: '负责核心业务前端架构设计与开发，主导前端性能优化项目...',
        },
        {
          company: '某科技公司',
          position: '前端工程师',
          period: '2019.06 - 2022.02',
          description: '参与公司主要产品的前端开发工作...',
        },
      ],
    },
    {
      id: 'education',
      title: '教育经历',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      items: [
        {
          school: '北京大学',
          major: '计算机科学与技术',
          degree: '本科',
          period: '2015.09 - 2019.06',
        },
      ],
    },
    {
      id: 'skills',
      title: '技能证书',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      skills: ['React', 'Vue', 'TypeScript', 'Node.js', 'Webpack', 'Git', 'Docker'],
    },
    {
      id: 'self',
      title: '自我评价',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: '5年前端开发经验，熟练掌握 React/Vue 等主流框架，具备丰富的大型项目开发经验。善于团队协作，注重代码质量，持续学习新技术。',
    },
  ];

  const quickActions = [
    {
      id: 'upload',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      label: '上传简历',
    },
    {
      id: 'preview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      label: '预览简历',
    },
    {
      id: 'refresh',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: '刷新简历',
    },
    {
      id: 'privacy',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: '隐私设置',
    },
  ];

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'refresh':
        setAlertConfig({
          title: '刷新成功',
          message: '您的简历已成功刷新，将优先展示给 HR',
          type: 'success',
        });
        setShowAlert(true);
        break;
      case 'privacy':
        setShowPrivacyModal(true);
        break;
      default:
        console.log('Quick action:', id);
    }
  };

  const handlePrivacyChange = (value: 'public' | 'delivery' | 'private') => {
    setPrivacySetting(value);
  };

  const confirmPrivacy = () => {
    setShowPrivacyModal(false);
    setAlertConfig({
      title: '设置成功',
      message: '简历隐私设置已更新',
      type: 'success',
    });
    setShowAlert(true);
  };

  const getPrivacyText = () => {
    switch (privacySetting) {
      case 'public': return '简历公开';
      case 'delivery': return '仅投递可见';
      case 'private': return '简历私密';
      default: return '仅投递可见';
    }
  };

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
          <h1 className="text-xl font-bold text-gray-900 flex-1">我的简历</h1>
          <div className="flex items-center gap-2 text-sm text-primary-600">
            <span>完整度: 85%</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="flex flex-col items-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="text-primary-600">{action.icon}</div>
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {resumeSections.map((section, index) => (
            <div
              key={section.id}
              className={`p-4 ${index < resumeSections.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-primary-600">{section.icon}</div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                  <span>编辑</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {section.id === 'basic' && section.content && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-gray-500">姓名：</span>
                    <span className="text-gray-900">{section.content.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">年龄：</span>
                    <span className="text-gray-900">{section.content.age}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">电话：</span>
                    <span className="text-gray-900">{section.content.phone}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">工作年限：</span>
                    <span className="text-gray-900">{section.content.workYears}</span>
                  </div>
                  <div className="text-sm col-span-2">
                    <span className="text-gray-500">邮箱：</span>
                    <span className="text-gray-900">{section.content.email}</span>
                  </div>
                </div>
              )}

              {section.id === 'intent' && section.content && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-gray-500">期望职位：</span>
                    <span className="text-gray-900">{section.content.position}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">期望薪资：</span>
                    <span className="text-gray-900">{section.content.salary}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">期望城市：</span>
                    <span className="text-gray-900">{section.content.city}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">求职状态：</span>
                    <span className="text-green-600">{section.content.status}</span>
                  </div>
                </div>
              )}

              {section.id === 'experience' && section.items && (
                <div className="space-y-4">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.position}</h4>
                        <span className="text-xs text-gray-500">{item.period}</span>
                      </div>
                      <p className="text-sm text-primary-600 mb-2">{item.company}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.id === 'education' && section.items && (
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{item.school}</h4>
                        <span className="text-xs text-gray-500">{item.period}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.major} · {item.degree}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.id === 'skills' && section.skills && (
                <div className="flex flex-wrap gap-2">
                  {section.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-primary-50 text-primary-600 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.id === 'self' && section.content && (
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="简历隐私设置"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="btn-outline px-6 py-2.5 flex-1"
            >
              取消
            </button>
            <button
              onClick={confirmPrivacy}
              className="btn-primary px-6 py-2.5 flex-1"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <button
            onClick={() => handlePrivacyChange('public')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              privacySetting === 'public'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              privacySetting === 'public' ? 'border-primary-600' : 'border-gray-300'
            }`}>
              {privacySetting === 'public' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">简历公开</p>
              <p className="text-xs text-gray-500">所有企业都可以搜索并查看您的简历</p>
            </div>
          </button>

          <button
            onClick={() => handlePrivacyChange('delivery')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              privacySetting === 'delivery'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              privacySetting === 'delivery' ? 'border-primary-600' : 'border-gray-300'
            }`}>
              {privacySetting === 'delivery' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">仅投递可见</p>
              <p className="text-xs text-gray-500">只有您投递的企业可以查看您的简历</p>
            </div>
          </button>

          <button
            onClick={() => handlePrivacyChange('private')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              privacySetting === 'private'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              privacySetting === 'private' ? 'border-primary-600' : 'border-gray-300'
            }`}>
              {privacySetting === 'private' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">简历私密</p>
              <p className="text-xs text-gray-500">任何企业都无法搜索到您的简历</p>
            </div>
          </button>
        </div>
      </ConfirmModal>

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

export default ResumePage;
