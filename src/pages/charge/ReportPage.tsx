import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ReportPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        报表统计
      </Title>
      <Card>
        <Result
          icon={<BarChartOutlined />}
          title="报表统计模块"
          subTitle="该模块包含运营数据可视化大屏、统计报表、自动上报等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>数据可视化大屏：</strong>实时展示医院运营数据，包括门诊量、住院量、营收数据等</li>
            <li><strong>统计报表：</strong>生成各类统计报表，包括日报、周报、月报、年报</li>
            <li><strong>营收统计：</strong>门诊收入、住院收入、药品收入、检查检验收入统计分析</li>
            <li><strong>工作量统计：</strong>医生工作量统计、科室工作量统计、设备使用率统计</li>
            <li><strong>自动上报：</strong>自动生成上报报表，支持导出Excel/PDF格式</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
