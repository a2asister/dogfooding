import { useEffect } from 'react';
import { Card, Typography, Result } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InventoryManagement() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        库存管理
      </Title>
      <Card>
        <Result
          icon={<ShopOutlined />}
          title="库存管理模块"
          subTitle="该模块包含药品耗材采购入库、盘点、效期预警、出库管理等功能。"
        />
        <div style={{ marginTop: 24, padding: '0 48px' }}>
          <Title level={4}>功能说明</Title>
          <ul>
            <li><strong>采购入库：</strong>药品耗材采购订单管理，入库验收，入库登记</li>
            <li><strong>库存盘点：</strong>定期库存盘点，盘盈盘亏处理，盘点报表</li>
            <li><strong>效期预警：</strong>药品效期预警，近效期药品提醒，过期药品管理</li>
            <li><strong>出库管理：</strong>药房领药出库，科室领用出库，出库记录查询</li>
            <li><strong>库存查询：</strong>实时库存查询，库存台账，库存明细报表</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
