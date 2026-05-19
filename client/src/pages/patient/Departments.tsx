import { useState, useEffect } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '@/services/api';
import type { Department } from '@/types';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getList();
      setDepartments(res);
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
      <h2 className="text-xl font-bold mb-6">科室列表</h2>
      <Row gutter={[16, 16]}>
        {departments.map((dept) => (
          <Col xs={12} sm={8} lg={6} key={dept.id}>
            <Card
              hoverable
              className="text-center cursor-pointer h-full"
              onClick={() => navigate(`/patient/doctors/${dept.id}`)}
            >
              <div className="text-4xl mb-3">{dept.icon || '🏥'}</div>
              <div className="font-semibold text-lg">{dept.name}</div>
              {dept.description && (
                <div className="text-sm text-gray-500 mt-2">{dept.description}</div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
