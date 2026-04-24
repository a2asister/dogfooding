import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Train } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 6,
          width: '100%',
          maxWidth: 480,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Train sx={{ fontSize: 48, color: 'white' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="#1a237e">
            火车站管理系统
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Railway Station Management System
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="用户名"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="请输入用户名"
          />

          <TextField
            fullWidth
            label="密码"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 4 }}
            placeholder="请输入密码"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.8,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #1a237e, #3949ab)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d1452, #283593)',
              },
            }}
          >
            登 录
          </Button>
        </form>

        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            测试账号：
          </Typography>
          <Typography variant="body2" color="text.secondary">
            超级管理员：admin / admin123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            调度管理员：dispatch / dispatch123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            安保人员：security / security123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            运维人员：maintenance / maintenance123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            普通值班人员：staff / staff123
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
