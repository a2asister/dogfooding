import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Spin,
  Button,
  Space,
  Descriptions,
  Modal,
  Progress,
} from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { statisticApi } from '@/services';
import type { Course } from '@/types';

const StatisticsHot: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hotCourses, setHotCourses] = useState<Course[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await statisticApi.getHotCourses(20);
      if (res.success) {
        setHotCourses(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDetail = (record: Course) => {
    setDetailCourse(record);
    setIsDetailModalOpen(true);
  };

  const dayMap: Record<number, string> = {
    1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
  };

  const pieChartOption = {
    title: {
      text: '选课人数分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}人 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '选课人数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: hotCourses.slice(0, 10).map((c) => ({
          value: c.currentStudents || 0,
          name: c.name,
        })),
      },
    ],
  };

  const barChartOption = {
    title: {
      text: '热门课程排行',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '选课人数',
    },
    yAxis: {
      type: 'category',
      data: hotCourses.slice(0, 10).map((c) => c.name).reverse(),
    },
    series: [
      {
        name: '选课人数',
        type: 'bar',
        data: hotCourses.slice(0, 10).map((c) => c.currentStudents || 0).reverse(),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' },
            ],
          },
        },
      },
    ],
  };

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: unknown, __: Course, index: number) => {
        const color = index < 3 ? ['#f5222d', '#fa8c16', '#faad14'][index] : '#666';
        return (
          <Tag color={color} style={{ fontSize: 14, fontWeight: 600 }}>
            {index + 1}
          </Tag>
        );
      },
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Course) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: '课程分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '授课教师',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '学分',
      dataIndex: 'credit',
      key: 'credit',
      width: 60,
    },
    {
      title: '选课进度',
      key: 'progress',
      width: 200,
      render: (_: unknown, record: Course) => {
        const current = record.currentStudents || 0;
        const max = record.maxStudents || 50;
        const percent = Math.round((current / max) * 100);
        const color = percent >= 90 ? '#f5222d' : percent >= 70 ? '#fa8c16' : '#52c41a';
        return (
          <Progress
            percent={percent}
            format={() => `${current}/${max}`}
            strokeColor={color}
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'isHot',
      key: 'isHot',
      width: 60,
      render: (isHot: boolean) => (
        isHot ? <Tag color="orange">热门</Tag> : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Course) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Spin spinning={loading}>
        <Card
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              刷新
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={hotCourses}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
          <Card title="选课人数分布" style={{ flex: 1 }}>
            <ReactECharts option={pieChartOption} style={{ height: 400 }} />
          </Card>
          <Card title="热门课程排行" style={{ flex: 1 }}>
            <ReactECharts option={barChartOption} style={{ height: 400 }} />
          </Card>
        </div>

        <Modal
          title="课程详情"
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={600}
        >
          {detailCourse && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="课程名称">{detailCourse.name}</Descriptions.Item>
              <Descriptions.Item label="课程编码">{detailCourse.code}</Descriptions.Item>
              <Descriptions.Item label="课程分类">
                {detailCourse.category?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="授课教师">
                {detailCourse.teacher?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="学分">{detailCourse.credit}</Descriptions.Item>
              <Descriptions.Item label="总学时">{detailCourse.totalHours || '-'}</Descriptions.Item>
              <Descriptions.Item label="选课进度">
                {detailCourse.currentStudents || 0} / {detailCourse.maxStudents || 50} 人
                <Progress
                  percent={Math.round(((detailCourse.currentStudents || 0) / (detailCourse.maxStudents || 50)) * 100)}
                  style={{ marginTop: 8 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="上课时间">
                {detailCourse.schedules && detailCourse.schedules.length > 0 ? (
                  <Space direction="vertical">
                    {detailCourse.schedules.map((s, i) => (
                      <Tag key={i}>
                        {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location}
                      </Tag>
                    ))}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="课程简介">
                {detailCourse.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default StatisticsHot;
