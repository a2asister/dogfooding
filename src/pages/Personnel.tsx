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
  TablePagination,
  Alert,
  Badge,
  Divider,
  AvatarGroup,
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  Schedule,
  AssignmentTurnedIn,
  HowToReg,
  ExitToApp,
  History,
  Group,
  Work,
  AccessTime,
  LocationOn,
  Phone,
  Info,
  CheckCircle,
  Cancel,
  EventBusy,
  Flight,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { mockStaff, mockShiftSchedules } from '../data/mockData';
import { Staff, ShiftSchedule } from '../types';
import dayjs from 'dayjs';

const Personnel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [staffList, setStaffList] = useState<Staff[]>(mockStaff);
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>(mockShiftSchedules);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [openCheckInDialog, setOpenCheckInDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftSchedule | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_duty':
        return 'success';
      case 'off_duty':
        return 'default';
      case 'leave':
        return 'warning';
      case 'business_trip':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_duty':
        return '在岗';
      case 'off_duty':
        return '离岗';
      case 'leave':
        return '请假';
      case 'business_trip':
        return '出差';
      default:
        return '未知';
    }
  };

  const getShiftTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      morning: '早班',
      afternoon: '午班',
      night: '夜班',
      day_off: '休息',
    };
    return typeMap[type] || type;
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return 'primary';
      case 'afternoon':
        return 'success';
      case 'night':
        return 'error';
      case 'day_off':
        return 'default';
      default:
        return 'default';
    }
  };

  const departments = [...new Set(staffList.map((s) => s.department))];

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const stats = {
    total: staffList.length,
    onDuty: staffList.filter((s) => s.status === 'on_duty').length,
    offDuty: staffList.filter((s) => s.status === 'off_duty').length,
    leave: staffList.filter((s) => s.status === 'leave').length,
    businessTrip: staffList.filter((s) => s.status === 'business_trip').length,
  };

  const staffColumns: GridColDef[] = [
    {
      field: 'employeeId',
      headerName: '工号',
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight={600} color="#1a237e">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: '姓名',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor:
                params.row.gender === 'male'
                  ? '#e3f2fd'
                  : '#fce4ec',
              color:
                params.row.gender === 'male'
                  ? '#1a237e'
                  : '#c2185b',
            }}
          >
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.gender === 'male' ? '男' : '女'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'position', headerName: '岗位', width: 120 },
    { field: 'department', headerName: '部门', width: 120 },
    { field: 'phone', headerName: '联系电话', width: 140 },
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
      field: 'lastCheckIn',
      headerName: '最后打卡',
      width: 160,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="编辑">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedStaff(params.row);
                setOpenStaffDialog(true);
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.status === 'on_duty' ? '签退' : '签到'}>
            <IconButton
              size="small"
              color={params.row.status === 'on_duty' ? 'error' : 'success'}
              onClick={() => {
                setSelectedStaff(params.row);
                setOpenCheckInDialog(true);
              }}
            >
              {params.row.status === 'on_duty' ? <ExitToApp /> : <HowToReg />}
            </IconButton>
          </Tooltip>
          <Tooltip title="排班">
            <IconButton
              size="small"
              color="info"
              onClick={() => {
                setSelectedShift({
                  id: String(Date.now()),
                  staffId: params.row.id,
                  staffName: params.row.name,
                  date: dayjs().format('YYYY-MM-DD'),
                  shiftType: 'morning',
                  startTime: '08:00',
                  endTime: '16:00',
                  location: params.row.department,
                });
                setOpenShiftDialog(true);
              }}
            >
              <Schedule />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const shiftColumns: GridColDef[] = [
    {
      field: 'date',
      headerName: '日期',
      width: 120,
    },
    {
      field: 'staffName',
      headerName: '人员',
      width: 120,
    },
    {
      field: 'shiftType',
      headerName: '班次',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getShiftTypeLabel(params.value)}
          color={getShiftTypeColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'startTime',
      headerName: '开始时间',
      width: 100,
    },
    {
      field: 'endTime',
      headerName: '结束时间',
      width: 100,
    },
    {
      field: 'location',
      headerName: '岗位地点',
      width: 150,
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="编辑">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedShift(params.row);
                setOpenShiftDialog(true);
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="删除">
            <IconButton
              size="small"
              color="error"
              onClick={() =>
                setShiftSchedules(shiftSchedules.filter((s) => s.id !== params.row.id))
              }
            >
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
          人员岗位考勤排班管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理车站所有人员的岗位信息、排班设置、考勤打卡全流程
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Group sx={{ color: '#1a237e' }} />
                <Typography variant="body2" color="text.secondary">
                  总人数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#1a237e">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#2e7d32' }} />
                <Typography variant="body2" color="text.secondary">
                  在岗人数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                {stats.onDuty}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Cancel sx={{ color: '#7b1fa2' }} />
                <Typography variant="body2" color="text.secondary">
                  离岗人数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#7b1fa2">
                {stats.offDuty}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventBusy sx={{ color: '#ed6c02' }} />
                <Typography variant="body2" color="text.secondary">
                  请假人数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#ed6c02">
                {stats.leave}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Flight sx={{ color: '#00838f' }} />
                <Typography variant="body2" color="text.secondary">
                  出差人数
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#00838f">
                {stats.businessTrip}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    在岗人员分布
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<Refresh />}>
                    刷新状态
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {departments.map((dept) => {
                    const deptStaff = staffList.filter((s) => s.department === dept);
                    const onDutyInDept = deptStaff.filter((s) => s.status === 'on_duty').length;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={dept}>
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Work sx={{ color: '#1a237e', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              {dept}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AvatarGroup max={4}>
                              {deptStaff
                                .slice(0, 4)
                                .map((s) => (
                                  <Tooltip key={s.id} title={s.name}>
                                    <Avatar
                                      sx={{
                                        width: 30,
                                        height: 30,
                                        fontSize: 12,
                                        bgcolor:
                                          s.status === 'on_duty'
                                            ? '#e3f2fd'
                                            : '#fafafa',
                                        color:
                                          s.status === 'on_duty'
                                            ? '#1a237e'
                                            : '#9e9e9e',
                                      }}
                                    >
                                      {s.name.charAt(0)}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                            </AvatarGroup>
                            <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
                              <Typography variant="body2">
                                <Chip
                                  label={`${onDutyInDept}/${deptStaff.length} 在岗`}
                                  size="small"
                                  color={onDutyInDept === deptStaff.length ? 'success' : 'primary'}
                                />
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  今日排班概览
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="#1a237e">
                        早班 (08:00 - 16:00)
                      </Typography>
                      <Chip
                        label={`${shiftSchedules.filter((s) => s.shiftType === 'morning').length} 人`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {shiftSchedules
                        .filter((s) => s.shiftType === 'morning')
                        .slice(0, 3)
                        .map((s) => s.staffName)
                        .join('、')}
                      {shiftSchedules.filter((s) => s.shiftType === 'morning').length > 3 && '...'}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="#2e7d32">
                        午班 (14:00 - 22:00)
                      </Typography>
                      <Chip
                        label={`${shiftSchedules.filter((s) => s.shiftType === 'afternoon').length} 人`}
                        size="small"
                        color="success"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {shiftSchedules
                        .filter((s) => s.shiftType === 'afternoon')
                        .slice(0, 3)
                        .map((s) => s.staffName)
                        .join('、')}
                      {shiftSchedules.filter((s) => s.shiftType === 'afternoon').length > 3 && '...'}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ffebee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="#d32f2f">
                        夜班 (22:00 - 06:00)
                      </Typography>
                      <Chip
                        label={`${shiftSchedules.filter((s) => s.shiftType === 'night').length} 人`}
                        size="small"
                        color="error"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {shiftSchedules
                        .filter((s) => s.shiftType === 'night')
                        .slice(0, 3)
                        .map((s) => s.staffName)
                        .join('、')}
                      {shiftSchedules.filter((s) => s.shiftType === 'night').length > 3 && '...'}
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="人员信息管理" icon={<Person />} iconPosition="start" />
          <Tab label="排班设置" icon={<Schedule />} iconPosition="start" />
          <Tab label="考勤记录" icon={<History />} iconPosition="start" />
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
                  placeholder="搜索姓名、工号、岗位"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>状态筛选</InputLabel>
                  <Select
                    value={statusFilter}
                    label="状态筛选"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="on_duty">在岗</MenuItem>
                    <MenuItem value="off_duty">离岗</MenuItem>
                    <MenuItem value="leave">请假</MenuItem>
                    <MenuItem value="business_trip">出差</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>部门筛选</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="部门筛选"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部部门</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
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
                    setSelectedStaff({
                      id: String(Date.now()),
                      employeeId: `EMP${String(staffList.length + 1).padStart(3, '0')}`,
                      name: '',
                      gender: 'male',
                      position: '',
                      department: '客运科',
                      phone: '',
                      status: 'off_duty',
                    });
                    setOpenStaffDialog(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                  }}
                >
                  新增人员
                </Button>
              </Box>

              <DataGrid
                rows={filteredStaff}
                columns={staffColumns}
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
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  size="small"
                  onClick={() => {
                    setSelectedShift({
                      id: String(Date.now()),
                      staffId: '',
                      staffName: '',
                      date: dayjs().format('YYYY-MM-DD'),
                      shiftType: 'morning',
                      startTime: '08:00',
                      endTime: '16:00',
                      location: '',
                    });
                    setOpenShiftDialog(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                  }}
                >
                  新增排班
                </Button>
              </Box>
              <DataGrid
                rows={shiftSchedules}
                columns={shiftColumns}
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

          {activeTab === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                考勤记录功能展示，详细记录人员上下班打卡信息
              </Alert>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell>日期</TableCell>
                      <TableCell>工号</TableCell>
                      <TableCell>姓名</TableCell>
                      <TableCell>岗位</TableCell>
                      <TableCell>签到时间</TableCell>
                      <TableCell>签退时间</TableCell>
                      <TableCell>工作时长</TableCell>
                      <TableCell>状态</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffList
                      .filter((s) => s.lastCheckIn)
                      .slice(0, 8)
                      .map((staff, index) => {
                        const workHours = staff.lastCheckOut
                          ? dayjs(staff.lastCheckOut).diff(dayjs(staff.lastCheckIn), 'hour', true).toFixed(1)
                          : '-';
                        return (
                          <TableRow key={staff.id}>
                            <TableCell>{dayjs().subtract(index, 'day').format('YYYY-MM-DD')}</TableCell>
                            <TableCell>{staff.employeeId}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                  {staff.name.charAt(0)}
                                </Avatar>
                                {staff.name}
                              </Box>
                            </TableCell>
                            <TableCell>{staff.position}</TableCell>
                            <TableCell>
                              <Chip
                                icon={<HowToReg sx={{ fontSize: 16 }} />}
                                label={staff.lastCheckIn?.split(' ')[1]}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {staff.lastCheckOut ? (
                                <Chip
                                  icon={<ExitToApp sx={{ fontSize: 16 }} />}
                                  label={staff.lastCheckOut.split(' ')[1]}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  未签退
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {workHours !== '-' ? `${workHours} 小时` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={workHours !== '-' ? '正常' : '进行中'}
                                size="small"
                                color={workHours !== '-' ? 'success' : 'info'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openStaffDialog}
        onClose={() => setOpenStaffDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStaff?.name ? '编辑人员信息' : '新增人员'}
        </DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="工号"
                  value={selectedStaff.employeeId}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, employeeId: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="姓名"
                  value={selectedStaff.name}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, name: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>性别</InputLabel>
                  <Select
                    value={selectedStaff.gender}
                    label="性别"
                    onChange={(e) =>
                      setSelectedStaff({ ...selectedStaff, gender: e.target.value as any })
                    }
                  >
                    <MenuItem value="male">男</MenuItem>
                    <MenuItem value="female">女</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="岗位"
                  value={selectedStaff.position}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, position: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>部门</InputLabel>
                  <Select
                    value={selectedStaff.department}
                    label="部门"
                    onChange={(e) =>
                      setSelectedStaff({ ...selectedStaff, department: e.target.value })
                    }
                  >
                    <MenuItem value="站长办公室">站长办公室</MenuItem>
                    <MenuItem value="调度室">调度室</MenuItem>
                    <MenuItem value="安保科">安保科</MenuItem>
                    <MenuItem value="运维科">运维科</MenuItem>
                    <MenuItem value="客运科">客运科</MenuItem>
                    <MenuItem value="后勤科">后勤科</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="联系电话"
                  value={selectedStaff.phone}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, phone: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>当前状态</InputLabel>
                  <Select
                    value={selectedStaff.status}
                    label="当前状态"
                    onChange={(e) =>
                      setSelectedStaff({ ...selectedStaff, status: e.target.value as any })
                    }
                  >
                    <MenuItem value="on_duty">在岗</MenuItem>
                    <MenuItem value="off_duty">离岗</MenuItem>
                    <MenuItem value="leave">请假</MenuItem>
                    <MenuItem value="business_trip">出差</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenStaffDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedStaff) {
                const exists = staffList.find((s) => s.id === selectedStaff.id);
                if (exists) {
                  setStaffList(
                    staffList.map((s) =>
                      s.id === selectedStaff.id ? selectedStaff : s
                    )
                  );
                } else {
                  setStaffList([...staffList, selectedStaff]);
                }
              }
              setOpenStaffDialog(false);
              setSelectedStaff(null);
            }}
            sx={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openShiftDialog}
        onClose={() => setOpenShiftDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedShift?.id ? '编辑排班' : '新增排班'}
        </DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="日期"
                  type="date"
                  value={selectedShift.date}
                  onChange={(e) =>
                    setSelectedShift({ ...selectedShift, date: e.target.value })
                  }
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>人员</InputLabel>
                  <Select
                    value={selectedShift.staffName}
                    label="人员"
                    onChange={(e) =>
                      setSelectedShift({
                        ...selectedShift,
                        staffName: e.target.value,
                        staffId: staffList.find((s) => s.name === e.target.value)?.id || '',
                      })
                    }
                  >
                    {staffList.map((s) => (
                      <MenuItem key={s.id} value={s.name}>
                        {s.name} - {s.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>班次类型</InputLabel>
                  <Select
                    value={selectedShift.shiftType}
                    label="班次类型"
                    onChange={(e) => {
                      const type = e.target.value as string;
                      let startTime = '08:00';
                      let endTime = '16:00';
                      if (type === 'morning') {
                        startTime = '08:00';
                        endTime = '16:00';
                      } else if (type === 'afternoon') {
                        startTime = '14:00';
                        endTime = '22:00';
                      } else if (type === 'night') {
                        startTime = '22:00';
                        endTime = '06:00';
                      }
                      setSelectedShift({
                        ...selectedShift,
                        shiftType: type as any,
                        startTime,
                        endTime,
                      });
                    }}
                  >
                    <MenuItem value="morning">早班 (08:00 - 16:00)</MenuItem>
                    <MenuItem value="afternoon">午班 (14:00 - 22:00)</MenuItem>
                    <MenuItem value="night">夜班 (22:00 - 06:00)</MenuItem>
                    <MenuItem value="day_off">休息</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="岗位地点"
                  value={selectedShift.location}
                  onChange={(e) =>
                    setSelectedShift({ ...selectedShift, location: e.target.value })
                  }
                  margin="normal"
                />
              </Grid>
              {selectedShift.shiftType !== 'day_off' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="开始时间"
                      type="time"
                      value={selectedShift.startTime}
                      onChange={(e) =>
                        setSelectedShift({ ...selectedShift, startTime: e.target.value })
                      }
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="结束时间"
                      type="time"
                      value={selectedShift.endTime}
                      onChange={(e) =>
                        setSelectedShift({ ...selectedShift, endTime: e.target.value })
                      }
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenShiftDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedShift) {
                const exists = shiftSchedules.find((s) => s.id === selectedShift.id);
                if (exists) {
                  setShiftSchedules(
                    shiftSchedules.map((s) =>
                      s.id === selectedShift.id ? selectedShift : s
                    )
                  );
                } else {
                  setShiftSchedules([...shiftSchedules, selectedShift]);
                }
              }
              setOpenShiftDialog(false);
              setSelectedShift(null);
            }}
            sx={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCheckInDialog}
        onClose={() => setOpenCheckInDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStaff?.status === 'on_duty' ? '签退确认' : '签到确认'}
        </DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: '#e3f2fd',
                      color: '#1a237e',
                      fontSize: 24,
                    }}
                  >
                    {selectedStaff.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedStaff.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStaff.employeeId} - {selectedStaff.position}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Alert
                  severity={selectedStaff.status === 'on_duty' ? 'warning' : 'info'}
                  sx={{ mb: 2 }}
                >
                  {selectedStaff.status === 'on_duty'
                    ? `确认签退？当前时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
                    : `确认签到？当前时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`}
                </Alert>
                {selectedStaff.lastCheckIn && (
                  <Typography variant="body2" color="text.secondary">
                    上次打卡时间：{selectedStaff.lastCheckIn}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenCheckInDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedStaff) {
                const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
                if (selectedStaff.status === 'on_duty') {
                  setStaffList(
                    staffList.map((s) =>
                      s.id === selectedStaff.id
                        ? { ...s, status: 'off_duty' as const, lastCheckOut: now }
                        : s
                    )
                  );
                } else {
                  setStaffList(
                    staffList.map((s) =>
                      s.id === selectedStaff.id
                        ? { ...s, status: 'on_duty' as const, lastCheckIn: now }
                        : s
                    )
                  );
                }
              }
              setOpenCheckInDialog(false);
              setSelectedStaff(null);
            }}
            sx={{
              background:
                selectedStaff?.status === 'on_duty'
                  ? 'linear-gradient(135deg, #d32f2f, #f44336)'
                  : 'linear-gradient(135deg, #1a237e, #3949ab)',
            }}
          >
            {selectedStaff?.status === 'on_duty' ? '确认签退' : '确认签到'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Personnel;
