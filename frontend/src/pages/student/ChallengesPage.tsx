import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Progress, Tag, Modal, Empty, Spin, message } from 'antd';
import { TrophyOutlined, LockOutlined, CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { challengesAPI } from '../../services/api';
import { Challenge } from '../../types';

export const ChallengesPage = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await challengesAPI.getChallenges();
      setChallenges(response.data.challenges);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = (challenge: Challenge) => {
    if (!challenge.isUnlocked) {
      message.warning('请先完成前一关！');
      return;
    }
    setSelectedChallenge(challenge);
  };

  const confirmStart = () => {
    if (selectedChallenge) {
      navigate(`/editor?challengeId=${selectedChallenge.id}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'blue';
      case 'hard':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐ 简单';
      case 'medium':
        return '⭐⭐ 中等';
      case 'hard':
        return '⭐⭐⭐ 困难';
      default:
        return difficulty;
    }
  };

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const totalCount = challenges.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">🎮 闯关练习</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            进度: {completedCount}/{totalCount}
          </span>
          <Progress percent={progress} size="small" className="w-32" />
        </div>
      </div>

      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-700">
              <TrophyOutlined className="mr-2" />
              当前赛季：编程探险之旅
            </h3>
            <p className="text-orange-600 text-sm">
              完成所有关卡，赢取限定勋章！
            </p>
          </div>
          <div className="text-5xl">🏆</div>
        </div>
      </Card>

      <Spin spinning={loading}>
        {challenges.length === 0 && !loading ? (
          <Empty description="暂无闯关题目" />
        ) : (
          <Row gutter={[16, 16]}>
            {challenges.map((challenge, index) => (
              <Col xs={24} sm={12} lg={8} key={challenge.id}>
                <Card
                  hoverable={challenge.isUnlocked}
                  className={`h-full shadow-sm hover:shadow-md transition-shadow ${
                    !challenge.isUnlocked ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleStartChallenge(challenge)}
                  cover={
                    <div
                      className="h-32 flex items-center justify-center relative"
                      style={{
                        background: challenge.isCompleted
                          ? 'linear-gradient(135deg, #d1fae5, #6ee7b7)'
                          : challenge.isUnlocked
                          ? 'linear-gradient(135deg, #dbeafe, #93c5fd)'
                          : 'linear-gradient(135deg, #f3f4f6, #d1d5db)',
                      }}
                    >
                      <div className="text-5xl">
                        {challenge.isCompleted ? '✅' : challenge.isUnlocked ? '🎯' : '🔒'}
                      </div>
                      <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-sm font-bold">
                        第 {index + 1} 关
                      </div>
                      {challenge.isCompleted && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          {challenge.score}分
                        </div>
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{challenge.title}</span>
                        {challenge.isCompleted && <CheckCircleOutlined className="text-green-500" />}
                      </div>
                    }
                    description={
                      <div className="mt-2">
                        <Tag color={getDifficultyColor(challenge.difficulty)}>
                          {getDifficultyText(challenge.difficulty)}
                        </Tag>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                    }
                  />
                  <div className="mt-4">
                    <Button
                      type="primary"
                      block
                      disabled={!challenge.isUnlocked}
                      icon={challenge.isUnlocked ? <PlayCircleOutlined /> : <LockOutlined />}
                    >
                      {challenge.isCompleted
                        ? '再次挑战'
                        : challenge.isUnlocked
                        ? '开始挑战'
                        : '未解锁'}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <Modal
        title={selectedChallenge?.title}
        open={!!selectedChallenge}
        onOk={confirmStart}
        onCancel={() => setSelectedChallenge(null)}
        okText="开始挑战"
        cancelText="取消"
      >
        <div className="space-y-4">
          <Tag color={selectedChallenge ? getDifficultyColor(selectedChallenge.difficulty) : 'default'}>
            {selectedChallenge ? getDifficultyText(selectedChallenge.difficulty) : ''}
          </Tag>
          <p>{selectedChallenge?.description}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🎯 任务目标</h4>
            <p className="text-sm text-gray-600">{selectedChallenge?.taskDescription}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 提示</h4>
            <p className="text-sm text-blue-600">{selectedChallenge?.hints}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChallengesPage;
