import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Typography, Button, Result, Empty } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { microAppRegistry } from '@/services/microAppRegistry';
import { loadMicroApp, MicroApp as QiankunMicroApp } from 'qiankun';

const { Title, Text } = Typography;

interface MicroAppWrapperProps {
  // Props for the wrapper
}

const ensureHttpPrefix = (entry: string): string => {
  if (entry.startsWith('//')) {
    return `http:${entry}`;
  }
  if (!entry.startsWith('http://') && !entry.startsWith('https://')) {
    return `http://${entry}`;
  }
  return entry;
};

const MicroAppWrapper: React.FC<MicroAppWrapperProps> = () => {
  const { appName } = useParams<{ appName: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<QiankunMicroApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appDisplayName, setAppDisplayName] = useState('');
  const [entryUrl, setEntryUrl] = useState('');

  useEffect(() => {
    if (!appName) {
      setError('应用名称不能为空');
      setLoading(false);
      return;
    }

    const app = microAppRegistry.getAppByName(appName);
    if (!app) {
      setError(`应用 "${appName}" 不存在`);
      setLoading(false);
      return;
    }

    setAppDisplayName(app.displayName);

    if (app.status !== 'production' && app.status !== 'staging') {
      setError(`应用 "${app.displayName}" 当前仅支持预览（状态：${app.status}），请在应用管理中查看详情`);
      setLoading(false);
      return;
    }

    const defaultVersion = app.versions.find((v) => v.isDefault) || app.versions[0];
    if (!defaultVersion) {
      setError(`应用 "${app.displayName}" 没有可用的版本`);
      setLoading(false);
      return;
    }

    const normalizedEntry = ensureHttpPrefix(defaultVersion.entry);
    setEntryUrl(normalizedEntry);
    console.log(`[MicroAppWrapper] Loading app: ${appName}, entry: ${normalizedEntry}`);

    const mountMicroApp = async () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        if (microAppRef.current) {
          try {
            await microAppRef.current.unmount();
          } catch (e) {
            console.warn('[MicroAppWrapper] Error unmounting previous app:', e);
          }
        }

        const props = {
          ...app.sandboxConfig.props,
          appName: app.name,
          appDisplayName: app.displayName,
          version: defaultVersion.version,
        };

        microAppRef.current = loadMicroApp(
          {
            name: app.name,
            entry: normalizedEntry,
            container: containerRef.current!,
            props,
          },
          {
            sandbox: app.sandboxConfig.enabled
              ? {
                  strictStyleIsolation: app.sandboxConfig.strictStyleIsolation,
                  experimentalStyleIsolation: app.sandboxConfig.experimentalStyleIsolation,
                }
              : false,
            prefetch: false,
          }
        );

        await microAppRef.current.mountPromise
          .then(() => {
            console.log('[MicroAppWrapper] App mounted successfully');
            setLoading(false);
          })
          .catch((err) => {
            console.error('[MicroAppWrapper] Mount promise error:', err);
            setLoading(false);
            setError(`无法加载子应用，请确保子应用正在运行：${normalizedEntry}\n\n错误详情：${err instanceof Error ? err.message : '连接被拒绝'}`);
            message.error('子应用加载失败，请检查子应用是否已启动');
          });
      } catch (err) {
        console.error('[MicroAppWrapper] Error loading micro app:', err);
        setError(`加载应用时出错：${err instanceof Error ? err.message : '未知错误'}`);
        setLoading(false);
      }
    };

    mountMicroApp();

    return () => {
      const unmountApp = async () => {
        if (microAppRef.current) {
          try {
            await microAppRef.current.unmount();
            console.log('[MicroAppWrapper] App unmounted successfully');
          } catch (err) {
            console.error('[MicroAppWrapper] Error unmounting app:', err);
          }
        }
      };
      unmountApp();
    };
  }, [appName]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (error) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '0 24px',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/app-market')}
            style={{ padding: '4px 12px' }}
          >
            返回应用市场
          </Button>
          <Text strong style={{ fontSize: 14 }}>
            {appDisplayName || appName}
          </Text>
          <div style={{ width: 100 }} />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="error"
            title="应用加载失败"
            subTitle={error}
            extra={
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>
                  重试
                </Button>
                <Button onClick={() => navigate('/app-market')}>
                  返回应用市场
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '0 24px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app-market')}
          style={{ padding: '4px 12px' }}
        >
          返回应用市场
        </Button>
        <Text strong style={{ fontSize: 14 }}>
          {appDisplayName || appName}
        </Text>
        <div style={{ width: 100 }} />
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              zIndex: 1000,
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
              正在加载 {appDisplayName || appName}...
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          id={`micro-app-container-${appName}`}
          style={{
            height: '100%',
            width: '100%',
            minHeight: 400,
          }}
          className="micro-app-container"
        />
      </div>
    </div>
  );
};

export default MicroAppWrapper;
