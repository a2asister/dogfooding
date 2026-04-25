import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function NursingPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        护理记录
      </Title>
      <Card>
        <Result
          icon={<UserOutlined />}
          title="护理记录模块"
          subTitle="该模块包含护理记录管理、生命体征记录、护理执行等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>护理记录：</strong>记录患者的护理过程、护理措施和护理效果</li>
            <li><strong>生命体征：</strong>记录患者的体温、心率、血压、呼吸、血氧等生命体征</li>
            <li><strong>护理执行：</strong>管理护理任务的执行状态和执行记录</li>
            <li><strong>护理计划：</strong>制定和管理患者的护理计划</li>
            <li><strong>交接班记录：</strong>记录护士交接班信息</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
