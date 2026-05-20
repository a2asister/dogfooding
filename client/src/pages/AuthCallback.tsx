import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

function AuthCallback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr)) as User;
        login(token, user);
        message.success('GitHub登录成功');
        navigate('/dashboard');
      } catch {
        message.error('登录信息解析失败');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Spin size="large" tip="正在完成登录..." />
    </div>
  );
}

export default AuthCallback;
