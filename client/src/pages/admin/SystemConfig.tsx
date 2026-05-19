import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Upload, Space, Row, Col, Divider } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { uploadApi } from '@/services/api';

interface HospitalConfig {
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  business_hours: string;
  hospital_intro: string;
  hospital_logo?: string;
}

export default function SystemConfig() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    form.setFieldsValue({
      hospital_name: '智慧综合医院',
      hospital_address: '北京市朝阳区健康大道100号',
      hospital_phone: '010-88888888',
      business_hours: '周一至周日 08:00-18:00',
      hospital_intro:
        '智慧综合医院是一家集医疗、教学、科研、预防、保健、康复为一体的现代化综合性医院。医院占地面积5万平方米，建筑面积12万平方米，开放床位800张。设有临床医技科室32个，其中国家重点专科2个，省级重点专科5个。',
    });
  }, [form]);

  const handleSubmit = async (values: HospitalConfig) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('配置保存成功');
    } catch {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadApi.uploadFile(file);
      setLogoUrl(res.url);
      message.success('上传成功');
    } catch {
      message.error('上传失败');
    }
    return false;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">系统配置</h2>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="医院基本信息" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ hospital_name: '智慧综合医院' }}
            >
              <Form.Item
                name="hospital_name"
                label="医院名称"
                rules={[{ required: true, message: '请输入医院名称' }]}
              >
                <Input placeholder="请输入医院名称" />
              </Form.Item>
              <Form.Item
                name="hospital_address"
                label="医院地址"
                rules={[{ required: true, message: '请输入医院地址' }]}
              >
                <Input placeholder="请输入医院地址" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="hospital_phone"
                    label="联系电话"
                    rules={[{ required: true, message: '请输入联系电话' }]}
                  >
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="business_hours"
                    label="营业时间"
                    rules={[{ required: true, message: '请输入营业时间' }]}
                  >
                    <Input placeholder="请输入营业时间" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="hospital_intro" label="医院简介">
                <Input.TextArea rows={4} placeholder="请输入医院简介" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    保存配置
                  </Button>
                  <Button onClick={() => form.resetFields()}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card title="基础收费项目配置">
            <div className="text-gray-500 text-center py-8">
              收费项目配置功能开发中...
              <div className="mt-2 text-sm">
                可配置挂号费、诊疗费、检查费等基础收费项目
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="医院Logo" className="mb-6">
            <div className="text-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-32 h-32 object-contain mx-auto mb-4" />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-4xl">🏥</span>
                </div>
              )}
              <Upload beforeUpload={handleUpload} accept="image/*" showUploadList={false}>
                <Button icon={<UploadOutlined />}>上传Logo</Button>
              </Upload>
            </div>
          </Card>

          <Card title="就诊时段配置">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>上午</span>
                <span className="text-gray-500">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>下午</span>
                <span className="text-gray-500">14:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>夜间急诊</span>
                <span className="text-gray-500">18:00 - 08:00</span>
              </div>
            </div>
            <Divider />
            <Button type="dashed" block className="mt-2">
              + 添加时段
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
