import type { Article, Question, Project } from '../types';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to={`/articles/${article.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {article.is_pinned === 1 && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">置顶</span>
            )}
            {article.is_featured === 1 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">精选</span>
            )}
            {article.tags && article.tags.split(',').filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <img
                src={article.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.username}`}
                alt={article.username}
                className="w-5 h-5 rounded-full"
              />
              <span>{article.username}</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                Lv.{article.level}
              </span>
            </div>
            <span>{dayjs(article.created_at).fromNow()}</span>
            <span>👁 {article.views}</span>
            <span>👍 {article.likes}</span>
            <span>💬 {article.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const statusColors: Record<string, string> = {
    resolved: 'bg-green-100 text-green-700',
    approved: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Link
      to={`/questions/${question.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${statusColors[question.status] || 'bg-gray-100 text-gray-700'}`}>
              {question.status === 'resolved' ? '已解决' : question.status === 'approved' ? '进行中' : '待审核'}
            </span>
            {question.tags && question.tags.split(',').filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2">
            {question.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <img
                src={question.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${question.username}`}
                alt={question.username}
                className="w-5 h-5 rounded-full"
              />
              <span>{question.username}</span>
            </div>
            <span>{dayjs(question.created_at).fromNow()}</span>
            <span>👁 {question.views}</span>
            <span>💬 {question.answer_count || 0} 回答</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    recruiting: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusText: Record<string, string> = {
    recruiting: '招募中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
              {statusText[project.status] || project.status}
            </span>
            {project.tags && project.tags.split(',').filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2">
            {project.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>项目进度</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <img
                src={project.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.username}`}
                alt={project.username}
                className="w-5 h-5 rounded-full"
              />
              <span>{project.username}</span>
            </div>
            <span>👥 {project.current_members}/{project.team_size}</span>
            <span>⭐ {project.likes}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
