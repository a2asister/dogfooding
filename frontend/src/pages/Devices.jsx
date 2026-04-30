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
  Drawer,
  Descriptions,
  Badge,
  InputNumber,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ControlOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  HomeOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { deviceApi } from '../services/api'
import styled from 'styled-components'

const { Option } = Select
const { TextArea } = Input

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`

const DeviceControlCard = styled(Card)`
  .control-item {
    margin-bottom: 16px;
  }
`

const Devices = () => {
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [controlDrawerVisible, setControlDrawerVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [currentDevice, setCurrentDevice] = useState(null)
  const [form] = Form.useForm()
  const [controlForm] = Form.useForm()
  
  const deviceTypes = [
    { value: 'light', label: '灯光', icon: <BulbOutlined /> },
    { value: 'appliance', label: '家电', icon: <ThunderboltOutlined /> },
    { value: 'window', label: '门窗', icon: <HomeOutlined /> },
    { value: 'door', label: '门锁', icon: <SafetyOutlined /> },
    { value: 'security', label: '安防', icon: <SafetyOutlined /> },
    { value: 'sensor', label: '传感器', icon: <EyeOutlined /> }
  ]
  
  useEffect(() => {
    fetchDevices()
  }, [pagination.current, pagination.pageSize])
  
  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await deviceApi.getAll({
        page: pagination.current,
        pageSize: pagination.pageSize
      })
      
      const data = response.data.data
      setDevices(data.devices || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }))
    } catch (error) {
      console.error('获取设备列表失败:', error)
      message.error('获取设备列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusColor = (status) => {
    const colorMap = {
      online: 'success',
      offline: 'default',
      error: 'error'
    }
    return colorMap[status] || 'default'
  }
  
  const getStatusText = (status) => {
    const textMap = {
      online: '在线',
      offline: '离线',
      error: '异常'
    }
    return textMap[status] || status
  }
  
  const getTypeText = (type) => {
    const typeMap = {
      light: '灯光',
      appliance: '家电',
      window: '门窗',
      door: '门锁',
      security: '安防',
      sensor: '传感器'
    }
    return typeMap[type] || type
  }
  
  const handleAdd = () => {
    setCurrentDevice(null)
    form.resetFields()
    setModalVisible(true)
  }
  
  const handleEdit = (record) => {
    setCurrentDevice(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }
  
  const handleDelete = async (id) => {
    try {
      await deviceApi.delete(id)
      message.success('删除成功')
      fetchDevices()
    } catch (error) {
      message.error('删除失败')
    }
  }
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (currentDevice) {
        await deviceApi.update(currentDevice.id, values)
        message.success('更新成功')
      } else {
        await deviceApi.create(values)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchDevices()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }
  
  const openControlDrawer = (record) => {
    setCurrentDevice(record)
    controlForm.setFieldsValue(record.state || {})
    setControlDrawerVisible(true)
  }
  
  const openDetailDrawer = (record) => {
    setCurrentDevice(record)
    setDetailDrawerVisible(true)
  }
  
  const handleControl = async () => {
    try {
      const values = await controlForm.validateFields()
      await deviceApi.control(currentDevice.id, values)
      message.success('控制成功')
      setControlDrawerVisible(false)
      fetchDevices()
    } catch (error) {
      message.error('控制失败')
    }
  }
  
  const renderControlFields = () => {
    if (!currentDevice) return null
    
    const fields = []
    
    switch (currentDevice.type) {
      case 'light':
        fields.push(
          <Form.Item name="isOn" label="开关" key="isOn" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>,
          <Form.Item name="brightness" label="亮度" key="brightness">
            <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        )
        break
      case 'appliance':
        fields.push(
          <Form.Item name="isOn" label="开关" key="isOn" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>,
          <Form.Item name="mode" label="模式" key="mode">
            <Select placeholder="选择模式">
              <Option value="cool">制冷</Option>
              <Option value="heat">制热</Option>
              <Option value="auto">自动</Option>
              <Option value="dry">除湿</Option>
            </Select>
          </Form.Item>,
          <Form.Item name="temperature" label="温度" key="temperature">
            <InputNumber min={16} max={30} style={{ width: '100%' }} addonAfter="°C" />
          </Form.Item>
        )
        break
      case 'door':
        fields.push(
          <Form.Item name="isLocked" label="锁定" key="isLocked" valuePropName="checked">
            <Switch checkedChildren="已锁" unCheckedChildren="未锁" />
          </Form.Item>
        )
        break
      default:
        fields.push(
          <Form.Item name="isOn" label="开关" key="isOn" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        )
    }
    
    return fields
  }
  
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{getTypeText(type)}</Tag>
    },
    {
      title: '品牌/型号',
      key: 'brand',
      render: (_, record) => (
        <span>{record.brand || '-'} / {record.model || '-'}</span>
      )
    },
    {
      title: '位置',
      key: 'location',
      render: (_, record) => (
        <span>{record.room || '-'} / {record.location || '-'}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
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
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<ControlOutlined />}
            onClick={() => openControlDrawer(record)}
            disabled={record.status === 'offline'}
          >
            控制
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
            title="确定要删除这个设备吗？"
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
        设备管理
      </h2>
      
      <StyledCard>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加设备
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={devices}
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
      </StyledCard>
      
      <Modal
        title={currentDevice ? '编辑设备' : '添加设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="设备类型"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select placeholder="请选择设备类型">
                  {deviceTypes.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.icon} {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="brand" label="品牌">
                <Input placeholder="请输入品牌" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="model" label="型号">
                <Input placeholder="请输入型号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="room" label="房间">
                <Input placeholder="请输入房间" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="location" label="位置">
            <Input placeholder="请输入位置" />
          </Form.Item>
        </Form>
      </Modal>
      
      <Drawer
        title={`设备控制 - ${currentDevice?.name}`}
        placement="right"
        width={400}
        onClose={() => setControlDrawerVisible(false)}
        open={controlDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setControlDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleControl}>
              确认
            </Button>
          </div>
        }
      >
        <Form form={controlForm} layout="vertical">
          {renderControlFields()}
        </Form>
      </Drawer>
      
      <Drawer
        title={`设备详情 - ${currentDevice?.name}`}
        placement="right"
        width={500}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {currentDevice && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="设备名称">{currentDevice.name}</Descriptions.Item>
            <Descriptions.Item label="设备类型">{getTypeText(currentDevice.type)}</Descriptions.Item>
            <Descriptions.Item label="品牌">{currentDevice.brand || '-'}</Descriptions.Item>
            <Descriptions.Item label="型号">{currentDevice.model || '-'}</Descriptions.Item>
            <Descriptions.Item label="房间">{currentDevice.room || '-'}</Descriptions.Item>
            <Descriptions.Item label="位置">{currentDevice.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={getStatusColor(currentDevice.status)} text={getStatusText(currentDevice.status)} />
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <pre>{JSON.stringify(currentDevice.state || {}, null, 2)}</pre>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentDevice.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(currentDevice.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Devices