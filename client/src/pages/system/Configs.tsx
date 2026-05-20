import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Card, List } from 'antd';
import { EditOutlined, CloudUploadOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Configs: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
    loadBackups();
  }, []);

  const loadConfigs = async () => {
    const res: any = await request.get('/system/configs');
    if (res.code === 0) setConfigs(res.data);
  };

  const loadBackups = async () => {
    const res: any = await request.get('/system/backups');
    if (res.code === 0) setBackups(res.data);
  };

  const handleEdit = (record: any) => {
    setEditingConfig(record);
    form.setFieldsValue({
      configKey: record.configKey,
      configValue: record.configValue,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const res: any = await request.put(`/system/configs/${editingConfig.configKey}`, values);
    if (res.code === 0) {
      message.success('更新成功');
      setModalOpen(false);
      loadConfigs();
    }
  };

  const handleBackup = async () => {
    const res: any = await request.post('/system/backup');
    if (res.code === 0) {
      message.success('备份成功');
      loadBackups();
    }
  };

  const configColumns = [
    { title: '配置键', dataIndex: 'configKey', width: 200 },
    { title: '配置值', dataIndex: 'configValue' },
    { title: '描述', dataIndex: 'description' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="系统参数配置" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>考核参数配置</h3>
        </div>
        <Table
          columns={configColumns}
          dataSource={configs}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="数据备份管理">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>数据备份</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>自动备份: <Switch defaultChecked /></span>
            <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleBackup}>立即备份</Button>
          </div>
        </div>
        <List
          dataSource={backups}
          renderItem={(item: any) => (
            <List.Item
              actions={[<Button size="small">下载</Button>]}
            >
              <List.Item.Meta
                title={item.filename}
                description={`大小: ${(item.size / 1024 / 1024).toFixed(2)} MB | 创建时间: ${new Date(item.createdAt).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="编辑配置"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="configKey" label="配置键">
            <Input disabled />
          </Form.Item>
          <Form.Item name="configValue" label="配置值" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确定</Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Configs;
