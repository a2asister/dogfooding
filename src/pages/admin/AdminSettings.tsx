import React, { useEffect, useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Plus,
  Trash2,
  Palette,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Tag,
  Edit,
  MessageSquare
} from 'lucide-react';
import {
  getDesigner,
  updateDesigner,
  getWorkExperiences,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getQuickReplies,
  addQuickReply,
  updateQuickReply,
  deleteQuickReply
} from '../../data/services';
import { QUICK_REPLY_CATEGORIES } from '../../types';
import type { Designer, WorkExperience, QuickReply } from '../../types';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'quickReplies' | 'security' | 'appearance'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    avatar: '',
    title: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    experience: 0,
    skills: [] as string[],
    styles: [] as string[]
  });

  // Experience Form
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: ''
  });

  // Quick Reply Form
  const [quickReplyForm, setQuickReplyForm] = useState({
    title: '',
    content: '',
    category: QUICK_REPLY_CATEGORIES[0],
    sortOrder: 0,
    isActive: true
  });

  // Tag Input
  const [newSkill, setNewSkill] = useState('');
  const [newStyle, setNewStyle] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    messageNotifications: true,
    reviewNotifications: true
  });

  // Security
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD'
  });

  const loadData = async () => {
    try {
      const [designerData, experiencesData, quickRepliesData] = await Promise.all([
        getDesigner(),
        getWorkExperiences('demo-designer-id'),
        getQuickReplies()
      ]);

      setDesigner(designerData || null);
      setWorkExperiences(experiencesData);
      setQuickReplies(quickRepliesData);

      if (designerData) {
        setProfileForm({
          name: designerData.name,
          avatar: designerData.avatar,
          title: designerData.title,
          bio: designerData.bio,
          location: designerData.location,
          email: designerData.email,
          phone: designerData.phone,
          experience: designerData.experience,
          skills: designerData.skills,
          styles: designerData.styles
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!designer) return;

    setSaving(true);
    try {
      const updatedDesigner: Designer = {
        ...designer,
        name: profileForm.name,
        avatar: profileForm.avatar,
        title: profileForm.title,
        bio: profileForm.bio,
        location: profileForm.location,
        email: profileForm.email,
        phone: profileForm.phone,
        experience: profileForm.experience,
        skills: profileForm.skills,
        styles: profileForm.styles,
        updatedAt: Date.now()
      };

      await updateDesigner(updatedDesigner);
      setDesigner(updatedDesigner);
      alert('保存成功！');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setExperienceForm({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: ''
    });
    setShowExperienceModal(true);
  };

  const handleEditExperience = (exp: WorkExperience) => {
    setEditingExperience(exp);
    setExperienceForm({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      description: exp.description,
      achievements: exp.achievements.join('\n')
    });
    setShowExperienceModal(true);
  };

  const handleSaveExperience = async () => {
    setSaving(true);
    try {
      const achievements = experienceForm.achievements
        .split('\n')
        .map(a => a.trim())
        .filter(a => a);

      const experienceData = {
        designerId: 'demo-designer-id',
        company: experienceForm.company,
        position: experienceForm.position,
        startDate: experienceForm.startDate ? new Date(experienceForm.startDate).getTime() : Date.now(),
        endDate: experienceForm.endDate ? new Date(experienceForm.endDate).getTime() : null,
        description: experienceForm.description,
        achievements
      };

      if (editingExperience) {
        const updated: WorkExperience = {
          ...editingExperience,
          ...experienceData,
          updatedAt: Date.now()
        };
        await updateWorkExperience(updated);
        setWorkExperiences(workExperiences.map(e => e.id === editingExperience.id ? updated : e));
      } else {
        const id = await addWorkExperience(experienceData);
        const newExp: WorkExperience = {
          ...experienceData,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setWorkExperiences([...workExperiences, newExp]);
      }

      setShowExperienceModal(false);
    } catch (error) {
      console.error('Failed to save experience:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (confirm('确定要删除这条工作经历吗？')) {
      try {
        await deleteWorkExperience(id);
        setWorkExperiences(workExperiences.filter(e => e.id !== id));
      } catch (error) {
        console.error('Failed to delete experience:', error);
      }
    }
  };

  const handleAddQuickReply = () => {
    setEditingQuickReply(null);
    setQuickReplyForm({
      title: '',
      content: '',
      category: QUICK_REPLY_CATEGORIES[0],
      sortOrder: quickReplies.length,
      isActive: true
    });
    setShowQuickReplyModal(true);
  };

  const handleEditQuickReply = (reply: QuickReply) => {
    setEditingQuickReply(reply);
    setQuickReplyForm({
      title: reply.title,
      content: reply.content,
      category: reply.category,
      sortOrder: reply.sortOrder,
      isActive: reply.isActive
    });
    setShowQuickReplyModal(true);
  };

  const handleSaveQuickReply = async () => {
    setSaving(true);
    try {
      const replyData = {
        title: quickReplyForm.title,
        content: quickReplyForm.content,
        category: quickReplyForm.category,
        sortOrder: quickReplyForm.sortOrder,
        isActive: quickReplyForm.isActive
      };

      if (editingQuickReply) {
        const updated: QuickReply = {
          ...editingQuickReply,
          ...replyData,
          updatedAt: Date.now()
        };
        await updateQuickReply(updated);
        setQuickReplies(quickReplies.map(r => r.id === editingQuickReply.id ? updated : r));
      } else {
        const id = await addQuickReply(replyData);
        const newReply: QuickReply = {
          ...replyData,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setQuickReplies([...quickReplies, newReply]);
      }

      setShowQuickReplyModal(false);
    } catch (error) {
      console.error('Failed to save quick reply:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuickReply = async (id: string) => {
    if (confirm('确定要删除这条快捷回复吗？')) {
      try {
        await deleteQuickReply(id);
        setQuickReplies(quickReplies.filter(r => r.id !== id));
      } catch (error) {
        console.error('Failed to delete quick reply:', error);
      }
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(s => s !== skill)
    });
  };

  const handleAddStyle = () => {
    if (newStyle.trim() && !profileForm.styles.includes(newStyle.trim())) {
      setProfileForm({
        ...profileForm,
        styles: [...profileForm.styles, newStyle.trim()]
      });
      setNewStyle('');
    }
  };

  const handleRemoveStyle = (style: string) => {
    setProfileForm({
      ...profileForm,
      styles: profileForm.styles.filter(s => s !== style)
    });
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'quickReplies', label: '快捷回复', icon: MessageSquare },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'appearance', label: '显示设置', icon: Palette }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
          <p className="text-gray-500 mt-1">管理您的个人信息、通知、快捷回复和安全设置</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>基本信息</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Avatar */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4">
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>上传头像</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">职位/头衔</label>
                        <input
                          type="text"
                          value={profileForm.title}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="例如：资深UI设计师"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Mail className="w-4 h-4 inline mr-1" /> 邮箱
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Phone className="w-4 h-4 inline mr-1" /> 电话
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="w-4 h-4 inline mr-1" /> 所在城市
                        </label>
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="例如：北京市"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Briefcase className="w-4 h-4 inline mr-1" /> 从业年限
                        </label>
                        <input
                          type="number"
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm({ ...profileForm, experience: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="介绍一下您自己..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>专业技能</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">技能标签</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileForm.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-purple-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="输入技能名称，按回车添加"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Styles */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>擅长风格</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">风格标签</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileForm.styles.map((style) => (
                        <span
                          key={style}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          <Palette className="w-3 h-3" />
                          <span>{style}</span>
                          <button
                            onClick={() => handleRemoveStyle(style)}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newStyle}
                        onChange={(e) => setNewStyle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStyle()}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="输入风格名称，按回车添加"
                      />
                      <button
                        onClick={handleAddStyle}
                        className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>工作经历</span>
                  </h3>
                  <button
                    onClick={handleAddExperience}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加经历</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {workExperiences.length > 0 ? (
                    workExperiences.map((exp) => (
                      <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{exp.position}</h4>
                            <p className="text-purple-600 text-sm">{exp.company}</p>
                            <p className="text-gray-500 text-sm mt-1">
                              {new Date(exp.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                              {' - '}
                              {exp.endDate ? new Date(exp.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : '至今'}
                            </p>
                            {exp.description && (
                              <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                            )}
                            {exp.achievements.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {exp.achievements.map((achievement, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditExperience(exp)}
                              className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">暂无工作经历</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>保存设置</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>通知设置</span>
              </h3>

              <div className="space-y-6">
                {[
                  { key: 'emailNotifications', label: '邮件通知', description: '通过邮件接收重要更新' },
                  { key: 'pushNotifications', label: '推送通知', description: '在浏览器中接收实时通知' },
                  { key: 'orderUpdates', label: '订单更新', description: '订单状态变更时通知' },
                  { key: 'messageNotifications', label: '消息通知', description: '收到新消息时通知' },
                  { key: 'reviewNotifications', label: '评价通知', description: '收到新评价时通知' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications]
                      })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-purple-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Save className="w-5 h-5" />
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Replies Tab */}
          {activeTab === 'quickReplies' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>快捷回复</span>
                  </h3>
                  <button
                    onClick={handleAddQuickReply}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加回复</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {quickReplies.length > 0 ? (
                    quickReplies.map((reply) => (
                      <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{reply.title}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                reply.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {reply.isActive ? '启用' : '禁用'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {reply.category}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{reply.content}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditQuickReply(reply)}
                              className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuickReply(reply.id)}
                              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">暂无快捷回复</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>安全设置</span>
              </h3>

              <div className="space-y-8">
                {/* Password Change */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">修改密码</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two Factor Auth */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">两步验证</h4>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">启用两步验证</p>
                      <p className="text-sm text-gray-500">增强账户安全性，每次登录需要验证码</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                      启用
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">活跃会话</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">当前设备</p>
                          <p className="text-sm text-gray-500">Chrome on macOS · 当前会话</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <Check className="w-3 h-3 mr-1" /> 活跃
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Save className="w-5 h-5" />
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>显示设置</span>
              </h3>

              <div className="space-y-6 max-w-lg">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">主题</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: '浅色', icon: Globe },
                      { id: 'dark', label: '深色', icon: Clock },
                      { id: 'auto', label: '跟随系统', icon: Settings }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          appearance.theme === theme.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <theme.icon className={`w-6 h-6 mx-auto mb-2 ${
                          appearance.theme === theme.id ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          appearance.theme === theme.id ? 'text-purple-700 font-medium' : 'text-gray-600'
                        }`}>
                          {theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
                  <select
                    value={appearance.language}
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时区</label>
                  <select
                    value={appearance.timezone}
                    onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Asia/Shanghai">中国 (GMT+8)</option>
                    <option value="Asia/Tokyo">日本 (GMT+9)</option>
                    <option value="America/New_York">美国东部 (GMT-5)</option>
                    <option value="Europe/London">伦敦 (GMT+0)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期格式</label>
                  <select
                    value={appearance.dateFormat}
                    onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="YYYY-MM-DD">2024-01-15</option>
                    <option value="DD/MM/YYYY">15/01/2024</option>
                    <option value="MM/DD/YYYY">01/15/2024</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Save className="w-5 h-5" />
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowExperienceModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingExperience ? '编辑工作经历' : '添加工作经历'}
                </h3>
                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                    <input
                      type="text"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                    <input
                      type="text"
                      value={experienceForm.position}
                      onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                    <input
                      type="date"
                      value={experienceForm.startDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                    <input
                      type="date"
                      value={experienceForm.endDate}
                      onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="留空表示至今"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作描述</label>
                  <textarea
                    rows={3}
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">成就（每行一个）</label>
                  <textarea
                    rows={3}
                    value={experienceForm.achievements}
                    onChange={(e) => setExperienceForm({ ...experienceForm, achievements: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="负责公司品牌设计项目&#10;获得红点设计奖"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveExperience}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <span>保存</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reply Modal */}
      {showQuickReplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowQuickReplyModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingQuickReply ? '编辑快捷回复' : '添加快捷回复'}
                </h3>
                <button
                  onClick={() => setShowQuickReplyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={quickReplyForm.title}
                    onChange={(e) => setQuickReplyForm({ ...quickReplyForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="例如：问候语"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={quickReplyForm.category}
                    onChange={(e) => setQuickReplyForm({ ...quickReplyForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {QUICK_REPLY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">回复内容</label>
                  <textarea
                    rows={4}
                    value={quickReplyForm.content}
                    onChange={(e) => setQuickReplyForm({ ...quickReplyForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="输入快捷回复内容..."
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quickReplyForm.isActive}
                      onChange={(e) => setQuickReplyForm({ ...quickReplyForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">启用此快捷回复</span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowQuickReplyModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveQuickReply}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <span>保存</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
