import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Select, Button, Space, Statistic, Tag, Empty, Modal, List, Badge, Tooltip } from 'antd';
import { ReloadOutlined, ClusterOutlined, DatabaseOutlined, CloudServerOutlined, RocketOutlined, GlobalOutlined, ApiOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { traceApi, ServiceNode, ServiceEdge } from '../api';

const serviceTypeIcons: Record<string, any> = {
  frontend: <GlobalOutlined />,
  gateway: <ApiOutlined />,
  service: <CloudServerOutlined />,
  database: <DatabaseOutlined />,
  cache: <RocketOutlined />,
  mq: <ClusterOutlined />,
};

const serviceTypeColors: Record<string, string> = {
  frontend: '#9254de',
  gateway: '#13c2c2',
  service: '#1890ff',
  database: '#fa8c16',
  cache: '#52c41a',
  mq: '#eb2f96',
};

const callTypeColors: Record<string, string> = {
  HTTP: '#1890ff',
  DB: '#fa8c16',
  CACHE: '#52c41a',
  MQ: '#eb2f96',
  RPC: '#722ed1',
};

export default function ServiceTopology() {
  const [env, setEnv] = useState('prod');
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [edges, setEdges] = useState<ServiceEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ServiceEdge | null>(null);
  const chartRef = useRef<ReactECharts>(null);

  const loadTopology = async () => {
    setLoading(true);
    try {
      const data = await traceApi.getTopology({ env });
      setNodes(data.nodes);
      setEdges(data.edges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopology();
  }, [env]);

  const getChartOption = () => {
    if (nodes.length === 0) {
      return {};
    }

    const chartNodes = nodes.map((node) => ({
      ...node,
      symbolSize: Math.max(40, Math.min(80, node.callCount / 100 + 40)),
      itemStyle: {
        color: node.hasError ? '#ff4d4f' : serviceTypeColors[node.type] || '#1890ff',
        borderColor: node.hasError ? '#ff4d4f' : '#fff',
        borderWidth: 2,
        shadowBlur: node.hasError ? 20 : 10,
        shadowColor: node.hasError ? '#ff4d4f' : 'rgba(0,0,0,0.2)',
      },
      label: {
        show: true,
        formatter: node.name,
        fontSize: 12,
        color: '#333',
      },
      value: node.callCount,
      category: node.type,
    }));

    const chartEdges = edges.map((edge) => ({
      ...edge,
      lineStyle: {
        color: edge.errorCount > 0 ? '#ff4d4f' : callTypeColors[edge.callType] || '#999',
        width: Math.max(1, Math.min(5, edge.callCount / 1000 + 1)),
        curveness: 0.2,
        opacity: edge.errorCount > 0 ? 0.8 : 0.5,
      },
      label: {
        show: edge.avgDuration > 100,
        formatter: `${edge.avgDuration}ms`,
        fontSize: 10,
        color: '#666',
      },
      value: edge.callCount,
    }));

    const categories = [
      { name: 'frontend', itemStyle: { color: serviceTypeColors.frontend } },
      { name: 'gateway', itemStyle: { color: serviceTypeColors.gateway } },
      { name: 'service', itemStyle: { color: serviceTypeColors.service } },
      { name: 'database', itemStyle: { color: serviceTypeColors.database } },
      { name: 'cache', itemStyle: { color: serviceTypeColors.cache } },
      { name: 'mq', itemStyle: { color: serviceTypeColors.mq } },
    ];

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const edge = params.data;
            return `
              <div style="padding: 8px;">
                <div><strong>${edge.source} → ${edge.target}</strong></div>
                <div>调用类型: ${edge.callType}</div>
                <div>调用次数: ${edge.callCount}</div>
                <div>错误次数: ${edge.errorCount}</div>
                <div>错误率: ${edge.errorRate}%</div>
                <div>平均耗时: ${edge.avgDuration}ms</div>
                <div>P95耗时: ${edge.p95Duration}ms</div>
                <div>P99耗时: ${edge.p99Duration}ms</div>
              </div>
            `;
          } else {
            const node = params.data;
            return `
              <div style="padding: 8px;">
                <div><strong>${node.name}</strong></div>
                <div>类型: ${node.type}</div>
                <div>IP: ${node.ip}:${node.port}</div>
                <div>调用次数: ${node.callCount}</div>
                <div>错误次数: ${node.errorCount}</div>
                <div>错误率: ${node.errorRate}%</div>
                <div>平均耗时: ${node.avgDuration}ms</div>
              </div>
            `;
          }
        },
      },
      legend: [{
        data: categories.map((c) => c.name),
        orient: 'vertical',
        right: 10,
        top: 'center',
        formatter: (name: string) => {
          const names: Record<string, string> = {
            frontend: '前端',
            gateway: '网关',
            service: '应用服务',
            database: '数据库',
            cache: '缓存',
            mq: '消息队列',
          };
          return names[name] || name;
        },
      }],
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: chartNodes,
          links: chartEdges,
          categories,
          roam: true,
          draggable: true,
          force: {
            repulsion: 400,
            edgeLength: [100, 200],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
            },
          },
          select: {
            itemStyle: {
              borderWidth: 3,
              borderColor: '#1890ff',
            },
          },
        },
      ],
    };
  };

  const handleChartClick = (params: any) => {
    if (params.dataType === 'node') {
      const node = nodes.find((n) => n.id === params.data.id);
      if (node) setSelectedNode(node);
    } else if (params.dataType === 'edge') {
      const edge = edges.find(
        (e) => e.source === params.data.source && e.target === params.data.target
      );
      if (edge) setSelectedEdge(edge);
    }
  };

  const totalCalls = edges.reduce((sum, e) => sum + e.callCount, 0);
  const totalErrors = edges.reduce((sum, e) => sum + e.errorCount, 0);
  const avgLatency = edges.length > 0 ? edges.reduce((sum, e) => sum + e.avgDuration, 0) / edges.length : 0;

  return (
    <div>
      <Card
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <ClusterOutlined />
            <span>服务依赖拓扑</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={env}
              onChange={setEnv}
              style={{ width: 120 }}
            >
              <Select.Option value="dev">开发环境</Select.Option>
              <Select.Option value="test">测试环境</Select.Option>
              <Select.Option value="pre">预发布环境</Select.Option>
              <Select.Option value="prod">生产环境</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadTopology} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="服务节点数" value={nodes.length} prefix={<CloudServerOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="依赖关系数" value={edges.length} prefix={<ApiOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="总调用量"
                value={totalCalls}
                valueStyle={{ color: '#1890ff' }}
                prefix={<RocketOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="异常依赖"
                value={edges.filter((e) => e.errorCount > 0).length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<Badge status="error" />}
              />
            </Card>
          </Col>
        </Row>

        {nodes.length > 0 ? (
          <Card size="small" style={{ height: 600 }}>
            <ReactECharts
              ref={chartRef}
              option={getChartOption()}
              style={{ height: '100%', width: '100%' }}
              onEvents={{ click: handleChartClick }}
            />
          </Card>
        ) : (
          <Card size="small" style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="暂无拓扑数据" />
          </Card>
        )}
      </Card>

      <Card title="依赖关系列表" size="small">
        {edges.length > 0 ? (
          <List
            dataSource={edges}
            renderItem={(edge) => (
              <List.Item
                actions={[
                  <Button type="link" size="small" onClick={() => setSelectedEdge(edge)}>
                    详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={serviceTypeColors[nodes.find((n) => n.id === edge.source)?.type || ''] || 'default'}>
                        {edge.source}
                      </Tag>
                      <span>→</span>
                      <Tag color={serviceTypeColors[nodes.find((n) => n.id === edge.target)?.type || ''] || 'default'}>
                        {edge.target}
                      </Tag>
                      <Tag color={callTypeColors[edge.callType] || 'default'}>{edge.callType}</Tag>
                      {edge.errorCount > 0 && <Tag color="error">异常</Tag>}
                    </Space>
                  }
                  description={
                    <Space size={16}>
                      <span>调用次数: <strong>{edge.callCount}</strong></span>
                      <span>错误: <strong style={{ color: edge.errorCount > 0 ? '#ff4d4f' : '#52c41a' }}>{edge.errorCount}</strong></span>
                      <span>错误率: <strong>{edge.errorRate}%</strong></span>
                      <span>平均耗时: <strong>{edge.avgDuration}ms</strong></span>
                      <span>P95: <strong>{edge.p95Duration}ms</strong></span>
                      <span>P99: <strong>{edge.p99Duration}ms</strong></span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无依赖数据" />
        )}
      </Card>

      <Modal
        title="服务节点详情"
        open={!!selectedNode}
        onCancel={() => setSelectedNode(null)}
        footer={null}
        width={600}
      >
        {selectedNode && (
          <div>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: selectedNode.hasError ? '#ff4d4f' : serviceTypeColors[selectedNode.type] || '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 20,
                  }}
                >
                  {serviceTypeIcons[selectedNode.type] || <CloudServerOutlined />}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedNode.name}</h3>
                  <Tag color={serviceTypeColors[selectedNode.type] || 'default'}>{selectedNode.type}</Tag>
                  {selectedNode.hasError && <Tag color="error">异常</Tag>}
                </div>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>IP 地址</span>
                    <div style={{ fontSize: 16, fontFamily: 'monospace' }}>{selectedNode.ip}:{selectedNode.port}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>服务类型</span>
                    <div style={{ fontSize: 16 }}>{selectedNode.type}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>总调用次数</span>
                    <div style={{ fontSize: 16, color: '#1890ff' }}>{selectedNode.callCount}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>错误次数</span>
                    <div style={{ fontSize: 16, color: selectedNode.errorCount > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {selectedNode.errorCount}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>错误率</span>
                    <div style={{ fontSize: 16 }}>{selectedNode.errorRate}%</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>平均耗时</span>
                    <div style={{ fontSize: 16 }}>{selectedNode.avgDuration}ms</div>
                  </div>
                </Col>
              </Row>

              <div>
                <h4>相关依赖</h4>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {edges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e, i) => (
                      <div key={i} style={{ padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                        <Space>
                          <Tag color={e.source === selectedNode.id ? 'blue' : 'green'}>
                            {e.source === selectedNode.id ? '调用' : '被调用'}
                          </Tag>
                          <span>
                            {e.source === selectedNode.id ? e.target : e.source}
                          </span>
                          <Tag color={callTypeColors[e.callType]}>{e.callType}</Tag>
                          <span>{e.callCount}次</span>
                          <span>{e.avgDuration}ms</span>
                        </Space>
                      </div>
                    ))}
                </Space>
              </div>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        title="依赖关系详情"
        open={!!selectedEdge}
        onCancel={() => setSelectedEdge(null)}
        footer={null}
        width={600}
      >
        {selectedEdge && (
          <div>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{selectedEdge.source}</Tag>
                <span style={{ fontSize: 20 }}>→</span>
                <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>{selectedEdge.target}</Tag>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>调用类型</span>
                    <div style={{ fontSize: 16 }}>
                      <Tag color={callTypeColors[selectedEdge.callType]}>{selectedEdge.callType}</Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>调用次数</span>
                    <div style={{ fontSize: 16, color: '#1890ff' }}>{selectedEdge.callCount}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>错误次数</span>
                    <div style={{ fontSize: 16, color: selectedEdge.errorCount > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {selectedEdge.errorCount}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#888' }}>错误率</span>
                    <div style={{ fontSize: 16 }}>{selectedEdge.errorRate}%</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <span style={{ color: '#888' }}>平均耗时</span>
                    <div style={{ fontSize: 16 }}>{selectedEdge.avgDuration}ms</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <span style={{ color: '#888' }}>P95 耗时</span>
                    <div style={{ fontSize: 16 }}>{selectedEdge.p95Duration}ms</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <span style={{ color: '#888' }}>P99 耗时</span>
                    <div style={{ fontSize: 16 }}>{selectedEdge.p99Duration}ms</div>
                  </div>
                </Col>
              </Row>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
