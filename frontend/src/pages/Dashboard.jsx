import { createSignal, createEffect, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { api } from '../api.js';
import PieChart from '../components/PieChart.jsx';
import BarChart from '../components/BarChart.jsx';

const Dashboard = () => {
  const [data, setData] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  let interval = null;

  const loadData = async () => {
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    loadData();
    interval = setInterval(loadData, 5000);
    onCleanup(() => {
      if (interval) clearInterval(interval);
    });
  });

  const getActivityColors = (index) => {
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(67, 233, 123, 0.8)',
      'rgba(245, 87, 108, 0.8)',
      'rgba(79, 172, 254, 0.8)',
      'rgba(240, 147, 251, 0.8)',
      'rgba(255, 154, 158, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(76, 161, 175, 0.8)'
    ];
    return colors[index % colors.length];
  };

  const activityNames = () => data()?.activityStats?.map(a => a.name.slice(0, 8)) || [];
  const activityRegistrations = () => data()?.activityStats?.map(a => a.current_participants) || [];
  const activityCheckins = () => data()?.activityStats?.map(a => a.checkins || 0) || [];

  return (
    <div>
      <div class="page-header">
        <h1 class="page-title">统一看板</h1>
        <A href="/activities" class="btn btn-primary">
          → 活动管理
        </A>
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-icon primary">📊</div>
          <div class="card-title">总活动数</div>
          <div class="card-value">{loading() ? '-' : data()?.totalActivities || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon secondary">✅</div>
          <div class="card-title">进行中</div>
          <div class="card-value">{loading() ? '-' : data()?.activeActivities || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon warning">👥</div>
          <div class="card-title">总报名数</div>
          <div class="card-value">{loading() ? '-' : data()?.totalRegistrations || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon danger">✓</div>
          <div class="card-title">总签到数</div>
          <div class="card-value">{loading() ? '-' : data()?.totalCheckins || 0}</div>
        </div>
      </div>

      <div class="charts-grid" style={{ marginTop: '24px' }}>
        <div class="chart-card">
          <PieChart
            data={[
              data()?.activeActivities || 0,
              (data()?.totalActivities || 0) - (data()?.activeActivities || 0)
            ]}
            labels={['进行中', '已结束/草稿']}
            colors={['#43e97b', '#e0e0e0']}
            title="活动状态分布"
          />
        </div>

        <div class="chart-card">
          <PieChart
            data={[
              data()?.totalCheckins || 0,
              (data()?.totalRegistrations || 0) - (data()?.totalCheckins || 0)
            ]}
            labels={['已签到', '未签到']}
            colors={['#667eea', '#f093fb']}
            title="签到转化率"
          />
        </div>
      </div>

      {data()?.activityStats?.length > 0 && (
        <div class="charts-grid" style={{ marginTop: '24px' }}>
          <div class="chart-card">
            <BarChart
              data={activityRegistrations()}
              labels={activityNames()}
              colors={data()?.activityStats?.map((_, i) => getActivityColors(i))}
              title="各活动报名人数对比"
              horizontal={true}
            />
          </div>

          <div class="chart-card">
            <BarChart
              data={activityCheckins()}
              labels={activityNames()}
              colors={data()?.activityStats?.map((_, i) => getActivityColors(i + 2))}
              title="各活动签到人数对比"
              horizontal={true}
            />
          </div>
        </div>
      )}

      <div class="card" style={{ marginTop: '24px' }}>
        <h3 class="card-title" style={{ marginBottom: '16px' }}>活动列表</h3>
        <div class="tables-container">
          <table>
            <thead>
              <tr>
                <th>活动名称</th>
                <th>状态</th>
                <th>报名进度</th>
                <th>签到数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading() ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td>
                </tr>
              ) : data()?.activityStats?.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div class="empty-state">
                      <div class="empty-icon">📭</div>
                      <div class="empty-text">暂无活动数据</div>
                      <A href="/activities" class="btn btn-primary" style={{ marginTop: '12px' }}>
                        创建活动
                      </A>
                    </div>
                  </td>
                </tr>
              ) : (
                data()?.activityStats?.map((activity) => {
                  const progress = activity.max_participants > 0 
                    ? (activity.current_participants / activity.max_participants * 100) 
                    : 0;
                  return (
                    <tr>
                      <td>{activity.name}</td>
                      <td>
                        <span class={`status-badge status-${activity.status}`}>
                          {activity.status === 'active' ? '进行中' : 
                           activity.status === 'completed' ? '已结束' : '草稿'}
                        </span>
                      </td>
                      <td style={{ width: '300px' }}>
                        <div class="progress-container">
                          <div class="progress-bar">
                            <div class="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                          <div class="progress-text">
                            <span>{activity.current_participants} 人</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                        </div>
                      </td>
                      <td>{activity.checkins || 0}</td>
                      <td>
                        <A href={`/activities/${activity.id}`} class="btn btn-sm btn-outline">
                          详情
                        </A>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
