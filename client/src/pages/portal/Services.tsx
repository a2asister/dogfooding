import React from 'react';
import { Card, Row, Col, List, Button, Table, Tag } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, MailOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const Services: React.FC = () => {
  const contactInfo = {
    address: 'XX省XX市XX区XX路100号',
    phone: '010-12345678',
    fax: '010-12345679',
    email: 'info@university.edu.cn',
    zipCode: '100000',
  };

  const guides = [
    { title: '新生入学指南', desc: '新生入学报到流程及注意事项', link: '#' },
    { title: '选课操作指南', desc: '学生选课系统使用说明', link: '#' },
    { title: '奖助学金申请指南', desc: '各类奖助学金申请条件及流程', link: '#' },
    { title: '学籍异动办理指南', desc: '休学、复学、转学等办理流程', link: '#' },
    { title: '毕业生离校指南', desc: '毕业手续办理流程', link: '#' },
    { title: '校园卡使用指南', desc: '校园卡充值、挂失、补办说明', link: '#' },
  ];

  const downloads = [
    { name: '学生成绩证明模板', size: '25KB', format: 'DOCX' },
    { name: '在读证明模板', size: '22KB', format: 'DOCX' },
    { name: '请假条模板', size: '18KB', format: 'DOCX' },
    { name: '学生证补办申请表', size: '30KB', format: 'DOCX' },
    { name: '转专业申请表', size: '35KB', format: 'DOCX' },
    { name: '奖学金申请表', size: '40KB', format: 'DOCX' },
  ];

  const departments = [
    { name: '教务处', phone: '010-12340001', location: '行政楼201' },
    { name: '学生处', phone: '010-12340002', location: '行政楼202' },
    { name: '招生办公室', phone: '010-12340003', location: '行政楼101' },
    { name: '就业指导中心', phone: '010-12340004', location: '学生活动中心202' },
    { name: '财务处', phone: '010-12340005', location: '行政楼105' },
    { name: '后勤服务中心', phone: '010-12340006', location: '后勤楼101' },
    { name: '图书馆', phone: '010-12340007', location: '图书馆101' },
    { name: '网络中心', phone: '010-12340008', location: '信息楼301' },
  ];

  return (
    <div>
      <h1 className="page-title">公共服务</h1>

      <Row gutter={20}>
        <Col span={12}>
          <Card className="card-shadow" title={<><EnvironmentOutlined /> 联系方式</>} style={{ marginBottom: '20px' }}>
            <List>
              <List.Item>
                <List.Item.Meta
                  avatar={<EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                  title="学校地址"
                  description={contactInfo.address}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<PhoneOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                  title="联系电话"
                  description={contactInfo.phone}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<MailOutlined style={{ fontSize: '24px', color: '#722ed1' }} />}
                  title="电子邮箱"
                  description={contactInfo.email}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="传真"
                  description={contactInfo.fax}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="邮编"
                  description={contactInfo.zipCode}
                />
              </List.Item>
            </List>
          </Card>
        </Col>

        <Col span={12}>
          <Card className="card-shadow" title={<><QuestionCircleOutlined /> 办事指南</>} style={{ marginBottom: '20px' }}>
            <List
              dataSource={guides}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Button type="link" style={{ padding: 0 }}>{item.title}</Button>}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow" title={<><DownloadOutlined /> 常用下载</>} style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          {downloads.map((item, idx) => (
            <Col span={8} key={idx}>
              <Card size="small" hoverable style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                      {item.size} | {item.format}
                    </div>
                  </div>
                  <Button type="primary" size="small" icon={<DownloadOutlined />}>
                    下载
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card className="card-shadow" title="各部门联系方式">
        <Table
          dataSource={departments}
          rowKey="name"
          pagination={false}
          columns={[
            { title: '部门名称', dataIndex: 'name', key: 'name', width: '33%' },
            { title: '联系电话', dataIndex: 'phone', key: 'phone', width: '33%' },
            {
              title: '办公地点',
              dataIndex: 'location',
              key: 'location',
              width: '33%',
              render: (text) => <Tag color="blue">{text}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Services;
