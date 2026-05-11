import { createSignal } from 'solid-js';

export default function CommentForm({ onSubmit, onCancel, placeholder, isReply = false }) {
  const [author, setAuthor] = createSignal('');
  const [content, setContent] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!author().trim() || !content().trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(content().trim(), author().trim());
      setAuthor('');
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form class={isReply ? 'reply-form' : 'comment-form'} onSubmit={handleSubmit}>
      <div class="form-group">
        <input
          type="text"
          placeholder="你的昵称"
          value={author()}
          onInput={(e) => setAuthor(e.target.value)}
          disabled={isSubmitting()}
        />
      </div>
      <div class="form-group">
        <textarea
          placeholder={placeholder || '写下你的评论...'}
          value={content()}
          onInput={(e) => setContent(e.target.value)}
          disabled={isSubmitting()}
        />
      </div>
      <div class="form-actions">
        {onCancel && (
          <button
            type="button"
            class="cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting()}
          >
            取消
          </button>
        )}
        <button type="submit" class="submit-btn" disabled={isSubmitting()}>
          {isSubmitting() ? '发送中...' : (isReply ? '回复' : '发布评论')}
        </button>
      </div>
    </form>
  );
}
