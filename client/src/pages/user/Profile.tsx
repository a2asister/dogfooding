import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Descriptions, Tag, message, Modal, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../store/useStore';
import { AuthStatus } from '../../types';

const authStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.UNVERIFIED]: { color: 'default', text: '未认证' },
  [AuthStatus.PENDING]: { color: 'orange', text: '审核中' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已认证' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

function Profile(): JSX.Element {
  const { user, setUser } = useAuthStore();
  const [form] = Form.useForm();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadProfile = async (): Promise<void> => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmitAuth = async (values: { realName: string; idCard: string }): Promise<void> => {
    try {
      await userApi.submitRealName(values);
      message.success('实名认证提交成功，等待审核');
      setShowAuthModal(false);
      loadProfile();
    } catch {
      // Error handled
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>;
  }

  return (
    <div>
      <h2 className="page-title">个人中心</h2>
      
      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <h3>{user.nickname}</h3>
            <p style={{ color: '#666' }}>{user.phone}</p>
            <Tag color="blue">{user.role === 'user' ? '普通用户' : user.role === 'merchant' ? '商家' : user.role === 'operator' ? '运营' : '管理员'}</Tag>
            
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="账户余额">¥{user.balance.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="冻结余额">¥{user.frozenBalance.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="实名认证">
                  {(() => {
                    const statusInfo = authStatusMap[user.authStatus];
                    return statusInfo ? <Tag color={statusInfo.color}>{statusInfo.text}</Tag> : null;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="真实姓名">
                  {user.realName || '未填写'}
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {user.authStatus === AuthStatus.UNVERIFIED && (
              <Button 
                type="primary" 
                block 
                style={{ marginTop: 16 }}
                onClick={() => setShowAuthModal(true)}
              >
                实名认证
              </Button>
            )}
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title="账户信息">
            <Descriptions column={2}>
              <Descriptions.Item label="昵称">{user.nickname}</Descriptions.Item>
              <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>
              <Descriptions.Item label="用户角色">
                {user.role === 'user' ? '普通用户' : user.role === 'merchant' ? '商家' : user.role === 'operator' ? '运营人员' : '超级管理员'}
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                <Tag color="green">正常</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="实名认证" style={{ marginTop: 16 }}>
            {user.authStatus === AuthStatus.UNVERIFIED ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#666', marginBottom: 16 }}>您还未进行实名认证，实名认证后可参与竞拍</p>
                <Button type="primary" onClick={() => setShowAuthModal(true)}>
                  立即认证
                </Button>
              </div>
            ) : user.authStatus === AuthStatus.PENDING ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Tag color="orange" style={{ fontSize: 16, padding: '8px 16px' }}>
                  实名认证审核中，请耐心等待
                </Tag>
              </div>
            ) : user.authStatus === AuthStatus.VERIFIED ? (
              <Descriptions column={2}>
                <Descriptions.Item label="真实姓名">{user.realName}</Descriptions.Item>
                <Descriptions.Item label="身份证号">
                  {user.idCard?.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Tag color="red" style={{ fontSize: 16, padding: '8px 16px' }}>
                  实名认证未通过，请重新提交
                </Tag>
                <Button type="primary" style={{ marginTop: 16 }} onClick={() => setShowAuthModal(true)}>
                  重新认证
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="实名认证"
        open={showAuthModal}
        onCancel={() => setShowAuthModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAuth}
        >
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[
              { required: true, message: '请输入真实姓名' },
              { min: 2, message: '姓名至少2个字符' }
            ]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            name="idCard"
            label="身份证号"
            rules={[
              { required: true, message: '请输入身份证号' },
              { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号' }
            ]}
          >
            <Input placeholder="请输入18位身份证号" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交认证
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Profile;
