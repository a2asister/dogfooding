import { useState, useEffect } from 'react';
import { Table, Input, Select, DatePicker, Space } from 'antd';
import request from '../../utils/request';

const Logs: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [filters, setFilters] = useState({ module: '', operation: '' });

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system/logs', {
        params: { page: pagination.current, pageSize: pagination.pageSize, ...filters },
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '操作人', dataIndex: 'username', width: 120 },
    { title: '操作模块', dataIndex: 'module', width: 120 },
    { title: '操作类型', dataIndex: 'operation', width: 150 },
    { title: '详情', dataIndex: 'details' },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 140 },
    { title: '操作时间', dataIndex: 'createdAt', width: 180 },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>操作日志</h3>
        <Space>
          <Input
            placeholder="搜索模块"
            style={{ width: 150 }}
            allowClear
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
          />
          <Input
            placeholder="搜索操作"
            style={{ width: 150 }}
            allowClear
            onChange={(e) => setFilters({ ...filters, operation: e.target.value })}
          />
          <DatePicker.RangePicker />
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
    </div>
  );
};

export default Logs;
