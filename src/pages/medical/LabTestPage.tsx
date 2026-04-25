import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { LabTestOrder } from '../../types';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  pending: 'orange',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'default',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

export default function LabTestPage() {
  const { labTestOrders, loadAll: loadCommon, addLabTestOrder, updateLabTestOrder } = useCommonStore();
  const { patients, medicalRecords, loadAll: loadPatient } = usePatientStore();
  const { doctors, loadAll: loadHospital } = useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabTestOrder | null>(null);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();

  useEffect(() => {
    loadCommon();
    loadPatient();
    loadHospital();
  }, [loadCommon, loadPatient, loadHospital]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || '-';
  };

  const getDoctorName = (doctorId: string) => {
    const doc = doctors.find((d) => d.id === doctorId);
    const user = useHospitalStore
      .getState()
      .medicalStaff.find((u) => u.id === doc?.userId);
    return user?.name || '-';
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleView = (record: LabTestOrder) => {
    setSelectedOrder(record);
    setViewModalVisible(true);
  };

  const handleInputResult = (record: LabTestOrder) => {
    setSelectedOrder(record);
    resultForm.setFieldsValue({ result: record.result });
    setResultModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addLabTestOrder({
        ...values,
        status: 'pending',
      });
      message.success('检验申请创建成功');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const handleSubmitResult = () => {
    if (!selectedOrder) return;
    resultForm.validateFields().then((values) => {
      updateLabTestOrder(selectedOrder.id, {
        status: 'completed',
        result: values.result,
        resultDate: new Date().toISOString().split('T')[0],
      });
      message.success('检验结果已录入');
      setResultModalVisible(false);
    });
  };

  const handleStatusChange = (id: string, status: LabTestOrder['status']) => {
    const updated = updateLabTestOrder(id, { status });
    if (updated) {
      message.success('状态已更新');
    }
  };

  const columns: ColumnsType<LabTestOrder> = [
    {
      title: '患者姓名',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (patientId) => getPatientName(patientId),
    },
    {
      title: '申请医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctorId) => getDoctorName(doctorId),
    },
    {
      title: '检验类型',
      dataIndex: 'testType',
      key: 'testType',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '检验名称',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleStatusChange(record.id, 'in_progress')}>
              开始检验
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" onClick={() => handleInputResult(record)}>
              录入结果
            </Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" danger onClick={() => handleStatusChange(record.id, 'cancelled')}>
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          检验管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增检验申请
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={labTestOrders}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条检验记录`,
          }}
        />
      </Card>

      {/* 新增检验申请模态框 */}
      <Modal
        title="新增检验申请"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="medicalRecordId"
            label="关联病历（可选）"
          >
            <Select placeholder="请选择关联的病历" allowClear>
              {medicalRecords.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {getPatientName(r.patientId)} - {r.chiefComplaint}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="patientId"
            label="选择患者"
            rules={[{ required: true, message: '请选择患者' }]}
          >
            <Select placeholder="请选择患者">
              {patients.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} - {p.phone}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="doctorId"
            label="申请医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生">
              {doctors.map((doc) => {
                const user = useHospitalStore
                  .getState()
                  .medicalStaff.find((u) => u.id === doc.userId);
                return (
                  <Select.Option key={doc.id} value={doc.id}>
                    {user?.name} - {doc.title}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="testType"
            label="检验类型"
            rules={[{ required: true, message: '请输入检验类型' }]}
          >
            <Select placeholder="请选择检验类型">
              <Select.Option value="血液检验">血液检验</Select.Option>
              <Select.Option value="尿液检验">尿液检验</Select.Option>
              <Select.Option value="粪便检验">粪便检验</Select.Option>
              <Select.Option value="生化检验">生化检验</Select.Option>
              <Select.Option value="免疫检验">免疫检验</Select.Option>
              <Select.Option value="微生物检验">微生物检验</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="testName"
            label="检验项目名称"
            rules={[{ required: true, message: '请输入检验项目名称' }]}
          >
            <Input placeholder="请输入检验项目名称" />
          </Form.Item>
          <Form.Item name="description" label="检验说明">
            <Input.TextArea placeholder="请输入检验说明" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看检验详情模态框 */}
      <Modal
        title="检验详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>患者：</Typography.Text>
              {getPatientName(selectedOrder.patientId)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>申请医生：</Typography.Text>
              {getDoctorName(selectedOrder.doctorId)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>检验类型：</Typography.Text>
              <Tag color="blue">{selectedOrder.testType}</Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>检验项目：</Typography.Text>
              {selectedOrder.testName}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>状态：</Typography.Text>
              <Tag color={statusColors[selectedOrder.status]}>
                {statusLabels[selectedOrder.status]}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>检验说明：</Typography.Text>
              {selectedOrder.description || '无'}
            </div>
            {selectedOrder.result && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>检验结果：</Typography.Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedOrder.result}
                </div>
              </div>
            )}
            {selectedOrder.resultDate && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>结果日期：</Typography.Text>
                {selectedOrder.resultDate}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>申请时间：</Typography.Text>
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* 录入结果模态框 */}
      <Modal
        title="录入检验结果"
        open={resultModalVisible}
        onOk={handleSubmitResult}
        onCancel={() => setResultModalVisible(false)}
        okText="确认提交"
        cancelText="取消"
      >
        <Form form={resultForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="result"
            label="检验结果"
            rules={[{ required: true, message: '请输入检验结果' }]}
          >
            <Input.TextArea placeholder="请输入检验结果详情" rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
