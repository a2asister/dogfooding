import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Calendar, Badge } from 'antd';
import {
  TeamOutlined,
  MoneyCollectOutlined,
  ProjectOutlined,
  FileTextOutlined,
  RiseOutlined,
  CalendarOutlined,
  CarOutlined,
} from '@ant-design/icons';

const Dashboard = () => {
  const mockStats = [
    { title: '员工总数', value: 256, icon: <TeamOutlined />, color: '#1890ff' },
    { title: '本月收入', value: '¥1,250,000', icon: <MoneyCollectOutlined />, color: '#52c41a' },
    { title: '进行中项目', value: 12, icon: <ProjectOutlined />, color: '#faad14' },
    { title: '待审批合同', value: 8, icon: <FileTextOutlined />, color: '#ff4d4f' },
  ];

  const recentProjects = [
    { key: '1', name: '数字化转型项目', progress: 65, status: '进行中', manager: '张三' },
    { key: '2', name: '新系统开发', progress: 40, status: '进行中', manager: '李四' },
    { key: '3', name: '市场推广', progress: 90, status: '即将完成', manager: '王五' },
    { key: '4', name: '员工培训', progress: 20, status: '进行中', manager: '赵六' },
  ];

  const columns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" status={progress >= 80 ? 'success' : 'active'} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '即将完成' ? 'green' : 'blue'}>{status}</Tag>
      ),
    },
    { title: '负责人', dataIndex: 'manager', key: 'manager' },
  ];

  const pendingApprovals = [
    { key: '1', type: '报销申请', applicant: '张三', amount: '¥3,500', time: '2024-01-15' },
    { key: '2', type: '采购申请', applicant: '李四', amount: '¥12,000', time: '2024-01-14' },
    { key: '3', type: '用车申请', applicant: '王五', amount: '-', time: '2024-01-14' },
  ];

  const approvalColumns = [
    { title: '申请类型', dataIndex: 'type', key: 'type' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '金额', dataIndex: 'amount', key: 'amount' },
    { title: '申请时间', dataIndex: 'time', key: 'time' },
  ];

  const dateCellRender = (value) => {
    const date = value.date();
    if (date === 10) {
      return (
        <ul className="events">
          <li><Badge status="error" text="项目评审会" /></li>
        </ul>
      );
    }
    if (date === 15) {
      return (
        <ul className="events">
          <li><Badge status="success" text="发薪日" /></li>
        </ul>
      );
    }
    if (date === 20) {
      return (
        <ul className="events">
          <li><Badge status="warning" text="季度总结" /></li>
        </ul>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>工作台</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {mockStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="项目进度" extra={<a href="/project">查看全部</a>}>
            <Table
              columns={columns}
              dataSource={recentProjects}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="待我审批" extra={<a href="#">查看全部</a>}>
            <Table
              columns={approvalColumns}
              dataSource={pendingApprovals}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="快捷入口">
            <Row gutter={[16, 16]}>
              {[
                { icon: <TeamOutlined />, title: '请假申请', color: '#1890ff' },
                { icon: <MoneyCollectOutlined />, title: '费用报销', color: '#52c41a' },
                { icon: <CarOutlined />, title: '用车申请', color: '#faad14' },
                { icon: <CalendarOutlined />, title: '会议室预约', color: '#722ed1' },
                { icon: <RiseOutlined />, title: '采购申请', color: '#eb2f96' },
                { icon: <FileTextOutlined />, title: '合同审批', color: '#13c2c2' },
              ].map((item, index) => (
                <Col span={8} key={index}>
                  <div style={{
                    textAlign: 'center',
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: `${item.color}10`,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${item.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${item.color}10`;
                  }}>
                    <div style={{ fontSize: 28, color: item.color, marginBottom: 8 }}>
                      {item.icon}
                    </div>
                    <div style={{ color: '#333', fontSize: 14 }}>{item.title}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="本月日程">
            <Calendar
              fullscreen={false}
              cellRender={dateCellRender}
              headerRender={({ value, type, onChange, onTypeChange }) => null}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
