import React from 'react';
import { Card, Result, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Result
          status="info"
          title="订单详情页"
          subTitle={`订单ID: ${id}`}
          extra={[
            <Button type="primary" key="list" onClick={() => navigate('/orders')}>
              返回订单列表
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default OrderDetail;
