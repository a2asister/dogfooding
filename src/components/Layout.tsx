import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Train,
  People,
  ConfirmationNumber,
  Security,
  Build,
  Person,
  ReportProblem,
  BarChart,
  Logout,
  Notifications,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

const drawerWidth = 260;

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiredRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: '首页概览',
    icon: <Dashboard />,
    requiredRoles: ['super_admin', 'dispatch_admin', 'security_staff', 'maintenance_staff', 'regular_staff'],
  },
  {
    path: '/train-scheduling',
    label: '车次调度管理',
    icon: <Train />,
    requiredRoles: ['super_admin', 'dispatch_admin'],
  },
  {
    path: '/passenger-flow',
    label: '客流管理',
    icon: <People />,
    requiredRoles: ['super_admin', 'dispatch_admin', 'regular_staff'],
  },
  {
    path: '/ticketing',
    label: '票务与检票管理',
    icon: <ConfirmationNumber />,
    requiredRoles: ['super_admin', 'dispatch_admin', 'regular_staff'],
  },
  {
    path: '/security',
    label: '安检安防与监控管理',
    icon: <Security />,
    requiredRoles: ['super_admin', 'security_staff'],
  },
  {
    path: '/equipment',
    label: '设备设施运维管理',
    icon: <Build />,
    requiredRoles: ['super_admin', 'maintenance_staff'],
  },
  {
    path: '/personnel',
    label: '人员岗位考勤排班',
    icon: <Person />,
    requiredRoles: ['super_admin'],
  },
  {
    path: '/emergency',
    label: '应急事件处置管理',
    icon: <ReportProblem />,
    requiredRoles: ['super_admin', 'dispatch_admin', 'security_staff'],
  },
  {
    path: '/statistics',
    label: '数据统计分析',
    icon: <BarChart />,
    requiredRoles: ['super_admin'],
  },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      super_admin: '超级管理员',
      dispatch_admin: '调度管理员',
      security_staff: '安保人员',
      maintenance_staff: '运维人员',
      regular_staff: '普通值班人员',
    };
    return roleMap[role];
  };

  const filteredNavItems = navItems.filter((item) => hasPermission(item.requiredRoles));

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1a237e, #283593)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            火车站管理系统
          </Typography>
          
          <Tooltip title="通知">
            <IconButton color="inherit" sx={{ mr: 2 }} onClick={handleNotificationOpen}>
              <Badge badgeContent={5} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { width: 360, maxHeight: 400 },
            }}
          >
            <MenuItem disabled sx={{ justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                系统通知
              </Typography>
              <Typography variant="caption" color="text.secondary">
                5 条未读
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="error">
                    客流预警
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    刚刚
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  第三候车室客流已达临界值（97%），请及时疏导
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    设备故障
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    5分钟前
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  东侧自动扶梯出现故障，已自动生成维修工单
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    列车晚点
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    15分钟前
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  G1234次列车预计晚点30分钟到达本站
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    安检提醒
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    30分钟前
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  安检仪 #3 检测到违禁品，已通知安保人员
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    系统通知
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1小时前
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  今日运维巡检任务已生成，请相关人员及时完成
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ justifyContent: 'center' }} onClick={handleNotificationClose}>
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                查看全部通知
              </Typography>
            </MenuItem>
          </Menu>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="个人信息">
              <IconButton
                onClick={handleMenuOpen}
                sx={{ p: 0, display: 'flex', alignItems: 'center' }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1a237e',
                    fontWeight: 'bold',
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 1.5, textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {getRoleLabel(user?.role || 'regular_staff')}
                  </Typography>
                </Box>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2">{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.department}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                退出登录
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 64,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 64,
            boxSizing: 'border-box',
            bgcolor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', pt: 1 }}>
          <List>
            {filteredNavItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    py: 1.2,
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(26, 35, 126, 0.1)',
                      color: '#1a237e',
                      '&:hover': {
                        bgcolor: 'rgba(26, 35, 126, 0.15)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(26, 35, 126, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === item.path ? '#1a237e' : '#64748b',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: open ? 1 : 0,
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <IconButton
            onClick={() => setOpen(!open)}
            sx={{
              width: '100%',
              justifyContent: open ? 'flex-end' : 'center',
              color: '#64748b',
            }}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f1f5f9',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
