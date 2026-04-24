import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Train,
  People,
  ConfirmationNumber,
  Security,
  Build,
  AccessTime,
  Warning,
  CheckCircle,
  TrendingUp,
  MoreVert,
  DirectionsRailway,
  ExitToApp,
  AccountBalance,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  mockTrains,
  mockPassengerFlow,
  mockTicketingInfo,
  mockSecurityAlerts,
  mockStaff,
  mockStatisticsData,
} from '../data/mockData';
import dayjs from 'dayjs';

const COLORS = ['#1a237e', '#3949ab', '#7986cb', '#9fa8da', '#c5cae9'];

const Dashboard: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time':
        return 'success';
      case 'delayed':
        return 'warning';
      case 'early':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'temporary':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_time':
        return '准点';
      case 'delayed':
        return '晚点';
      case 'early':
        return '早点';
      case 'cancelled':
        return '停运';
      case 'temporary':
        return '临时';
      default:
        return '未知';
    }
  };

  const totalTrains = mockTrains.length;
  const delayedTrains = mockTrains.filter((t) => t.status === 'delayed').length;
  const cancelledTrains = mockTrains.filter((t) => t.status === 'cancelled').length;
  const onTimeTrains = mockTrains.filter((t) => t.status === 'on_time').length;

  const totalPassengers = mockPassengerFlow.reduce((sum, p) => sum + p.currentCount, 0);
  const totalIn = mockPassengerFlow.reduce((sum, p) => sum + p.inCount, 0);
  const totalOut = mockPassengerFlow.reduce((sum, p) => sum + p.outCount, 0);
  const warningAreas = mockPassengerFlow.filter((p) => p.status !== 'normal').length;

  const totalTickets = mockTicketingInfo.reduce((sum, t) => sum + t.totalTickets, 0);
  const soldTickets = mockTicketingInfo.reduce((sum, t) => sum + t.soldTickets, 0);
  const checkedPassengers = mockTicketingInfo.reduce((sum, t) => sum + t.checkedPassengers, 0);

  const activeAlerts = mockSecurityAlerts.filter((a) => a.status === 'active').length;
  const onDutyStaff = mockStaff.filter((s) => s.status === 'on_duty').length;

  const trainStatusData = [
    { name: '准点', value: onTimeTrains, color: '#4caf50' },
    { name: '晚点', value: delayedTrains, color: '#ff9800' },
    { name: '停运', value: cancelledTrains, color: '#f44336' },
    { name: '其他', value: totalTrains - onTimeTrains - delayedTrains - cancelledTrains, color: '#9e9e9e' },
  ];

  const stationStatusData = [
    { name: '正常区域', value: mockPassengerFlow.filter((p) => p.status === 'normal').length },
    { name: '预警区域', value: mockPassengerFlow.filter((p) => p.status === 'warning').length },
    { name: '临界区域', value: mockPassengerFlow.filter((p) => p.status === 'critical').length },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: number;
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  sx={{ fontSize: 16, color: trend >= 0 ? '#4caf50' : '#f44336' }}
                />
                <Typography
                  variant="caption"
                  sx={{ ml: 0.5, color: trend >= 0 ? '#4caf50' : '#f44336' }}
                >
                  {trend >= 0 ? '+' : ''}{trend}% 较昨日
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ color }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          首页概览
        </Typography>
        <Typography variant="body1" color="text.secondary">
          欢迎使用火车站管理系统，当前时间：{dayjs().format('YYYY年MM月DD日 HH:mm:ss')}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="今日车次"
            value={totalTrains}
            icon={<Train sx={{ fontSize: 32 }} />}
            color="#1a237e"
            subtitle={`准点 ${onTimeTrains} 列，晚点 ${delayedTrains} 列`}
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="在站旅客"
            value={totalPassengers}
            icon={<People sx={{ fontSize: 32 }} />}
            color="#2e7d32"
            subtitle={`进站 ${totalIn}，出站 ${totalOut}`}
            trend={-3.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="今日售票"
            value={soldTickets}
            icon={<ConfirmationNumber sx={{ fontSize: 32 }} />}
            color="#ed6c02"
            subtitle={`已检票 ${checkedPassengers} 人`}
            trend={8.7}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="在岗人员"
            value={onDutyStaff}
            icon={<AccountBalance sx={{ fontSize: 32 }} />}
            color="#7b1fa2"
            subtitle={`告警 ${activeAlerts} 条待处理`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  今日车次运行情况
                </Typography>
                <Tooltip title="更多">
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockStatisticsData.trainCounts}>
                    <defs>
                      <linearGradient id="colorTrains" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a237e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#1a237e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTrains)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  车次状态分布
                </Typography>
              </Box>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trainStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trainStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                {trainStatusData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="body2">
                      {item.name} ({item.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  客流趋势（近7天）
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStatisticsData.passengerCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="inCount" name="进站人数" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outCount" name="出站人数" fill="#1a237e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  重点区域客流状态
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mockPassengerFlow.slice(0, 5).map((area) => (
                  <Paper key={area.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {area.area}
                      </Typography>
                      <Chip
                        label={area.status === 'normal' ? '正常' : area.status === 'warning' ? '预警' : '临界'}
                        size="small"
                        color={
                          area.status === 'normal'
                            ? 'success'
                            : area.status === 'warning'
                            ? 'warning'
                            : 'error'
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={area.density * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor:
                                area.status === 'normal'
                                  ? '#4caf50'
                                  : area.status === 'warning'
                                  ? '#ff9800'
                                  : '#f44336',
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {area.currentCount}/{area.maxCapacity}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  实时告警
                </Typography>
                <Chip
                  icon={<Warning />}
                  label={`${activeAlerts} 条待处理`}
                  color="error"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {mockSecurityAlerts
                  .filter((a) => a.status === 'active')
                  .slice(0, 5)
                  .map((alert) => (
                    <Paper
                      key={alert.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: (theme) =>
                          `4px solid ${
                            alert.level === 'critical'
                              ? theme.palette.error.main
                              : alert.level === 'high'
                              ? theme.palette.warning.main
                              : theme.palette.info.main
                          }`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {alert.type === 'device_error'
                            ? '设备故障'
                            : alert.type === 'fire'
                            ? '消防告警'
                            : alert.type === 'prohibited_item'
                            ? '违禁品查获'
                            : '治安事件'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.timestamp.split(' ')[1]}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {alert.location} - {alert.description}
                      </Typography>
                    </Paper>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  即将到发车次
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {mockTrains.slice(0, 5).map((train) => (
                  <Paper key={train.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor:
                              train.status === 'on_time'
                                ? '#e8f5e9'
                                : train.status === 'delayed'
                                ? '#fff3e0'
                                : '#ffebee',
                            color:
                              train.status === 'on_time'
                                ? '#2e7d32'
                                : train.status === 'delayed'
                                ? '#ed6c02'
                                : '#d32f2f',
                          }}
                        >
                          <DirectionsRailway />
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {train.trainNumber}
                            </Typography>
                            <Chip
                              label={getStatusLabel(train.status)}
                              size="small"
                              color={getStatusColor(train.status) as any}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {train.startStation} → {train.endStation}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {train.scheduledArrivalTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          到站时间
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
