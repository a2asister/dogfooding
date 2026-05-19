import { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Spin, Empty, Popconfirm, message } from 'antd';
import { appointmentApi } from '@/services/api';
import type { Appointment } from '@/types';

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'gold', text: '待确认' },
  confirmed: { color: 'blue', text: '已确认' },
  cancelled: { color: 'default', text: '已取消' },
  completed: { color: 'green', text: '已完成' },
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentApi.getList();
      setAppointments(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await appointmentApi.cancel(id);
      message.success('取消成功');
      fetchAppointments();
    } catch {
      // error already handled
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
      <h2 className="text-xl font-bold mb-6">我的预约</h2>
      {appointments.length === 0 ? (
        <Empty description="暂无预约记录" />
      ) : (
        <List
          dataSource={appointments}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card className="w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {item.doctor_name}
                      <Tag className="ml-2" color={statusMap[item.status].color}>
                        {statusMap[item.status].text}
                      </Tag>
                    </h3>
                    <p className="text-gray-600 mb-1">{item.department_name}</p>
                    <p className="text-gray-500 text-sm">
                      就诊日期：{item.appointment_date}
                      {item.time_slot === 'morning' ? ' 上午' : ' 下午'}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      预约时间：{item.created_at}
                    </p>
                  </div>
                  <div>
                    {item.status === 'confirmed' && (
                      <Popconfirm
                        title="确定要取消预约吗？"
                        onConfirm={() => handleCancel(item.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button danger>取消预约</Button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
