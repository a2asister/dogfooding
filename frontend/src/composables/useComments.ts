import { ref, shallowRef } from 'vue';
import { 
  getComments, 
  createComment, 
  deleteComment as apiDeleteComment,
  toggleLike as apiToggleLike,
  type Comment,
  type CreateCommentInput 
} from '../api/comment';

const comments = shallowRef<Comment[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const newCommentIds = ref<string[]>([]);

function findAndUpdateComment(
  commentList: Comment[],
  id: string,
  updater: (comment: Comment) => Comment
): Comment[] {
  return commentList.map(comment => {
    if (comment.id === id) {
      return updater(comment);
    }
    if (comment.children && comment.children.length > 0) {
      return {
        ...comment,
        children: findAndUpdateComment(comment.children, id, updater)
      };
    }
    return comment;
  });
}

function findAndDeleteComment(commentList: Comment[], id: string): Comment[] {
  return commentList
    .filter(comment => comment.id !== id)
    .map(comment => {
      if (comment.children && comment.children.length > 0) {
        return {
          ...comment,
          children: findAndDeleteComment(comment.children, id)
        };
      }
      return comment;
    });
}

function findAndAddChild(
  commentList: Comment[],
  parentId: string,
  newComment: Comment
): Comment[] {
  return commentList.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        children: [...(comment.children || []), newComment]
      };
    }
    if (comment.children && comment.children.length > 0) {
      return {
        ...comment,
        children: findAndAddChild(comment.children, parentId, newComment)
      };
    }
    return comment;
  });
}

export function useComments() {
  async function fetchComments() {
    loading.value = true;
    error.value = null;
    try {
      const data = await getComments();
      comments.value = data;
    } catch (e) {
      error.value = '加载评论失败';
      console.error('Fetch comments error:', e);
    } finally {
      loading.value = false;
    }
  }

  async function addComment(input: CreateCommentInput): Promise<Comment | null> {
    try {
      const newComment = await createComment(input);
      const commentWithChildren = { ...newComment, children: [] };
      
      newCommentIds.value.push(newComment.id);
      
      if (newComment.parentId) {
        comments.value = findAndAddChild(
          comments.value,
          newComment.parentId,
          commentWithChildren
        );
      } else {
        comments.value = [...comments.value, commentWithChildren];
      }
      
      setTimeout(() => {
        newCommentIds.value = newCommentIds.value.filter(id => id !== newComment.id);
      }, 1000);
      
      return commentWithChildren;
    } catch (e) {
      error.value = '创建评论失败';
      console.error('Create comment error:', e);
      return null;
    }
  }

  async function deleteComment(id: string) {
    try {
      await apiDeleteComment(id);
      comments.value = findAndDeleteComment(comments.value, id);
    } catch (e) {
      error.value = '删除评论失败';
      console.error('Delete comment error:', e);
    }
  }

  async function toggleLike(id: string) {
    try {
      const updatedComment = await apiToggleLike(id);
      comments.value = findAndUpdateComment(comments.value, id, () => {
        return updatedComment;
      });
    } catch (e) {
      error.value = '点赞失败';
      console.error('Toggle like error:', e);
    }
  }

  function isNewComment(id: string): boolean {
    return newCommentIds.value.includes(id);
  }

  return {
    comments,
    loading,
    error,
    newCommentIds,
    fetchComments,
    addComment,
    deleteComment,
    toggleLike,
    isNewComment
  };
}

export function commentService() {
  return useComments();
}
