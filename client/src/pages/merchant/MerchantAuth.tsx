import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Descriptions, Tag, message } from 'antd';
import { merchantApi } from '../../services/api';
import { AuthStatus } from '../../types';

const authStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.UNVERIFIED]: { color: 'default', text: '未认证' },
  [AuthStatus.PENDING]: { color: 'orange', text: '审核中' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已通过' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

function MerchantAuth(): JSX.Element {
  const [form] = Form.useForm();
  const [merchantInfo, setMerchantInfo] = useState<{
    companyName: string;
    businessLicense: string;
    contactName: string;
    contactPhone: string;
    authStatus: string;
  } | null>(null);

  const loadStatus = async (): Promise<void> => {
    try {
      const res = await merchantApi.getAuthStatus();
      setMerchantInfo(res);
    } catch {
      setMerchantInfo(null);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubmit = async (values: {
    companyName: string;
    businessLicense: string;
    contactName: string;
    contactPhone: string;
  }): Promise<void> => {
    try {
      await merchantApi.submitAuth(values);
      message.success('资质认证提交成功，等待审核');
      loadStatus();
    } catch {
      // Error handled
    }
  };

  return (
    <div>
      <h2 className="page-title">商家资质认证</h2>
      
      {merchantInfo ? (
        <Card>
          <Descriptions title="认证信息" column={1}>
            <Descriptions.Item label="公司名称">{merchantInfo.companyName}</Descriptions.Item>
            <Descriptions.Item label="营业执照号">{merchantInfo.businessLicense}</Descriptions.Item>
            <Descriptions.Item label="联系人">{merchantInfo.contactName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{merchantInfo.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="审核状态">
              {(() => {
                const statusInfo = authStatusMap[merchantInfo.authStatus];
                return statusInfo ? (
                  <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                ) : null;
              })()}
            </Descriptions.Item>
          </Descriptions>
          
          {merchantInfo.authStatus === AuthStatus.REJECTED && (
            <Button type="primary" style={{ marginTop: 16 }} onClick={() => setMerchantInfo(null)}>
              重新提交
            </Button>
          )}
          
          {merchantInfo.authStatus === AuthStatus.PENDING && (
            <p style={{ color: '#faad14', marginTop: 16 }}>您的认证信息正在审核中，请耐心等待...</p>
          )}
        </Card>
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="companyName"
              label="公司名称"
              rules={[
                { required: true, message: '请输入公司名称' },
                { min: 2, message: '公司名称至少2个字符' }
              ]}
            >
              <Input placeholder="请输入公司全称" />
            </Form.Item>
            
            <Form.Item
              name="businessLicense"
              label="营业执照号"
              rules={[
                { required: true, message: '请输入营业执照号' },
                { min: 5, message: '请输入有效的营业执照号' }
              ]}
            >
              <Input placeholder="请输入营业执照注册号" />
            </Form.Item>
            
            <Form.Item
              name="contactName"
              label="联系人姓名"
              rules={[
                { required: true, message: '请输入联系人姓名' },
                { min: 2, message: '姓名至少2个字符' }
              ]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
            
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input placeholder="请输入联系手机号" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                提交认证
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}

export default MerchantAuth;
