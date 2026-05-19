import { useState, useEffect } from 'react';
import { List, Card, Avatar, Button, Spin, Empty } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi, departmentApi } from '@/services/api';
import type { User, Department } from '@/types';

export default function Doctors() {
  const { deptId } = useParams<{ deptId: string }>();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [deptId]);

  const fetchData = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        departmentApi.getList(),
        doctorApi.getList(deptId ? parseInt(deptId, 10) : undefined),
      ]);
      setDoctors(docRes);
      if (deptId) {
        setDepartment(deptRes.find((d) => d.id === parseInt(deptId, 10)) || null);
      }
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
      <h2 className="text-xl font-bold mb-6">
        {department ? `${department.name} - 医生列表` : '全部医生'}
      </h2>
      {doctors.length === 0 ? (
        <Empty description="暂无医生" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
          dataSource={doctors}
          renderItem={(doctor) => (
            <List.Item>
              <Card hoverable>
                <div className="flex items-center gap-4">
                  <Avatar size={64} icon={<span className="text-2xl">👨‍⚕️</span>} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{doctor.real_name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{doctor.title}</p>
                    <p className="text-gray-400 text-xs">{doctor.department_name}</p>
                  </div>
                </div>
                <Button
                  type="primary"
                  block
                  className="mt-4"
                  onClick={() => navigate(`/patient/appointment/${doctor.id}`)}
                >
                  立即预约
                </Button>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
