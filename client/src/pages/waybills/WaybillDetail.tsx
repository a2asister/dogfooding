import React from 'react';
import { Card, Result, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const WaybillDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Result
          status="info"
          title="运单详情页"
          subTitle={`运单ID: ${id}`}
          extra={[
            <Button type="primary" key="list" onClick={() => navigate('/waybills')}>
              返回运单列表
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default WaybillDetail;
