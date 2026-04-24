import React, { useState } from 'react';
import {
  Save,
  Download,
  Database,
  Bell,
  Shield,
  User,
  Building2,
  Clock,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  BedDouble,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToJSON } from '@/utils';
import { mockUsers } from '@/data/mockData';

const Settings: React.FC = () => {
  const { rooms, orders, customers, workOrders, priceStrategies, discounts, exceptionReports } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('general');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [hotelSettings, setHotelSettings] = useState({
    name: '豪华大酒店',
    address: '北京市朝阳区建国路88号',
    phone: '400-888-8888',
    email: 'contact@hotel.com',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    totalRooms: rooms.length,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrder: true,
    orderCancelled: true,
    roomMaintenance: true,
    dailyReport: false,
    priceChange: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'yyyy-MM-dd',
    currency: 'CNY',
    autoBackup: true,
    backupInterval: 'daily',
  });

  const tabs = [
    { id: 'general', label: '基础设置', icon: Building2 },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'backup', label: '数据备份', icon: Database },
    { id: 'permissions', label: '权限管理', icon: Shield },
    { id: 'system', label: '系统设置', icon: RefreshCw },
  ];

  const handleSave = () => {
    setSaveMessage({ type: 'success', text: '设置已保存成功！' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleExportData = (type: 'rooms' | 'orders' | 'customers' | 'all') => {
    let data: Record<string, unknown>[] = [];
    let filename = '';

    switch (type) {
      case 'rooms':
        data = rooms.map(r => ({
          房间号: r.roomNumber,
          类型: r.type === 'standard' ? '标准间' : r.type === 'king' ? '大床房' : r.type === 'deluxe' ? '豪华间' : '套房',
          楼层: r.floor,
          面积: r.area,
          状态: r.status === 'available' ? '空闲' : r.status === 'booked' ? '已预订' : r.status === 'occupied' ? '已入住' : r.status === 'cleaning' ? '待清洁' : '维修中',
          基础价格: r.basePrice,
        }));
        filename = '客房数据';
        break;
      case 'orders':
        data = orders.map(o => ({
          订单号: o.orderNumber,
          客户姓名: o.customerName,
          联系电话: o.customerPhone,
          房间类型: o.roomType === 'standard' ? '标准间' : o.roomType === 'king' ? '大床房' : o.roomType === 'deluxe' ? '豪华间' : '套房',
          入住日期: o.checkInDate,
          退房日期: o.checkOutDate,
          订单金额: o.totalAmount,
          支付状态: o.paymentStatus === 'paid' ? '已支付' : o.paymentStatus === 'partial' ? '部分支付' : '待支付',
          订单状态: o.status === 'pending' ? '待确认' : o.status === 'confirmed' ? '已确认' : o.status === 'checked_in' ? '已入住' : o.status === 'checked_out' ? '已退房' : '已取消',
        }));
        filename = '订单数据';
        break;
      case 'customers':
        data = customers.map(c => ({
          客户姓名: c.name,
          联系电话: c.phone,
          客户类型: c.type === 'new' ? '新客户' : c.type === 'regular' ? '老客户' : 'VIP客户',
          入住次数: c.totalStays,
          累计消费: c.totalSpent,
          首次入住: c.createdAt.split('T')[0],
        }));
        filename = '客户数据';
        break;
      case 'all':
        exportToJSON({
          rooms,
          orders,
          customers,
          workOrders,
          priceStrategies,
          discounts,
          exceptionReports,
        }, '全量数据备份');
        alert('全量数据已导出为 JSON 文件');
        return;
    }

    exportToCSV(data, filename);
    alert(`${filename}已导出为 CSV 文件`);
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      alert('数据已重置（演示模式）');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">管理酒店系统配置和数据</p>
        </div>
        <Button variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          保存设置
        </Button>
      </div>

      {saveMessage && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          saveMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {saveMessage.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <AlertCircle className="w-5 h-5 text-red-600" />
          }
          <span className={saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {saveMessage.text}
          </span>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">当前登录用户</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{currentUser?.name[0]}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-sm text-gray-500">
                  {currentUser?.role === 'admin' ? '管理员' :
                   currentUser?.role === 'manager' ? '经理' :
                   currentUser?.role === 'reception' ? '前台' : '客房服务'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>酒店基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">酒店名称</label>
                      <Input
                        value={hotelSettings.name}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                      <Input
                        value={hotelSettings.phone}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                      <Input
                        value={hotelSettings.email}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">总房间数</label>
                      <Input
                        value={hotelSettings.totalRooms}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">酒店地址</label>
                      <TextArea
                        value={hotelSettings.address}
                        onChange={(e) => setHotelSettings({ ...hotelSettings, address: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>入住退房时间设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">入住时间</label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <Input
                          type="time"
                          value={hotelSettings.checkInTime}
                          onChange={(e) => setHotelSettings({ ...hotelSettings, checkInTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">退房时间</label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <Input
                          type="time"
                          value={hotelSettings.checkOutTime}
                          onChange={(e) => setHotelSettings({ ...hotelSettings, checkOutTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>通知提醒设置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'newOrder', label: '新订单通知', desc: '有新订单时发送通知' },
                    { key: 'orderCancelled', label: '订单取消通知', desc: '订单被取消时发送通知' },
                    { key: 'roomMaintenance', label: '客房维护通知', desc: '客房需要维护时发送通知' },
                    { key: 'dailyReport', label: '每日运营报告', desc: '每日自动发送运营报告' },
                    { key: 'priceChange', label: '价格变动通知', desc: '价格策略变更时发送通知' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings],
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notificationSettings[item.key as keyof typeof notificationSettings]
                            ? 'bg-primary'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notificationSettings[item.key as keyof typeof notificationSettings]
                            ? 'left-7'
                            : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>数据导出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'rooms' as const, label: '导出客房数据', icon: BedDouble, desc: '导出所有客房信息为 CSV' },
                      { type: 'orders' as const, label: '导出订单数据', icon: FileText, desc: '导出所有订单信息为 CSV' },
                      { type: 'customers' as const, label: '导出客户数据', icon: User, desc: '导出所有客户信息为 CSV' },
                      { type: 'all' as const, label: '全量数据备份', icon: Database, desc: '导出所有数据为 JSON' },
                    ].map(item => (
                      <button
                        key={item.type}
                        onClick={() => handleExportData(item.type)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <Download className="w-5 h-5 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>自动备份设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">启用自动备份</p>
                        <p className="text-sm text-gray-500 mt-1">系统将自动定期备份数据</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings({
                          ...systemSettings,
                          autoBackup: !systemSettings.autoBackup,
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          systemSettings.autoBackup ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          systemSettings.autoBackup ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">备份频率</label>
                      <Select
                        value={systemSettings.backupInterval}
                        onChange={(e) => setSystemSettings({ ...systemSettings, backupInterval: e.target.value })}
                        options={[
                          { value: 'hourly', label: '每小时' },
                          { value: 'daily', label: '每天' },
                          { value: 'weekly', label: '每周' },
                          { value: 'monthly', label: '每月' },
                        ]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">危险操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">重置所有数据</p>
                        <p className="text-sm text-red-600 mt-1">此操作将清除所有业务数据，恢复到初始状态。此操作不可恢复，请谨慎操作。</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="danger" onClick={handleResetData}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        重置数据
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'permissions' && (
            <Card>
              <CardHeader>
                <CardTitle>用户权限管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">用户名</th>
                        <th className="px-4 py-3 font-medium">姓名</th>
                        <th className="px-4 py-3 font-medium">角色</th>
                        <th className="px-4 py-3 font-medium">联系电话</th>
                        <th className="px-4 py-3 font-medium">状态</th>
                        <th className="px-4 py-3 font-medium">上次登录</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary font-medium text-sm">{user.name[0]}</span>
                              </div>
                              <span className="text-gray-900">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{user.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'reception' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? '管理员' :
                               user.role === 'manager' ? '经理' :
                               user.role === 'reception' ? '前台' : '客房服务'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {user.isActive ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>角色权限说明：</strong>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-900">管理员 (admin)</p>
                      <p className="text-blue-700">拥有所有功能权限，包括系统设置和用户管理</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">经理 (manager)</p>
                      <p className="text-blue-700">可查看数据统计、设置价格、管理工单</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">前台 (reception)</p>
                      <p className="text-blue-700">可操作订单、办理入住退房、管理客户信息</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">客房服务 (housekeeping)</p>
                      <p className="text-blue-700">可查看客房状态、处理清洁和维修工单</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>语言和地区设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">系统语言</label>
                      <Select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                        options={[
                          { value: 'zh-CN', label: '简体中文' },
                          { value: 'zh-TW', label: '繁体中文' },
                          { value: 'en-US', label: 'English' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">时区</label>
                      <Select
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                        options={[
                          { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
                          { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
                          { value: 'America/New_York', label: '纽约时间 (UTC-5)' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">日期格式</label>
                      <Select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                        options={[
                          { value: 'yyyy-MM-dd', label: '2026-04-24' },
                          { value: 'yyyy/MM/dd', label: '2026/04/24' },
                          { value: 'dd-MM-yyyy', label: '24-04-2026' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">货币单位</label>
                      <Select
                        value={systemSettings.currency}
                        onChange={(e) => setSystemSettings({ ...systemSettings, currency: e.target.value })}
                        options={[
                          { value: 'CNY', label: '人民币 (¥)' },
                          { value: 'USD', label: '美元 ($)' },
                          { value: 'EUR', label: '欧元 (€)' },
                        ]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系统信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: '系统版本', value: 'v1.0.0' },
                      { label: 'React 版本', value: '18.2.0' },
                      { label: 'TypeScript 版本', value: '5.0.0' },
                      { label: '最后更新时间', value: new Date().toLocaleString('zh-CN') },
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="font-medium text-gray-900 mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
