import { createSignal, createEffect } from 'solid-js';
import TypewriterText from './TypewriterText';
import CommentForm from './CommentForm';

export default function CommentBubble({
  comment,
  isNew = false,
  depth = 0,
  onReply,
  onLike,
  onDelete
}) {
  const [isLiked, setIsLiked] = createSignal(false);
  const [isLiking, setIsLiking] = createSignal(false);
  const [showReplyForm, setShowReplyForm] = createSignal(false);
  const [showTypewriter, setShowTypewriter] = createSignal(false);
  const [isNewBubble, setIsNewBubble] = createSignal(isNew);

  createEffect(() => {
    if (isNew) {
      setTimeout(() => {
        setShowTypewriter(true);
      }, 400);
      setTimeout(() => {
        setIsNewBubble(false);
      }, 700);
    }
  });

  const handleLike = async () => {
    if (isLiked()) return;
    setIsLiking(true);
    setIsLiked(true);
    await onLike(comment.id);
    setTimeout(() => {
      setIsLiking(false);
    }, 500);
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这条评论吗？')) {
      await onDelete(comment.id);
    }
  };

  const handleReplySubmit = async (content, author) => {
    await onReply(content, author, comment.id);
    setShowReplyForm(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  const bubbleClasses = () => {
    let classes = 'comment-bubble';
    if (depth > 0) classes += ' reply-bubble';
    if (isNewBubble()) classes += ' new-bubble';
    if (isLiked()) classes += ' liked';
    if (isLiking()) classes += ' liking';
    return classes;
  };

  return (
    <div class="comment-thread">
      <div class="comment-wrapper">
        <div class="avatar">{getInitials(comment.author)}</div>
        
        <div class={bubbleClasses()}>
          <div class="comment-header">
            <span class="comment-author">{comment.author}</span>
            <span class="comment-time">{formatTime(comment.createdAt)}</span>
          </div>
          
          <div class="comment-content">
            {isNew && showTypewriter() ? (
              <TypewriterText 
                text={comment.content} 
                onComplete={() => setIsAnimating(false)}
              />
            ) : (
              <span>{comment.content}</span>
            )}
          </div>
          
          <div class="comment-actions">
            <button 
              class="action-btn" 
              onClick={handleLike}
              disabled={isLiked()}
            >
              <span>❤️</span>
              <span class="action-count">{comment.likes + (isLiked() ? 1 : 0)}</span>
            </button>
            <button 
              class="action-btn" 
              onClick={() => setShowReplyForm(!showReplyForm())}
            >
              <span>💬</span>
              <span class="action-count">回复</span>
            </button>
            <button 
              class="action-btn delete-btn" 
              onClick={handleDelete}
            >
              <span>🗑️</span>
              <span class="action-count">删除</span>
            </button>
          </div>
        </div>
      </div>

      {showReplyForm() && (
        <div class="reply-form-container">
          <CommentForm
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
            placeholder="回复这条评论..."
            isReply={true}
          />
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div class="comment-children">
          {comment.children.map(child => (
            <CommentBubble
              key={child.id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
