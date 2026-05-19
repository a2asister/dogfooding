import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Spin, Descriptions, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalRecordApi, visitApi } from '@/services/api';
import type { MedicalRecord, Visit } from '@/types';

const { TextArea } = Input;

export default function MedicalRecordPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (visitId) {
      fetchData(parseInt(visitId, 10));
    }
  }, [visitId]);

  const fetchData = async (id: number) => {
    try {
      const [recordRes, visitRes] = await Promise.all([
        medicalRecordApi.getByVisit(id),
        visitApi.getTodayList(),
      ]);
      setRecord(recordRes);
      setVisit(visitRes.find((v) => v.id === id) || null);
      if (recordRes) {
        form.setFieldsValue({
          chiefComplaint: recordRes.chief_complaint,
          presentIllness: recordRes.present_illness,
          diagnosis: recordRes.diagnosis,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: {
    chiefComplaint?: string;
    presentIllness?: string;
    diagnosis?: string;
  }) => {
    if (!visitId) return;
    setSubmitting(true);
    try {
      await medicalRecordApi.save({
        visitId: parseInt(visitId, 10),
        ...values,
      });
      message.success('病历保存成功');
      fetchData(parseInt(visitId, 10));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">电子病历</h2>
        <Button onClick={() => navigate('/medical')}>返回</Button>
      </div>

      {visit && (
        <Card className="mb-6">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="患者姓名">{visit.patient_name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{visit.patient_phone}</Descriptions.Item>
            <Descriptions.Item label="医生">{visit.doctor_name}</Descriptions.Item>
            <Descriptions.Item label="科室">{visit.department_name}</Descriptions.Item>
            <Descriptions.Item label="接诊时间">{visit.start_time}</Descriptions.Item>
            <Descriptions.Item label="状态">{visit.status}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="病历信息">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="chiefComplaint" label="主诉">
            <TextArea rows={3} placeholder="请输入患者主诉" />
          </Form.Item>
          <Form.Item name="presentIllness" label="现病史">
            <TextArea rows={4} placeholder="请输入现病史" />
          </Form.Item>
          <Form.Item name="diagnosis" label="诊断">
            <TextArea rows={3} placeholder="请输入诊断结果" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存病历
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
