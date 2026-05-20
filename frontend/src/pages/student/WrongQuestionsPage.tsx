import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Empty, Spin, Modal, message } from 'antd';
import { DeleteOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { wrongQuestionsAPI } from '../../services/api';
import { WrongQuestion } from '../../types';

export const WrongQuestionsPage = () => {
  const navigate = useNavigate();
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    try {
      const response = await wrongQuestionsAPI.getWrongQuestions();
      setWrongQuestions(response.data.wrongQuestions);
    } catch (err) {
      console.error('Failed to load wrong questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '移除错题',
      content: '确定要从错题本中移除这道题吗？',
      onOk: async () => {
        try {
          await wrongQuestionsAPI.removeWrongQuestion(id);
          message.success('已移除');
          loadWrongQuestions();
        } catch (err) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleReview = (question: WrongQuestion) => {
    if (question.type === 'challenge') {
      navigate(`/editor?challengeId=${question.challengeId}`);
    } else if (question.type === 'homework') {
      navigate(`/editor?homeworkId=${question.homeworkId}`);
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'challenge':
        return '闯关练习';
      case 'homework':
        return '课后作业';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'challenge':
        return 'orange';
      case 'homework':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📝 错题本</h2>
        <Tag color="red">共 {wrongQuestions.length} 道错题</Tag>
      </div>

      <Card className="shadow-sm">
        <Spin spinning={loading}>
          {wrongQuestions.length === 0 && !loading ? (
            <Empty
              description="太棒了！还没有错题，继续保持！"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/challenges')}>
                去练习
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={wrongQuestions}
              renderItem={(item) => (
                <List.Item
                  className="hover:bg-gray-50 rounded-lg px-3 -mx-3"
                  actions={[
                    <Button
                      key="review"
                      type="link"
                      icon={<BookOutlined />}
                      onClick={() => handleReview(item)}
                    >
                      重做
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    >
                      移除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        <Tag color={getTypeColor(item.type)}>{getTypeText(item.type)}</Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>
                            📚 所属课程：{item.courseTitle || '未知课程'}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.wrongAnswer && (
                          <div className="bg-red-50 p-2 rounded text-sm text-red-600">
                            ❌ 错误答案：{item.wrongAnswer}
                          </div>
                        )}
                        {item.correctAnswer && (
                          <div className="bg-green-50 p-2 rounded text-sm text-green-600">
                            ✅ 正确答案：{item.correctAnswer}
                          </div>
                        )}
                        {item.explanation && (
                          <div className="bg-blue-50 p-2 rounded text-sm text-blue-600">
                            💡 解析：{item.explanation}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default WrongQuestionsPage;
