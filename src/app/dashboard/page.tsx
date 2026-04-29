"use client";

import {
  Building2,
  Users,
  Handshake,
  DollarSign,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  mockDashboardStats,
  mockTrendData,
  mockPropertyDistribution,
  mockClientConversion,
  mockAgentPerformance,
  mockReminders,
} from "@/data/mockData";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const StatCard = ({
  icon,
  title,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`text-sm mt-2 flex items-center gap-1 ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              size={16}
              className={trendUp ? "" : "rotate-180"}
            />
            {trend}
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
        {icon}
      </div>
    </div>
  </div>
);

const ReminderItem = ({ reminder }: { reminder: typeof mockReminders[0] }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "viewing":
        return "bg-blue-100 text-blue-800";
      case "follow_up":
        return "bg-yellow-100 text-yellow-800";
      case "contract":
        return "bg-green-100 text-green-800";
      case "birthday":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "viewing":
        return "带看";
      case "follow_up":
        return "跟进";
      case "contract":
        return "合同";
      case "birthday":
        return "生日";
      default:
        return "其他";
    }
  };

  return (
    <div
      className={`p-4 border-b border-gray-100 last:border-0 ${
        !reminder.isRead ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={`badge ${getTypeColor(reminder.type)}`}>
            {getTypeLabel(reminder.type)}
          </span>
          <div>
            <p className="font-medium text-gray-900">{reminder.title}</p>
            <p className="text-sm text-gray-500 mt-1">{reminder.content}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <Calendar size={14} />
        <span>2026-04-29 09:30</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
          <p className="text-gray-500 mt-1">
            今日：2026年04月29日 星期三
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<Building2 size={24} />}
          title="总房源数"
          value={mockDashboardStats.totalProperties}
          trend="+12 本月新增"
          trendUp={true}
        />
        <StatCard
          icon={<Building2 size={24} />}
          title="可售/可租房源"
          value={mockDashboardStats.availableProperties}
        />
        <StatCard
          icon={<Users size={24} />}
          title="总客户数"
          value={mockDashboardStats.totalClients}
          trend="+28 本月新增"
          trendUp={true}
        />
        <StatCard
          icon={<Users size={24} />}
          title="活跃客户"
          value={mockDashboardStats.activeClients}
        />
        <StatCard
          icon={<Eye size={24} />}
          title="待处理带看"
          value={mockDashboardStats.pendingViewings}
        />
        <StatCard
          icon={<MessageSquare size={24} />}
          title="待跟进客户"
          value={mockDashboardStats.pendingFollowUps}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={<DollarSign size={24} />}
          title="本月营收"
          value={formatCurrency(mockDashboardStats.monthlyRevenue)}
          trend="+18.5% 较上月"
          trendUp={true}
        />
        <StatCard
          icon={<Handshake size={24} />}
          title="本月佣金"
          value={formatCurrency(mockDashboardStats.monthlyCommission)}
          trend="+15.2% 较上月"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              业绩趋势
            </h2>
            <p className="text-sm text-gray-500 mt-1">近4个月销售与租赁数据</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="销售套数"
                  />
                  <Line
                    type="monotone"
                    dataKey="rentals"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="租赁套数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              房源类型分布
            </h2>
            <p className="text-sm text-gray-500 mt-1">按房源类型统计</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPropertyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockPropertyDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              客户转化漏斗
            </h2>
            <p className="text-sm text-gray-500 mt-1">客户从线索到成交的转化</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    data={mockClientConversion}
                    dataKey="count"
                    isAnimationActive
                  >
                    <LabelList
                      position="right"
                      fill="#333"
                      stroke="none"
                      dataKey="stage"
                    />
                    {mockClientConversion.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              经纪人业绩排行
            </h2>
            <p className="text-sm text-gray-500 mt-1">本月成交业绩</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockAgentPerformance}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="deals" fill="#3b82f6" name="成交套数" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            待办提醒
          </h2>
          <p className="text-sm text-gray-500 mt-1">近期需要处理的事项</p>
        </div>
        <div className="divide-y divide-gray-100">
          {mockReminders.slice(0, 5).map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </div>
    </div>
  );
}
