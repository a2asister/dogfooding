import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InpatientPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        住院管理
      </Title>
      <Card>
        <Result
          icon={<InboxOutlined />}
          title="住院管理模块"
          subTitle="该模块包含床位管理、入院登记、出院结算、住院费用管理等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>床位管理：</strong>管理病房床位信息，包括床位状态、类型、每日费用等</li>
            <li><strong>入院登记：</strong>患者入院登记，分配床位，记录入院原因</li>
            <li><strong>住院期间：</strong>管理住院期间的护理记录、医嘱执行、费用记录</li>
            <li><strong>出院结算：</strong>办理患者出院手续，结算住院费用</li>
            <li><strong>住院费用：</strong>记录和管理患者住院期间的所有费用明细</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
