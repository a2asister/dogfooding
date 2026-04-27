import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal, AlertModal } from '@/components/common/Modal';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCancelAccountModal, setShowCancelAccountModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const [notifications, setNotifications] = useState({
    newJob: true,
    newMessage: true,
    interview: true,
    application: true,
  });

  const [privacy, setPrivacy] = useState({
    resumeVisible: true,
    contactVisible: false,
    searchable: true,
  });

  const menuGroups = [
    {
      title: '账号管理',
      items: [
        {
          id: 'password',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          label: '修改密码',
          type: 'action',
        },
        {
          id: 'phone',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          ),
          label: '更换手机号',
          type: 'action',
        },
        {
          id: 'profile',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: '编辑资料',
          type: 'action',
        },
      ],
    },
    {
      title: '消息设置',
      items: [
        {
          id: 'newJob',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          label: '职位推荐',
          type: 'toggle',
          value: notifications.newJob,
        },
        {
          id: 'newMessage',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
          label: 'HR 消息',
          type: 'toggle',
          value: notifications.newMessage,
        },
        {
          id: 'interview',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: '面试通知',
          type: 'toggle',
          value: notifications.interview,
        },
        {
          id: 'application',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          label: '投递状态',
          type: 'toggle',
          value: notifications.application,
        },
      ],
    },
    {
      title: '隐私设置',
      items: [
        {
          id: 'resumeVisible',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: '简历可见',
          type: 'toggle',
          value: privacy.resumeVisible,
        },
        {
          id: 'contactVisible',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          label: '联系方式可见',
          type: 'toggle',
          value: privacy.contactVisible,
        },
        {
          id: 'searchable',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
          label: '允许企业搜索',
          type: 'toggle',
          value: privacy.searchable,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          id: 'help',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: '帮助中心',
          type: 'action',
        },
        {
          id: 'feedback',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          label: '意见反馈',
          type: 'action',
        },
        {
          id: 'about',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: '关于我们',
          type: 'action',
          value: 'v1.0.0',
        },
      ],
    },
  ];

  const handleMenuClick = (id: string) => {
    switch (id) {
      case 'password':
        setShowPasswordModal(true);
        break;
      case 'phone':
        setShowPhoneModal(true);
        break;
      case 'profile':
        setShowProfileModal(true);
        break;
      case 'help':
        setAlertConfig({
          title: '帮助中心',
          message: '帮助中心功能正在开发中，敬请期待。',
          type: 'info',
        });
        setShowAlert(true);
        break;
      case 'feedback':
        setAlertConfig({
          title: '意见反馈',
          message: '意见反馈功能正在开发中，敬请期待。',
          type: 'info',
        });
        setShowAlert(true);
        break;
      case 'about':
        setAlertConfig({
          title: '关于我们',
          message: '招聘 APP v1.0.0\n专注于为求职者提供优质的招聘服务体验。',
          type: 'info',
        });
        setShowAlert(true);
        break;
    }
  };

  const handleToggle = (id: string) => {
    if (['newJob', 'newMessage', 'interview', 'application'].includes(id)) {
      setNotifications((prev) => ({
        ...prev,
        [id]: !prev[id as keyof typeof prev],
      }));
    } else if (['resumeVisible', 'contactVisible', 'searchable'].includes(id)) {
      setPrivacy((prev) => ({
        ...prev,
        [id]: !prev[id as keyof typeof prev],
      }));
    }
  };

  const confirmCancelAccount = () => {
    setShowCancelAccountModal(false);
    setAlertConfig({
      title: '注销申请已提交',
      message: '您的账号注销申请已提交，将在7个工作日内处理完成。',
      type: 'success',
    });
    setShowAlert(true);
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
          <h1 className="text-xl font-bold text-gray-900 flex-1">设置</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? 'mt-4' : ''}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-xl overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => item.type === 'action' ? handleMenuClick(item.id) : undefined}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                    index < group.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="text-primary-600">{item.icon}</div>
                  <span className="flex-1 text-left text-gray-800">{item.label}</span>
                  
                  {item.type === 'action' && (
                    <>
                      {item.value && (
                        <span className="text-sm text-gray-400 mr-2">{item.value}</span>
                      )}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}

                  {item.type === 'toggle' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.id);
                      }}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        item.value ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></div>
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4">
          <button
            onClick={() => setShowCancelAccountModal(true)}
            className="w-full bg-white rounded-xl py-3.5 text-red-500 font-medium hover:bg-red-50 transition-colors"
          >
            注销账号
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">版本 v1.0.0</p>
          <p className="text-gray-400 text-xs mt-1">© 2024 招聘 APP</p>
        </div>
      </div>

      <ConfirmModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="修改密码"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="btn-outline px-6 py-2.5 flex-1"
            >
              取消
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setAlertConfig({
                  title: '密码修改成功',
                  message: '您的密码已成功修改，请使用新密码登录。',
                  type: 'success',
                });
                setShowAlert(true);
              }}
              className="btn-primary px-6 py-2.5 flex-1"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原密码</label>
            <input
              type="password"
              placeholder="请输入原密码"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              type="password"
              placeholder="请输入新密码（至少6位）"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              type="password"
              placeholder="请再次输入新密码"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="更换手机号"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowPhoneModal(false)}
              className="btn-outline px-6 py-2.5 flex-1"
            >
              取消
            </button>
            <button
              onClick={() => {
                setShowPhoneModal(false);
                setAlertConfig({
                  title: '手机号更换成功',
                  message: '您的手机号已成功更换。',
                  type: 'success',
                });
                setShowAlert(true);
              }}
              className="btn-primary px-6 py-2.5 flex-1"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原手机号</label>
            <div className="flex gap-2">
              <input
                type="text"
                value="138****8888"
                disabled
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <button className="px-4 py-2.5 text-primary-600 text-sm font-medium">获取验证码</button>
            </div>
            <input
              type="text"
              placeholder="请输入验证码"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mt-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新手机号</label>
            <input
              type="tel"
              placeholder="请输入新手机号"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="编辑资料"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowProfileModal(false)}
              className="btn-outline px-6 py-2.5 flex-1"
            >
              取消
            </button>
            <button
              onClick={() => {
                setShowProfileModal(false);
                setAlertConfig({
                  title: '资料修改成功',
                  message: '您的个人资料已成功更新。',
                  type: 'success',
                });
                setShowAlert(true);
              }}
              className="btn-primary px-6 py-2.5 flex-1"
            >
              保存
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              defaultValue="求职者"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">求职状态</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>求职中</option>
              <option>观望机会</option>
              <option>暂不求职</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
            <textarea
              rows={3}
              placeholder="简单介绍一下自己..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={showCancelAccountModal}
        onClose={() => setShowCancelAccountModal(false)}
        title="确认注销账号"
        confirmText="确认注销"
        danger={true}
        onConfirm={confirmCancelAccount}
      >
        <div className="text-sm text-gray-600 space-y-3">
          <p>注销账号将清除您的所有数据，包括：</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>个人信息及简历</li>
            <li>投递记录与面试记录</li>
            <li>收藏与浏览记录</li>
            <li>消息与聊天记录</li>
          </ul>
          <p className="text-red-500 font-medium">此操作不可恢复，请谨慎操作。</p>
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

export default SettingsPage;
