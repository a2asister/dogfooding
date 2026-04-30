import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Typography, Layout, message, Table } from 'antd';
import { useRouter } from 'next/router';
import { useParams } from 'next/navigation';
import axios from 'axios';
import * as echarts from 'echarts';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;

export default function SurveyResponses() {
  const params = useParams();
  const id = params?.id as string;
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const chartRefs = useRef<{ [key: number]: echarts.ECharts | null }>({});
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchSurvey();
      fetchStatistics();
      fetchResponses();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`${process.env.API_URL}/surveys/${id}`);
      setSurvey(response.data);
    } catch (error) {
      message.error('获取问卷信息失败');
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.API_URL}/surveys/${id}/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStatistics(response.data);
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${process.env.API_URL}/surveys/${id}/responses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setResponses(response.data);
    } catch (error) {
      message.error('获取答卷数据失败');
    }
  };

  useEffect(() => {
    if (statistics) {
      statistics.statistics.forEach((stat: any) => {
        if (stat.type === 'multiple_choice' || stat.type === 'single_choice') {
          const chartDom = document.getElementById(`chart-${stat.questionId}`);
          if (chartDom) {
            const chart = echarts.init(chartDom);
            chartRefs.current[stat.questionId] = chart;

            const option = {
              title: {
                text: stat.questionText,
                left: 'center',
              },
              tooltip: {
                trigger: 'item',
              },
              legend: {
                orient: 'vertical',
                left: 'left',
              },
              series: [
                {
                  name: '回答数',
                  type: 'pie',
                  radius: '50%',
                  data: Object.entries(stat.statistics).map(([key, value]) => ({
                    name: `选项 ${key}`,
                    value,
                  })),
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            };

            chart.setOption(option);
          }
        }
      });
    }

    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          chart.dispose();
        }
      });
    };
  }, [statistics]);

  if (loading) {
    return <div>加载中...</div>;
  }

  const columns = [
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: '回答者',
      dataIndex: 'respondentEmail',
      key: 'respondentEmail',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#f0f2f5' }}>
        <div style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold' }}>调查问卷系统</div>
        <div style={{ padding: '20px' }}>
          <Button block onClick={() => router.push('/dashboard')}>
            返回列表
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Title level={2}>{survey?.title}</Title>
          <Text>{survey?.description}</Text>
          <div style={{ marginTop: 20 }}>
            <Text strong>总回答数: {statistics?.totalResponses}</Text>
          </div>
          <div style={{ marginTop: 20 }}>
            <Title level={3}>统计结果</Title>
            {statistics?.statistics.map((stat: any) => (
              <Card key={stat.questionId} style={{ marginBottom: 20 }}>
                <Text strong>{stat.questionText}</Text>
                <Text style={{ marginLeft: 10 }}>题型: {stat.type}</Text>
                {stat.type === 'multiple_choice' || stat.type === 'single_choice' ? (
                  <div id={`chart-${stat.questionId}`} style={{ width: '100%', height: 400, marginTop: 20 }} />
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <Text>回答数: {stat.responseCount}</Text>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <Title level={3}>原始回答</Title>
            <Table columns={columns} dataSource={responses} rowKey="id" />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}