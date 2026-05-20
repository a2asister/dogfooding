import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Modal, Select, Empty, Spin, Dropdown, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { Project } from '../../types';

const { Option } = Select;

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getMyProjects();
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '删除作品',
      content: '确定要删除这个作品吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await projectsAPI.deleteProject(id);
          message.success('作品已删除');
          loadProjects();
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleShare = (project: Project) => {
    const shareUrl = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('分享链接已复制到剪贴板！');
  };

  const handleTogglePublic = async (project: Project) => {
    try {
      await projectsAPI.updateProject(project.id, {
        isPublic: !project.isPublic,
      });
      message.success(project.isPublic ? '已设置为私密' : '已设置为公开');
      loadProjects();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      animation: '🎬',
      game: '🎮',
      art: '🎨',
      music: '🎵',
      story: '📖',
      other: '📦',
    };
    return icons[category] || '📦';
  };

  const getCategoryText = (category: string) => {
    const texts: Record<string, string> = {
      animation: '动画',
      game: '游戏',
      art: '艺术',
      music: '音乐',
      story: '故事',
      other: '其他',
    };
    return texts[category] || category;
  };

  const filteredProjects =
    categoryFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === categoryFilter);

  const categories = [...new Set(projects.map((p) => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">🎨 我的作品</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部分类</Option>
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {getCategoryIcon(cat)} {getCategoryText(cat)}
              </Option>
            ))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/editor')}>
            创建作品
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        {filteredProjects.length === 0 && !loading ? (
          <Empty description="还没有作品，快去创建第一个吧！">
            <Button type="primary" onClick={() => navigate('/editor')}>
              开始创作
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProjects.map((project) => (
              <Col xs={24} sm={12} lg={8} key={project.id}>
                <Card
                  hoverable
                  className="h-full shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/editor?projectId=${project.id}`)}
                  cover={
                    <div
                      className="h-40 flex items-center justify-center text-6xl bg-gradient-to-br from-blue-50 to-purple-50"
                    >
                      {getCategoryIcon(project.category)}
                    </div>
                  }
                  actions={[
                    <EditOutlined
                      key="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor?projectId=${project.id}`);
                      }}
                    />,
                    project.isPublic ? (
                      <GlobalOutlined
                        key="public"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublic(project);
                        }}
                      />
                    ) : (
                      <LockOutlined
                        key="private"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublic(project);
                        }}
                      />
                    ),
                    <ShareAltOutlined
                      key="share"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(project);
                      }}
                    />,
                    <DeleteOutlined
                      key="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="text-red-500"
                    />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{project.title}</span>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'public',
                                icon: project.isPublic ? <LockOutlined /> : <GlobalOutlined />,
                                label: project.isPublic ? '设为私密' : '设为公开',
                                onClick: () => handleTogglePublic(project),
                              },
                              {
                                key: 'share',
                                icon: <ShareAltOutlined />,
                                label: '分享',
                                onClick: () => handleShare(project),
                              },
                              {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: '删除',
                                danger: true,
                                onClick: () => handleDelete(project.id),
                              },
                            ],
                          }}
                          trigger={['click']}
                        >
                          <MoreOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        </Dropdown>
                      </div>
                    }
                    description={
                      <div className="mt-2">
                        <Tag color={project.isPublic ? 'green' : 'default'}>
                          {project.isPublic ? '🌍 公开' : '🔒 私密'}
                        </Tag>
                        <Tag>{getCategoryIcon(project.category)} {getCategoryText(project.category)}</Tag>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {project.description || '暂无描述'}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          更新于 {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default ProjectsPage;
