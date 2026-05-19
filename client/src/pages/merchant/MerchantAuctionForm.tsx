import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, message, Row, Col, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { merchantApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const categories = [
  { value: 'art', label: '艺术品' },
  { value: 'jewelry', label: '珠宝首饰' },
  { value: 'collectibles', label: '收藏品' },
  { value: 'electronics', label: '电子产品' },
  { value: 'furniture', label: '家具' },
  { value: 'other', label: '其他' }
];

function MerchantAuctionForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadAuctionDetail();
    }
  }, [id]);

  const loadAuctionDetail = async (): Promise<void> => {
    try {
      const res = await merchantApi.getAuctions() as unknown as { items: Array<{ id: number; title: string; description: string; images: string; category: string; startPrice: number; minIncrement: number; reservePrice?: number; startTime: string; endTime: string }> };
      const auction = res.items.find(item => item.id === Number(id));
      if (auction) {
        form.setFieldsValue({
          ...auction,
          timeRange: [dayjs(auction.startTime), dayjs(auction.endTime)]
        });
      }
    } catch {
      // Error handled
    }
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    images: string;
    category: string;
    startPrice: number;
    minIncrement: number;
    reservePrice?: number;
    timeRange: [dayjs.Dayjs, dayjs.Dayjs];
  }): Promise<void> => {
    setLoading(true);
    try {
      const data: {
        title: string;
        description: string;
        images: string;
        category: string;
        startPrice: number;
        minIncrement: number;
        reservePrice?: number;
        startTime: string;
        endTime: string;
      } = {
        title: values.title,
        description: values.description,
        images: values.images,
        category: values.category,
        startPrice: values.startPrice,
        minIncrement: values.minIncrement,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString()
      };
      if (values.reservePrice !== undefined) {
        data.reservePrice = values.reservePrice;
      }

      if (isEdit) {
        await merchantApi.updateAuction(Number(id), data);
        message.success('修改成功');
      } else {
        await merchantApi.createAuction(data);
        message.success('发布成功，等待审核');
      }
      navigate('/merchant/auctions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">{isEdit ? '编辑商品' : '发布拍卖商品'}</h2>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="title"
            label="商品标题"
            rules={[
              { required: true, message: '请输入商品标题' },
              { min: 5, max: 100, message: '标题长度5-100个字符' }
            ]}
          >
            <Input placeholder="请输入商品标题" size="large" />
          </Form.Item>

          <Form.Item
            name="category"
            label="商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select placeholder="请选择分类" size="large">
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[
              { required: true, message: '请输入商品描述' },
              { min: 10, message: '描述至少10个字符' }
            ]}
          >
            <TextArea rows={6} placeholder="请详细描述商品信息..." />
          </Form.Item>

          <Form.Item
            name="images"
            label="商品图片"
            rules={[{ required: true, message: '请输入商品图片链接' }]}
            extra="多张图片请用逗号分隔"
          >
            <Input placeholder="例如: https://example.com/img1.jpg,https://example.com/img2.jpg" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="startPrice"
                label="起拍价(元)"
                rules={[
                  { required: true, message: '请输入起拍价' },
                  { type: 'number', min: 0.01, message: '起拍价必须大于0' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0.01} step={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minIncrement"
                label="加价幅度(元)"
                rules={[
                  { required: true, message: '请输入加价幅度' },
                  { type: 'number', min: 1, message: '加价幅度至少1元' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} step={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reservePrice"
                label="保留价(元)"
                extra="可选，未达此价格流拍"
              >
                <InputNumber style={{ width: '100%' }} min={0} step={100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="timeRange"
            label="拍卖时间"
            rules={[{ required: true, message: '请选择拍卖时间范围' }]}
          >
            <RangePicker
              showTime
              style={{ width: '100%' }}
              size="large"
              minDate={dayjs()}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" loading={loading}>
                {isEdit ? '保存修改' : '提交审核'}
              </Button>
              <Button size="large" onClick={() => navigate('/merchant/auctions')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default MerchantAuctionForm;
