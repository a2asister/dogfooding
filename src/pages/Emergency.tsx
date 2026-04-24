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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Badge,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ReportProblem as EmergencyIcon,
  Warning,
  CheckCircle,
  Timer,
  Person,
  LocationOn,
  AccessTime,
  Info,
  Start,
  History,
  Description,
  Send,
  People,
  Assignment,
  Refresh,
  ExpandMore,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  mockEmergencyPlans,
  mockEmergencyRecords,
  mockStaff,
} from '../data/mockData';
import { EmergencyPlan, EmergencyRecord } from '../types';
import dayjs from 'dayjs';

const Emergency: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState<EmergencyPlan[]>(mockEmergencyPlans);
  const [records, setRecords] = useState<EmergencyRecord[]>(mockEmergencyRecords);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [openStartEmergencyDialog, setOpenStartEmergencyDialog] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EmergencyRecord | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [selectedPlanForStart, setSelectedPlanForStart] = useState<EmergencyPlan | null>(null);

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      delay: '列车晚点',
      passenger_stuck: '旅客滞留',
      weather: '极端天气',
      equipment_failure: '设备故障',
      medical: '医疗急救',
      security: '治安事件',
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delay':
        return 'warning';
      case 'passenger_stuck':
        return 'info';
      case 'weather':
        return 'error';
      case 'equipment_failure':
        return 'warning';
      case 'medical':
        return 'error';
      case 'security':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delay':
        return <Timer />;
      case 'passenger_stuck':
        return <People />;
      case 'weather':
        return <Warning />;
      case 'equipment_failure':
        return <EmergencyIcon />;
      case 'medical':
        return <EmergencyIcon />;
      case 'security':
        return <Warning />;
      default:
        return <EmergencyIcon />;
    }
  };

  const stats = {
    active: records.filter((r) => r.status === 'active').length,
    resolved: records.filter((r) => r.status === 'resolved').length,
    total: records.length,
    plans: plans.length,
  };

  const planColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: '预案名称',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#ffebee',
              color: '#d32f2f',
            }}
          >
            {getCategoryIcon(params.row.category)}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: '分类',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getCategoryLabel(params.value)}
          color={getCategoryColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'description',
      headerName: '描述',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'steps',
      headerName: '步骤数',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value.length} 步`}
          color="primary"
          size="small"
        />
      ),
    },
    {
      field: 'responsibleDepartments',
      headerName: '责任部门',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value.join('、')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="查看详情">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedPlan(params.row);
                setOpenPlanDialog(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
          <Tooltip title="启动预案">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedPlanForStart(params.row);
                setOpenStartEmergencyDialog(true);
              }}
            >
              <PlayArrow />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const recordColumns: GridColDef[] = [
    {
      field: 'planName',
      headerName: '预案名称',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: '事件描述',
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'startTime',
      headerName: '开始时间',
      width: 160,
    },
    {
      field: 'endTime',
      headerName: '结束时间',
      width: 160,
      renderCell: (params) => params.value || '进行中',
    },
    {
      field: 'handler',
      headerName: '处理人',
      width: 120,
    },
    {
      field: 'status',
      headerName: '状态',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? '处理中' : '已完成'}
          color={params.value === 'active' ? 'error' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="查看详情">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedRecord(params.row);
                setOpenRecordDialog(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
          {params.row.status === 'active' && (
            <Tooltip title="结束处置">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setRecords(
                    records.map((r) =>
                      r.id === params.row.id
                        ? {
                            ...r,
                            status: 'resolved',
                            endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                          }
                        : r
                    )
                  );
                }}
              >
                <Stop />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          应急事件处置管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理车站突发情况应急预案，支持快速响应和处置记录
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Badge badgeContent={stats.active} color="error">
                  <EmergencyIcon sx={{ color: '#d32f2f' }} />
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  进行中事件
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#d32f2f">
                {stats.active}
              </Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#2e7d32' }} />
                <Typography variant="body2" color="text.secondary">
                  已完成处置
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                {stats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Description sx={{ color: '#1a237e' }} />
                <Typography variant="body2" color="text.secondary">
                  应急预案数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#1a237e">
                {stats.plans}
              </Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <History sx={{ color: '#7b1fa2' }} />
                <Typography variant="body2" color="text.secondary">
                  总处置记录
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {stats.active > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning />
          <Typography variant="body1" fontWeight={600}>
            有 {stats.active} 个事件正在处理中，请及时关注
          </Typography>
          </Box>
        </Alert>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="应急预案" icon={<Description />} iconPosition="start" />
          <Tab label="进行中事件" icon={<EmergencyIcon />} iconPosition="start" />
          <Tab label="处置记录" icon={<History />} iconPosition="start" />
        </Tabs>
        <CardContent>
          {activeTab === 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: 2,
                }}
              >
                <Button variant="outlined" startIcon={<Refresh />} size="small">
                  刷新数据
                </Button>
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                应急预案列表
              </Typography>

              <DataGrid
                rows={plans}
                columns={planColumns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#f8fafc',
                    fontWeight: 600,
                  },
                }}
              />

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                预案详情预览
              </Typography>

              <Grid container spacing={2}>
                {plans.map((plan) => (
                  <Grid item xs={12} md={6} key={plan.id}>
                    <Accordion
                      expanded={expandedPlan === plan.id}
                      onChange={() =>
                        setExpandedPlan(expandedPlan === plan.id ? null : plan.id)
                      }
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ bgcolor: '#f8fafc' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor:
                                plan.category === 'delay'
                                  ? '#fff3e0'
                                  : plan.category === 'medical'
                                  ? '#ffebee'
                                  : plan.category === 'security'
                                  ? '#fce4ec'
                                  : '#e3f2fd',
                              color:
                                plan.category === 'delay'
                                  ? '#ed6c02'
                                  : plan.category === 'medical'
                                  ? '#d32f2f'
                                  : plan.category === 'security'
                                  ? '#c2185b'
                                  : '#1a237e',
                            }}
                          >
                            {getCategoryIcon(plan.category)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {plan.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={getCategoryLabel(plan.category)}
                                size="small"
                                color={getCategoryColor(plan.category) as any}
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {plan.steps.length} 个步骤
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {plan.description}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          责任部门：{plan.responsibleDepartments.join('、')}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          处置步骤：
                        </Typography>
                        <Stepper orientation="vertical" activeStep={-1}>
                          {plan.steps.map((step, index) => (
                            <Step key={index} completed>
                              <StepLabel>
                                <Typography variant="body2" fontWeight={600}>
                                  步骤 {index + 1}
                                </Typography>
                              </StepLabel>
                              <StepContent>
                                <Typography variant="body2">{step}</Typography>
                              </StepContent>
                            </Step>
                          ))}
                        </Stepper>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<PlayArrow />}
                            onClick={() => {
                              setSelectedPlanForStart(plan);
                              setOpenStartEmergencyDialog(true);
                            }}
                            size="small"
                          >
                            启动预案
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  进行中事件
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Add />}
                  onClick={() => {
                    setSelectedPlanForStart(plans[0]);
                    setOpenStartEmergencyDialog(true);
                  }}
                  size="small"
                >
                  新增事件
                </Button>
              </Box>

              {records.filter((r) => r.status === 'active').length === 0 ? (
                <Alert severity="info">
                  当前没有进行中的事件，所有事件处理完毕
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {records
                    .filter((r) => r.status === 'active')
                    .map((record) => (
                      <Grid item xs={12} md={6} key={record.id}>
                        <Card sx={{ borderRadius: 2, border: '2px solid #f44336' }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 2,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: '#ffebee',
                                    color: '#d32f2f',
                                    animation: 'pulse 2s infinite',
                                  }}
                                >
                                  <EmergencyIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>
                                    {record.planName}
                                  </Typography>
                                  <Chip
                                    label="处理中"
                                    color="error"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              </Box>
                              <Box textAlign="right">
                                <Typography variant="caption" color="text.secondary">
                                  开始时间
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {record.startTime}
                                </Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" color="text.secondary" paragraph>
                              {record.description}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Person sx={{ color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2">
                                处理人：<strong>{record.handler}</strong>
                              </Typography>
                            </Box>

                            {record.notes && (
                              <Paper sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
                                <Typography variant="body2">
                                  <strong>备注：</strong>
                                  {record.notes}
                                </Typography>
                              </Paper>
                            )}

                            <Box
                              sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 1,
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Info />}
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setOpenRecordDialog(true);
                                }}
                              >
                                查看详情
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<Stop />}
                                onClick={() => {
                                  setRecords(
                                    records.map((r) =>
                                    r.id === record.id
                                      ? {
                                          ...r,
                                          status: 'resolved',
                                          endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                                        }
                                      : r
                                    )
                                  );
                                }}
                              >
                                结束处置
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                处置记录
              </Typography>
                <Button variant="outlined" startIcon={<Refresh />} size="small">
                  刷新数据
                </Button>
              </Box>

              <DataGrid
                rows={records}
                columns={recordColumns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#f8fafc',
                    fontWeight: 600,
                  },
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openStartEmergencyDialog}
        onClose={() => setOpenStartEmergencyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
              <EmergencyIcon />
            </Avatar>
            启动应急处置流程
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPlanForStart && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body1" fontWeight={600}>
                  请确认启动 {selectedPlanForStart.name} 的应急处置流程
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      预案信息
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip
                        label={selectedPlanForStart.name}
                        color="primary"
                      />
                      <Chip
                        label={getCategoryLabel(selectedPlanForStart.category)}
                        color={getCategoryColor(selectedPlanForStart.category) as any}
                      />
                      <Chip
                        label={`${selectedPlanForStart.steps.length} 个处置步骤`}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {selectedPlanForStart.description}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>选择预案</InputLabel>
                    <Select
                      value={selectedPlanForStart.id}
                      label="选择预案"
                      onChange={(e) => {
                        const plan = plans.find((p) => p.id === e.target.value);
                        if (plan) setSelectedPlanForStart(plan);
                      }}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>处理人</InputLabel>
                    <Select
                      defaultValue=""
                      label="处理人"
                    >
                      {mockStaff
                        .filter(
                          (s) =>
                            s.department === '站长办公室' ||
                            s.department === '调度室' ||
                            s.department === '安保科'
                        )
                        .map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} - {s.position}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="事件描述"
                    multiline
                    rows={3}
                    margin="normal"
                    placeholder="请详细描述当前事件情况..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    处置步骤（将按以下顺序执行）：
                  </Typography>
                  <Stepper orientation="vertical" activeStep={-1}>
                    {selectedPlanForStart.steps.map((step, index) => (
                      <Step key={index} completed>
                        <StepLabel>
                          <Typography variant="body2" fontWeight={600}>
                            步骤 {index + 1}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2">{step}</Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>责任部门：</strong>
                      {selectedPlanForStart.responsibleDepartments.join('、')}
                    </Typography>
                    <Typography variant="body2">
                      启动后，系统将自动记录处置过程，并通知相关责任部门人员。
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenStartEmergencyDialog(false)}>取消</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PlayArrow />}
            onClick={() => {
              if (selectedPlanForStart) {
                const newRecord: EmergencyRecord = {
                  id: String(Date.now()),
                  planId: selectedPlanForStart.id,
                  planName: selectedPlanForStart.name,
                  startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  status: 'active',
                  description: '应急事件已启动',
                  handler: '当前用户',
                };
                setRecords([newRecord, ...records]);
                setOpenStartEmergencyDialog(false);
                setActiveTab(1);
              }
            }}
            sx={{
              background: 'linear-gradient(135deg, #d32f2f, #f44336)',
            }}
          >
            确认启动
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRecordDialog}
        onClose={() => setOpenRecordDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor:
                  selectedRecord?.status === 'active' ? '#ffebee' : '#e8f5e9',
                color:
                  selectedRecord?.status === 'active' ? '#d32f2f' : '#2e7d32',
              }}
            >
              <Description />
            </Avatar>
            处置记录详情
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      预案名称
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.planName}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      状态
                    </Typography>
                    <Box>
                      <Chip
                        label={selectedRecord.status === 'active' ? '处理中' : '已完成'}
                        color={selectedRecord.status === 'active' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      开始时间
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.startTime}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      结束时间
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.endTime || '进行中'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      处理人
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.handler}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    事件描述
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="body2">{selectedRecord.description}</Typography>
                  </Paper>
                </Grid>
                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      备注
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
                      <Typography variant="body2">{selectedRecord.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenRecordDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPlanDialog}
        onClose={() => setOpenPlanDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1a237e' }}>
              <Description />
            </Avatar>
            应急预案详情
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#ffebee',
                          color: '#d32f2f',
                        }}
                      >
                        {getCategoryIcon(selectedPlan.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedPlan.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={getCategoryLabel(selectedPlan.category)}
                            size="small"
                            color={getCategoryColor(selectedPlan.category) as any}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {selectedPlan.steps.length} 个处置步骤
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Divider />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      {selectedPlan.description}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    责任部门
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedPlan.responsibleDepartments.map((dept, index) => (
                      <Chip key={index} label={dept} color="primary" />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    处置步骤
                  </Typography>
                  <Stepper orientation="vertical" activeStep={-1}>
                    {selectedPlan.steps.map((step, index) => (
                      <Step key={index} completed>
                        <StepLabel>
                          <Typography variant="body2" fontWeight={600}>
                            步骤 {index + 1}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2">{step}</Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenPlanDialog(false)}>关闭</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PlayArrow />}
            onClick={() => {
              setOpenPlanDialog(false);
              if (selectedPlan) {
                setSelectedPlanForStart(selectedPlan);
                setOpenStartEmergencyDialog(true);
              }
            }}
          >
            启动预案
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Emergency;
