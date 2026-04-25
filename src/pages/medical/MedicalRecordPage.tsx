import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { MedicalRecord } from '../../types';

const { Title } = Typography;

export default function MedicalRecordPage() {
  const { medicalRecords, patients, loadAll: loadPatient, addMedicalRecord, updateMedicalRecord } =
    usePatientStore();
  const { doctors, loadAll: loadHospital } = useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [form] = Form.useForm();

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

  const handleAdd = () => {
    setSelectedRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (selectedRecord) {
        const updated = updateMedicalRecord(selectedRecord.id, values);
        if (updated) {
          message.success('病历更新成功');
          setModalVisible(false);
        }
      } else {
        addMedicalRecord(values);
        message.success('病历创建成功');
        setModalVisible(false);
      }
    });
  };

  const columns: ColumnsType<MedicalRecord> = [
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
      title: '主诉',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint',
      ellipsis: true,
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
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
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
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
          电子病历管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建病历
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={medicalRecords}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 份病历`,
          }}
        />
      </Card>

      {/* 新建/编辑病历模态框 */}
      <Modal
        title={selectedRecord ? '编辑病历' : '新建病历'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={800}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
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
          <Form.Item
            name="chiefComplaint"
            label="主诉"
            rules={[{ required: true, message: '请输入主诉' }]}
          >
            <Input.TextArea placeholder="请输入主诉" rows={2} />
          </Form.Item>
          <Form.Item
            name="presentIllness"
            label="现病史"
            rules={[{ required: true, message: '请输入现病史' }]}
          >
            <Input.TextArea placeholder="请输入现病史" rows={2} />
          </Form.Item>
          <Form.Item name="pastHistory" label="既往史">
            <Input.TextArea placeholder="请输入既往史" rows={2} />
          </Form.Item>
          <Form.Item
            name="physicalExamination"
            label="体格检查"
            rules={[{ required: true, message: '请输入体格检查' }]}
          >
            <Input.TextArea placeholder="请输入体格检查" rows={2} />
          </Form.Item>
          <Form.Item
            name="diagnosis"
            label="诊断"
            rules={[{ required: true, message: '请输入诊断' }]}
          >
            <Input.TextArea placeholder="请输入诊断" rows={2} />
          </Form.Item>
          <Form.Item
            name="treatmentPlan"
            label="治疗方案"
            rules={[{ required: true, message: '请输入治疗方案' }]}
          >
            <Input.TextArea placeholder="请输入治疗方案" rows={2} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看病历模态框 */}
      <Modal
        title="病历详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>患者：</Typography.Text>
              {getPatientName(selectedRecord.patientId)}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>医生：</Typography.Text>
              {getDoctorName(selectedRecord.doctorId)}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>主诉：</Typography.Text>
              {selectedRecord.chiefComplaint}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>现病史：</Typography.Text>
              {selectedRecord.presentIllness}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>既往史：</Typography.Text>
              {selectedRecord.pastHistory || '无'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>体格检查：</Typography.Text>
              {selectedRecord.physicalExamination}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>诊断：</Typography.Text>
              {selectedRecord.diagnosis}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>治疗方案：</Typography.Text>
              {selectedRecord.treatmentPlan}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>创建时间：</Typography.Text>
              {new Date(selectedRecord.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
