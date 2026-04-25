import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { AlertOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InfectionControlPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        院感管理
      </Title>
      <Card>
        <Result
          icon={<AlertOutlined />}
          title="院感管理模块"
          subTitle="该模块包含院感隐患排查、整改跟踪、质控闭环管理等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>隐患排查：</strong>上报医院感染隐患，包括环境、器械、操作等方面</li>
            <li><strong>风险评估：</strong>对上报的隐患进行风险评估，确定严重程度</li>
            <li><strong>整改跟踪：</strong>跟踪隐患整改过程，记录整改措施和进度</li>
            <li><strong>质控闭环：</strong>实现隐患上报-评估-整改-验证-关闭的闭环管理</li>
            <li><strong>统计分析：</strong>统计分析院感事件，识别高风险区域和趋势</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
