import React from 'react';
import { Card, Row, Col, List, Tag, Progress } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined, ExperimentOutlined } from '@ant-design/icons';

const Research: React.FC = () => {
  const departments = [
    { name: '计算机学院', majors: 5, students: 3500, teachers: 120 },
    { name: '电子信息学院', majors: 4, students: 2800, teachers: 95 },
    { name: '机械工程学院', majors: 3, students: 2400, teachers: 88 },
    { name: '经济管理学院', majors: 6, students: 3200, teachers: 110 },
    { name: '外国语学院', majors: 3, students: 1500, teachers: 92 },
    { name: '数学与统计学院', majors: 4, students: 1800, teachers: 75 },
  ];

  const achievements = [
    { title: '国家科技进步奖', count: 12, color: '#1890ff' },
    { title: '省部级科技奖励', count: 86, color: '#52c41a' },
    { title: '授权发明专利', count: 352, color: '#722ed1' },
    { title: '发表SCI论文', count: 1258, color: '#fa8c16' },
  ];

  const researchPlatforms = [
    { name: '国家重点实验室', level: '国家级', director: '张教授' },
    { name: '国家工程技术研究中心', level: '国家级', director: '李教授' },
    { name: '教育部重点实验室', level: '省部级', director: '王教授' },
    { name: 'XX省协同创新中心', level: '省部级', director: '刘教授' },
  ];

  return (
    <div>
      <h1 className="page-title">教学科研</h1>

      <Row gutter={20}>
        {achievements.map((item, idx) => (
          <Col span={6} key={idx}>
            <Card className="card-shadow" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '600', color: item.color }}>{item.count}</div>
              <div style={{ color: '#666', marginTop: '8px' }}>{item.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="card-shadow" title={<><BookOutlined /> 院系设置</>} style={{ marginBottom: '20px' }}>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={departments}
          renderItem={(item) => (
            <List.Item>
              <Card size="small" hoverable>
                <div style={{ fontWeight: '500', fontSize: '16px', marginBottom: '10px' }}>{item.name}</div>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', color: '#1890ff', fontWeight: '500' }}>{item.majors}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>专业数</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', color: '#52c41a', fontWeight: '500' }}>{item.students}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>学生数</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', color: '#722ed1', fontWeight: '500' }}>{item.teachers}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>教师数</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Row gutter={20}>
        <Col span={12}>
          <Card className="card-shadow" title={<><TeamOutlined /> 师资力量</>} style={{ marginBottom: '20px' }}>
            <List>
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>两院院士</span>
                    <span>8 人</span>
                  </div>
                  <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
                </div>
              </List.Item>
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>长江学者特聘教授</span>
                    <span>25 人</span>
                  </div>
                  <Progress percent={85} showInfo={false} strokeColor="#52c41a" />
                </div>
              </List.Item>
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>国家杰出青年基金获得者</span>
                    <span>32 人</span>
                  </div>
                  <Progress percent={75} showInfo={false} strokeColor="#722ed1" />
                </div>
              </List.Item>
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>博士生导师</span>
                    <span>260 人</span>
                  </div>
                  <Progress percent={65} showInfo={false} strokeColor="#fa8c16" />
                </div>
              </List.Item>
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>教授</span>
                    <span>350 人</span>
                  </div>
                  <Progress percent={55} showInfo={false} strokeColor="#eb2f96" />
                </div>
              </List.Item>
            </List>
          </Card>
        </Col>

        <Col span={12}>
          <Card className="card-shadow" title={<><ExperimentOutlined /> 科研平台</>} style={{ marginBottom: '20px' }}>
            <List
              dataSource={researchPlatforms}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={
                      <div>
                        <Tag color={item.level === '国家级' ? 'red' : 'blue'}>{item.level}</Tag>
                        <span style={{ color: '#999' }}>主任：{item.director}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow" title={<><TrophyOutlined /> 最新科研成果</>}>
        <List
          dataSource={[
            { title: '我校在人工智能领域取得重要突破', time: '2024-10-15', fund: '国家自然科学基金重点项目' },
            { title: '新材料研究成果发表于国际顶级期刊', time: '2024-10-10', fund: '973计划项目' },
            { title: '新能源技术创新获国家发明专利', time: '2024-10-08', fund: '国家重点研发计划' },
            { title: '大数据处理算法研究获国际会议最佳论文', time: '2024-10-05', fund: '省部级科技项目' },
          ]}
          renderItem={(item) => (
            <List.Item className="news-item">
              <List.Item.Meta
                title={<span className="news-item-title">{item.title}</span>}
                description={
                  <div>
                    <Tag color="purple">{item.fund}</Tag>
                    <span style={{ color: '#999' }}>发布时间：{item.time}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Research;
