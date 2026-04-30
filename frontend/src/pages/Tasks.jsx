import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Switch,
  DatePicker,
  TimePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import { taskApi, sceneApi, deviceApi } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const Tasks = () => {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [scenes, setScenes] = useState([])
  const [devices, setDevices] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [form] = Form.useForm()
  
  const cronPresets = [
    { label: '每天 8:00', value: '0 8 * * *' },
    { label: '每天 12:00', value: '0 12 * * *' },
    { label: '每天 18:00', value: '0 18 * * *' },
    { label: '每天 22:00', value: '0 22 * * *' },
    { label: '每周一 8:00', value: '0 8 * * 1' },
    { label: '每周五 18:00', value: '0 18 * * 5' },
    { label: '工作日 8:00', value: '0 8 * * 1-5' },
    { label: '周末 10:00', value: '0 10 * * 6-0' }
  ]
  
  useEffect(() => {
    fetchTasks()
    fetchScenes()
    fetchDevices()
  }, [pagination.current, pagination.pageSize])
  
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await taskApi.getAll({
        page: pagination.current,
        pageSize: pagination.pageSize
      })
      
      const data = response.data.data
      setTasks(data.tasks || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }))
    } catch (error) {
      console.error('获取定时任务列表失败:', error)
      message.error('获取定时任务列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchScenes = async () => {
    try {
      const response = await sceneApi.getAll({ pageSize: 100 })
      setScenes(response.data.data.scenes || [])
    } catch (error) {
      console.error('获取场景列表失败:', error)
    }
  }
  
  const fetchDevices = async () => {
    try {
      const response = await deviceApi.getAll({ pageSize: 100 })
      setDevices(response.data.data.devices || [])
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }
  
  const handleAdd = () => {
    setCurrentTask(null)
    form.resetFields()
    form.setFieldsValue({ is_enabled: true })
    setModalVisible(true)
  }
  
  const handleEdit = (record) => {
    setCurrentTask(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      cron_expression: record.cron_expression,
      scene_id: record.scene_id,
      device_id: record.device_id,
      target_state: JSON.stringify(record.target_state || {}),
      is_enabled: record.is_enabled
    })
    setModalVisible(true)
  }
  
  const handleDelete = async (id) => {
    try {
      await taskApi.delete(id)
      message.success('删除成功')
      fetchTasks()
    } catch (error) {
      message.error('删除失败')
    }
  }
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (values.target_state) {
        try {
          values.target_state = JSON.parse(values.target_state)
        } catch (e) {
          message.error('目标状态必须是有效的 JSON 格式')
          return
        }
      }
      
      if (currentTask) {
        await taskApi.update(currentTask.id, values)
        message.success('更新成功')
      } else {
        await taskApi.create(values)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchTasks()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }
  
  const toggleTask = async (record) => {
    try {
      await taskApi.toggle(record.id, !record.is_enabled)
      message.success(record.is_enabled ? '已禁用' : '已启用')
      fetchTasks()
    } catch (error) {
      message.error('操作失败')
    }
  }
  
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Cron 表达式',
      dataIndex: 'cron_expression',
      key: 'cron_expression',
      render: (expression) => (
        <Tag>{expression}</Tag>
      )
    },
    {
      title: '触发对象',
      key: 'target',
      render: (_, record) => {
        if (record.Scene) {
          return <span>场景: {record.Scene.name}</span>
        }
        if (record.Device) {
          return <span>设备: {record.Device.name}</span>
        }
        return '-'
      }
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      render: (isEnabled) => (
        <Tag color={isEnabled ? 'green' : 'default'}>
          {isEnabled ? '已启用' : '已禁用'}
        </Tag>
      )
    },
    {
      title: '上次执行',
      key: 'last_run',
      render: (_, record) => (
        record.last_run ? new Date(record.last_run).toLocaleString() : '-'
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => toggleTask(record)}
          >
            {record.is_enabled ? '禁用' : '启用'}
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个定时任务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        定时任务
      </h2>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建定时任务
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={(page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
        />
      </Card>
      
      <Modal
        title={currentTask ? '编辑定时任务' : '创建定时任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          
          <Form.Item name="description" label="任务描述">
            <TextArea rows={2} placeholder="请输入任务描述" />
          </Form.Item>
          
          <Form.Item
            name="cron_expression"
            label="Cron 表达式"
            rules={[{ required: true, message: '请输入 Cron 表达式' }]}
          >
            <Select placeholder="选择预设或手动输入" allowClear>
              {cronPresets.map(preset => (
                <Option key={preset.value} value={preset.value}>
                  {preset.label}
                </Option>
              ))}
            </Select>
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
              格式: 秒 分 时 日 月 周 (例如: 0 8 * * * 表示每天 8:00)
            </div>
          </Form.Item>
          
          <Form.Item label="触发类型">
            <Form.Item
              name="scene_id"
              noStyle
            >
              <Select 
                placeholder="选择场景（可选）" 
                allowClear
                style={{ width: '48%', marginRight: '4%' }}
              >
                {scenes.map(scene => (
                  <Option key={scene.id} value={scene.id}>
                    场景: {scene.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <span style={{ margin: '0 8px' }}>或</span>
            <Form.Item
              name="device_id"
              noStyle
            >
              <Select 
                placeholder="选择设备（可选）" 
                allowClear
                style={{ width: '48%' }}
              >
                {devices.map(device => (
                  <Option key={device.id} value={device.id}>
                    设备: {device.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form.Item>
          
          <Form.Item name="target_state" label="目标状态 (JSON，设备专用)">
            <TextArea rows={3} placeholder='{"isOn": true, "brightness": 80}' />
          </Form.Item>
          
          <Form.Item name="is_enabled" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tasks