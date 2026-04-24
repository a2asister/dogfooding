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
  Tabs,
  Tab,
  Badge,
  Divider,
} from '@mui/material';
import {
  Refresh,
  Security,
  Videocam,
  Warning,
  CheckCircle,
  Info,
  Print,
  Visibility,
} from '@mui/icons-material';
import { mockSecurityDevices, mockSecurityAlerts } from '../data/mockData';
import { SecurityDevice, SecurityAlert } from '../types';

const SecurityPage: React.FC = () => {
  const [devices] = useState<SecurityDevice[]>(mockSecurityDevices);
  const [alerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const maintenanceDevices = devices.filter((d) => d.status === 'maintenance').length;
  const errorDevices = devices.filter((d) => d.status === 'error').length;

  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'maintenance':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'offline':
        return '离线';
      case 'maintenance':
        return '维护中';
      case 'error':
        return '故障';
      default:
        return '未知';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'device_error':
        return '设备故障';
      case 'fire':
        return '消防告警';
      case 'prohibited_item':
        return '违禁品查获';
      case 'security_event':
        return '治安事件';
      default:
        return '未知';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewAlert = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setOpenAlertDialog(true);
  };

  const cameraDevices = devices.filter((d) => d.type === 'camera');
  const scannerDevices = devices.filter((d) => d.type === 'scanner');
  const turnstileDevices = devices.filter((d) => d.type === 'turnstile');
  const smokeDetectorDevices = devices.filter((d) => d.type === 'smoke_detector');
  const alarmDevices = devices.filter((d) => d.type === 'alarm');

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          安检安防与监控管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          整合站内安防设备状态监控、实时告警接收和处置管理
        </Typography>
      </Box>

      {activeAlerts > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={
          <Button color="inherit" size="small">查看全部</Button>
        }>
          <strong>安全告警：</strong>当前有 {activeAlerts} 条告警待处理，请及时处置！
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>设备总数</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">{totalDevices}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <Security sx={{ fontSize: 32 }} />
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>在线设备</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#2e7d32">{onlineDevices}</Typography>
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>离线/故障</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#d32f2f">{offlineDevices + errorDevices}</Typography>
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>待处理告警</Typography>
                  <Typography variant="h3" fontWeight="bold" color="#ed6c02">{activeAlerts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label={`实时告警 (${activeAlerts})`} />
              <Tab label={`设备状态监控 (${totalDevices})`} />
              <Tab label={`已处理记录 (${resolvedAlerts})`} />
            </Tabs>
            <CardContent>
              {activeTab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell>告警类型</TableCell>
                        <TableCell>级别</TableCell>
                        <TableCell>位置</TableCell>
                        <TableCell>描述</TableCell>
                        <TableCell>时间</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell align="center">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.filter((a) => a.status === 'active').map((alert) => (
                        <TableRow key={alert.id} hover sx={{ bgcolor: 'rgba(255, 235, 238, 0.3)' }}>
                          <TableCell>
                            <Chip label={getAlertTypeLabel(alert.type)} size="small" color={getAlertLevelColor(alert.level) as any} />
                          </TableCell>
                          <TableCell>
                            <Chip label={alert.level === 'low' ? '低级' : alert.level === 'medium' ? '中级' : alert.level === 'high' ? '高级' : '紧急'} size="small" color={getAlertLevelColor(alert.level) as any} />
                          </TableCell>
                          <TableCell>{alert.location}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {alert.description}
                            </Typography>
                          </TableCell>
                          <TableCell>{alert.timestamp.split(' ')[1]}</TableCell>
                          <TableCell>
                            <Chip label="待处理" size="small" color="warning" />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="查看详情">
                              <IconButton size="small" color="primary" onClick={() => handleViewAlert(alert)}>
                                <Visibility />
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
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      监控摄像头 ({cameraDevices.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {cameraDevices.map((device) => (
                        <Grid item xs={12} sm={6} md={4} key={device.id}>
                          <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Videocam sx={{ color: device.status === 'online' ? '#2e7d32' : '#9e9e9e' }} />
                                <Typography variant="subtitle2" fontWeight={600}>{device.name}</Typography>
                              </Box>
                              <Chip label={getStatusLabel(device.status)} size="small" color={getStatusColor(device.status) as any} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">位置: {device.location}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">最后检查: {device.lastCheck}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                      其他设备
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell>设备名称</TableCell>
                            <TableCell>设备类型</TableCell>
                            <TableCell>位置</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>最后检查</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...scannerDevices, ...turnstileDevices, ...smokeDetectorDevices, ...alarmDevices].map((device) => (
                            <TableRow key={device.id} hover>
                              <TableCell>
                                <Typography fontWeight={500}>{device.name}</Typography>
                              </TableCell>
                              <TableCell>
                                {device.type === 'scanner' ? '安检仪' : device.type === 'turnstile' ? '闸机' : device.type === 'smoke_detector' ? '烟感报警器' : '应急报警'}
                              </TableCell>
                              <TableCell>{device.location}</TableCell>
                              <TableCell>
                                <Chip label={getStatusLabel(device.status)} size="small" color={getStatusColor(device.status) as any} />
                              </TableCell>
                              <TableCell>{device.lastCheck}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}

              {activeTab === 2 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell>告警类型</TableCell>
                        <TableCell>级别</TableCell>
                        <TableCell>位置</TableCell>
                        <TableCell>描述</TableCell>
                        <TableCell>发生时间</TableCell>
                        <TableCell>处理人</TableCell>
                        <TableCell>处理时间</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.filter((a) => a.status === 'resolved').map((alert) => (
                        <TableRow key={alert.id} hover>
                          <TableCell>
                            <Chip label={getAlertTypeLabel(alert.type)} size="small" color="default" />
                          </TableCell>
                          <TableCell>
                            <Chip label={alert.level === 'low' ? '低级' : alert.level === 'medium' ? '中级' : alert.level === 'high' ? '高级' : '紧急'} size="small" color="default" />
                          </TableCell>
                          <TableCell>{alert.location}</TableCell>
                          <TableCell>{alert.description}</TableCell>
                          <TableCell>{alert.timestamp}</TableCell>
                          <TableCell>{alert.resolvedBy}</TableCell>
                          <TableCell>{alert.resolvedTime}</TableCell>
                        </TableRow>
                      ))}
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
                设备状态分布
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" />
                      <Typography variant="body2">在线正常</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#2e7d32">{onlineDevices}</Typography>
                  </Box>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fff3e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info color="warning" />
                      <Typography variant="body2">维护中</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#ed6c02">{maintenanceDevices}</Typography>
                  </Box>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ffebee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning color="error" />
                      <Typography variant="body2">离线/故障</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="#d32f2f">{offlineDevices + errorDevices}</Typography>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                设备类型分布
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Videocam sx={{ color: '#1a237e' }} />
                    <Typography variant="body2">监控摄像头</Typography>
                  </Box>
                  <Chip label={cameraDevices.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: '#2e7d32' }} />
                    <Typography variant="body2">安检仪</Typography>
                  </Box>
                  <Chip label={scannerDevices.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">闸机</Typography>
                  </Box>
                  <Chip label={turnstileDevices.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ color: '#ed6c02' }} />
                    <Typography variant="body2">烟感报警器</Typography>
                  </Box>
                  <Chip label={smokeDetectorDevices.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ color: '#7b1fa2' }} />
                    <Typography variant="body2">应急报警装置</Typography>
                  </Box>
                  <Chip label={alarmDevices.length} size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                安防日志与台账
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" fontWeight={500}>安检违禁品台账</Typography>
                  <Typography variant="caption" color="text.secondary">记录所有查获违禁品信息</Typography>
                  <Button size="small" sx={{ mt: 1 }}>查看详情</Button>
                </Paper>
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" fontWeight={500}>设备巡检日志</Typography>
                  <Typography variant="caption" color="text.secondary">记录所有设备巡检记录</Typography>
                  <Button size="small" sx={{ mt: 1 }}>查看详情</Button>
                </Paper>
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" fontWeight={500}>告警处置记录</Typography>
                  <Typography variant="caption" color="text.secondary">记录所有告警处置全过程</Typography>
                  <Button size="small" sx={{ mt: 1 }}>查看详情</Button>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            告警详情处理
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity={selectedAlert?.level === 'critical' || selectedAlert?.level === 'high' ? 'error' : 'warning'} sx={{ mb: 3 }}>
              <Typography variant="subtitle1">
                {selectedAlert && getAlertTypeLabel(selectedAlert.type)} - {selectedAlert?.location}
              </Typography>
              <Typography variant="body2">{selectedAlert?.description}</Typography>
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">发生时间</Typography>
                  <Typography variant="h6" fontWeight="bold">{selectedAlert?.timestamp}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">告警级别</Typography>
                  <Typography variant="h6" fontWeight="bold" color={selectedAlert?.level === 'critical' ? '#d32f2f' : '#ed6c02'}>
                    {selectedAlert?.level === 'low' ? '低级' : selectedAlert?.level === 'medium' ? '中级' : selectedAlert?.level === 'high' ? '高级' : '紧急'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAlertDialog(false)}>稍后处理</Button>
          <Button variant="outlined" color="warning">标记处理中</Button>
          <Button
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}
          >
            标记已处理
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityPage;
