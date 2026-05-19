import { useState, useEffect } from 'react';
import { Card, Avatar, Button, DatePicker, Radio, Spin, message, Descriptions } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { doctorApi, appointmentApi } from '@/services/api';
import type { User, DoctorSchedule } from '@/types';

export default function Appointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<(User & { schedules: DoctorSchedule[] }) | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctorId) {
      fetchDoctor(parseInt(doctorId, 10));
    }
  }, [doctorId]);

  const fetchDoctor = async (id: number) => {
    try {
      const res = await doctorApi.getDetail(id);
      setDoctor(res);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointment = async () => {
    if (!selectedSchedule || !doctor) {
      message.warning('请选择就诊时段');
      return;
    }
    setSubmitting(true);
    try {
      await appointmentApi.create({
        scheduleId: selectedSchedule.id,
        appointmentDate: selectedSchedule.schedule_date,
        timeSlot: selectedSchedule.time_slot,
        doctorId: doctor.id,
      });
      message.success('预约成功');
      navigate('/patient/my-appointments');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSchedules = doctor?.schedules.filter(
    (s) => s.schedule_date === selectedDate.format('YYYY-MM-DD') && s.is_enabled
  );

  const disabledDate = (current: Dayjs) => {
    return current < dayjs().startOf('day') || current > dayjs().add(6, 'day');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!doctor) {
    return <div className="text-center py-8">医生不存在</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <Avatar size={80} icon={<span className="text-4xl">👨‍⚕️</span>} />
          <div>
            <h2 className="text-2xl font-bold mb-2">{doctor.real_name}</h2>
            <p className="text-gray-600 mb-1">
              {doctor.title} | {doctor.department_name}
            </p>
          </div>
        </div>
      </Card>

      <Card title="选择就诊日期" className="mb-6">
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          disabledDate={disabledDate}
          size="large"
          style={{ width: '100%' }}
        />
      </Card>

      <Card title="选择就诊时段" className="mb-6">
        {availableSchedules?.length === 0 ? (
          <div className="text-center text-gray-500 py-4">该日期暂无号源</div>
        ) : (
          <Radio.Group
            value={selectedSchedule?.id}
            onChange={(e) => {
              const schedule = availableSchedules?.find((s) => s.id === e.target.value);
              setSelectedSchedule(schedule || null);
            }}
            className="w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              {availableSchedules?.map((schedule) => {
                const timeSlotName =
                  schedule.time_slot === 'morning' ? '上午 08:00-12:00' : '下午 14:00-17:30';
                const remaining = schedule.total_quota - schedule.used_quota;
                const disabled = remaining <= 0;
                return (
                  <Radio.Button
                    key={schedule.id}
                    value={schedule.id}
                    disabled={disabled}
                    className="h-auto p-4 text-left"
                  >
                    <div className="font-medium">{timeSlotName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      剩余号源：{remaining} / {schedule.total_quota}
                    </div>
                  </Radio.Button>
                );
              })}
            </div>
          </Radio.Group>
        )}
      </Card>

      {selectedSchedule && (
        <Card title="预约信息确认" className="mb-6">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="医生">{doctor.real_name}</Descriptions.Item>
            <Descriptions.Item label="科室">{doctor.department_name}</Descriptions.Item>
            <Descriptions.Item label="日期">{selectedSchedule.schedule_date}</Descriptions.Item>
            <Descriptions.Item label="时段">
              {selectedSchedule.time_slot === 'morning' ? '上午 08:00-12:00' : '下午 14:00-17:30'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Button
        type="primary"
        size="large"
        block
        loading={submitting}
        onClick={handleAppointment}
        disabled={!selectedSchedule}
      >
        确认预约
      </Button>
    </div>
  );
}
