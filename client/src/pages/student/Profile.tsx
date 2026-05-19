import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Row, Col, List, Tag, Timeline, Avatar } from 'antd';
import { UserOutlined, TrophyOutlined, BookOutlined, WarningOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('加载学籍信息失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><UserOutlined /> 学籍信息</>}
        style={{ marginBottom: '20px' }}
        loading={loading}
      >
        <Row gutter={24}>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: '15px' }} />
            <div style={{ fontSize: '20px', fontWeight: '600' }}>{profile?.user?.name}</div>
            <div style={{ color: '#999', marginTop: '5px' }}>{profile?.user?.studentId}</div>
            <Tag color="blue" style={{ marginTop: '10px' }}>
              {profile?.user?.role === 'student' ? '在校学生' : profile?.user?.role}
            </Tag>
          </Col>
          <Col span={20}>
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="姓名">{profile?.user?.name}</Descriptions.Item>
              <Descriptions.Item label="学号">{profile?.user?.studentId}</Descriptions.Item>
              <Descriptions.Item label="性别">{profile?.user?.gender}</Descriptions.Item>
              <Descriptions.Item label="出生日期">{profile?.user?.birthDate}</Descriptions.Item>
              <Descriptions.Item label="学院">{profile?.user?.department}</Descriptions.Item>
              <Descriptions.Item label="专业">{profile?.user?.major}</Descriptions.Item>
              <Descriptions.Item label="班级">{profile?.user?.class}</Descriptions.Item>
              <Descriptions.Item label="入学日期">{profile?.user?.enrollmentDate}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{profile?.user?.phone}</Descriptions.Item>
              <Descriptions.Item label="电子邮箱">{profile?.user?.email}</Descriptions.Item>
              <Descriptions.Item label="学籍状态" span={2}>
                <Tag color="green">在籍</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            className="card-shadow"
            title={<><TrophyOutlined /> 奖惩记录</>}
            style={{ marginBottom: '20px' }}
          >
            {profile?.awards?.length > 0 ? (
              <Timeline
                items={profile.awards.map((award: any) => ({
                  color: award.type === 'scholarship' ? 'gold' : 'green',
                  children: (
                    <div>
                      <div style={{ fontWeight: '500' }}>{award.name}</div>
                      <div style={{ color: '#999', fontSize: '13px' }}>{award.year} 学年</div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                暂无奖励记录
              </div>
            )}
            {profile?.punishments?.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#f5222d' }}><WarningOutlined /> 处分记录</h4>
                <List
                  dataSource={profile.punishments}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={`${item.date} | ${item.reason}`}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            className="card-shadow"
            title={<><BookOutlined /> 培养方案</>}
            style={{ marginBottom: '20px' }}
          >
            {profile?.trainingPlan?.map((plan: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500' }}>{plan.semester}</span>
                  <Tag color="blue">{plan.totalCredits} 学分</Tag>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {plan.courses.map((course: string, cIdx: number) => (
                    <Tag key={cIdx}>{course}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
