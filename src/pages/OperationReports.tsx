import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  Tag,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Descriptions,
  Divider,
  Tabs,
  DatePicker,
  Progress,
  List,
  Timeline,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  CarOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  setSelectedPeriod,
  setDateRange,
  fetchReportData,
} from '@/store/slices/reportSlice';
import StatCard from '@/components/StatCard';
import type { AreaCapacityLoad, PeakHour } from '@/types';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const OperationReports = () => {
  const dispatch = useAppDispatch();
  const { data, selectedPeriod, loading } = useAppSelector((state) => state.report);

  const [activeTab, setActiveTab] = useState<string>('capacity');

  const handlePeriodChange = (value: string) => {
    dispatch(setSelectedPeriod(value as any));
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null]) => {
    if (dates && dates[0] && dates[1]) {
      dispatch(setDateRange({
        start: dates[0].format('YYYY-MM-DD'),
        end: dates[1].format('YYYY-MM-DD'),
      }));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchReportData({}));
    message.success('数据已刷新');
  };

  const handleExport = () => {
    message.success('报表已导出');
  };

  const areaLoadColumns: ColumnsType<AreaCapacityLoad> = [
    {
      title: '区域名称',
      dataIndex: 'areaName',
      key: 'areaName',
    },
    {
      title: '总车辆数',
      dataIndex: 'totalVehicles',
      key: 'totalVehicles',
      render: (value) => (
        <Tag color="blue">{value} 辆</Tag>
      ),
    },
    {
      title: '空闲车辆',
      dataIndex: 'idleVehicles',
      key: 'idleVehicles',
      render: (value) => (
        <Tag color="processing">{value} 辆</Tag>
      ),
    },
    {
      title: '营运车辆',
      dataIndex: 'operatingVehicles',
      key: 'operatingVehicles',
      render: (value) => (
        <Tag color="success">{value} 辆</Tag>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
      render: (value) => (
        <Tag color="orange">{value} 单</Tag>
      ),
    },
    {
      title: '运力负荷',
      dataIndex: 'loadRatio',
      key: 'loadRatio',
      render: (value) => {
        const percent = Math.round(value * 100);
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent > 80 ? 'exception' : percent > 60 ? 'normal' : 'active'}
            format={(p) => `${p}%`}
          />
        );
      },
    },
  ];

  const peakHourColumns: ColumnsType<PeakHour> = [
    {
      title: '时段',
      dataIndex: 'hour',
      key: 'hour',
      render: (hour) => (
        <Text strong>{String(hour).padStart(2, '0')}:00 - {String(hour + 1).padStart(2, '0')}:00</Text>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (value, record) => (
        <Space>
          <Tag color={record.isPeak ? 'error' : 'blue'}>{value} 单</Tag>
          {record.isPeak && <Tag color="red" icon={<WarningOutlined />}>高峰</Tag>}
        </Space>
      ),
    },
    {
      title: '车辆配置',
      dataIndex: 'vehicleCount',
      key: 'vehicleCount',
      render: (value) => (
        <Tag color="green">{value} 辆</Tag>
      ),
    },
    {
      title: '供需比',
      key: 'ratio',
      render: (_, record) => {
        const ratio = record.vehicleCount / Math.max(1, record.orderCount);
        return (
          <Text
            style={{
              color: ratio > 1 ? '#52c41a' : ratio > 0.5 ? '#faad14' : '#ff4d4f',
              fontWeight: 'bold',
            }}
          >
            {ratio.toFixed(2)}
          </Text>
        );
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="总车辆数"
            value={data.capacityStats.totalVehicles}
            suffix="辆"
            icon={<CarOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            color="#1890ff"
            progress={(data.capacityStats.onlineVehicles / data.capacityStats.totalVehicles) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="在线车辆"
            value={data.capacityStats.onlineVehicles}
            suffix="辆"
            icon={<CarOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
            color="#52c41a"
            progress={(data.capacityStats.onlineVehicles / data.capacityStats.totalVehicles) * 100}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="总订单数"
            value={data.orderThroughput.totalOrders}
            suffix="单"
            icon={<FileTextOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="完成率"
            value={Math.round(
              (data.orderThroughput.completedOrders / data.orderThroughput.totalOrders) * 100
            )}
            suffix="%"
            icon={<CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
            color="#52c41a"
            progress={Math.round(
              (data.orderThroughput.completedOrders / data.orderThroughput.totalOrders) * 100
            )}
          />
        </Col>
      </Row>

      <Card
        title="报表筛选"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新数据
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出报表
            </Button>
          </Space>
        }
      >
        <Space wrap>
          <Select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            style={{ width: 150 }}
          >
            <Option value="today">今日</Option>
            <Option value="yesterday">昨日</Option>
            <Option value="week">本周</Option>
            <Option value="month">本月</Option>
            <Option value="custom">自定义</Option>
          </Select>
          {selectedPeriod === 'custom' && (
            <RangePicker
              onChange={(dates) => handleDateRangeChange(dates as [Dayjs, Dayjs])}
            />
          )}
        </Space>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="运力统计" key="capacity" icon={<BarChartOutlined />}>
            <Card type="inner" title="运力概览">
              <Descriptions bordered column={3}>
                <Descriptions.Item label="总车辆数">
                  {data.capacityStats.totalVehicles} 辆
                </Descriptions.Item>
                <Descriptions.Item label="在线车辆">
                  <Tag color="success">{data.capacityStats.onlineVehicles} 辆</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="离线车辆">
                  <Tag color="error">{data.capacityStats.offlineVehicles} 辆</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="空闲车辆">
                  <Tag color="processing">{data.capacityStats.idleVehicles} 辆</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="营运车辆">
                  <Tag color="success">{data.capacityStats.operatingVehicles} 辆</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="平均利用率">
                  <Text strong>{(data.capacityStats.averageUtilization * 100).toFixed(0)}%</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card type="inner" title="区域运力负荷">
              <Table
                columns={areaLoadColumns}
                dataSource={data.areaCapacityLoad}
                rowKey="areaName"
                pagination={false}
              />
            </Card>
          </TabPane>

          <TabPane tab="订单吞吐量" key="orders" icon={<FileTextOutlined />}>
            <Card type="inner" title="订单统计">
              <Descriptions bordered column={3}>
                <Descriptions.Item label="总订单数">
                  {data.orderThroughput.totalOrders} 单
                </Descriptions.Item>
                <Descriptions.Item label="已完成">
                  <Tag color="success">{data.orderThroughput.completedOrders} 单</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="已取消">
                  <Tag color="error">{data.orderThroughput.cancelledOrders} 单</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="平均客单价">
                  <Text strong>¥{data.orderThroughput.averageOrderValue}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="高峰时段订单">
                  <Tag color="error">{data.orderThroughput.peakHourOrders} 单</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="平峰时段订单">
                  <Tag color="blue">{data.orderThroughput.offPeakOrders} 单</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card type="inner" title="高峰时段分析">
              <Table
                columns={peakHourColumns}
                dataSource={data.peakHours}
                rowKey="hour"
                pagination={false}
                size="small"
              />
            </Card>
          </TabPane>

          <TabPane tab="调度效率" key="efficiency" icon={<LineChartOutlined />}>
            <Card type="inner" title="效率指标">
              <Row gutter={[32, 32]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="平均派单时间"
                      value={data.dispatchEfficiency.averageDispatchTime}
                      suffix="分钟"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="派单成功率"
                      value={(data.dispatchEfficiency.dispatchSuccessRate * 100).toFixed(1)}
                      suffix="%"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="超时率"
                      value={(data.dispatchEfficiency.timeoutRate * 100).toFixed(1)}
                      suffix="%"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="改派率"
                      value={(data.dispatchEfficiency.reassignmentRate * 100).toFixed(1)}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Card type="inner" title="效率趋势">
              <Timeline mode="alternate">
                <Timeline.Item color="green">
                  <Text strong>09:00</Text> - 早高峰结束，派单效率提升至 95%
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <Text strong>12:00</Text> - 午间平峰，派单效率稳定在 90%
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Text strong>17:00</Text> - 晚高峰开始，派单效率有所下降
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text strong>21:00</Text> - 晚高峰结束，派单效率恢复正常
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>

          <TabPane tab="司机出勤" key="drivers" icon={<UserOutlined />}>
            <Card type="inner" title="司机出勤统计">
              <Descriptions bordered column={3}>
                <Descriptions.Item label="司机总数">
                  {data.driverAttendance.totalDrivers} 人
                </Descriptions.Item>
                <Descriptions.Item label="在岗">
                  <Tag color="success">{data.driverAttendance.onDuty} 人</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="离岗">
                  <Tag color="default">{data.driverAttendance.offDuty} 人</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="休假">
                  <Tag color="warning">{data.driverAttendance.onLeave} 人</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="平均工时" span={2}>
                  <Text strong>{data.driverAttendance.averageWorkingHours} 小时/天</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card type="inner" title="出勤分布">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="在岗率"
                      value={Math.round(
                        (data.driverAttendance.onDuty / data.driverAttendance.totalDrivers) * 100
                      )}
                      suffix="%"
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Progress
                      percent={Math.round(
                        (data.driverAttendance.onDuty / data.driverAttendance.totalDrivers) * 100
                      )}
                      strokeColor="#52c41a"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="离岗率"
                      value={Math.round(
                        (data.driverAttendance.offDuty / data.driverAttendance.totalDrivers) * 100
                      )}
                      suffix="%"
                      valueStyle={{ color: '#8c8c8c' }}
                    />
                    <Progress
                      percent={Math.round(
                        (data.driverAttendance.offDuty / data.driverAttendance.totalDrivers) * 100
                      )}
                      strokeColor="#8c8c8c"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="休假率"
                      value={Math.round(
                        (data.driverAttendance.onLeave / data.driverAttendance.totalDrivers) * 100
                      )}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Progress
                      percent={Math.round(
                        (data.driverAttendance.onLeave / data.driverAttendance.totalDrivers) * 100
                      )}
                      strokeColor="#faad14"
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default OperationReports;
