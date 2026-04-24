import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart as BarChartIcon,
  People,
  Train,
  Build,
  Person,
  ConfirmationNumber,
  AccessTime,
  Refresh,
  Download,
} from '@mui/icons-material';
import { mockStatisticsData, mockTrains, mockStaff, mockPassengerFlow } from '../data/mockData';
import dayjs from 'dayjs';

const COLORS = ['#1a237e', '#3949ab', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'];
const CHART_COLORS = {
  primary: '#1a237e',
  secondary: '#3949ab',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  purple: '#7b1fa2',
};

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  const getPeriodLabel = (p: string) => {
    const map: Record<string, string> = {
      daily: '日报',
      weekly: '周报',
      monthly: '月报',
      yearly: '年报',
    };
    return map[p] || p;
  };

  const trainTrendData = mockStatisticsData.trainCounts.map((item) => ({
    ...item,
    time: item.date,
  }));

  const passengerTrendData = mockStatisticsData.passengerCounts.map((item) => ({
    ...item,
    date: dayjs(item.date).format('MM-DD'),
  }));

  const peakHoursData = mockStatisticsData.peakHours.map((item) => ({
    ...item,
    time: `${item.hour}:00`,
  }));

  const equipmentFailureData = mockStatisticsData.equipmentFailureRate.map((item) => ({
    ...item,
    rate: item.rate,
  }));

  const attendanceRateData = mockStatisticsData.attendanceRate.map((item) => ({
    ...item,
    rate: item.rate,
  }));

  const ticketingData = mockStatisticsData.ticketingData.map((item) => ({
    ...item,
    date: dayjs(item.date).format('MM-DD'),
    sold: item.sold,
    unsold: item.total - item.sold,
  }));

  const trainStatusData = [
    { name: '准点', value: mockTrains.filter((t) => t.status === 'on_time').length, color: CHART_COLORS.success },
    { name: '晚点', value: mockTrains.filter((t) => t.status === 'delayed').length, color: CHART_COLORS.warning },
    { name: '停运', value: mockTrains.filter((t) => t.status === 'cancelled').length, color: CHART_COLORS.error },
    { name: '临时', value: mockTrains.filter((t) => t.status === 'temporary').length, color: CHART_COLORS.purple },
  ];

  const staffStatusData = [
    { name: '在岗', value: mockStaff.filter((s) => s.status === 'on_duty').length, color: CHART_COLORS.success },
    { name: '离岗', value: mockStaff.filter((s) => s.status === 'off_duty').length, color: CHART_COLORS.primary },
    { name: '请假', value: mockStaff.filter((s) => s.status === 'leave').length, color: CHART_COLORS.warning },
    { name: '出差', value: mockStaff.filter((s) => s.status === 'business_trip').length, color: CHART_COLORS.info },
  ];

  const areaDistributionData = mockPassengerFlow
    .filter((p) => p.status !== 'normal')
    .map((p) => ({
      name: p.area,
      current: p.currentCount,
      max: p.maxCapacity,
      density: (p.density * 100).toFixed(1),
    }));

  const summaryStats = {
    totalTrains: mockTrains.length,
    onTimeTrains: mockTrains.filter((t) => t.status === 'on_time').length,
    totalPassengers: mockPassengerFlow.reduce((sum, p) => sum + p.currentCount, 0),
    totalIn: mockPassengerFlow.reduce((sum, p) => sum + p.inCount, 0),
    totalOut: mockPassengerFlow.reduce((sum, p) => sum + p.outCount, 0),
    onDutyStaff: mockStaff.filter((s) => s.status === 'on_duty').length,
    totalStaff: mockStaff.length,
  };

  const onTimeRate = ((summaryStats.onTimeTrains / summaryStats.totalTrains) * 100).toFixed(1);
  const attendanceRate = ((summaryStats.onDutyStaff / summaryStats.totalStaff) * 100).toFixed(1);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              数据统计分析
            </Typography>
            <Typography variant="body1" color="text.secondary">
              车站运营核心数据统计与可视化分析，{getPeriodLabel(period)}
              ({dayjs().format('YYYY年MM月DD日')})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>统计周期</InputLabel>
              <Select
                value={period}
                label="统计周期"
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <MenuItem value="daily">日报</MenuItem>
                <MenuItem value="weekly">周报</MenuItem>
                <MenuItem value="monthly">月报</MenuItem>
                <MenuItem value="yearly">年报</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<Refresh />} size="small">
              刷新数据
            </Button>
            <Button variant="outlined" startIcon={<Download />} size="small">
              导出报表
            </Button>
          </Box>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>数据说明：</strong>以下统计数据基于当前系统Mock数据生成，实际部署后将接入实时业务数据。
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    今日车次
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">
                    {summaryStats.totalTrains}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(26, 35, 126, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Train sx={{ color: '#1a237e' }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                <Typography variant="caption" color="#4caf50">
                  准点率 {onTimeRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    在站旅客
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                    {summaryStats.totalPassengers}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(46, 125, 50, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <People sx={{ color: '#2e7d32' }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  进站: {summaryStats.totalIn}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  出站: {summaryStats.totalOut}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    在岗人员
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                    {summaryStats.onDutyStaff}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(237, 108, 2, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Person sx={{ color: '#ed6c02' }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                <Typography variant="caption" color="#4caf50">
                  出勤率 {attendanceRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    设备故障
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                    {mockStatisticsData.equipmentFailureRate[
                      mockStatisticsData.equipmentFailureRate.length - 1
                    ].rate}
                    %
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(123, 31, 162, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Build sx={{ color: '#7b1fa2' }} />
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingDown sx={{ fontSize: 16, color: '#4caf50' }} />
                <Typography variant="caption" color="#4caf50">
                  较上月下降 0.9%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="车次运行分析" icon={<Train />} iconPosition="start" />
          <Tab label="客流趋势分析" icon={<People />} iconPosition="start" />
          <Tab label="票务数据统计" icon={<ConfirmationNumber />} iconPosition="start" />
          <Tab label="设备与人员统计" icon={<Build />} iconPosition="start" />
        </Tabs>
        <CardContent>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  今日车次运行趋势
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trainTrendData}>
                      <defs>
                        <linearGradient id="colorTrains" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="车次数量"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTrains)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  车次状态分布
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trainStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trainStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  车次运行明细
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell>
                          <strong>车次号</strong>
                        </TableCell>
                        <TableCell>
                          <strong>类型</strong>
                        </TableCell>
                        <TableCell>
                          <strong>始发站</strong>
                        </TableCell>
                        <TableCell>
                          <strong>终到站</strong>
                        </TableCell>
                        <TableCell>
                          <strong>计划到站</strong>
                        </TableCell>
                        <TableCell>
                          <strong>状态</strong>
                        </TableCell>
                        <TableCell>
                          <strong>站台</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockTrains.slice(0, 8).map((train) => (
                        <TableRow key={train.id}>
                          <TableCell>
                            <Typography fontWeight={600}>{train.trainNumber}</Typography>
                          </TableCell>
                          <TableCell>{train.trainType}</TableCell>
                          <TableCell>{train.startStation}</TableCell>
                          <TableCell>{train.endStation}</TableCell>
                          <TableCell>{train.scheduledArrivalTime}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                train.status === 'on_time'
                                  ? '准点'
                                  : train.status === 'delayed'
                                  ? '晚点'
                                  : train.status === 'cancelled'
                                  ? '停运'
                                  : '临时'
                              }
                              size="small"
                              color={
                                train.status === 'on_time'
                                  ? 'success'
                                  : train.status === 'delayed'
                                  ? 'warning'
                                  : train.status === 'cancelled'
                                  ? 'error'
                                  : 'secondary'
                              }
                            />
                          </TableCell>
                          <TableCell>{train.platform}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  客流趋势（近7天）
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={passengerTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="inCount" name="进站人数" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outCount" name="出站人数" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  客流高峰时段
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="客流数量"
                        stroke={CHART_COLORS.warning}
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.warning, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  重点区域客流状态
                </Typography>
                <Grid container spacing={2}>
                  {mockPassengerFlow.slice(0, 6).map((area) => (
                    <Grid item xs={12} sm={4} md={2} key={area.id}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            area.status === 'normal'
                              ? '#e8f5e9'
                              : area.status === 'warning'
                              ? '#fff3e0'
                              : '#ffebee',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {area.area}
                          </Typography>
                          <Chip
                            label={
                              area.status === 'normal'
                                ? '正常'
                                : area.status === 'warning'
                                ? '预警'
                                : '临界'
                            }
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
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                          {area.currentCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          容量 {area.maxCapacity}，密度 {(area.density * 100).toFixed(0)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  售票趋势（近7天）
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={ticketingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sold" name="已售票" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="unsold" name="余票" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="总票数"
                        stroke={CHART_COLORS.success}
                        strokeWidth={3}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  今日票量分布
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell>
                          <strong>车次</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>总票</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>已售</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>余票</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockStatisticsData.ticketingData.slice(-5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography fontWeight={600}>车次{index + 1}</Typography>
                          </TableCell>
                          <TableCell align="right">{item.total}</TableCell>
                          <TableCell align="right">{item.sold}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={item.total - item.sold}
                              size="small"
                              color={item.total - item.sold > 50 ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  票务统计汇总
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          今日总票量
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={CHART_COLORS.primary}>
                          {mockStatisticsData.ticketingData
                            .slice(-1)
                            .reduce((sum, t) => sum + t.total, 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          已售票
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={CHART_COLORS.success}>
                          {mockStatisticsData.ticketingData
                            .slice(-1)
                            .reduce((sum, t) => sum + t.sold, 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          余票
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={CHART_COLORS.warning}>
                          {mockStatisticsData.ticketingData
                            .slice(-1)
                            .reduce((sum, t) => sum + t.total - sum + t.sold, 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          售票率
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={CHART_COLORS.purple}>
                          {(
                            (mockStatisticsData.ticketingData.slice(-1).reduce((sum, t) => sum + t.sold, 0) /
                              mockStatisticsData.ticketingData.slice(-1).reduce((sum, t) => sum + t.total, 0)) *
                            100
                          ).toFixed(1)}
                          %
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  设备故障率趋势
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={equipmentFailureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        name="故障率 (%)"
                        stroke={CHART_COLORS.error}
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.error, strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  人员出勤率趋势
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[95, 100]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        name="出勤率 (%)"
                        stroke={CHART_COLORS.success}
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  人员状态分布
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value}人 (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {staffStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  人员统计明细
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell>
                          <strong>部门</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>总人数</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>在岗</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>离岗</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        '站长办公室',
                        '调度室',
                        '安保科',
                        '运维科',
                        '客运科',
                        '后勤科',
                      ].map((dept) => {
                        const deptStaff = mockStaff.filter((s) => s.department === dept);
                        return (
                          <TableRow key={dept}>
                            <TableCell>
                              <Typography fontWeight={600}>{dept}</Typography>
                            </TableCell>
                            <TableCell align="right">{deptStaff.length}</TableCell>
                            <TableCell align="right">
                              {deptStaff.filter((s) => s.status === 'on_duty').length}
                            </TableCell>
                            <TableCell align="right">
                              {deptStaff.filter((s) => s.status !== 'on_duty').length}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
