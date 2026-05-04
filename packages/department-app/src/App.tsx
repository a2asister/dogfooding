import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Tree,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Radio,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
  ApartmentOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { DataNode, TreeProps } from 'antd/es/tree'
import dayjs from 'dayjs'

export interface Department {
  id: string
  name: string
  code: string
  parentId: string | null
  description: string
  managerId: string | null
  managerName: string | null
  employeeCount: number
  status: 'active' | 'inactive'
  children?: Department[]
  createdAt: string
  updatedAt: string
}

const mockDepartments: Department[] = [
  {
    id: 'd001',
    name: '总公司',
    code: 'HEAD_OFFICE',
    parentId: null,
    description: '公司总部',
    managerId: 'u001',
    managerName: '超级管理员',
    employeeCount: 50,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'd002',
        name: '技术部',
        code: 'TECH_DEPT',
        parentId: 'd001',
        description: '负责技术研发',
        managerId: 'u002',
        managerName: '张三',
        employeeCount: 20,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'd004',
            name: '前端组',
            code: 'FRONTEND_TEAM',
            parentId: 'd002',
            description: '负责前端开发',
            managerId: 'u003',
            managerName: '李四',
            employeeCount: 8,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'd005',
            name: '后端组',
            code: 'BACKEND_TEAM',
            parentId: 'd002',
            description: '负责后端开发',
            managerId: 'u004',
            managerName: '王五',
            employeeCount: 10,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 'd003',
        name: '市场部',
        code: 'MARKET_DEPT',
        parentId: 'd001',
        description: '负责市场推广',
        managerId: null,
        managerName: null,
        employeeCount: 15,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
]

const flatDepartments = (departments: Department[]): Department[] => {
  const result: Department[] = []
  const flatten = (items: Department[]) => {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }
  flatten(departments)
  return result
}

const convertToTreeData = (departments: Department[]): DataNode[] => {
  return departments.map(d => ({
    key: d.id,
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
        <span>
          <ApartmentOutlined style={{ marginRight: 4 }} />
          {d.name}
          <Tag color={d.status === 'active' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
            {d.employeeCount}人
          </Tag>
        </span>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
        </Space>
      </div>
    ),
    children: d.children ? convertToTreeData(d.children) : undefined,
  }))
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [flatList, setFlatList] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Department | null>(null)
  const [selectedItem, setSelectedItem] = useState<Department | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(['d001'])
  const [form] = Form.useForm()
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['d001', 'd002'])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3004/api/departments`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setDepartments(data.data || mockDepartments)
        setFlatList(flatDepartments(data.data || mockDepartments))
      } else {
        setDepartments(mockDepartments)
        setFlatList(flatDepartments(mockDepartments))
      }
    } catch (error) {
      setDepartments(mockDepartments)
      setFlatList(flatDepartments(mockDepartments))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelect: TreeProps['onSelect'] = (selectedKeysValue, { selected, selectedNodes, node }) => {
    if (selected) {
      const id = selectedKeysValue[0] as string
      const found = flatList.find(d => d.id === id)
      if (found) {
        setSelectedItem(found)
      }
      setSelectedKeys(selectedKeysValue)
    }
  }

  const handleExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue)
  }

  const handleAdd = (parentId?: string) => {
    setEditingItem(null)
    form.resetFields()
    if (parentId) {
      form.setFieldsValue({ parentId })
    }
    setModalVisible(true)
  }

  const handleEdit = (record: Department) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    if (id === 'd001') {
      message.warning('根部门不可删除')
      return
    }
    const hasChildren = (depts: Department[]): boolean => {
      for (const d of depts) {
        if (d.id === id && d.children && d.children.length > 0) {
          return true
        }
        if (d.children && hasChildren(d.children)) {
          return true
        }
      }
      return false
    }
    if (hasChildren(departments)) {
      message.warning('请先删除子部门')
      return
    }
    message.success('删除成功')
    setSelectedItem(null)
    setSelectedKeys([])
  }

  const handleDetail = (record: Department) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        message.success('更新成功')
      } else {
        message.success('创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const getParentOptions = () => {
    const options = [{ value: '', label: '无（根部门）' }]
    const buildOptions = (items: Department[], level = 0) => {
      items.forEach(item => {
        if (!editingItem || item.id !== editingItem.id) {
          const prefix = '　'.repeat(level) + (level > 0 ? '├ ' : '')
          options.push({ value: item.id, label: prefix + item.name })
        }
        if (item.children) {
          buildOptions(item.children, level + 1)
        }
      })
    }
    buildOptions(departments)
    return options
  }

  const totalEmployees = flatList.reduce((sum, d) => sum + d.employeeCount, 0)

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总部门数"
                    value={flatList.length}
                    prefix={<ApartmentOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总人数"
                    value={totalEmployees}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="启用部门"
                    value={flatList.filter(d => d.status === 'active').length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Card
                  title="部门结构"
                  bordered={false}
                  extra={
                    <Button type="link" icon={<PlusOutlined />} onClick={() => handleAdd()}>
                      新增
                    </Button>
                  }
                  style={{ height: '100%' }}
                >
                  <Spin spinning={loading}>
                    <Tree
                      showLine={{ showLeafIcon: false }}
                      defaultExpandAll
                      expandedKeys={expandedKeys}
                      selectedKeys={selectedKeys}
                      onSelect={handleSelect}
                      onExpand={handleExpand}
                      treeData={convertToTreeData(departments)}
                      blockNode
                    />
                  </Spin>
                </Card>
              </Col>
              <Col span={16}>
                <Card
                  title="部门详情"
                  bordered={false}
                  extra={
                    selectedItem ? (
                      <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                          刷新
                        </Button>
                        <Button icon={<PlusOutlined />} onClick={() => handleAdd(selectedItem.id)}>
                          添加子部门
                        </Button>
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedItem)}>
                          编辑
                        </Button>
                        <Popconfirm
                          title="确定要删除该部门吗？"
                          description="删除后无法恢复"
                          onConfirm={() => handleDelete(selectedItem.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button danger icon={<DeleteOutlined />}>
                            删除
                          </Button>
                        </Popconfirm>
                      </Space>
                    ) : null
                  }
                >
                  {selectedItem ? (
                    <>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="部门名称">
                          <ApartmentOutlined style={{ marginRight: 4 }} />
                          {selectedItem.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="部门编码">{selectedItem.code}</Descriptions.Item>
                        <Descriptions.Item label="上级部门">
                          {selectedItem.parentId 
                            ? flatList.find(d => d.id === selectedItem.parentId)?.name || '-' 
                            : '无（根部门）'}
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                          <Tag color={selectedItem.status === 'active' ? 'green' : 'red'}>
                            {selectedItem.status === 'active' ? '启用' : '禁用'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="负责人">
                          {selectedItem.managerName || '未设置'}
                        </Descriptions.Item>
                        <Descriptions.Item label="人数">
                          <Tag color="blue">{selectedItem.employeeCount} 人</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="描述" span={2}>
                          {selectedItem.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">
                          {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="更新时间">
                          {dayjs(selectedItem.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                      </Descriptions>

                      {selectedItem.children && selectedItem.children.length > 0 && (
                        <>
                          <Divider />
                          <div>
                            <h4 style={{ marginBottom: 12 }}>子部门列表</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {selectedItem.children.map(child => (
                                <Tag key={child.id} color="blue">
                                  <ApartmentOutlined style={{ marginRight: 4 }} />
                                  {child.name}
                                  <span style={{ marginLeft: 4, color: '#999' }}>
                                    ({child.employeeCount}人)
                                  </span>
                                </Tag>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
                      <ApartmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                      <p>请从左侧选择一个部门查看详情</p>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <Modal
              title={editingItem ? '编辑部门' : '新增部门'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={600}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="部门名称"
                      rules={[{ required: true, message: '请输入部门名称' }]}
                    >
                      <Input placeholder="请输入部门名称" prefix={<ApartmentOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label="部门编码"
                      rules={[{ required: true, message: '请输入部门编码' }]}
                    >
                      <Input placeholder="如: TECH_DEPT" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="parentId"
                      label="上级部门"
                    >
                      <Select placeholder="选择上级部门">
                        {getParentOptions().map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="状态"
                    >
                      <Radio.Group>
                        <Radio value="active">启用</Radio>
                        <Radio value="inactive">禁用</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="managerName"
                      label="负责人"
                    >
                      <Input placeholder="请输入负责人姓名" prefix={<TeamOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="employeeCount"
                      label="人数"
                    >
                      <Input type="number" placeholder="请输入人数" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="description"
                  label="描述"
                >
                  <Input.TextArea rows={3} placeholder="请输入部门描述" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="部门详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>,
              ]}
              width={600}
            >
              {selectedItem && (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="部门名称">{selectedItem.name}</Descriptions.Item>
                  <Descriptions.Item label="部门编码">{selectedItem.code}</Descriptions.Item>
                  <Descriptions.Item label="上级部门">
                    {selectedItem.parentId 
                      ? flatList.find(d => d.id === selectedItem.parentId)?.name || '-' 
                      : '无'}
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={selectedItem.status === 'active' ? 'green' : 'red'}>
                      {selectedItem.status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="负责人">{selectedItem.managerName || '未设置'}</Descriptions.Item>
                  <Descriptions.Item label="人数">
                    <Tag color="blue">{selectedItem.employeeCount} 人</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="描述" span={2}>
                    {selectedItem.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {dayjs(selectedItem.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Modal>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
