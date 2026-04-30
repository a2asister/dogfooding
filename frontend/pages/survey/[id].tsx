import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Layout, message, Form, Input, Select, Checkbox, List, Modal } from 'antd';
import { useRouter } from 'next/router';
import { useParams } from 'next/navigation';
import axios from 'axios';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { Option } = Select;
const { TextArea } = Input;

interface Question {
  id: number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: Option[];
}

interface Option {
  id: number;
  text: string;
  order: number;
}

export default function SurveyEdit() {
  const params = useParams();
  const id = params?.id as string;
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [questionForm] = Form.useForm();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.API_URL}/surveys/${id}`);
      setSurvey(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      message.error('获取问卷信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSurvey = async () => {
    try {
      await axios.put(`${process.env.API_URL}/surveys/${id}`, {
        ...survey,
        questions,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      message.success('问卷保存成功');
    } catch (error) {
      message.error('问卷保存失败');
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    questionForm.resetFields();
    setQuestionModalVisible(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    questionForm.setFieldsValue(question);
    setQuestionModalVisible(true);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSaveQuestion = async (values: any) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? { ...q, ...values } : q
      ));
    } else {
      const newQuestion = {
        ...values,
        id: Date.now(),
        order: questions.length,
        options: values.type === 'multiple_choice' || values.type === 'single_choice' ? [] : undefined,
      };
      setQuestions([...questions, newQuestion]);
    }
    setQuestionModalVisible(false);
  };

  const handleAddOption = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOption = {
          id: Date.now(),
          text: '',
          order: q.options.length,
        };
        return { ...q, options: [...q.options, newOption] };
      }
      return q;
    }));
  };

  const handleUpdateOption = (questionId: number, optionId: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, text } : o
          ),
        };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId: number, optionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== optionId),
        };
      }
      return q;
    }));
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#f0f2f5' }}>
        <div style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold' }}>调查问卷系统</div>
        <div style={{ padding: '20px' }}>
          <Button type="primary" block onClick={handleSaveSurvey}>
            保存问卷
          </Button>
        </div>
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
            <Button type="primary" onClick={handleAddQuestion}>
              添加问题
            </Button>
          </div>
          <List
            style={{ marginTop: 20 }}
            dataSource={questions}
            renderItem={(question, index) => (
              <Card style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>问题 {index + 1}:</Text>
                    <Text style={{ marginLeft: 10 }}>{question.text}</Text>
                    <Checkbox
                      checked={question.required}
                      onChange={(e) => {
                        setQuestions(questions.map(q => 
                          q.id === question.id ? { ...q, required: e.target.checked } : q
                        ));
                      }}
                      style={{ marginLeft: 10 }}
                    >
                      必答
                    </Checkbox>
                  </div>
                  <div>
                    <Button style={{ marginRight: 10 }} onClick={() => handleEditQuestion(question)}>
                      编辑
                    </Button>
                    <Button danger onClick={() => handleDeleteQuestion(question.id)}>
                      删除
                    </Button>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Text>题型: {question.type}</Text>
                </div>
                {question.options && (
                  <div style={{ marginTop: 10 }}>
                    <Text>选项:</Text>
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
                        <Input
                          value={option.text}
                          onChange={(e) => handleUpdateOption(question.id, option.id, e.target.value)}
                          style={{ width: 300, marginRight: 10 }}
                        />
                        <Button danger onClick={() => handleDeleteOption(question.id, option.id)}>
                          删除
                        </Button>
                      </div>
                    ))}
                    <Button style={{ marginTop: 10 }} onClick={() => handleAddOption(question.id)}>
                      添加选项
                    </Button>
                  </div>
                )}
              </Card>
            )}
          />
        </Content>
      </Layout>

      <Modal
        title={editingQuestion ? "编辑问题" : "添加问题"}
        open={questionModalVisible}
        onCancel={() => setQuestionModalVisible(false)}
        footer={null}
      >
        <Form form={questionForm} onFinish={handleSaveQuestion}>
          <Form.Item
            name="text"
            rules={[{ required: true, message: '请输入问题文本' }]}
          >
            <Input placeholder="问题文本" />
          </Form.Item>
          <Form.Item
            name="type"
            rules={[{ required: true, message: '请选择题型' }]}
          >
            <Select placeholder="选择题型">
              <Option value="single_choice">单选题</Option>
              <Option value="multiple_choice">多选题</Option>
              <Option value="text">填空题</Option>
              <Option value="rating">评分题</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="required"
            initialValue={false}
          >
            <Checkbox>必答</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}