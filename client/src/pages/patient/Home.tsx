import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { departmentApi, doctorApi } from '@/services/api';
import type { Department, User } from '@/types';

export default function PatientHome() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        departmentApi.getList(),
        doctorApi.getList(),
      ]);
      setDepartments(deptRes);
      setDoctors(docRes.slice(0, 4));
    } finally {
      setLoading(false);
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
    <div>
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">欢迎使用智慧医院</h2>
          <p className="opacity-90">在线挂号，便捷就医</p>
          <Button
            type="primary"
            size="large"
            className="mt-4 bg-white text-blue-600 border-none hover:bg-gray-100"
            onClick={() => navigate('/patient/departments')}
          >
            立即预约挂号
          </Button>
        </div>
      </Card>

      <h3 className="text-lg font-semibold mb-4">科室导航</h3>
      <Row gutter={[16, 16]} className="mb-8">
        {departments.slice(0, 8).map((dept) => (
          <Col xs={12} sm={6} key={dept.id}>
            <Card
              hoverable
              className="text-center cursor-pointer h-full"
              onClick={() => navigate(`/patient/doctors/${dept.id}`)}
            >
              <div className="text-3xl mb-2">{dept.icon || '🏥'}</div>
              <div className="font-medium">{dept.name}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <h3 className="text-lg font-semibold mb-4">推荐医生</h3>
      <Row gutter={[16, 16]}>
        {doctors.map((doctor) => (
          <Col xs={24} sm={12} lg={6} key={doctor.id}>
            <Card hoverable onClick={() => navigate(`/patient/appointment/${doctor.id}`)}>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                  👨‍⚕️
                </div>
                <div className="font-semibold">{doctor.real_name}</div>
                <div className="text-sm text-gray-500">{doctor.title}</div>
                <div className="text-xs text-gray-400 mt-1">{doctor.department_name}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
