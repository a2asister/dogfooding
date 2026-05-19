import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dayjs from 'dayjs';
import { projectsApi, commentsApi } from '../api';
import type { Project, Comment } from '../types';
import { useAuthStore } from '../store';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingResource, setSubmittingResource] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [projectRes, commentsRes] = await Promise.all([
          projectsApi.getDetail(Number(id)),
          commentsApi.getList({ target_type: 'project', target_id: Number(id) }),
        ]);
        setProject(projectRes.data);
        setProgressValue(projectRes.data.progress);
        setComments(commentsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!project || !user) return;
    try {
      const res = await projectsApi.like(project.id);
      setProject({ ...project, likes: res.data.liked ? project.likes + 1 : project.likes - 1 });
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!project || !user) return;
    try {
      const res = await projectsApi.favorite(project.id);
      setProject({ ...project, favorites: res.data.favorited ? project.favorites + 1 : project.favorites - 1 });
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  const handleJoin = async () => {
    if (!project || !user) return;
    try {
      await projectsApi.join(project.id);
      const res = await projectsApi.getDetail(project.id);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  const handleApproveMember = async (memberId: number) => {
    if (!project) return;
    try {
      await projectsApi.approveMember(project.id, memberId);
      const res = await projectsApi.getDetail(project.id);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to approve member:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user || !commentContent.trim()) return;
    
    setSubmittingComment(true);
    try {
      await commentsApi.create({
        target_type: 'project',
        target_id: project.id,
        content: commentContent,
      });
      setCommentContent('');
      const res = await commentsApi.getList({ target_type: 'project', target_id: project.id });
      setComments(res.data.data);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user || !resourceTitle.trim() || !resourceUrl.trim()) return;
    
    setSubmittingResource(true);
    try {
      await projectsApi.addResource(project.id, {
        title: resourceTitle,
        description: resourceDesc,
        url: resourceUrl,
      });
      setResourceTitle('');
      setResourceUrl('');
      setResourceDesc('');
      const res = await projectsApi.getDetail(project.id);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to add resource:', error);
    } finally {
      setSubmittingResource(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!project || !user) return;
    setUpdatingProgress(true);
    try {
      await projectsApi.updateProgress(project.id, { progress: progressValue });
      const res = await projectsApi.getDetail(project.id);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      recruiting: { bg: 'bg-green-100', text: 'text-green-700', label: '招募中' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: '进行中' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: '已完成' },
    };
    const b = badges[status];
    if (!b) {
      return (
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
          {status}
        </span>
      );
    }
    return (
      <span className={`${b.bg} ${b.text} text-xs px-2 py-0.5 rounded`}>
        {b.label}
      </span>
    );
  };

  const isMember = project?.members?.some(m => m.user_id === user?.id && m.status === 'approved');
  const isOwner = project?.user_id === user?.id;
  const hasApplied = project?.members?.some(m => m.user_id === user?.id && m.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500">项目不存在</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-2 mb-4">
            {getStatusBadge(project.status)}
            {project.tags && project.tags.split(',').filter(Boolean).map((tag) => (
              <span key={tag} className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b">
            <div className="flex items-center space-x-4">
              <Link to={`/users/${project.user_id}`} className="flex items-center space-x-2">
                <img
                  src={project.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.username}`}
                  alt={project.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{project.username}</span>
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                  Lv.{project.level}
                </span>
              </Link>
              <span>{dayjs(project.created_at).format('YYYY-MM-DD HH:mm')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>👁 {project.views}</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-bold mb-2 text-purple-800">项目简介</h3>
            <p className="text-gray-700">{project.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-purple-800">项目进度</h3>
              <span className="text-sm text-gray-500">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            {isOwner && (
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={handleUpdateProgress}
                  disabled={updatingProgress || progressValue === project.progress}
                  className="px-4 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  更新
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-3 text-purple-800">团队成员 ({project.current_members}/{project.team_size})</h3>
            <div className="flex flex-wrap gap-3">
              {project.members?.filter(m => m.status === 'approved').map((member) => (
                <Link
                  key={member.id}
                  to={`/users/${member.user_id}`}
                  className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <img
                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                    alt={member.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{member.username}</span>
                </Link>
              ))}
            </div>
            {project.members?.filter(m => m.status === 'pending').length !== undefined &&
              project.members.filter(m => m.status === 'pending').length > 0 && isOwner && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">待审批申请</h4>
                  <div className="space-y-2">
                    {project.members.filter(m => m.status === 'pending').map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg">
                        <Link to={`/users/${member.user_id}`} className="flex items-center space-x-2">
                          <img
                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                            alt={member.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm">{member.username}</span>
                        </Link>
                        <button
                          onClick={() => handleApproveMember(member.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          批准
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
          
          <div className="markdown-body mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content}
            </ReactMarkdown>
          </div>

          {project.resources && project.resources.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-4 text-purple-800">📦 项目资源</h3>
              <div className="space-y-3">
                {project.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{resource.title}</div>
                        {resource.description && (
                          <div className="text-sm text-gray-500">{resource.description}</div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {resource.type} · {resource.downloads} 次下载
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(isOwner || isMember) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-4 text-purple-800">➕ 添加资源</h3>
              <form onSubmit={handleAddResource} className="space-y-3">
                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="资源标题"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="资源链接"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <textarea
                  value={resourceDesc}
                  onChange={(e) => setResourceDesc(e.target.value)}
                  placeholder="资源描述（可选）"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingResource || !resourceTitle.trim() || !resourceUrl.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {submittingResource ? '添加中...' : '添加资源'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="flex items-center space-x-4 pt-6 border-t">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                project.is_liked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>👍</span>
              <span>{project.likes}</span>
            </button>
            <button
              onClick={handleFavorite}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                project.is_favorited
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>⭐</span>
              <span>{project.favorites}</span>
            </button>
            {user && !isOwner && !isMember && !hasApplied && project.status === 'recruiting' && (
              <button
                onClick={handleJoin}
                className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                申请加入
              </button>
            )}
            {hasApplied && (
              <span className="ml-auto px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                申请审核中
              </span>
            )}
            {isMember && (
              <span className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                ✓ 已加入
              </span>
            )}
          </div>
        </article>

        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h3 className="font-bold mb-6">评论 ({comments.length})</h3>
          
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submittingComment ? '发布中...' : '发布评论'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <Link to="/login" className="text-purple-600 hover:underline">
                登录
              </Link>
              <span className="text-gray-500"> 后发表评论</span>
            </div>
          )}
          
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start space-x-4">
                    <Link to={`/users/${comment.user_id}`}>
                      <img
                        src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                        alt={comment.username}
                        className="w-10 h-10 rounded-full"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-xs text-gray-500">
                          {dayjs(comment.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <button className="hover:text-purple-600">👍 {comment.likes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">暂无评论</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">项目发起者</h3>
          <Link to={`/users/${project.user_id}`} className="flex items-center space-x-3">
            <img
              src={project.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.username}`}
              alt={project.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium">{project.username}</div>
              <div className="text-xs text-gray-500">Lv.{project.level}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
