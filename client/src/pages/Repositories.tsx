import { useEffect, useState, type Key } from 'react';
import { Table, Button, Space, Tag, Modal, message, Spin, Card, Input } from 'antd';
import { PlusOutlined, SyncOutlined, DeleteOutlined, GithubOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { repositoryApi, githubApi } from '@/api';
import type { Repository } from '@/types';
import dayjs from 'dayjs';

function Repositories(): JSX.Element {
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [githubRepos, setGithubRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [githubLoading, setGithubLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchRepos = async (): Promise<void> => {
    try {
      const result = await repositoryApi.list();
      setRepos(result.repos as Repository[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleSyncGithub = async (): Promise<void> => {
    setGithubLoading(true);
    try {
      const result = await githubApi.getRepos();
      setGithubRepos(result.repos as Repository[]);
      setImportModalVisible(true);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleImportRepo = async (repo: Repository): Promise<void> => {
    try {
      await githubApi.importRepo(repo.id, repo);
      message.success('仓库导入成功');
      setImportModalVisible(false);
      fetchRepos();
    } catch {
      // ignore
    }
  };

  const handleDelete = (id: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '删除仓库将移除所有相关配置和记录，确认删除吗？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await repositoryApi.delete(id);
        message.success('删除成功');
        fetchRepos();
      },
    });
  };

  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Repository) => (
        <Button
          type="link"
          onClick={() => navigate(`/repositories/${record.id}`)}
          icon={<GithubOutlined />}
        >
          {text}
        </Button>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: { setSelectedKeys: (keys: Key[]) => void; selectedKeys: Key[]; confirm: () => void }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索仓库"
            value={selectedKeys[0] as string}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button type="primary" size="small" onClick={confirm} style={{ marginRight: 8 }}>搜索</Button>
        </div>
      ),
      onFilter: (value: string | number | boolean | Key, record: Repository) =>
        record.fullName.toLowerCase().includes(String(value).toLowerCase()),
      filterIcon: <SearchOutlined />,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (lang: string) => lang || '-',
    },
    {
      title: '默认分支',
      dataIndex: 'defaultBranch',
      key: 'defaultBranch',
      width: 120,
      render: (branch: string) => <Tag color="blue">{branch}</Tag>,
    },
    {
      title: '可见性',
      dataIndex: 'isPrivate',
      key: 'isPrivate',
      width: 100,
      render: (isPrivate: boolean) => (
        <Tag color={isPrivate ? 'orange' : 'green'}>{isPrivate ? '私有' : '公开'}</Tag>
      ),
    },
    {
      title: 'Star数',
      dataIndex: 'stars',
      key: 'stars',
      width: 80,
    },
    {
      title: '同步时间',
      dataIndex: 'lastSyncedAt',
      key: 'lastSyncedAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Repository) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/repositories/${record.id}`)}>
            详情
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)} icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const filteredRepos = repos.filter((r) =>
    !searchText || r.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索仓库"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Space>
            <Button icon={<SyncOutlined />} onClick={handleSyncGithub} loading={githubLoading}>
              从GitHub导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleSyncGithub} loading={githubLoading}>
              同步仓库
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRepos}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个仓库` }}
        />
      </Card>

      <Modal
        title="从GitHub导入仓库"
        open={importModalVisible}
        width={800}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        {githubLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={githubRepos}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            columns={[
              { title: '仓库', dataIndex: 'fullName', key: 'fullName' },
              { title: '描述', dataIndex: 'description', key: 'description' },
              { title: '语言', dataIndex: 'language', key: 'language' },
              {
                title: '操作',
                key: 'action',
                render: (_: unknown, record: Repository) => (
                  <Button type="primary" size="small" onClick={() => handleImportRepo(record)}>
                    导入
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}

export default Repositories;
