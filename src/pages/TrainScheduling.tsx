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
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Print,
  Tv,
  Search,
  Refresh,
  FilterList,
  Train,
  AccessTime,
  Warning,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { mockTrains } from '../data/mockData';
import { Train as TrainType } from '../types';
import dayjs from 'dayjs';

const TrainScheduling: React.FC = () => {
  const [trains, setTrains] = useState<TrainType[]>(mockTrains);
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainType | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openPushDialog, setOpenPushDialog] = useState(false);

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

  const filteredTrains = trains.filter((train) => {
    const matchesSearch =
      train.trainNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      train.startStation.toLowerCase().includes(searchText.toLowerCase()) ||
      train.endStation.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || train.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (train: TrainType) => {
    setSelectedTrain(train);
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (selectedTrain) {
      setTrains(
        trains.map((t) => (t.id === selectedTrain.id ? selectedTrain : t))
      );
      setOpenDialog(false);
      setSelectedTrain(null);
    }
  };

  const handleDelete = (id: string) => {
    setTrains(trains.filter((t) => t.id !== id));
  };

  const handleAdd = () => {
    setSelectedTrain({
      id: String(Date.now()),
      trainNumber: '',
      trainType: '高铁',
      startStation: '',
      endStation: '',
      scheduledArrivalTime: '',
      scheduledDepartureTime: '',
      platform: '',
      track: '',
      status: 'on_time',
    });
    setOpenDialog(true);
  };

  const stats = {
    total: trains.length,
    onTime: trains.filter((t) => t.status === 'on_time').length,
    delayed: trains.filter((t) => t.status === 'delayed').length,
    cancelled: trains.filter((t) => t.status === 'cancelled').length,
    temporary: trains.filter((t) => t.status === 'temporary').length,
  };

  const columns: GridColDef[] = [
    {
      field: 'trainNumber',
      headerName: '车次号',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Train sx={{ fontSize: 18, color: '#1a237e' }} />
          <Typography fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    { field: 'trainType', headerName: '车次类型', width: 100 },
    { field: 'startStation', headerName: '始发站', width: 120 },
    { field: 'endStation', headerName: '终到站', width: 120 },
    {
      field: 'scheduledArrivalTime',
      headerName: '计划到站',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'scheduledDepartureTime',
      headerName: '计划发车',
      width: 120,
    },
    {
      field: 'actualArrivalTime',
      headerName: '实际到站',
      width: 120,
      renderCell: (params) => (
        <Typography color={params.row.status === 'delayed' ? 'error' : params.row.status === 'early' ? 'info' : 'text.primary'}>
          {params.value || '-'}
        </Typography>
      ),
    },
    { field: 'platform', headerName: '站台', width: 100 },
    { field: 'track', headerName: '股道', width: 100 },
    {
      field: 'status',
      headerName: '状态',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
          icon={
            params.value === 'delayed' ? (
              <Warning sx={{ fontSize: 16 }} />
            ) : params.value === 'cancelled' ? (
              <Cancel sx={{ fontSize: 16 }} />
            ) : (
              <CheckCircle sx={{ fontSize: 16 }} />
            )
          }
        />
      ),
    },
    {
      field: 'delayMinutes',
      headerName: '晚点时长',
      width: 100,
      renderCell: (params) => (
        <Typography color={params.value ? 'error' : 'text.secondary'}>
          {params.value ? `${params.value} 分钟` : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="编辑">
            <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          车次调度管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理每日经停本站的列车信息，支持调度调整和状态监控
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                今日总车次
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#1a237e">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                准点运行
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                {stats.onTime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                晚点车次
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                {stats.delayed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffebee, #ffcdd2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                停运车次
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#d32f2f">
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                临时加开
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                {stats.temporary}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="搜索车次号、始发站、终到站"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>状态筛选</InputLabel>
              <Select
                value={statusFilter}
                label="状态筛选"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">全部状态</MenuItem>
                <MenuItem value="on_time">准点</MenuItem>
                <MenuItem value="delayed">晚点</MenuItem>
                <MenuItem value="early">早点</MenuItem>
                <MenuItem value="cancelled">停运</MenuItem>
                <MenuItem value="temporary">临时</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              size="small"
            >
              刷新数据
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              size="small"
              onClick={() => setOpenScheduleDialog(true)}
            >
              打印运行计划表
            </Button>
            <Button
              variant="outlined"
              startIcon={<Tv />}
              size="small"
              onClick={() => setOpenPushDialog(true)}
            >
              推送至大屏
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={handleAdd}
              sx={{
                background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d1452, #283593)',
                },
              }}
            >
              新增车次
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="全部车次" />
          <Tab label="今日运行计划" />
          <Tab label="晚点车次" />
          <Tab label="特殊状态车次" />
        </Tabs>
        <CardContent>
          <DataGrid
            rows={filteredTrains}
            columns={columns}
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
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTrain?.trainNumber ? '编辑车次信息' : '新增车次'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="车次号"
                value={selectedTrain?.trainNumber || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, trainNumber: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>车次类型</InputLabel>
                <Select
                  value={selectedTrain?.trainType || '高铁'}
                  label="车次类型"
                  onChange={(e) =>
                    setSelectedTrain({ ...selectedTrain!, trainType: e.target.value })
                  }
                >
                  <MenuItem value="高铁">高铁</MenuItem>
                  <MenuItem value="动车">动车</MenuItem>
                  <MenuItem value="特快">特快</MenuItem>
                  <MenuItem value="快速">快速</MenuItem>
                  <MenuItem value="直达">直达</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="始发站"
                value={selectedTrain?.startStation || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, startStation: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="终到站"
                value={selectedTrain?.endStation || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, endStation: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="计划到站时间"
                type="time"
                value={selectedTrain?.scheduledArrivalTime || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, scheduledArrivalTime: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="计划发车时间"
                type="time"
                value={selectedTrain?.scheduledDepartureTime || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, scheduledDepartureTime: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="实际到站时间"
                type="time"
                value={selectedTrain?.actualArrivalTime || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, actualArrivalTime: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="实际发车时间"
                type="time"
                value={selectedTrain?.actualDepartureTime || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, actualDepartureTime: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="站台分配"
                value={selectedTrain?.platform || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, platform: e.target.value })
                }
                margin="normal"
                placeholder="例如：1号站台"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="股道安排"
                value={selectedTrain?.track || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, track: e.target.value })
                }
                margin="normal"
                placeholder="例如：1股道"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>运行状态</InputLabel>
                <Select
                  value={selectedTrain?.status || 'on_time'}
                  label="运行状态"
                  onChange={(e) =>
                    setSelectedTrain({
                      ...selectedTrain!,
                      status: e.target.value as any
                    })
                  }
                >
                  <MenuItem value="on_time">准点</MenuItem>
                  <MenuItem value="delayed">晚点</MenuItem>
                  <MenuItem value="early">早点</MenuItem>
                  <MenuItem value="cancelled">停运</MenuItem>
                  <MenuItem value="temporary">临时加开</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="晚点时长（分钟）"
                type="number"
                value={selectedTrain?.delayMinutes || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, delayMinutes: Number(e.target.value) })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                multiline
                rows={3}
                value={selectedTrain?.note || ''}
                onChange={(e) =>
                  setSelectedTrain({ ...selectedTrain!, note: e.target.value })
                }
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>每日车次运行计划表</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            当前显示 {dayjs().format('YYYY年MM月DD日')} 车次运行计划表，共 {trains.length} 列车次
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell>车次号</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>始发站</TableCell>
                <TableCell>终到站</TableCell>
                <TableCell>计划到站</TableCell>
                <TableCell>计划发车</TableCell>
                <TableCell>站台</TableCell>
                <TableCell>股道</TableCell>
                <TableCell>状态</TableCell>
              </TableRow>
              </TableHead>
              <TableBody>
              {trains.map((train) => (
                <TableRow key={train.id}>
                  <TableCell fontWeight={600}>{train.trainNumber}</TableCell>
                  <TableCell>{train.trainType}</TableCell>
                  <TableCell>{train.startStation}</TableCell>
                  <TableCell>{train.endStation}</TableCell>
                  <TableCell>{train.scheduledArrivalTime}</TableCell>
                  <TableCell>{train.scheduledDepartureTime}</TableCell>
                  <TableCell>{train.platform}</TableCell>
                  <TableCell>{train.track}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(train.status)}
                      color={getStatusColor(train.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenScheduleDialog(false)}>关闭</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            sx={{
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            打印
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPushDialog}
        onClose={() => setOpenPushDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>数据同步推送</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              选择要推送数据的终端：
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>推送目标</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">全部终端</MenuItem>
                    <MenuItem value="large_screen">站内大屏</MenuItem>
                    <MenuItem value="checkout_a">检票口A区终端</MenuItem>
                    <MenuItem value="checkout_b">检票口B区终端</MenuItem>
                    <MenuItem value="entrance">进站口显示终端</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  推送内容：车次运行信息将同步更新至所选终端显示屏，确保旅客获取最新车次信息。
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenPushDialog(false)}>取消</Button>
          <Button
            variant="contained"
            startIcon={<Tv />}
            sx={{
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            确认推送
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainScheduling;
