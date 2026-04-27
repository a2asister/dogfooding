import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus, isLoggedIn, loading } = useAuthStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 100));
      }, 50);

      await checkAuthStatus();

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        if (useAuthStore.getState().isLoggedIn) {
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 500);
    };

    initApp();
  }, [checkAuthStatus, navigate]);

  if (loading && progress < 100) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-14 h-14 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">职聘网</h1>
            <p className="text-primary-100 text-lg">找好工作，上职聘</p>
          </div>

          <div className="w-48 mx-auto">
            <div className="h-1.5 bg-primary-300/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-primary-100 text-sm mt-3">{progress}%</p>
          </div>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-primary-200 text-sm">正在加载中...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default SplashPage;
