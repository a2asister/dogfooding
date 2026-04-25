import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function PharmacyPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        药房发药
      </Title>
      <Card>
        <Result
          icon={<MedicineBoxOutlined />}
          title="药房发药模块"
          subTitle="该模块包含处方审核、处方发药、退药管理、发药记录查询等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>处方审核：</strong>审核处方合法性、合理性，确认处方信息</li>
            <li><strong>处方发药：</strong>根据处方信息配发药品，确认患者身份，打印发药单</li>
            <li><strong>退药管理：</strong>处理患者退药申请，退药验收，退药记录</li>
            <li><strong>发药查询：</strong>查询发药记录，发药统计，发药明细报表</li>
            <li><strong>药品核对：</strong>发药前药品核对，药品信息确认，用药指导</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
