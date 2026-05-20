import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Upload, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Employees: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadDepartments();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/employees', {
        params: { page: pagination.current, pageSize: pagination.pageSize },
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    const res: any = await request.get('/departments/tree');
    if (res.code === 0) {
      const flattenDepts: any[] = [];
      const flatten = (items: any[], level: number = 0) => {
        items.forEach(item => {
          flattenDepts.push({
            id: item.id,
            name: `${'　'.repeat(level)}${level > 0 ? '└ ' : ''}${item.name}`,
          });
          if (item.children && item.children.length > 0) {
            flatten(item.children, level + 1);
          }
        });
      };
      flatten(res.data);
      setDepartments(flattenDepts);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      employeeNo: record.employeeNo,
      realName: record.realName,
      gender: record.gender,
      birthDate: record.birthDate,
      entryDate: record.entryDate,
      departmentId: record.departmentId,
      position: record.position,
      positionLevel: record.positionLevel,
      workPhone: record.workPhone,
      workEmail: record.workEmail,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/employees/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    }
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      birthDate: values.birthDate?.format('YYYY-MM-DD'),
      entryDate: values.entryDate?.format('YYYY-MM-DD'),
    };
    if (editingRecord) {
      const res: any = await request.put(`/employees/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      }
    } else {
      const res: any = await request.post('/employees', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      }
    }
  };

  const handleImport = async (file: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const res: any = await request.post('/employees/import', { file: base64 });
      if (res.code === 0) {
        message.success(`导入成功 ${res.data.count} 条`);
        loadData();
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleExport = async () => {
    const res: any = await request.get('/employees/export');
    if (res.code === 0) {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data.file}`;
      link.download = `员工数据_${Date.now()}.xlsx`;
      link.click();
    }
  };

  const handleDownloadTemplate = async () => {
    const res: any = await request.get('/employees/export/template');
    if (res.code === 0) {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data.template}`;
      link.download = '员工导入模板.xlsx';
      link.click();
    }
  };

  const columns = [
    { title: '员工编号', dataIndex: 'employeeNo' },
    { title: '姓名', dataIndex: 'realName' },
    { title: '性别', dataIndex: 'gender' },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '岗位', dataIndex: 'position' },
    { title: '职级', dataIndex: 'positionLevel' },
    { title: '工作邮箱', dataIndex: 'workEmail' },
    { title: '入职日期', dataIndex: 'entryDate' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>员工管理</h3>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>下载模板</Button>
          <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx,.xls">
            <Button icon={<ImportOutlined />}>批量导入</Button>
          </Upload>
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增员工</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />
      <Modal
        title={editingRecord ? '编辑员工' : '新增员工'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="employeeNo" label="员工编号">
              <Input />
            </Form.Item>
            <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Select>
                <Select.Option value="男">男</Select.Option>
                <Select.Option value="女">女</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="birthDate" label="出生日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="entryDate" label="入职日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="departmentId" label="部门">
              <Select>
                {departments.map((d: any) => (
                  <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="position" label="岗位">
              <Input />
            </Form.Item>
            <Form.Item name="positionLevel" label="职级">
              <Input />
            </Form.Item>
            <Form.Item name="workPhone" label="工作电话">
              <Input />
            </Form.Item>
            <Form.Item name="workEmail" label="工作邮箱">
              <Input />
            </Form.Item>
          </div>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确定</Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
