import React, { useEffect, useState } from 'react';
import { Card, Tag, Spin, Button, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';
import { Schedule } from '../../types';

const { Option } = Select;

const SchedulePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [week, setWeek] = useState(1);

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const periods = [
    { label: '第1-2节', time: '08:00-09:40' },
    { label: '第3-4节', time: '10:00-11:40' },
    { label: '第5-6节', time: '14:00-15:40' },
    { label: '第7-8节', time: '16:00-17:40' },
    { label: '第9-10节', time: '19:00-20:40' },
  ];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getSchedule();
      setSchedules(data);
    } catch (error) {
      console.error('加载课表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleByDayAndPeriod = (weekDay: number, periodIndex: number) => {
    const startPeriod = periodIndex * 2 + 1;
    const endPeriod = periodIndex * 2 + 2;
    return schedules.filter(
      (s) =>
        s.weekDay === weekDay &&
        ((s.startPeriod >= startPeriod && s.startPeriod <= endPeriod) ||
          (s.endPeriod >= startPeriod && s.endPeriod <= endPeriod) ||
          (s.startPeriod <= startPeriod && s.endPeriod >= endPeriod))
    );
  };

  const getScheduleColor = (index: number) => {
    const colors = [
      { bg: '#e6f4ff', text: '#1677ff' },
      { bg: '#f6ffed', text: '#52c41a' },
      { bg: '#fff7e6', text: '#fa8c16' },
      { bg: '#fff1f0', text: '#f5222d' },
      { bg: '#f9f0ff', text: '#722ed1' },
      { bg: '#e6fffb', text: '#13c2c2' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><CalendarOutlined /> 我的课表</>}
        extra={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>周次：</span>
            <Select value={week} onChange={setWeek} style={{ width: 100 }}>
              {Array.from({ length: 16 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>第 {i + 1} 周</Option>
              ))}
            </Select>
            <Button onClick={loadSchedule}>刷新</Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <table className="schedule-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>时间</th>
                {weekDays.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, periodIdx) => (
                <tr key={periodIdx}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{period.label}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{period.time}</div>
                  </td>
                  {weekDays.map((_, dayIdx) => {
                    const daySchedules = getScheduleByDayAndPeriod(dayIdx + 1, periodIdx);
                    return (
                      <td key={dayIdx} className="schedule-cell">
                        {daySchedules.map((schedule) => {
                          const color = getScheduleColor(schedule.id);
                          return (
                            <div key={schedule.id} className="schedule-item" style={{ background: color.bg }}>
                              <div className="schedule-item-name" style={{ color: color.text }}>
                                {schedule.courseName}
                              </div>
                              <div className="schedule-item-location">
                                第{schedule.startPeriod}-{schedule.endPeriod}节
                              </div>
                              <div className="schedule-item-location">
                                {schedule.teacher}
                              </div>
                              <div className="schedule-item-location">
                                {schedule.location}
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Spin>
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <Tag color="blue">共 {schedules.length} 门课程</Tag>
          <Tag color="green">本周上课 {new Set(schedules.map(s => s.weekDay)).size} 天</Tag>
        </div>
      </Card>
    </div>
  );
};

export default SchedulePage;
