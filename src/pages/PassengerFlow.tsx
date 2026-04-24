import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Refresh,
  Warning,
  People,
  TrendingUp,
  TrendingDown,
  Info,
  NotificationsActive,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { mockPassengerFlow, mockStatisticsData } from '../data/mockData';
import { PassengerFlow as PassengerFlowType } from '../types';

const PassengerFlow: React.FC = () => {
  const [passengerFlow, setPassengerFlow] = useState<PassengerFlowType[]>(mockPassengerFlow);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [selectedArea, setSelectedArea] = useState<PassengerFlowType | null>(null);

  const totalCurrent = passengerFlow.reduce((sum, p) => sum + p.currentCount, 0);
  const totalIn = passengerFlow.reduce((sum, p) => sum + p.inCount, 0);
  const totalOut = passengerFlow.reduce((sum, p) => sum + p.outCount, 0);
  const criticalAreas = passengerFlow.filter((p) => p.status === 'critical').length;
  const warningAreas = passengerFlow.filter((p) => p.status === 'warning').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'warning':
        return '预警';
      case 'critical':
        return '临界';
      default:
        return '未知';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const hourlyData = [
    { time: '06:00', in: 450, out: 320 },
    { time: '07:00', in: 890, out: 560 },
    { time: '08:00', in: 1230, out: 890 },
    { time: '09:00', in: 980, out: 780 },
    { time: '10:00', in: 670, out: 540 },
    { time: '11:00', in: 560, out: 430 },
    { time: '12:00', in: 720, out: 580 },
    { time: '13:00', in: 890, out: 720 },
    { time: '14:00', in: 650, out: 520 },
    { time: '15:00', in: 780, out: 640 },
    { time: '16:00', in: 920, out: 780 },
    { time: '17:00', in: 1180, out: 980 },
    { time: '18:00', in: 1350, out: 1120 },
    { time: '19:00', in: 980, out: 860 },
    { time: '20:00', in: 560, out: 450 },
  ];

  const handleAlertClick = (area: PassengerFlowType) => {
    setSelectedArea(area);
    setOpenAlertDialog(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          客流管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          实时监控站内各区域客流数据，预警客流超标情况
        </Typography>
      </Box>

      {(criticalAreas > 0 || warningAreas > 0) && (
        <Alert
          severity={criticalAreas > 0 ? 'error' : 'warning'}
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small">
              查看详情
            </Button>
          }
        >
          <strong>客流预警：</strong>
          {criticalAreas > 0 && ` ${criticalAreas} 个区域客流临界，`}
          {warningAreas > 0 && ` ${warningAreas} 个区域客流预警`}
          ，请及时开展客流疏导工作！
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    瞬时在站人数
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">
                    {totalCurrent.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    今日进站人数
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                    {totalIn.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: '#2e7d32' }} />
                    <Typography variant="caption" sx={{ ml: 0.5, color: '#2e7d32' }}>
                      +8.5% 较昨日
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    今日出站人数
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                    {totalOut.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingDown sx={{ fontSize: 16, color: '#ed6c02' }} />
                    <Typography variant="caption" sx={{ ml: 0.5, color: '#ed6c02' }}>
                      -3.2% 较昨日
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffebee, #ffcdd2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    预警区域
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#d32f2f">
                    {criticalAreas + warningAreas}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    临界 {criticalAreas} / 预警 {warningAreas}
                  </Typography>
                </Box>
                <Badge
                  badgeContent={criticalAreas + warningAreas}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: 16, height: 28, minWidth: 28 } }}
                >
                  <Avatar sx={{ bgcolor: '#d32f2f', width: 56, height: 56 }}>
                    <NotificationsActive sx={{ fontSize: 32 }} />
                  </Avatar>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  今日客流趋势
                </Typography>
                <Tooltip title="刷新数据">
                  <IconButton size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a237e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
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
                      dataKey="in"
                      name="进站人数"
                      stroke="#2e7d32"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorIn)"
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      name="出站人数"
                      stroke="#1a237e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOut)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  各区域客流状态
                </Typography>
                <Chip
                  label={`共 ${passengerFlow.length} 个区域`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell>区域名称</TableCell>
                      <TableCell align="center">当前人数</TableCell>
                      <TableCell align="center">最大容量</TableCell>
                      <TableCell align="center">客流密度</TableCell>
                      <TableCell align="center">状态</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {passengerFlow.map((area) => (
                      <TableRow
                        key={area.id}
                        hover
                        sx={{
                          bgcolor: area.status !== 'normal' ? 'rgba(255, 235, 238, 0.3)' : 'transparent',
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>{area.area}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            更新于 {area.lastUpdated}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight={600} color={area.status === 'critical' ? 'error' : 'text.primary'}>
                            {area.currentCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{area.maxCapacity}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ width: 120, mx: 'auto' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {(area.density * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={area.density * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getProgressColor(area.status),
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(area.status)}
                            color={getStatusColor(area.status) as any}
                            size="small"
                            icon={
                              area.status !== 'normal' ? (
                                <Warning sx={{ fontSize: 16 }} />
                              ) : (
                                <Info sx={{ fontSize: 16 }} />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          {area.status !== 'normal' && (
                            <Tooltip title="查看详情并处理">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleAlertClick(area)}
                              >
                                <NotificationsActive />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                客流高峰时段分布
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStatisticsData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}:00`} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} 人`, '客流']}
                      labelFormatter={(label) => `${label}:00`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {mockStatisticsData.peakHours.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.count >= 1200 ? '#d32f2f' : entry.count >= 800 ? '#ff9800' : '#4caf50'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                客流分布概览
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {passengerFlow.map((area) => (
                  <Paper key={area.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {area.area}
                      </Typography>
                      <Chip
                        label={getStatusLabel(area.status)}
                        size="small"
                        color={getStatusColor(area.status) as any}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={area.density * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getProgressColor(area.status),
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                        {area.currentCount}/{area.maxCapacity}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                客流疏导建议
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>第三候车室</strong> 客流已达临界值（97%），建议：
                </Typography>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li><Typography variant="caption">引导旅客分流至其他候车室</Typography></li>
                  <li><Typography variant="caption">增加该区域工作人员数量</Typography></li>
                  <li><Typography variant="caption">通过广播提醒旅客注意安全</Typography></li>
                </ul>
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>第一候车室</strong> 客流密度较高（76%），请密切关注。
                </Typography>
              </Alert>
              <Alert severity="success">
                <Typography variant="body2">
                  进站口、出站口、换乘通道客流正常，无拥堵风险。
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            客流预警处理
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              {selectedArea?.area}
            </Typography>
            <Alert severity={selectedArea?.status === 'critical' ? 'error' : 'warning'} sx={{ mb: 2 }}>
              当前客流密度 {(selectedArea?.density ?? 0) * 100}%，已达到
              {selectedArea?.status === 'critical' ? '临界' : '预警'}状态
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">当前人数</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#1a237e">
                    {selectedArea?.currentCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">最大容量</Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.secondary">
                    {selectedArea?.maxCapacity}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAlertDialog(false)}>稍后处理</Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            安排疏导
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PassengerFlow;
