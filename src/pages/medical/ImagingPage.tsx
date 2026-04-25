import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, FileImageOutlined } from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { ImagingOrder } from '../../types';

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

export default function ImagingPage() {
  const { imagingOrders, loadAll: loadCommon, addImagingOrder, updateImagingOrder } = useCommonStore();
  const { patients, medicalRecords, loadAll: loadPatient } = usePatientStore();
  const { doctors, loadAll: loadHospital } = useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);
  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();

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

  const handleView = (record: ImagingOrder) => {
    setSelectedOrder(record);
    setViewModalVisible(true);
  };

  const handleInputReport = (record: ImagingOrder) => {
    setSelectedOrder(record);
    reportForm.setFieldsValue({ report: record.report });
    setReportModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addImagingOrder({
        ...values,
        status: 'pending',
      });
      message.success('检查申请创建成功');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const handleSubmitReport = () => {
    if (!selectedOrder) return;
    reportForm.validateFields().then((values) => {
      updateImagingOrder(selectedOrder.id, {
        status: 'completed',
        report: values.report,
        reportDate: new Date().toISOString().split('T')[0],
      });
      message.success('检查报告已录入');
      setReportModalVisible(false);
    });
  };

  const handleStatusChange = (id: string, status: ImagingOrder['status']) => {
    const updated = updateImagingOrder(id, { status });
    if (updated) {
      message.success('状态已更新');
    }
  };

  const columns: ColumnsType<ImagingOrder> = [
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
      title: '检查类型',
      dataIndex: 'imagingType',
      key: 'imagingType',
      render: (type) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: '检查部位',
      dataIndex: 'bodyPart',
      key: 'bodyPart',
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
              开始检查
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" onClick={() => handleInputReport(record)}>
              录入报告
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
          检查管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增检查申请
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={imagingOrders}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条检查记录`,
          }}
        />
      </Card>

      {/* 新增检查申请模态框 */}
      <Modal
        title="新增检查申请"
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
            name="imagingType"
            label="检查类型"
            rules={[{ required: true, message: '请选择检查类型' }]}
          >
            <Select placeholder="请选择检查类型">
              <Select.Option value="X光">X光检查</Select.Option>
              <Select.Option value="CT">CT检查</Select.Option>
              <Select.Option value="MRI">MRI检查</Select.Option>
              <Select.Option value="超声">超声检查</Select.Option>
              <Select.Option value="心电图">心电图</Select.Option>
              <Select.Option value="胃镜">胃镜检查</Select.Option>
              <Select.Option value="肠镜">肠镜检查</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="bodyPart"
            label="检查部位"
            rules={[{ required: true, message: '请输入检查部位' }]}
          >
            <Input placeholder="请输入检查部位" />
          </Form.Item>
          <Form.Item name="description" label="检查说明">
            <Input.TextArea placeholder="请输入检查说明" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看检查详情模态框 */}
      <Modal
        title="检查详情"
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
              <Typography.Text strong>检查类型：</Typography.Text>
              <Tag color="purple">{selectedOrder.imagingType}</Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>检查部位：</Typography.Text>
              {selectedOrder.bodyPart}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>状态：</Typography.Text>
              <Tag color={statusColors[selectedOrder.status]}>
                {statusLabels[selectedOrder.status]}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>检查说明：</Typography.Text>
              {selectedOrder.description || '无'}
            </div>
            {selectedOrder.report && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>检查报告：</Typography.Text>
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedOrder.report}
                </div>
              </div>
            )}
            {selectedOrder.reportDate && (
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>报告日期：</Typography.Text>
                {selectedOrder.reportDate}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>申请时间：</Typography.Text>
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* 录入报告模态框 */}
      <Modal
        title="录入检查报告"
        open={reportModalVisible}
        onOk={handleSubmitReport}
        onCancel={() => setReportModalVisible(false)}
        okText="确认提交"
        cancelText="取消"
      >
        <Form form={reportForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="report"
            label="检查报告"
            rules={[{ required: true, message: '请输入检查报告' }]}
          >
            <Input.TextArea placeholder="请输入检查报告详情" rows={8} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
