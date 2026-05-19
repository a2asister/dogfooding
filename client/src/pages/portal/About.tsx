import React from 'react';
import { Card, Row, Col, Timeline, List } from 'antd';
import { TeamOutlined, HistoryOutlined, EnvironmentOutlined } from '@ant-design/icons';

const About: React.FC = () => {
  const leaders = [
    { name: '党委书记：XXX', title: '教授、博士生导师', desc: '主持学校党委全面工作' },
    { name: '校长：XXX', title: '教授、博士生导师', desc: '主持学校行政全面工作' },
    { name: '副校长：XXX', title: '教授', desc: '分管教学工作' },
    { name: '副校长：XXX', title: '教授', desc: '分管科研工作' },
  ];

  const history = [
    { time: '1950年', desc: '学校前身创立' },
    { time: '1978年', desc: '被确定为全国重点大学' },
    { time: '1996年', desc: '通过"211工程"部门预审' },
    { time: '2005年', desc: '与XX学院合并组建新校' },
    { time: '2017年', desc: '入选国家"双一流"建设高校' },
    { time: '2024年', desc: '建校74周年' },
  ];

  return (
    <div>
      <h1 className="page-title">学校概况</h1>

      <Card className="card-shadow" style={{ marginBottom: '20px' }}>
        <h2 className="section-title">学校简介</h2>
        <p style={{ lineHeight: '2', color: '#333', fontSize: '15px' }}>
          学校创建于1950年，是一所以工为主、多学科协调发展的全国重点大学。学校占地面积3000余亩，
          校舍建筑面积180余万平方米。现有全日制本科生24000余人，研究生8000余人，留学生1000余人。
          学校设有24个学院（部），86个本科专业，拥有博士后科研流动站15个，一级学科博士点20个，
          一级学科硕士点35个。学校现有专任教师2000余人，其中正高职称350余人，副高职称700余人，
          博士生导师260余人。
        </p>
        <p style={{ lineHeight: '2', color: '#333', fontSize: '15px', marginTop: '15px' }}>
          建校以来，学校共为国家培养输送了30余万名各类高级专门人才，培养了一大批学术精英、
          兴业之才和治国栋梁。学校与50多个国家和地区的200余所高校及科研机构建立了长期合作关系，
          国际化办学水平不断提升。
        </p>
      </Card>

      <Row gutter={20}>
        <Col span={12}>
          <Card className="card-shadow" title={<><HistoryOutlined /> 历史沿革</>}>
            <Timeline
              items={history.map((item) => ({
                color: 'blue',
                children: (
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.time}</div>
                    <div style={{ color: '#666' }}>{item.desc}</div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="card-shadow" title={<><TeamOutlined /> 现任领导</>}>
            <List
              dataSource={leaders}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<TeamOutlined style={{ fontSize: '32px', color: '#1677ff' }} />}
                    title={item.name}
                    description={
                      <div>
                        <div style={{ color: '#666' }}>{item.title}</div>
                        <div style={{ color: '#999', fontSize: '13px' }}>{item.desc}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow" style={{ marginTop: '20px' }} title={<><EnvironmentOutlined /> 校园风光</>}>
        <Row gutter={16}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <div
                style={{
                  height: '150px',
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              >
                校园风景 {i}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default About;
