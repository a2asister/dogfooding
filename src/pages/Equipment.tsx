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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Badge,
  Divider,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Build,
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  Assignment,
  ReportProblem,
  CheckCircle,
  PendingActions,
  Schedule,
  Inventory,
  History,
  TaskAlt,
  Person,
  AccessTime,
  LocationOn,
  Info,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  mockEquipment,
  mockMaintenanceWorkOrders,
  mockStaff,
} from '../data/mockData';
import { Equipment as EquipmentType, MaintenanceWorkOrder } from '../types';
import dayjs from 'dayjs';

const Equipment: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [equipmentList, setEquipmentList] = useState<EquipmentType[]>(mockEquipment);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(mockMaintenanceWorkOrders);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [openWorkOrderDialog, setOpenWorkOrderDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<MaintenanceWorkOrder | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'fault':
        return 'error';
      case 'scrapped':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'maintenance':
        return '维护中';
      case 'fault':
        return '故障';
      case 'scrapped':
        return '报废';
      default:
        return '未知';
    }
  };

  const getWorkOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'assigned':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getWorkOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'assigned':
        return '已派单';
      case 'in_progress':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '未知';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      seat: '候车座椅',
      elevator: '电梯',
      escalator: '扶梯',
      air_conditioning: '空调系统',
      lighting: '照明设备',
      toilet: '卫生间设施',
      broadcast: '广播系统',
      display: '信息显示屏',
    };
    return typeMap[type] || type;
  };

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchText.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchText.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    const matchesType = typeFilter === 'all' || eq.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: equipmentList.length,
    normal: equipmentList.filter((eq) => eq.status === 'normal').length,
    maintenance: equipmentList.filter((eq) => eq.status === 'maintenance').length,
    fault: equipmentList.filter((eq) => eq.status === 'fault').length,
    workOrders: workOrders.length,
    pendingWorkOrders: workOrders.filter((wo) => wo.status === 'pending' || wo.status === 'assigned' || wo.status === 'in_progress').length,
  };

  const equipmentColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: '设备名称',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              bgcolor:
                params.row.status === 'normal'
                  ? '#e8f5e9'
                  : params.row.status === 'fault'
                  ? '#ffebee'
                  : '#fff3e0',
              color:
                params.row.status === 'normal'
                  ? '#2e7d32'
                  : params.row.status === 'fault'
                  ? '#d32f2f'
                  : '#ed6c02',
            }}
          >
            <Build />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getTypeLabel(params.row.type)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'model', headerName: '型号', width: 120 },
    { field: 'location', headerName: '位置', width: 150 },
    {
      field: 'installationDate',
      headerName: '安装日期',
      width: 120,
    },
    {
      field: 'lastInspection',
      headerName: '上次巡检',
      width: 120,
    },
    {
      field: 'nextInspection',
      headerName: '下次巡检',
      width: 120,
    },
    {
      field: 'status',
      headerName: '状态',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
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
          <Tooltip title="编辑">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedEquipment(params.row);
                setOpenEquipmentDialog(true);
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="报修">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedWorkOrder({
                  id: String(Date.now()),
                  equipmentId: params.row.id,
                  equipmentName: params.row.name,
                  description: '',
                  reporter: '当前用户',
                  reportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  status: 'pending',
                  priority: 'medium',
                });
                setOpenWorkOrderDialog(true);
              }}
            >
              <ReportProblem />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const workOrderColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: '工单编号',
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight={600} color="#1a237e">
          WO-{params.value}
        </Typography>
      ),
    },
    {
      field: 'equipmentName',
      headerName: '设备名称',
      width: 150,
    },
    {
      field: 'description',
      headerName: '问题描述',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'reporter',
      headerName: '上报人',
      width: 100,
    },
    {
      field: 'reportTime',
      headerName: '上报时间',
      width: 160,
    },
    {
      field: 'assignee',
      headerName: '处理人',
      width: 100,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'priority',
      headerName: '优先级',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={getPriorityLabel(params.value)}
          color={getPriorityColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: '状态',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getWorkOrderStatusLabel(params.value)}
          color={getWorkOrderStatusColor(params.value) as any}
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
                setSelectedWorkOrder(params.row);
                setOpenWorkOrderDialog(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <Tooltip title="派单">
              <IconButton size="small" color="info">
                <Assignment />
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
          设备设施运维管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理站内所有基础设施的档案、巡检、维修工单全流程
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Inventory sx={{ color: '#1a237e' }} />
                <Typography variant="body2" color="text.secondary">
                  设备总数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#1a237e">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#2e7d32' }} />
                <Typography variant="body2" color="text.secondary">
                  正常运行
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                {stats.normal}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Schedule sx={{ color: '#ed6c02' }} />
                <Typography variant="body2" color="text.secondary">
                  维护中
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                {stats.maintenance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffebee, #ffcdd2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReportProblem sx={{ color: '#d32f2f' }} />
                <Typography variant="body2" color="text.secondary">
                  故障设备
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#d32f2f">
                {stats.fault}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Assignment sx={{ color: '#00695c' }} />
                <Typography variant="body2" color="text.secondary">
                  待处理工单
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#00695c">
                {stats.pendingWorkOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TaskAlt sx={{ color: '#7b1fa2' }} />
                <Typography variant="body2" color="text.secondary">
                  工单总数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                {stats.workOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="设备档案管理" icon={<Inventory />} iconPosition="start" />
          <Tab label="维修工单管理" icon={<Assignment />} iconPosition="start" />
          <Tab label="巡检记录" icon={<History />} iconPosition="start" />
        </Tabs>
        <CardContent>
          {activeTab === 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <TextField
                  size="small"
                  placeholder="搜索设备名称、位置、型号"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>类型筛选</InputLabel>
                  <Select
                    value={typeFilter}
                    label="类型筛选"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部类型</MenuItem>
                    <MenuItem value="seat">候车座椅</MenuItem>
                    <MenuItem value="elevator">电梯</MenuItem>
                    <MenuItem value="escalator">扶梯</MenuItem>
                    <MenuItem value="air_conditioning">空调系统</MenuItem>
                    <MenuItem value="lighting">照明设备</MenuItem>
                    <MenuItem value="toilet">卫生间设施</MenuItem>
                    <MenuItem value="broadcast">广播系统</MenuItem>
                    <MenuItem value="display">信息显示屏</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>状态筛选</InputLabel>
                  <Select
                    value={statusFilter}
                    label="状态筛选"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="normal">正常</MenuItem>
                    <MenuItem value="maintenance">维护中</MenuItem>
                    <MenuItem value="fault">故障</MenuItem>
                    <MenuItem value="scrapped">报废</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" startIcon={<Refresh />} size="small">
                  刷新数据
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  size="small"
                  onClick={() => {
                    setSelectedEquipment({
                      id: String(Date.now()),
                      name: '',
                      type: 'seat',
                      location: '',
                      model: '',
                      installationDate: dayjs().format('YYYY-MM-DD'),
                      status: 'normal',
                      lastInspection: dayjs().format('YYYY-MM-DD'),
                      nextInspection: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                    });
                    setOpenEquipmentDialog(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                  }}
                >
                  新增设备
                </Button>
              </Box>

              <DataGrid
                rows={filteredEquipment}
                columns={equipmentColumns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
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

          {activeTab === 1 && (
            <DataGrid
              rows={workOrders}
              columns={workOrderColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8fafc',
                  fontWeight: 600,
                },
              }}
            />
          )}

          {activeTab === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                巡检记录功能开发中，即将上线...
              </Alert>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell>巡检日期</TableCell>
                      <TableCell>设备名称</TableCell>
                      <TableCell>设备位置</TableCell>
                      <TableCell>巡检人员</TableCell>
                      <TableCell>巡检结果</TableCell>
                      <TableCell>备注</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipmentList.slice(0, 5).map((eq, index) => (
                      <TableRow key={eq.id}>
                        <TableCell>{dayjs().subtract(index, 'day').format('YYYY-MM-DD')}</TableCell>
                        <TableCell>{eq.name}</TableCell>
                        <TableCell>{eq.location}</TableCell>
                        <TableCell>赵运维</TableCell>
                        <TableCell>
                          <Chip
                            label="正常"
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>设备运行正常</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openEquipmentDialog}
        onClose={() => setOpenEquipmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEquipment?.name ? '编辑设备信息' : '新增设备'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="设备名称"
                value={selectedEquipment?.name || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>设备类型</InputLabel>
                <Select
                  value={selectedEquipment?.type || 'seat'}
                  label="设备类型"
                  onChange={(e) =>
                    setSelectedEquipment({ ...selectedEquipment!, type: e.target.value as any })
                  }
                >
                  <MenuItem value="seat">候车座椅</MenuItem>
                  <MenuItem value="elevator">电梯</MenuItem>
                  <MenuItem value="escalator">扶梯</MenuItem>
                  <MenuItem value="air_conditioning">空调系统</MenuItem>
                  <MenuItem value="lighting">照明设备</MenuItem>
                  <MenuItem value="toilet">卫生间设施</MenuItem>
                  <MenuItem value="broadcast">广播系统</MenuItem>
                  <MenuItem value="display">信息显示屏</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="设备型号"
                value={selectedEquipment?.model || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, model: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="安装位置"
                value={selectedEquipment?.location || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, location: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="安装日期"
                type="date"
                value={selectedEquipment?.installationDate || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, installationDate: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>设备状态</InputLabel>
                <Select
                  value={selectedEquipment?.status || 'normal'}
                  label="设备状态"
                  onChange={(e) =>
                    setSelectedEquipment({ ...selectedEquipment!, status: e.target.value as any })
                  }
                >
                  <MenuItem value="normal">正常</MenuItem>
                  <MenuItem value="maintenance">维护中</MenuItem>
                  <MenuItem value="fault">故障</MenuItem>
                  <MenuItem value="scrapped">报废</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="上次巡检日期"
                type="date"
                value={selectedEquipment?.lastInspection || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, lastInspection: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="下次巡检日期"
                type="date"
                value={selectedEquipment?.nextInspection || ''}
                onChange={(e) =>
                  setSelectedEquipment({ ...selectedEquipment!, nextInspection: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEquipmentDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedEquipment) {
                const exists = equipmentList.find((eq) => eq.id === selectedEquipment.id);
                if (exists) {
                  setEquipmentList(
                    equipmentList.map((eq) =>
                      eq.id === selectedEquipment.id ? selectedEquipment : eq
                    )
                  );
                } else {
                  setEquipmentList([...equipmentList, selectedEquipment]);
                }
              }
              setOpenEquipmentDialog(false);
              setSelectedEquipment(null);
            }}
            sx={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openWorkOrderDialog}
        onClose={() => setOpenWorkOrderDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedWorkOrder?.id ? '维修工单详情' : '新建维修工单'}
        </DialogTitle>
        <DialogContent>
          {selectedWorkOrder && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="设备名称"
                  value={selectedWorkOrder.equipmentName}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>优先级</InputLabel>
                  <Select
                    value={selectedWorkOrder.priority}
                    label="优先级"
                    onChange={(e) =>
                      setSelectedWorkOrder({ ...selectedWorkOrder, priority: e.target.value as any })
                    }
                  >
                    <MenuItem value="low">低</MenuItem>
                    <MenuItem value="medium">中</MenuItem>
                    <MenuItem value="high">高</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="问题描述"
                  multiline
                  rows={4}
                  value={selectedWorkOrder.description}
                  onChange={(e) =>
                    setSelectedWorkOrder({ ...selectedWorkOrder, description: e.target.value })
                  }
                  margin="normal"
                  placeholder="请详细描述设备故障情况..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="上报人"
                  value={selectedWorkOrder.reporter}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="上报时间"
                  value={selectedWorkOrder.reportTime}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              {selectedWorkOrder.status !== 'pending' && (
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={mockStaff.filter((s) => s.department === '运维科')}
                    getOptionLabel={(option) => option.name}
                    value={mockStaff.find((s) => s.name === selectedWorkOrder.assignee) || null}
                    onChange={(_, newValue) =>
                      setSelectedWorkOrder({
                        ...selectedWorkOrder,
                        assignee: newValue?.name || '',
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="处理人"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )}
              {selectedWorkOrder.status === 'completed' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="处理结果"
                    multiline
                    rows={3}
                    value={selectedWorkOrder.resolution || ''}
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenWorkOrderDialog(false)}>关闭</Button>
          {selectedWorkOrder?.status === 'pending' && (
            <Button
              variant="contained"
              onClick={() => {
                if (selectedWorkOrder) {
                  setWorkOrders([
                    ...workOrders,
                    { ...selectedWorkOrder, status: 'assigned' },
                  ]);
                }
                setOpenWorkOrderDialog(false);
              }}
              sx={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}
            >
              提交报修
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Equipment;
