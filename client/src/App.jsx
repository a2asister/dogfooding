import { createSignal, createEffect, batch } from 'solid-js';
import CommentBubble from './components/CommentBubble';
import CommentForm from './components/CommentForm';
import { fetchComments, createComment, deleteComment, likeComment } from './api';

export default function App() {
  const [comments, setComments] = createSignal([]);
  const [newCommentId, setNewCommentId] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  const loadComments = async () => {
    try {
      const data = await fetchComments();
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    loadComments();
  });

  const addCommentToTree = (tree, parentId, newComment) => {
    if (!parentId) {
      return [{ ...newComment, children: [] }, ...tree];
    }
    
    return tree.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          children: [...(comment.children || []), { ...newComment, children: [] }]
        };
      }
      if (comment.children) {
        return {
          ...comment,
          children: addCommentToTree(comment.children, parentId, newComment)
        };
      }
      return comment;
    });
  };

  const removeCommentFromTree = (tree, id) => {
    return tree
      .filter(comment => comment.id !== id)
      .map(comment => {
        if (comment.children) {
          return {
            ...comment,
            children: removeCommentFromTree(comment.children, id)
          };
        }
        return comment;
      });
  };

  const updateCommentLikes = (tree, id, likes) => {
    return tree.map(comment => {
      if (comment.id === id) {
        return { ...comment, likes };
      }
      if (comment.children) {
        return {
          ...comment,
          children: updateCommentLikes(comment.children, id, likes)
        };
      }
      return comment;
    });
  };

  const handleCreateComment = async (content, author, parentId = null) => {
    const newComment = await createComment(content, author, parentId);
    batch(() => {
      setComments(prev => addCommentToTree(prev, parentId, newComment));
      setNewCommentId(newComment.id);
    });
    
    setTimeout(() => setNewCommentId(null), 2000);
  };

  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setComments(prev => removeCommentFromTree(prev, id));
  };

  const handleLikeComment = async (id) => {
    const updated = await likeComment(id);
    setComments(prev => updateCommentLikes(prev, id, updated.likes));
  };

  return (
    <div class="app-container">
      <header class="header">
        <h1>💭 气泡评论系统</h1>
        <p>新评论以聊天气泡形式弹出，体验流畅的动画效果</p>
      </header>

      <CommentForm onSubmit={(content, author) => handleCreateComment(content, author)} />

      <div class="comments-container">
        {loading() ? (
          <div class="empty-state">
            <h3>加载中...</h3>
          </div>
        ) : comments().length === 0 ? (
          <div class="empty-state">
            <h3>还没有评论</h3>
            <p>成为第一个发言的人吧！</p>
          </div>
        ) : (
          comments().map(comment => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              isNew={newCommentId() === comment.id}
              onReply={handleCreateComment}
              onLike={handleLikeComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
