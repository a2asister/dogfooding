import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Tag,
  message,
  Space,
  Empty,
  Descriptions,
  Modal,
} from 'antd';
import { ReloadOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { electiveApi, batchApi } from '@/services';
import type { CourseSelection, ElectiveBatch, Course, CourseSchedule } from '@/types';
import * as XLSX from 'xlsx';

const { Option } = Select;

const dayMap: Record<number, string> = {
  1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
};

const MySchedule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const [activeBatches, setActiveBatches] = useState<ElectiveBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailSelection, setDetailSelection] = useState<CourseSelection | null>(null);

  const fetchBatches = async () => {
    try {
      const res = await batchApi.getActiveBatches();
      if (res.success) {
        setActiveBatches(res.data || []);
        if (res.data && res.data.length > 0 && !selectedBatch) {
          setSelectedBatch(res.data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSelections = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res = await electiveApi.getMySelections(selectedBatch);
      if (res.success) {
        setSelections(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchSelections();
    }
  }, [selectedBatch]);

  const handleDetail = (selection: CourseSelection) => {
    setDetailSelection(selection);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    const schedules: Array<{
      课程名称: string;
      课程编码: string;
      星期: string;
      节次: string;
      上课地点: string;
      授课教师: string;
      学分: number;
    }> = [];

    selections.forEach((selection) => {
      const course = selection.course as Course | undefined;
      const courseSchedules = course?.schedules as CourseSchedule[] | undefined;

      if (!courseSchedules || courseSchedules.length === 0) {
        schedules.push({
          课程名称: course?.name || '-',
          课程编码: course?.code || '-',
          星期: '-',
          节次: '-',
          上课地点: '-',
          授课教师: course?.teacher?.name || '-',
          学分: course?.credit || 0,
        });
      } else {
        courseSchedules.forEach((schedule) => {
          schedules.push({
            课程名称: course?.name || '-',
            课程编码: course?.code || '-',
            星期: dayMap[schedule.dayOfWeek] || String(schedule.dayOfWeek),
            节次: `第${schedule.startPeriod}-${schedule.endPeriod}节`,
            上课地点: schedule.location,
            授课教师: course?.teacher?.name || '-',
            学分: course?.credit || 0,
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(schedules);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '课程表');
    XLSX.writeFile(workbook, '我的课程表.xlsx');
    message.success('导出成功');
  };

  const getScheduleTableData = () => {
    const scheduleMap: Record<string, CourseSelection & { schedule?: CourseSchedule }> = {};

    selections.forEach((selection) => {
      const course = selection.course as Course | undefined;
      const courseSchedules = course?.schedules as CourseSchedule[] | undefined;

      if (!courseSchedules || courseSchedules.length === 0) {
        return;
      }

      courseSchedules.forEach((schedule) => {
        for (let period = schedule.startPeriod; period <= schedule.endPeriod; period++) {
          const key = `${schedule.dayOfWeek}-${period}`;
          scheduleMap[key] = { ...selection, schedule };
        }
      });
    });

    const tableData: Array<{
      period: string;
      [key: string]: string | React.ReactNode;
    }> = [];

    const maxPeriod = 12;
    for (let period = 1; period <= maxPeriod; period++) {
      const row: { period: string; [key: string]: string | React.ReactNode } = {
        period: `第${period}节`,
      };

      for (let day = 1; day <= 7; day++) {
        const key = `${day}-${period}`;
        const selection = scheduleMap[key];

        if (selection) {
          const course = selection.course as Course | undefined;
          const schedule = selection.schedule;

          const isStartPeriod = schedule && period === schedule.startPeriod;
          const periodCount = schedule ? schedule.endPeriod - schedule.startPeriod + 1 : 1;

          if (isStartPeriod || !schedule) {
            row[`day${day}`] = (
              <div
                style={{
                  backgroundColor: '#e6f7ff',
                  borderRadius: 4,
                  padding: 8,
                  height: isStartPeriod ? periodCount * 80 : 80,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                  {course?.name}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {course?.teacher?.name}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {schedule?.location}
                </div>
              </div>
            );
          }
        } else {
          row[`day${day}`] = '';
        }
      }

      tableData.push(row);
    }

    return tableData;
  };

  const scheduleColumns: ColumnsType<{ period: string; [key: string]: string | React.ReactNode }> = [
    {
      title: '节次',
      dataIndex: 'period',
      key: 'period',
      width: 80,
      fixed: 'left' as const,
    },
    {
      title: '周一',
      dataIndex: 'day1',
      key: 'day1',
      width: 140,
    },
    {
      title: '周二',
      dataIndex: 'day2',
      key: 'day2',
      width: 140,
    },
    {
      title: '周三',
      dataIndex: 'day3',
      key: 'day3',
      width: 140,
    },
    {
      title: '周四',
      dataIndex: 'day4',
      key: 'day4',
      width: 140,
    },
    {
      title: '周五',
      dataIndex: 'day5',
      key: 'day5',
      width: 140,
    },
    {
      title: '周六',
      dataIndex: 'day6',
      key: 'day6',
      width: 140,
    },
    {
      title: '周日',
      dataIndex: 'day7',
      key: 'day7',
      width: 140,
    },
  ];

  const columns: ColumnsType<CourseSelection> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: CourseSelection, index: number) => index + 1,
    },
    {
      title: '课程名称',
      dataIndex: ['course', 'name'],
      key: 'courseName',
      width: 180,
      render: (text: string, record: CourseSelection) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: '课程编码',
      dataIndex: ['course', 'code'],
      key: 'courseCode',
      width: 120,
    },
    {
      title: '上课时间',
      key: 'schedule',
      width: 200,
      render: (_: unknown, record: CourseSelection) => {
        const schedules = record.course?.schedules as CourseSchedule[] | undefined;
        if (!schedules || schedules.length === 0) return '-';
        return (
          <Space direction="vertical" size="small">
            {schedules.map((s, i) => (
              <Tag key={i}>
                {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '上课地点',
      key: 'location',
      width: 150,
      render: (_: unknown, record: CourseSelection) => {
        const schedules = record.course?.schedules as CourseSchedule[] | undefined;
        if (!schedules || schedules.length === 0) return '-';
        return (
          <Space direction="vertical" size="small">
            {schedules.map((s, i) => (
              <Tag key={i} color="blue">{s.location}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '授课教师',
      dataIndex: ['course', 'teacher', 'name'],
      key: 'teacher',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '学分',
      dataIndex: ['course', 'credit'],
      key: 'credit',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: CourseSelection) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  const totalCredits = selections.reduce((sum, item) => {
    const course = item.course as Course | undefined;
    return sum + (course?.credit || 0);
  }, 0);

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space wrap>
          <Select
            placeholder="选择选课批次"
            style={{ width: 250 }}
            value={selectedBatch || undefined}
            onChange={setSelectedBatch}
          >
            {activeBatches.map((batch) => (
              <Option key={batch.id} value={batch.id}>
                {batch.name}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchSelections}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出课表
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Space>
            <Tag color="blue">已选课程：{selections.length}门</Tag>
            <Tag color="green">总学分：{totalCredits}</Tag>
          </Space>
        </div>
      </Card>

      <Card title="课程表视图" style={{ marginBottom: 16 }}>
        {selections.length > 0 ? (
          <Table
            columns={scheduleColumns}
            dataSource={getScheduleTableData()}
            rowKey="period"
            pagination={false}
            size="small"
            scroll={{ x: 1200 }}
          />
        ) : (
          <Empty description="暂无课程" />
        )}
      </Card>

      <Card title="课程列表">
        <Table
          columns={columns}
          dataSource={selections}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无已选课程" />,
          }}
        />
      </Card>

      <Modal
        title="选课详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {detailSelection && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="课程名称">
              {detailSelection.course?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="课程编码">
              {detailSelection.course?.code || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="课程分类">
              {detailSelection.course?.category?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="授课教师">
              {detailSelection.course?.teacher?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="学分">
              {detailSelection.course?.credit || 0}
            </Descriptions.Item>
            <Descriptions.Item label="总学时">
              {detailSelection.course?.totalHours || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="上课时间">
              {(() => {
                const schedules = detailSelection.course?.schedules as CourseSchedule[] | undefined;
                if (!schedules || schedules.length === 0) return '-';
                return (
                  <Space direction="vertical">
                    {schedules.map((s, i) => (
                      <Tag key={i}>
                        {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location}
                      </Tag>
                    ))}
                  </Space>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="课程简介">
              {detailSelection.course?.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="选课状态">
              <Tag color={detailSelection.status === 'selected' ? 'green' : 'red'}>
                {detailSelection.status === 'selected' ? '已选' : '已退'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="选课时间">
              {detailSelection.selectedAt ? new Date(detailSelection.selectedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MySchedule;
