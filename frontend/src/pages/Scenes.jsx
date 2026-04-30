import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Empty,
  Space,
  Tag,
  List,
  Switch
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons'
import { sceneApi, deviceApi } from '../services/api'
import styled from 'styled-components'

const { Option } = Select
const { TextArea } = Input

const SceneCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .scene-icon {
    font-size: 48px;
    color: #1890ff;
    text-align: center;
    margin-bottom: 16px;
  }
`

const Scenes = () => {
  const [loading, setLoading] = useState(false)
  const [scenes, setScenes] = useState([])
  const [devices, setDevices] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [currentScene, setCurrentScene] = useState(null)
  const [form] = Form.useForm()
  
  const iconOptions = [
    'home', 'away', 'moon', 'tv', 'sun', 'coffee', 'workout', 'reading'
  ]
  
  useEffect(() => {
    fetchScenes()
    fetchDevices()
  }, [])
  
  const fetchScenes = async () => {
    try {
      setLoading(true)
      const response = await sceneApi.getAll({ pageSize: 100 })
      setScenes(response.data.data.scenes || [])
    } catch (error) {
      console.error('获取场景列表失败:', error)
      message.error('获取场景列表失败')
    } finally {
      setLoading(false)
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
    setCurrentScene(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true, devices: [] })
    setModalVisible(true)
  }
  
  const handleEdit = (record) => {
    setCurrentScene(record)
    
    const sceneDevices = record.Devices?.map(device => ({
      device_id: device.id,
      target_state: device.SceneDevice?.target_state || {}
    })) || []
    
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      icon: record.icon,
      is_active: record.is_active,
      devices: sceneDevices
    })
    setModalVisible(true)
  }
  
  const handleDelete = async (id) => {
    try {
      await sceneApi.delete(id)
      message.success('删除成功')
      fetchScenes()
    } catch (error) {
      message.error('删除失败')
    }
  }
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (values.devices && values.devices.length > 0) {
        values.devices = values.devices.map(device => {
          if (device.target_state && typeof device.target_state === 'string') {
            try {
              return {
                ...device,
                target_state: JSON.parse(device.target_state)
              }
            } catch (e) {
              message.error(`设备 ${device.device_id} 的目标状态 JSON 格式错误`)
              throw e
            }
          }
          return device
        })
      }
      
      if (currentScene) {
        await sceneApi.update(currentScene.id, values)
        message.success('更新成功')
      } else {
        await sceneApi.create(values)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchScenes()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }
  
  const executeScene = async (scene) => {
    try {
      message.loading({ content: '正在执行场景...', key: 'execute' })
      await sceneApi.execute(scene.id)
      message.success({ content: `场景 "${scene.name}" 执行成功`, key: 'execute' })
    } catch (error) {
      message.error({ content: '场景执行失败', key: 'execute' })
    }
  }
  
  const getIconComponent = (iconName) => {
    return <AppstoreOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
  }
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        场景管理
      </h2>
      
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          创建场景
        </Button>
      </div>
      
      {scenes.length === 0 ? (
        <Empty description="暂无场景，点击上方按钮创建第一个场景" />
      ) : (
        <Row gutter={[16, 16]}>
          {scenes.map(scene => (
            <Col xs={24} sm={12} lg={8} xl={6} key={scene.id}>
              <SceneCard
                hoverable
                cover={
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    {getIconComponent(scene.icon)}
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 500,
                      marginTop: '8px'
                    }}>
                      {scene.name}
                    </div>
                    <div style={{ color: '#8c8c8c', marginTop: '4px' }}>
                      {scene.is_active ? (
                        <Tag color="green">已启用</Tag>
                      ) : (
                        <Tag color="default">已禁用</Tag>
                      )}
                    </div>
                  </div>
                }
                actions={[
                  <PlayCircleOutlined 
                    key="execute" 
                    title="执行场景"
                    onClick={() => executeScene(scene)}
                  />,
                  <EditOutlined 
                    key="edit" 
                    title="编辑"
                    onClick={() => handleEdit(scene)}
                  />,
                  <Popconfirm
                    title="确定要删除这个场景吗？"
                    onConfirm={() => handleDelete(scene.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <DeleteOutlined key="delete" title="删除" />
                  </Popconfirm>
                ]}
              >
                <Card.Meta description={scene.description || '暂无描述'} />
                {scene.Devices && scene.Devices.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                      关联设备 ({scene.Devices.length}):
                    </div>
                    <Space size={[4, 4]} wrap>
                      {scene.Devices.slice(0, 3).map(device => (
                        <Tag key={device.id} size="small">
                          {device.name}
                        </Tag>
                      ))}
                      {scene.Devices.length > 3 && (
                        <Tag size="small">+{scene.Devices.length - 3}</Tag>
                      )}
                    </Space>
                  </div>
                )}
              </SceneCard>
            </Col>
          ))}
        </Row>
      )}
      
      <Modal
        title={currentScene ? '编辑场景' : '创建场景'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="场景名称"
            rules={[{ required: true, message: '请输入场景名称' }]}
          >
            <Input placeholder="请输入场景名称" />
          </Form.Item>
          
          <Form.Item name="description" label="场景描述">
            <TextArea rows={2} placeholder="请输入场景描述" />
          </Form.Item>
          
          <Form.Item name="icon" label="场景图标">
            <Select placeholder="选择图标">
              {iconOptions.map(icon => (
                <Option key={icon} value={icon}>{icon}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="is_active" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.List name="devices">
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="关联设备">
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加设备
                  </Button>
                </Form.Item>
                
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'device_id']}
                          fieldKey={[name, 'device_id']}
                          rules={[{ required: true, message: '请选择设备' }]}
                        >
                          <Select placeholder="选择设备">
                            {devices.map(device => (
                              <Option key={device.id} value={device.id}>
                                {device.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'target_state']}
                          fieldKey={[name, 'target_state']}
                          label="目标状态 (JSON)"
                        >
                          <Input placeholder='{"isOn": true, "brightness": 80}' />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button 
                          type="text" 
                          danger 
                          onClick={() => remove(name)}
                          style={{ marginTop: '32px' }}
                        >
                          删除
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  )
}

export default Scenes