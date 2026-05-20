import React, { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { organizationApi, userApi } from '../services/api';
import { Organization, OrganizationType, ORGANIZATION_TYPE_OPTIONS, User } from '../types';

const { Option } = Select;
const { TreeNode } = Tree;

export default function OrganizationPage() {
  const [orgTree, setOrgTree] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form] = Form.useForm();
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    loadOrgTree();
    loadAllOrgs();
    loadAllUsers();
  }, []);

  const loadOrgTree = async () => {
    try {
      const response = await organizationApi.getOrganizationTree();
      setOrgTree(response.data);
    } catch (error) {
      message.error('加载组织架构失败');
    }
  };

  const loadAllOrgs = async () => {
    try {
      const response = await organizationApi.getOrganizations();
      setAllOrgs(response.data);
    } catch (error) {
      console.error('加载组织列表失败', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setAllUsers(response.data);
    } catch (error) {
      console.error('加载用户列表失败', error);
    }
  };

  const loadOrgUsers = async (orgId: string) => {
    try {
      const response = await organizationApi.getOrganizationUsers(orgId);
      setOrgUsers(response.data);
    } catch (error) {
      message.error('加载部门用户失败');
    }
  };

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const findOrg = (items: Organization[], id: string): Organization | null => {
        for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
            const found = findOrg(item.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      const org = findOrg(orgTree, selectedKeys[0] as string);
      if (org) {
        setSelectedOrg(org);
        loadOrgUsers(org.id);
      }
    }
  };

  const handleCreate = () => {
    setEditingOrg(null);
    form.resetFields();
    if (selectedOrg) {
      form.setFieldsValue({ parentId: selectedOrg.id });
    }
    setIsModalVisible(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    form.setFieldsValue(org);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationApi.deleteOrganization(id);
      message.success('删除成功');
      setSelectedOrg(null);
      loadOrgTree();
      loadAllOrgs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingOrg) {
        await organizationApi.updateOrganization(editingOrg.id, values);
        message.success('更新成功');
      } else {
        await organizationApi.createOrganization(values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      loadOrgTree();
      loadAllOrgs();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const renderTreeNodes = (items: Organization[]) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.name} key={item.id}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} />;
    });
  };

  return (
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 112px)' }}>
      <Card
        title="组织架构"
        style={{ width: 300, flexShrink: 0 }}
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleCreate}>
            新建
          </Button>
        }
      >
        <Tree
          showLine
          defaultExpandAll
          onSelect={handleSelect}
        >
          {renderTreeNodes(orgTree)}
        </Tree>
      </Card>

      <Card
        title={selectedOrg ? `${selectedOrg.name} - 详情` : '请选择组织'}
        style={{ flex: 1, overflow: 'auto' }}
        extra={selectedOrg && (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(selectedOrg)}>
              编辑
            </Button>
            <Popconfirm title="确定要删除该组织吗？" onConfirm={() => handleDelete(selectedOrg.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )}
      >
        {selectedOrg ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>类型：</strong>{ORGANIZATION_TYPE_OPTIONS.find(o => o.value === selectedOrg.type)?.label || selectedOrg.type}</p>
              <p><strong>描述：</strong>{selectedOrg.description || '-'}</p>
              <p><strong>负责人：</strong>{selectedOrg.leaderId ? allUsers.find(u => u.id === selectedOrg.leaderId)?.realName || '-' : '-'}</p>
            </div>
            <h3 style={{ marginBottom: 12 }}>
              <TeamOutlined /> 成员列表 ({orgUsers.length})
            </h3>
            {orgUsers.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {orgUsers.map(user => (
                  <div key={user.id} style={{
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>{user.realName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>暂无成员</p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            请从左侧选择组织查看详情
          </div>
        )}
      </Card>

      <Modal
        title={editingOrg ? '编辑组织' : '新建组织'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="组织名称"
            rules={[{ required: true, message: '请输入组织名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label="上级组织">
            <Select
              placeholder="请选择上级组织（根节点不选）"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {allOrgs.map(org => (
                <Option key={org.id} value={org.id}>{org.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="组织类型" rules={[{ required: true, message: '请选择组织类型' }]}>
            <Select>
              {ORGANIZATION_TYPE_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="leaderId" label="负责人">
            <Select
              showSearch
              placeholder="请选择负责人"
              optionFilterProp="children"
              allowClear
            >
              {allUsers.map(user => (
                <Option key={user.id} value={user.id}>{user.realName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
