import React from 'react';
import { Card, Row, Col, List, Tag } from 'antd';
import { BookOutlined, UserOutlined, StarOutlined, DollarOutlined } from '@ant-design/icons';

const Admission: React.FC = () => {
  const admissionInfo = {
    totalPlan: 5000,
    provinces: 31,
    majors: 72,
    contactPhone: '010-12345678',
  };

  const recruitMajors = [
    { name: '计算机科学与技术', code: '080901', degree: '工学学士', duration: '四年', plan: 200 },
    { name: '软件工程', code: '080902', degree: '工学学士', duration: '四年', plan: 180 },
    { name: '人工智能', code: '080717T', degree: '工学学士', duration: '四年', plan: 150 },
    { name: '电子信息工程', code: '080701', degree: '工学学士', duration: '四年', plan: 180 },
    { name: '通信工程', code: '080703', degree: '工学学士', duration: '四年', plan: 120 },
    { name: '自动化', code: '080801', degree: '工学学士', duration: '四年', plan: 150 },
    { name: '会计学', code: '120203K', degree: '管理学学士', duration: '四年', plan: 100 },
    { name: '金融学', code: '020301K', degree: '经济学学士', duration: '四年', plan: 100 },
  ];

  const jobNews = [
    { title: 'XX科技有限公司2024校园招聘', time: '2024-10-15', salary: '15-25K' },
    { title: 'XX集团秋季招聘宣讲会', time: '2024-10-12', salary: '18-30K' },
    { title: 'XX银行校园招聘公告', time: '2024-10-10', salary: '12-20K' },
    { title: 'XX互联网公司技术岗招聘', time: '2024-10-08', salary: '20-35K' },
    { title: 'XX研究院科研岗位招聘', time: '2024-10-05', salary: '25-40K' },
  ];

  return (
    <div>
      <h1 className="page-title">招生就业</h1>

      <Row gutter={20}>
        <Col span={12}>
          <Card className="card-shadow" title={<><BookOutlined /> 招生信息</>} style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f6ffed', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', color: '#52c41a', fontWeight: '600' }}>{admissionInfo.totalPlan}</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>年度招生计划</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#e6f7ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', color: '#1890ff', fontWeight: '600' }}>{admissionInfo.majors}</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>招生专业数</div>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: '20px' }}>
              <p>• 招生范围：全国 {admissionInfo.provinces} 个省、自治区、直辖市</p>
              <p>• 咨询电话：{admissionInfo.contactPhone}</p>
              <p>• 招生邮箱：zsb@university.edu.cn</p>
              <p>• 学校地址：XX省XX市XX区XX路100号</p>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card className="card-shadow" title={<><UserOutlined /> 就业服务</>} style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#fff7e6', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', color: '#fa8c16', fontWeight: '600' }}>96.8%</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>毕业生就业率</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9f0ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', color: '#722ed1', fontWeight: '600' }}>12.8万</div>
                  <div style={{ color: '#666', marginTop: '5px' }}>年均就业岗位</div>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: '20px' }}>
              <p>• 就业指导中心：学生活动中心202室</p>
              <p>• 咨询电话：010-87654321</p>
              <p>• 就业邮箱：job@university.edu.cn</p>
              <p>• 双选会时间：每年10月、4月</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow" title={<><StarOutlined /> 招生专业</>} style={{ marginBottom: '20px' }}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={recruitMajors}
          renderItem={(item) => (
            <List.Item>
              <Card size="small" hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '15px' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
                      专业代码：{item.code} | {item.degree} | {item.duration}
                    </div>
                  </div>
                  <Tag color="blue">计划招生 {item.plan} 人</Tag>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card className="card-shadow" title={<><DollarOutlined /> 最新招聘信息</>}>
        <List
          dataSource={jobNews}
          renderItem={(item) => (
            <List.Item className="news-item">
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="news-item-title">{item.title}</span>
                    <div>
                      <Tag color="green">{item.salary}</Tag>
                      <span style={{ color: '#999', fontSize: '13px' }}>{item.time}</span>
                    </div>
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

export default Admission;
