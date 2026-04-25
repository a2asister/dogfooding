import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Modal, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useCommonStore } from '../../stores/commonStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import { useAuthStore } from '../../stores/authStore';
import type { ColumnsType } from 'antd/es/table';
import type { MedicalRecord, LabTestOrder, ImagingOrder, Prescription } from '../../types';

const { Title } = Typography;

export default function MyRecords() {
  const { currentUser } = useAuthStore();
  const { patients, medicalRecords, prescriptions, prescriptionItems, loadAll: loadPatient } =
    usePatientStore();
  const { labTestOrders, imagingOrders, loadAll: loadCommon } = useCommonStore();
  const { doctors, departments, medications, loadAll: loadHospital } = useHospitalStore();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadPatient();
    loadCommon();
    loadHospital();
  }, [loadPatient, loadCommon, loadHospital]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.userId === currentUser?.id);
  }, [patients, currentUser]);

  const myRecords = useMemo(() => {
    if (!currentPatient) return [];
    return [...medicalRecords]
      .filter((r) => r.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [medicalRecords, currentPatient]);

  const myLabTests = useMemo(() => {
    if (!currentPatient) return [];
    return [...labTestOrders]
      .filter((o) => o.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [labTestOrders, currentPatient]);

  const myImaging = useMemo(() => {
    if (!currentPatient) return [];
    return [...imagingOrders]
      .filter((o) => o.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [imagingOrders, currentPatient]);

  const myPrescriptions = useMemo(() => {
    if (!currentPatient) return [];
    return [...prescriptions]
      .filter((p) => p.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [prescriptions, currentPatient]);

  const getDoctorName = (doctorId: string) => {
    const doc = doctors.find((d) => d.id === doctorId);
    const user = useHospitalStore
      .getState()
      .medicalStaff.find((u) => u.id === doc?.userId);
    return user?.name || '-';
  };

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || '-';
  };

  const getMedicationName = (medicationId: string) => {
    const med = medications.find((m) => m.id === medicationId);
    return med?.name || '-';
  };

  const getPrescriptionItems = (prescriptionId: string) => {
    return prescriptionItems.filter((item) => item.prescriptionId === prescriptionId);
  };

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const recordColumns: ColumnsType<MedicalRecord> = [
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (docId) => getDoctorName(docId),
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
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          查看
        </Button>
      ),
    },
  ];

  const labTestColumns: ColumnsType<LabTestOrder> = [
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
      render: (status) => {
        const colors: Record<string, string> = {
          pending: 'orange',
          in_progress: 'blue',
          completed: 'green',
          cancelled: 'default',
        };
        const labels: Record<string, string> = {
          pending: '待处理',
          in_progress: '进行中',
          completed: '已完成',
          cancelled: '已取消',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: '结果日期',
      dataIndex: 'resultDate',
      key: 'resultDate',
      render: (date) => date || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const imagingColumns: ColumnsType<ImagingOrder> = [
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
      render: (status) => {
        const colors: Record<string, string> = {
          pending: 'orange',
          in_progress: 'blue',
          completed: 'green',
          cancelled: 'default',
        };
        const labels: Record<string, string> = {
          pending: '待处理',
          in_progress: '进行中',
          completed: '已完成',
          cancelled: '已取消',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: '报告日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (date) => date || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const prescriptionColumns: ColumnsType<Prescription> = [
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (docId) => getDoctorName(docId),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors: Record<string, string> = {
          pending: 'orange',
          approved: 'blue',
          dispensed: 'green',
          completed: 'default',
        };
        const labels: Record<string, string> = {
          pending: '待审核',
          approved: '已审核',
          dispensed: '已发药',
          completed: '已完成',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        我的病历报告
      </Title>

      <Card title="电子病历" style={{ marginBottom: 16 }}>
        {myRecords.length > 0 ? (
          <Table
            columns={recordColumns}
            dataSource={myRecords}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 份病历`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无病历记录
          </div>
        )}
      </Card>

      <Card title="检验报告" style={{ marginBottom: 16 }}>
        {myLabTests.length > 0 ? (
          <Table
            columns={labTestColumns}
            dataSource={myLabTests}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条检验记录`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无检验记录
          </div>
        )}
      </Card>

      <Card title="检查报告" style={{ marginBottom: 16 }}>
        {myImaging.length > 0 ? (
          <Table
            columns={imagingColumns}
            dataSource={myImaging}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条检查记录`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无检查记录
          </div>
        )}
      </Card>

      <Card title="处方记录">
        {myPrescriptions.length > 0 ? (
          <Table
            columns={prescriptionColumns}
            dataSource={myPrescriptions}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 张处方`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无处方记录
          </div>
        )}
      </Card>

      {/* 查看病历模态框 */}
      <Modal
        title="病历详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <div style={{ marginTop: 16 }}>
            <Descriptions title="基本信息" bordered column={1} size="small">
              <Descriptions.Item label="医生">{getDoctorName(selectedRecord.doctorId)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedRecord.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>主诉</Title>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.chiefComplaint}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>现病史</Title>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.presentIllness}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>既往史</Title>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.pastHistory || '无'}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>体格检查</Title>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.physicalExamination}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>诊断</Title>
              <div style={{ padding: 12, backgroundColor: '#e6f7ff', borderRadius: 4, borderLeft: '4px solid #1890ff' }}>
                {selectedRecord.diagnosis}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>治疗方案</Title>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.treatmentPlan}
              </div>
            </div>

            {selectedRecord.notes && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>备注</Title>
                <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedRecord.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
