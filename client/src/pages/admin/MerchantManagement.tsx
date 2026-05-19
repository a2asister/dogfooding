import { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { AuthStatus } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const authStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已通过' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

function MerchantManagement(): JSX.Element {
  const [merchants, setMerchants] = useState<Array<{ id: number; userId: number; companyName: string; businessLicense: string; contactName: string; contactPhone: string; authStatus: string; createdAt: string; phone: string; nickname: string }>>([]);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [currentMerchant, setCurrentMerchant] = useState<{ id: number; companyName: string } | null>(null);
  const [form] = Form.useForm();

  const loadMerchants = async (): Promise<void> => {
    try {
      const res = await adminApi.getMerchants() as unknown as { merchants: Array<{ id: number; userId: number; companyName: string; businessLicense: string; contactName: string; contactPhone: string; authStatus: string; createdAt: string; phone: string; nickname: string }>; total: number };
      setMerchants(res.merchants);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleAudit = (merchant: { id: number; companyName: string }): void => {
    setCurrentMerchant(merchant);
    setAuthModalVisible(true);
  };

  const handleSubmitAudit = async (values: { status: string; reason?: string }): Promise<void> => {
    if (!currentMerchant) return;
    
    try {
      await adminApi.auditMerchant(currentMerchant.id, values.status, values.reason);
      message.success('审核完成');
      setAuthModalVisible(false);
      form.resetFields();
      loadMerchants();
    } catch {
      // Error handled
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '公司名称',
      dataIndex: 'companyName',
      key: 'companyName'
    },
    {
      title: '营业执照',
      dataIndex: 'businessLicense',
      key: 'businessLicense'
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName'
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone'
    },
    {
      title: '关联用户',
      key: 'user',
      render: (_: unknown, record: { phone: string; nickname: string }) => (
        <div>
          <div>{record.nickname}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: '审核状态',
      dataIndex: 'authStatus',
      key: 'authStatus',
      render: (status: string) => {
        const info = authStatusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: { id: number; companyName: string; authStatus: string }) => (
        record.authStatus === AuthStatus.PENDING && (
          <Button type="link" size="small" onClick={() => handleAudit(record)}>
            审核
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <h2 className="page-title">商家管理</h2>
      
      <Table
        dataSource={merchants}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`审核商家 - ${currentMerchant?.companyName}`}
        open={authModalVisible}
        onCancel={() => setAuthModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAudit}>
          <Form.Item
            name="status"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择">
              <Option value={AuthStatus.VERIFIED}>通过</Option>
              <Option value={AuthStatus.REJECTED}>拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="拒绝原因"
            extra="拒绝时必填"
          >
            <TextArea rows={3} placeholder="请输入拒绝原因" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交审核
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MerchantManagement;
