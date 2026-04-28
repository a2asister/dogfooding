import React from 'react';
import { Card, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>个人中心</h2>
      <Card>
        <Result
          status="info"
          title="个人中心页面"
          subTitle="此页面用于管理个人信息、密码修改等"
          extra={[
            <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default Profile;
