import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Tag,
  Popconfirm,
  message,
  Space,
  Empty,
  Descriptions,
  Modal,
} from 'antd';
import { ReloadOutlined, ExportOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { electiveApi, batchApi } from '@/services';
import type { CourseSelection, ElectiveBatch, Course, CourseSchedule } from '@/types';
import * as XLSX from 'xlsx';

const { Option } = Select;

const MyCourses: React.FC = () => {
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

  const handleDropCourse = async (courseId: string) => {
    if (!selectedBatch) return;
    try {
      const res = await electiveApi.dropCourse({
        courseId,
        batchId: selectedBatch,
      });
      if (res.success) {
        message.success('退课成功');
        fetchSelections();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDetail = (selection: CourseSelection) => {
    setDetailSelection(selection);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    const exportData = selections.map((item, index) => {
      const course = item.course as Course | undefined;
      return {
        序号: index + 1,
        课程名称: course?.name || '-',
        课程编码: course?.code || '-',
        课程分类: course?.category?.name || '-',
        授课教师: course?.teacher?.name || '-',
        学分: course?.credit || 0,
        选课时间: item.selectedAt ? new Date(item.selectedAt).toLocaleString() : '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '已选课程');
    XLSX.writeFile(workbook, '已选课程列表.xlsx');
    message.success('导出成功');
  };

  const dayMap: Record<number, string> = {
    1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
  };

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
      title: '课程分类',
      dataIndex: ['course', 'category', 'name'],
      key: 'category',
      width: 100,
      render: (text: string) => text || '-',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          selected: 'green',
          dropped: 'red',
          completed: 'blue',
        };
        const textMap: Record<string, string> = {
          selected: '已选',
          dropped: '已退',
          completed: '已完成',
        };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: '选课时间',
      dataIndex: 'selectedAt',
      key: 'selectedAt',
      width: 160,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: CourseSelection) => {
        const course = record.course as Course | undefined;
        return (
          <Space size="small">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
              详情
            </Button>
            {record.status === 'selected' && (
              <Popconfirm
                title="确定要退课吗？"
                onConfirm={() => handleDropCourse(course?.id || '')}
              >
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                  退课
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
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
            导出
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Space>
            <Tag color="blue">已选课程：{selections.length}门</Tag>
            <Tag color="green">总学分：{totalCredits}</Tag>
          </Space>
        </div>
      </Card>

      <Card>
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

export default MyCourses;
