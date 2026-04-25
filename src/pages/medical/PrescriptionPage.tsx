import { useEffect } from 'react';
import { Card, Typography, Alert, Table, Tag, Space, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Prescription, PrescriptionItem } from '../../types';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'blue',
  dispensed: 'green',
  completed: 'default',
};

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已审核',
  dispensed: '已发药',
  completed: '已完成',
};

export default function PrescriptionPage() {
  const { prescriptions, prescriptionItems, patients, medicalRecords, loadAll: loadPatient, addPrescription, updatePrescriptionStatus } =
    usePatientStore();
  const { doctors, medications, loadAll: loadHospital } = useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [form] = Form.useForm();
  const [prescriptionItemsForm, setPrescriptionItemsForm] = useState<
    Array<{ medicationId: string; dosage: string; frequency: string; duration: string; quantity: number; price: number }>
  >([]);

  useEffect(() => {
    loadPatient();
    loadHospital();
  }, [loadPatient, loadHospital]);

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

  const getMedicationName = (medicationId: string) => {
    const med = medications.find((m) => m.id === medicationId);
    return med?.name || '-';
  };

  const getPrescriptionItems = (prescriptionId: string) => {
    return prescriptionItems.filter((item) => item.prescriptionId === prescriptionId);
  };

  const handleAdd = () => {
    setSelectedPrescription(null);
    setPrescriptionItemsForm([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleView = (record: Prescription) => {
    setSelectedPrescription(record);
    setViewModalVisible(true);
  };

  const handleStatusChange = (id: string, status: Prescription['status']) => {
    const updated = updatePrescriptionStatus(id, status);
    if (updated) {
      message.success('处方状态已更新');
    }
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (prescriptionItemsForm.length === 0) {
        message.error('请至少添加一种药品');
        return;
      }

      const totalAmount = prescriptionItemsForm.reduce((sum, item) => sum + item.price * item.quantity, 0);

      addPrescription(
        {
          ...values,
          totalAmount,
          status: 'pending',
        },
        prescriptionItemsForm.map((item) => ({
          ...item,
        }))
      );

      message.success('处方创建成功');
      setModalVisible(false);
      setPrescriptionItemsForm([]);
      form.resetFields();
    });
  };

  const addPrescriptionItem = () => {
    setPrescriptionItemsForm([
      ...prescriptionItemsForm,
      { medicationId: '', dosage: '', frequency: '', duration: '', quantity: 1, price: 0 },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    const newItems = [...prescriptionItemsForm];
    newItems.splice(index, 1);
    setPrescriptionItemsForm(newItems);
  };

  const updatePrescriptionItem = (index: number, field: string, value: any) => {
    const newItems = [...prescriptionItemsForm];
    (newItems[index] as any)[field] = value;
    if (field === 'medicationId') {
      const med = medications.find((m) => m.id === value);
      if (med) {
        newItems[index].price = med.price;
      }
    }
    setPrescriptionItemsForm(newItems);
  };

  const columns: ColumnsType<Prescription> = [
    {
      title: '患者姓名',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (patientId) => getPatientName(patientId),
    },
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctorId) => getDoctorName(doctorId),
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span style={{ color: '#fa8c16' }}>¥{amount.toFixed(2)}</span>,
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
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleStatusChange(record.id, 'approved')}>
              审核
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" onClick={() => handleStatusChange(record.id, 'dispensed')}>
              发药
            </Button>
          )}
          {record.status === 'dispensed' && (
            <Button type="link" onClick={() => handleStatusChange(record.id, 'completed')}>
              完成
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
          处方管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建处方
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 张处方`,
          }}
        />
      </Card>

      {/* 新建处方模态框 */}
      <Modal
        title="新建处方"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={800}
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
            label="医生"
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
        </Form>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Typography.Text strong>药品列表</Typography.Text>
            <Button type="primary" size="small" onClick={addPrescriptionItem}>
              添加药品
            </Button>
          </div>
          {prescriptionItemsForm.length === 0 ? (
            <Alert message="暂无药品，请点击上方按钮添加" type="info" />
          ) : (
            prescriptionItemsForm.map((item, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: 8 }}
                extra={
                  <Button type="link" danger size="small" onClick={() => removePrescriptionItem(index)}>
                    删除
                  </Button>
                }
              >
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Select
                    style={{ width: 180 }}
                    placeholder="选择药品"
                    value={item.medicationId || undefined}
                    onChange={(value) => updatePrescriptionItem(index, 'medicationId', value)}
                  >
                    {medications.map((med) => (
                      <Select.Option key={med.id} value={med.id}>
                        {med.name} - ¥{med.price}
                      </Select.Option>
                    ))}
                  </Select>
                  <Input
                    style={{ width: 100 }}
                    placeholder="剂量"
                    value={item.dosage}
                    onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                  />
                  <Input
                    style={{ width: 100 }}
                    placeholder="频次"
                    value={item.frequency}
                    onChange={(e) => updatePrescriptionItem(index, 'frequency', e.target.value)}
                  />
                  <Input
                    style={{ width: 100 }}
                    placeholder="疗程"
                    value={item.duration}
                    onChange={(e) => updatePrescriptionItem(index, 'duration', e.target.value)}
                  />
                  <InputNumber
                    style={{ width: 80 }}
                    placeholder="数量"
                    min={1}
                    value={item.quantity}
                    onChange={(value) => updatePrescriptionItem(index, 'quantity', value || 1)}
                  />
                  <Input
                    style={{ width: 80 }}
                    placeholder="单价"
                    prefix="¥"
                    value={item.price}
                    disabled
                  />
                </div>
              </Card>
            ))
          )}
        </div>

        {prescriptionItemsForm.length > 0 && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Typography.Text strong style={{ fontSize: 16 }}>
              合计金额：¥
              {prescriptionItemsForm.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </Typography.Text>
          </div>
        )}
      </Modal>

      {/* 查看处方模态框 */}
      <Modal
        title="处方详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedPrescription && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>患者：</Typography.Text>
              {getPatientName(selectedPrescription.patientId)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>医生：</Typography.Text>
              {getDoctorName(selectedPrescription.doctorId)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>状态：</Typography.Text>
              <Tag color={statusColors[selectedPrescription.status]}>
                {statusLabels[selectedPrescription.status]}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>总金额：</Typography.Text>
              <span style={{ color: '#fa8c16', fontSize: 18 }}>
                ¥{selectedPrescription.totalAmount.toFixed(2)}
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Typography.Text strong>创建时间：</Typography.Text>
              {new Date(selectedPrescription.createdAt).toLocaleString()}
            </div>

            <Typography.Title level={5}>药品列表</Typography.Title>
            <Table
              dataSource={getPrescriptionItems(selectedPrescription.id)}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '药品名称', dataIndex: 'medicationId', key: 'medicationId', render: (id) => getMedicationName(id) },
                { title: '剂量', dataIndex: 'dosage', key: 'dosage' },
                { title: '频次', dataIndex: 'frequency', key: 'frequency' },
                { title: '疗程', dataIndex: 'duration', key: 'duration' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单价', dataIndex: 'price', key: 'price', render: (price) => `¥${price}` },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
