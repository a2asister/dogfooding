import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, Button, Space, Switch, Tabs, message, Row, Col } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined } from '@ant-design/icons'
import Mock from 'mockjs'
import { apiApi, projectApi } from '@/services'
import type { Api, Project } from '@/types'
import { ApiMethod } from '@/types'

export default function ApiEditor() {
  const { id, apiId } = useParams<{ id: string; apiId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [, setApi] = useState<Api | null>(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [mockPreview, setMockPreview] = useState<string>('')
  const projectId = Number(id)
  const isEdit = !!apiId

  useEffect(() => {
    loadProject()
    if (isEdit) {
      loadApi()
    } else {
      form.setFieldsValue({
        method: ApiMethod.GET,
        mockEnabled: 1,
        status: 'draft'
      })
    }
  }, [apiId, projectId])

  useEffect(() => {
    const mockData = form.getFieldValue('mockData')
    if (mockData) {
      try {
        const template = JSON.parse(mockData)
        const result = Mock.mock(template)
        setMockPreview(JSON.stringify(result, null, 2))
      } catch {
        setMockPreview('Mock 数据格式错误')
      }
    } else {
      setMockPreview('')
    }
  }, [form.getFieldsValue(['mockData']).mockData])

  const loadProject = async () => {
    try {
      const res = await projectApi.getDetail(projectId)
      setProject(res.data.data)
    } catch {
      // ignore
    }
  }

  const loadApi = async () => {
    setLoading(true)
    try {
      const res = await apiApi.getDetail(Number(apiId))
      const data = res.data.data as any
      setApi(res.data.data)
      form.setFieldsValue({
        ...data,
        requestHeaders: data.request_headers,
        requestParams: data.request_params,
        requestBody: data.request_body,
        responseBody: data.response_body,
        mockEnabled: data.mock_enabled === 1,
        mockData: data.mock_data
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        mockEnabled: values.mockEnabled ? 1 : 0
      }
      if (isEdit) {
        await apiApi.update(Number(apiId), submitData)
        message.success('更新成功')
      } else {
        await apiApi.create({ ...submitData, projectId })
        message.success('创建成功')
      }
      navigate(`/projects/${projectId}/apis`)
    } catch {
      // error handled
    }
  }

  const handleTestMock = () => {
    const mockData = form.getFieldValue('mockData')
    if (mockData) {
      try {
        const template = JSON.parse(mockData)
        const result = Mock.mock(template)
        setMockPreview(JSON.stringify(result, null, 2))
        message.success('Mock 数据生成成功')
      } catch (e) {
        message.error('Mock 数据格式错误')
      }
    }
  }

  const methodOptions = Object.values(ApiMethod).map((m) => (
    <Select.Option key={m} value={m}>{m}</Select.Option>
  ))

  const tabItems = [
    {
      key: 'request',
      label: '请求定义',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="method" label="请求方法" rules={[{ required: true }]}>
                <Select>{methodOptions}</Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="path" label="请求路径" rules={[{ required: true }]}>
                <Input placeholder="/api/v1/users" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="requestHeaders" label="请求头 (JSON)">
            <Input.TextArea rows={4} placeholder='{"Content-Type": "application/json"}' />
          </Form.Item>
          <Form.Item name="requestParams" label="URL 参数 (JSON)">
            <Input.TextArea rows={4} placeholder='{"page": 1, "pageSize": 20}' />
          </Form.Item>
          <Form.Item name="requestBody" label="请求体 (JSON)">
            <Input.TextArea rows={6} placeholder='{"name": "test", "age": 18}' />
          </Form.Item>
        </Space>
      )
    },
    {
      key: 'response',
      label: '响应定义',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Form.Item name="responseBody" label="响应示例 (JSON)">
            <Input.TextArea rows={8} placeholder='{"code": 0, "message": "success", "data": {}}' />
          </Form.Item>
        </Space>
      )
    },
    {
      key: 'mock',
      label: 'Mock 配置',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mockEnabled" label="开启 Mock" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Select.Option value="draft">草稿</Select.Option>
                  <Select.Option value="published">已发布</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="mockData" label="Mock 数据模板 (JSON)">
            <Input.TextArea
              rows={10}
              placeholder={`{
  "code": 0,
  "message": "success",
  "data": {
    "id|+1": 1,
    "name": "@name",
    "email": "@email",
    "createdAt": "@datetime"
  }
}`}
            />
          </Form.Item>
          <Space>
            <Button icon={<PlayCircleOutlined />} onClick={handleTestMock}>
              预览 Mock 结果
            </Button>
          </Space>
          {mockPreview && (
            <Card title="Mock 预览结果" size="small">
              <pre style={{ margin: 0, maxHeight: 300, overflow: 'auto' }}>{mockPreview}</pre>
            </Card>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}/apis`)}>
            返回
          </Button>
          <h2 className="page-title">{isEdit ? '编辑接口' : '新建接口'} - {project?.name}</h2>
        </Space>
        <Space>
          <Button onClick={() => navigate(`/projects/${projectId}/apis`)}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={loading}>
            保存
          </Button>
        </Space>
      </div>

      <Card loading={loading}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="接口名称" rules={[{ required: true, message: '请输入接口名称' }]}>
            <Input placeholder="获取用户列表" />
          </Form.Item>
          <Form.Item name="description" label="接口描述">
            <Input.TextArea rows={2} placeholder="接口的详细说明..." />
          </Form.Item>
          <Tabs defaultActiveKey="request" items={tabItems} />
        </Form>
      </Card>
    </div>
  )
}
