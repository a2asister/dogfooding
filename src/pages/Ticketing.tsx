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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Refresh,
  ConfirmationNumber,
  People,
  CheckCircle,
  AccessTime,
  Print,
  Search,
  FilterList,
  Info,
  Warning,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { mockTicketingInfo, mockTrains } from '../data/mockData';
import { TicketingInfo as TicketingInfoType, Train } from '../types';

const COLORS = ['#1a237e', '#4caf50', '#ff9800', '#f44336'];

const Ticketing: React.FC = () => {
  const [ticketingInfo, setTicketingInfo] = useState<TicketingInfoType[]>(mockTicketingInfo);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTrain, setSelectedTrain] = useState<TicketingInfoType | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [gateStatuses, setGateStatuses] = useState([
    { id: 'A1', name: '检票口A1', status: 'online', checked: 156, total: 200 },
    { id: 'A2', name: '检票口A2', status: 'online', checked: 89, total: 180 },
    { id: 'A3', name: '检票口A3', status: 'offline', checked: 0, total: 0 },
    { id: 'B1', name: '检票口B1', status: 'online', checked: 234, total: 250 },
    { id: 'B2', name: '检票口B2', status: 'maintenance', checked: 0, total: 0 },
  ]);

  const totalTickets = ticketingInfo.reduce((sum, t) => sum + t.totalTickets, 0);
  const soldTickets = ticketingInfo.reduce((sum, t) => sum + t.soldTickets, 0);
  const remainingTickets = ticketingInfo.reduce((sum, t) => sum + t.remainingTickets, 0);
  const checkedPassengers = ticketingInfo.reduce((sum, t) => sum + t.checkedPassengers, 0);
  const uncheckedPassengers = ticketingInfo.reduce((sum, t) => sum + t.uncheckedPassengers, 0);

  const ticketDistribution = [
    { name: '已售', value: soldTickets },
    { name: '余票', value: remainingTickets },
  ];

  const checkStatus = [
    { name: '已检票', value: checkedPassengers },
    { name: '未检票', value: uncheckedPassengers },
  ];

  const hourlyTicketing = [
    { time: '06:00', sold: 120, checked: 80 },
    { time: '07:00', sold: 350, checked: 280 },
    { time: '08:00', sold: 520, checked: 450 },
    { time: '09:00', sold: 480, checked: 420 },
    { time: '10:00', sold: 320, checked: 280 },
    { time: '11:00', sold: 280, checked: 250 },
    { time: '12:00', sold: 380, checked: 320 },
    { time: '13:00', sold: 450, checked: 400 },
    { time: '14:00', sold: 320, checked: 280 },
  ];

  const handleViewDetail = (info: TicketingInfoType) => {
    setSelectedTrain(info);
    setOpenDetailDialog(true);
  };

  const toggleGateStatus = (gateId: string) => {
    setGateStatuses(
      gateStatuses.map((gate) =>
        gate.id === gateId
          ? {
              ...gate,
              status: gate.status === 'online' ? 'offline' : 'online',
            }
          : gate
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return '正常';
      case 'offline':
        return '关闭';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          票务与检票管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          实时同步售票数据、监控检票状态、管理检票口设备
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    今日总票量
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">
                    {totalTickets.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <ConfirmationNumber sx={{ fontSize: 32 }} />
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
                    已售车票
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                    {soldTickets.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    售票率 {((soldTickets / totalTickets) * 100).toFixed(1)}%
                  </Typography>
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
                    剩余车票
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                    {remainingTickets.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    余票率 {((remainingTickets / totalTickets) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    已检票乘车
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#00796b">
                    {checkedPassengers.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    检票率 {((checkedPassengers / soldTickets) * 100).toFixed(1)}%
                  </Typography>
                </Box>
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
                  今日售票检票趋势
                </Typography>
                <Tooltip title="刷新数据">
                  <IconButton size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyTicketing}>
                    <defs>
                      <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a237e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorChecked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
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
                      dataKey="sold"
                      name="售票"
                      stroke="#1a237e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSold)"
                    />
                    <Area
                      type="monotone"
                      dataKey="checked"
                      name="检票"
                      stroke="#4caf50"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorChecked)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="今日车次票务信息" />
              <Tab label="检票口设备状态" />
              <Tab label="退票改签记录" />
            </Tabs>
            <CardContent>
              {activeTab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell>车次号</TableCell>
                        <TableCell align="center">总票量</TableCell>
                        <TableCell align="center">已售</TableCell>
                        <TableCell align="center">余票</TableCell>
                        <TableCell align="center">已检票</TableCell>
                        <TableCell align="center">未检票</TableCell>
                        <TableCell align="center">售票进度</TableCell>
                        <TableCell align="center">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ticketingInfo.map((info) => (
                        <TableRow key={info.id} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{info.trainNumber}</Typography>
                          </TableCell>
                          <TableCell align="center">{info.totalTickets}</TableCell>
                          <TableCell align="center">
                            <Typography color="#1a237e" fontWeight={500}>
                              {info.soldTickets}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography color="#ed6c02" fontWeight={500}>
                              {info.remainingTickets}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography color="#2e7d32" fontWeight={500}>
                              {info.checkedPassengers}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography color="#f44336" fontWeight={500}>
                              {info.uncheckedPassengers}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={(info.soldTickets / info.totalTickets) * 100}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: '#e0e0e0',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {((info.soldTickets / info.totalTickets) * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="查看详情">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewDetail(info)}
                              >
                                <Info />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="打印">
                              <IconButton size="small" color="secondary">
                                <Print />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {activeTab === 1 && (
                <Grid container spacing={2}>
                  {gateStatuses.map((gate) => (
                    <Grid item xs={12} sm={6} md={4} key={gate.id}>
                      <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {gate.name}
                          </Typography>
                          <Chip
                            label={getStatusLabel(gate.status)}
                            color={getStatusColor(gate.status) as any}
                            size="small"
                          />
                        </Box>
                        {gate.status !== 'maintenance' && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                检票进度
                              </Typography>
                              <Typography variant="caption">
                                {gate.checked}/{gate.total}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={gate.total > 0 ? (gate.checked / gate.total) * 100 : 0}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#e0e0e0',
                              }}
                            />
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title={gate.status === 'online' ? '关闭检票口' : '开启检票口'}>
                            <IconButton
                              size="small"
                              color={gate.status === 'online' ? 'error' : 'success'}
                              onClick={() => toggleGateStatus(gate.id)}
                              disabled={gate.status === 'maintenance'}
                            >
                              {gate.status === 'online' ? <ToggleOff /> : <ToggleOn />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}

              {activeTab === 2 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell>时间</TableCell>
                        <TableCell>车次</TableCell>
                        <TableCell>类型</TableCell>
                        <TableCell>数量</TableCell>
                        <TableCell>旅客姓名</TableCell>
                        <TableCell>备注</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>09:30:15</TableCell>
                        <TableCell>G1001</TableCell>
                        <TableCell><Chip label="退票" size="small" color="error" /></TableCell>
                        <TableCell>2张</TableCell>
                        <TableCell>张三、李四</TableCell>
                        <TableCell>行程变更</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>08:45:32</TableCell>
                        <TableCell>D2002</TableCell>
                        <TableCell><Chip label="改签" size="small" color="warning" /></TableCell>
                        <TableCell>1张</TableCell>
                        <TableCell>王五</TableCell>
                        <TableCell>改签到D3001次</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>07:20:10</TableCell>
                        <TableCell>G1003</TableCell>
                        <TableCell><Chip label="改签" size="small" color="warning" /></TableCell>
                        <TableCell>3张</TableCell>
                        <TableCell>赵六、钱七、孙八</TableCell>
                        <TableCell>因原车次晚点</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                票量分布
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} 张`, '数量']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                {ticketDistribution.map((item, index) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2">
                      {item.name}: {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                检票状态
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={checkStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#4caf50" />
                      <Cell fill="#ff9800" />
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} 人`, '数量']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="body2">已检票: {checkedPassengers}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                  <Typography variant="body2">未检票: {uncheckedPassengers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                设备状态概览
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" />
                      <Typography variant="body2">设备正常</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                      {gateStatuses.filter((g) => g.status === 'online').length}
                    </Typography>
                  </Box>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ffebee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning color="error" />
                      <Typography variant="body2">设备关闭</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#d32f2f">
                      {gateStatuses.filter((g) => g.status === 'offline').length}
                    </Typography>
                  </Box>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fff3e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime color="warning" />
                      <Typography variant="body2">维护中</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#ed6c02">
                      {gateStatuses.filter((g) => g.status === 'maintenance').length}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ConfirmationNumber color="primary" />
            车次票务详情 - {selectedTrain?.trainNumber}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">总票量</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#1a237e">
                    {selectedTrain?.totalTickets}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">已售</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    {selectedTrain?.soldTickets}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">余票</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                    {selectedTrain?.remainingTickets}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">已检票</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#00796b">
                    {selectedTrain?.checkedPassengers}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Alert severity="info">
              售票进度：{selectedTrain && ((selectedTrain.soldTickets / selectedTrain.totalTickets) * 100).toFixed(1)}%，
              检票进度：{selectedTrain && ((selectedTrain.checkedPassengers / selectedTrain.soldTickets) * 100).toFixed(1)}%
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDetailDialog(false)}>关闭</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            sx={{
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            打印报表
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ticketing;
