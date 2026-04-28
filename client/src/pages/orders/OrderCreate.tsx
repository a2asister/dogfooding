import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Switch, 
  Button, 
  Card, 
  Row, 
  Col, 
  Steps,
  message,
  Divider
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { orderApi } from '../../services/api';
import { PackageType, PaymentMethod } from '../../types';
import type { CreateOrderRequest } from '../../types';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: '寄件人信息' },
    { title: '收件人信息' },
    { title: '包裹信息' },
    { title: '确认提交' }
  ];

  const packageTypeOptions: { value: PackageType; label: string }[] = [
    { value: PackageType.DOCUMENT, label: '文件' },
    { value: PackageType.PARCEL, label: '包裹' },
    { value: PackageType.FRAGILE, label: '易碎品' },
    { value: PackageType.LIQUID, label: '液体' },
    { value: PackageType.OTHER, label: '其他' }
  ];

  const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
    { value: PaymentMethod.ONLINE, label: '在线支付' },
    { value: PaymentMethod.COD, label: '货到付款' },
    { value: PaymentMethod.PREPAID, label: '寄付' },
    { value: PaymentMethod.MONTHLY, label: '月结' }
  ];

  const serviceTypeOptions = [
    { value: 'standard', label: '标准快递' },
    { value: 'express', label: '特快专递' },
    { value: 'same_day', label: '当日达' },
    { value: 'overnight', label: '次日达' },
    { value: 'economy', label: '经济快递' }
  ];

  const handleNext = async () => {
    try {
      const fieldsToValidate = getFieldsToValidate(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsToValidate = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['senderName', 'senderPhone', 'senderProvince', 'senderCity', 'senderDistrict', 'senderAddress'];
      case 1:
        return ['receiverName', 'receiverPhone', 'receiverProvince', 'receiverCity', 'receiverDistrict', 'receiverAddress'];
      case 2:
        return ['packageName', 'packageCount'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const orderData: CreateOrderRequest = {
        senderName: values.senderName,
        senderPhone: values.senderPhone,
        senderProvince: values.senderProvince,
        senderCity: values.senderCity,
        senderDistrict: values.senderDistrict,
        senderAddress: values.senderAddress,
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        receiverProvince: values.receiverProvince,
        receiverCity: values.receiverCity,
        receiverDistrict: values.receiverDistrict,
        receiverAddress: values.receiverAddress,
        packageName: values.packageName,
        packageType: values.packageType,
        packageCount: values.packageCount,
        packageWeight: values.packageWeight,
        packageLength: values.packageLength,
        packageWidth: values.packageWidth,
        packageHeight: values.packageHeight,
        declaredValue: values.declaredValue,
        isInsured: values.isInsured,
        serviceType: values.serviceType,
        paymentMethod: values.paymentMethod,
        remark: values.remark
      };

      const result = await orderApi.create(orderData);

      if (result.success) {
        message.success('订单创建成功');
        navigate('/orders');
      } else {
        message.error(result.message || '订单创建失败');
      }
    } catch (error: any) {
      message.error(error.message || '订单创建失败');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="寄件人信息">
            <Form.Item
              name="senderName"
              label="寄件人姓名"
              rules={[{ required: true, message: '请输入寄件人姓名' }]}
            >
              <Input placeholder="请输入寄件人姓名" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="senderPhone"
                  label="联系电话"
                  rules={[
                    { required: true, message: '请输入联系电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="senderEmail"
                  label="电子邮箱"
                  rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
                >
                  <Input placeholder="请输入电子邮箱（选填）" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="senderProvince"
                  label="省份"
                  rules={[{ required: true, message: '请选择省份' }]}
                >
                  <Select placeholder="请选择省份">
                    <Option value="北京市">北京市</Option>
                    <Option value="上海市">上海市</Option>
                    <Option value="广东省">广东省</Option>
                    <Option value="浙江省">浙江省</Option>
                    <Option value="江苏省">江苏省</Option>
                    <Option value="山东省">山东省</Option>
                    <Option value="河南省">河南省</Option>
                    <Option value="四川省">四川省</Option>
                    <Option value="湖北省">湖北省</Option>
                    <Option value="湖南省">湖南省</Option>
                    <Option value="福建省">福建省</Option>
                    <Option value="陕西省">陕西省</Option>
                    <Option value="辽宁省">辽宁省</Option>
                    <Option value="重庆市">重庆市</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="senderCity"
                  label="城市"
                  rules={[{ required: true, message: '请选择城市' }]}
                >
                  <Input placeholder="请输入城市" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="senderDistrict"
                  label="区县"
                  rules={[{ required: true, message: '请输入区县' }]}
                >
                  <Input placeholder="请输入区县" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="senderAddress"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <TextArea rows={3} placeholder="请输入详细地址" />
            </Form.Item>
          </Card>
        );
      case 1:
        return (
          <Card title="收件人信息">
            <Form.Item
              name="receiverName"
              label="收件人姓名"
              rules={[{ required: true, message: '请输入收件人姓名' }]}
            >
              <Input placeholder="请输入收件人姓名" />
            </Form.Item>
            <Form.Item
              name="receiverPhone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="receiverProvince"
                  label="省份"
                  rules={[{ required: true, message: '请选择省份' }]}
                >
                  <Select placeholder="请选择省份">
                    <Option value="北京市">北京市</Option>
                    <Option value="上海市">上海市</Option>
                    <Option value="广东省">广东省</Option>
                    <Option value="浙江省">浙江省</Option>
                    <Option value="江苏省">江苏省</Option>
                    <Option value="山东省">山东省</Option>
                    <Option value="河南省">河南省</Option>
                    <Option value="四川省">四川省</Option>
                    <Option value="湖北省">湖北省</Option>
                    <Option value="湖南省">湖南省</Option>
                    <Option value="福建省">福建省</Option>
                    <Option value="陕西省">陕西省</Option>
                    <Option value="辽宁省">辽宁省</Option>
                    <Option value="重庆市">重庆市</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="receiverCity"
                  label="城市"
                  rules={[{ required: true, message: '请输入城市' }]}
                >
                  <Input placeholder="请输入城市" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="receiverDistrict"
                  label="区县"
                  rules={[{ required: true, message: '请输入区县' }]}
                >
                  <Input placeholder="请输入区县" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="receiverAddress"
              label="详细地址"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <TextArea rows={3} placeholder="请输入详细地址" />
            </Form.Item>
          </Card>
        );
      case 2:
        return (
          <Card title="包裹信息">
            <Form.Item
              name="packageName"
              label="物品名称"
              rules={[{ required: true, message: '请输入物品名称' }]}
            >
              <Input placeholder="请输入物品名称" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="packageType"
                  label="物品类型"
                  initialValue="parcel"
                >
                  <Select placeholder="请选择物品类型">
                    {packageTypeOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="packageCount"
                  label="件数"
                  initialValue={1}
                  rules={[{ required: true, message: '请输入件数' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入件数" />
                </Form.Item>
              </Col>
            </Row>
            <Divider>重量与尺寸（选填）</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="packageWeight"
                  label="重量（kg）"
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入重量" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="packageLength"
                  label="长度（cm）"
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入长度" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="packageWidth"
                  label="宽度（cm）"
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入宽度" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="packageHeight"
                  label="高度（cm）"
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入高度" />
                </Form.Item>
              </Col>
            </Row>
            <Divider>增值服务（选填）</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isInsured"
                  label="保价服务"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="declaredValue"
                  label="保价金额（元）"
                  dependencies={['isInsured']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('isInsured') && !value) {
                          return Promise.reject(new Error('请输入保价金额'));
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入保价金额" />
                </Form.Item>
              </Col>
            </Row>
            <Divider>服务选项</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="serviceType"
                  label="服务类型"
                  initialValue="standard"
                >
                  <Select placeholder="请选择服务类型">
                    {serviceTypeOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="支付方式"
                  initialValue="online"
                >
                  <Select placeholder="请选择支付方式">
                    {paymentMethodOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea rows={3} placeholder="请输入备注信息（选填）" />
            </Form.Item>
          </Card>
        );
      case 3:
        return (
          <Card title="订单确认">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="寄件人信息" size="small">
                  <p><strong>姓名：</strong>{form.getFieldValue('senderName')}</p>
                  <p><strong>电话：</strong>{form.getFieldValue('senderPhone')}</p>
                  <p><strong>地址：</strong>
                    {form.getFieldValue('senderProvince')} 
                    {form.getFieldValue('senderCity')} 
                    {form.getFieldValue('senderDistrict')} 
                    {form.getFieldValue('senderAddress')}
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="收件人信息" size="small">
                  <p><strong>姓名：</strong>{form.getFieldValue('receiverName')}</p>
                  <p><strong>电话：</strong>{form.getFieldValue('receiverPhone')}</p>
                  <p><strong>地址：</strong>
                    {form.getFieldValue('receiverProvince')} 
                    {form.getFieldValue('receiverCity')} 
                    {form.getFieldValue('receiverDistrict')} 
                    {form.getFieldValue('receiverAddress')}
                  </p>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Card title="包裹信息" size="small" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <p><strong>物品名称：</strong>{form.getFieldValue('packageName')}</p>
                </Col>
                <Col span={6}>
                  <p><strong>物品类型：</strong>
                    {packageTypeOptions.find(o => o.value === form.getFieldValue('packageType'))?.label}
                  </p>
                </Col>
                <Col span={6}>
                  <p><strong>件数：</strong>{form.getFieldValue('packageCount')} 件</p>
                </Col>
                <Col span={6}>
                  <p><strong>服务类型：</strong>
                    {serviceTypeOptions.find(o => o.value === form.getFieldValue('serviceType'))?.label}
                  </p>
                </Col>
              </Row>
              {form.getFieldValue('packageWeight') && (
                <Row gutter={16}>
                  <Col span={6}>
                    <p><strong>重量：</strong>{form.getFieldValue('packageWeight')} kg</p>
                  </Col>
                </Row>
              )}
            </Card>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/orders')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>新建订单</h2>
      </div>

      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          packageType: 'parcel',
          packageCount: 1,
          isInsured: false,
          serviceType: 'standard',
          paymentMethod: 'online'
        }}
      >
        {renderStepContent()}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrev} style={{ marginRight: 8 }}>
              上一步
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" loading={loading} onClick={handleSubmit} icon={<SaveOutlined />}>
              提交订单
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default OrderCreate;
