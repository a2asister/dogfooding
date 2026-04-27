import { useMemo } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import type { PermissionLevel, OperationLog } from '@/types';
import styles from './PermissionControl.module.css';

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  view: '大屏查看',
  operate: '设备操控',
  config: '参数配置',
  admin: '管理员',
};

const PERMISSION_COLORS: Record<PermissionLevel, string> = {
  view: '#6b7280',
  operate: '#3b82f6',
  config: '#f59e0b',
  admin: '#ef4444',
};

function UserCard({
  user,
  currentUser,
  onSwitch,
}: {
  user: { id: string; username: string; name: string; permissions: PermissionLevel[] };
  currentUser: { id: string } | null;
  onSwitch: () => void;
}) {
  const isActive = currentUser?.id === user.id;

  return (
    <div className={`${styles.userCard} ${isActive ? styles.active : ''}`}>
      <div className={styles.userHeader}>
        <span className={styles.userName}>{user.name}</span>
        <span className={styles.userRole}>
          {user.permissions.includes('admin')
            ? '管理员'
            : user.permissions.includes('config')
              ? '配置员'
              : user.permissions.includes('operate')
                ? '操作员'
                : '观察员'}
        </span>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.username}>@{user.username}</span>
      </div>
      <div className={styles.permissions}>
        {user.permissions.map((perm) => (
          <span
            key={perm}
            className={styles.permBadge}
            style={{ backgroundColor: PERMISSION_COLORS[perm] }}
          >
            {PERMISSION_LABELS[perm]}
          </span>
        ))}
      </div>
      {!isActive && (
        <button className={styles.switchButton} onClick={onSwitch}>
          切换到此账号
        </button>
      )}
      {isActive && <span className={styles.currentBadge}>当前账号</span>}
    </div>
  );
}

function OperationLogItem({ log }: { log: OperationLog }) {
  return (
    <div className={styles.logItem}>
      <div className={styles.logHeader}>
        <span className={styles.logUser}>{log.username}</span>
        <span className={styles.logTime}>
          {new Date(log.timestamp).toLocaleString('zh-CN')}
        </span>
      </div>
      <div className={styles.logContent}>
        <span className={styles.logAction}>{log.action}</span>
        <span className={styles.logTarget}>{log.target}</span>
      </div>
      {log.details && <p className={styles.logDetails}>{log.details}</p>}
    </div>
  );
}

export function PermissionControl() {
  const users = useTrafficStore((state) => state.users);
  const operationLogs = useTrafficStore((state) => state.operationLogs);
  const currentUser = useTrafficStore((state) => state.currentUser);
  const login = useTrafficStore((state) => state.login);
  const logout = useTrafficStore((state) => state.logout);

  const recentLogs = useMemo(() => operationLogs.slice(0, 20), [operationLogs]);

  const canManageUsers = currentUser?.permissions.includes('admin');

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>权限管控</h2>

      <div className={styles.content}>
        <div className={styles.usersSection}>
          <h3 className={styles.sectionTitle}>用户列表</h3>
          <div className={styles.usersList}>
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUser={currentUser}
                onSwitch={() => login(user.username)}
              />
            ))}
          </div>
        </div>

        <div className={styles.logsSection}>
          <div className={styles.logsHeader}>
            <h3 className={styles.sectionTitle}>操作日志</h3>
            {currentUser && (
              <button className={styles.logoutButton} onClick={logout}>
                退出登录
              </button>
            )}
          </div>
          <div className={styles.currentUserInfo}>
            当前用户: <strong>{currentUser?.name || '未登录'}</strong>
            {currentUser?.permissions && (
              <span className={styles.currentPerms}>
                {currentUser.permissions.map((p) => PERMISSION_LABELS[p]).join(', ')}
              </span>
            )}
          </div>
          <div className={styles.logsList}>
            {recentLogs.length === 0 ? (
              <p className={styles.emptyLogs}>暂无操作记录</p>
            ) : (
              recentLogs.map((log) => (
                <OperationLogItem key={log.id} log={log} />
              ))
            )}
          </div>
        </div>
      </div>

      {canManageUsers && (
        <div className={styles.adminNotice}>
          您拥有管理员权限，可以管理所有用户和系统配置。
        </div>
      )}
    </div>
  );
}