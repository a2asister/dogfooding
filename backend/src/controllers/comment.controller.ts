import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Comment } from '../entities/Comment';
import { CommentLike } from '../entities/CommentLike';
import { Note } from '../entities/Note';
import { User } from '../entities/User';
import { filterSensitiveWords } from '../utils/sensitiveWords';
import { createCommentNotification, createReplyNotification } from '../utils/notification';

const commentRepository = AppDataSource.getRepository(Comment);
const commentLikeRepository = AppDataSource.getRepository(CommentLike);
const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { noteId, content, parentId, replyToUserId } = req.body;

    if (!noteId || !content) {
      res.status(400).json({ message: '参数不完整' });
      return;
    }

    const note = await noteRepository.findOne({ where: { id: noteId }, relations: ['author'] });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const { filtered, hasSensitive, foundWords } = filterSensitiveWords(content);
    if (hasSensitive) {
      res.status(400).json({ message: '评论包含敏感词', foundWords });
      return;
    }

    const comment = commentRepository.create({
      content: filtered,
      noteId,
      authorId: req.user.id,
      parentId: parentId || null,
      replyToUserId: replyToUserId || null,
    });

    if (parentId) {
      const parentComment = await commentRepository.findOne({ where: { id: parentId } });
      if (parentComment) {
        comment.rootId = parentComment.rootId || parentId;
      }
    }

    await commentRepository.save(comment);

    note.commentCount = (note.commentCount || 0) + 1;
    await noteRepository.save(note);

    if (parentId && replyToUserId) {
      const replyToUser = await userRepository.findOne({ where: { id: replyToUserId } });
      if (replyToUser && replyToUserId !== req.user.id) {
        await createReplyNotification(
          note.id,
          note.title,
          replyToUserId,
          req.user.id,
          req.user.nickname,
          content
        );
      }
    } else if (note.author.id !== req.user.id) {
      await createCommentNotification(
        note.id,
        note.title,
        note.author.id,
        req.user.id,
        req.user.nickname,
        content
      );
    }

    res.status(201).json({
      message: '评论成功',
      comment,
    });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCommentList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId, page = 1, pageSize = 20 } = req.query;

    if (!noteId) {
      res.status(400).json({ message: '缺少笔记ID' });
      return;
    }

    const skip = (Number(page) - 1) * Number(pageSize);

    const [rootComments, total] = await commentRepository.findAndCount({
      where: {
        noteId: noteId as string,
        parentId: null as any,
        isDeleted: false,
      },
      relations: ['author'],
      order: {
        isPinned: 'DESC',
        createdAt: 'DESC',
      },
      skip,
      take: Number(pageSize),
    });

    const commentList = await Promise.all(
      rootComments.map(async (comment) => {
        const [replies, replyCount] = await commentRepository.findAndCount({
          where: {
            rootId: comment.id,
            isDeleted: false,
          },
          relations: ['author', 'replyToUser'],
          order: { createdAt: 'ASC' },
          take: 5,
        });

        let isLiked = false;
        if (req.user) {
          isLiked = !!(await commentLikeRepository.findOne({
            where: { userId: req.user.id, commentId: comment.id },
          }));
        }

        return {
          id: comment.id,
          content: comment.content,
          likeCount: comment.likeCount,
          replyCount,
          isPinned: comment.isPinned,
          isLiked,
          author: {
            id: comment.author.id,
            nickname: comment.author.nickname,
            avatar: comment.author.avatar,
          },
          replies: replies.map((reply) => ({
            id: reply.id,
            content: reply.content,
            likeCount: reply.likeCount,
            author: {
              id: reply.author.id,
              nickname: reply.author.nickname,
              avatar: reply.author.avatar,
            },
            replyToUser: reply.replyToUser
              ? {
                  id: reply.replyToUser.id,
                  nickname: reply.replyToUser.nickname,
                }
              : null,
            createdAt: reply.createdAt,
          })),
          createdAt: comment.createdAt,
        };
      })
    );

    res.json({
      list: commentList,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getReplyList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId, page = 1, pageSize = 20 } = req.query;

    if (!commentId) {
      res.status(400).json({ message: '缺少评论ID' });
      return;
    }

    const skip = (Number(page) - 1) * Number(pageSize);

    const [replies, total] = await commentRepository.findAndCount({
      where: {
        rootId: commentId as string,
        isDeleted: false,
      },
      relations: ['author', 'replyToUser'],
      order: { createdAt: 'ASC' },
      skip,
      take: Number(pageSize),
    });

    const replyList = await Promise.all(
      replies.map(async (reply) => {
        let isLiked = false;
        if (req.user) {
          isLiked = !!(await commentLikeRepository.findOne({
            where: { userId: req.user.id, commentId: reply.id },
          }));
        }

        return {
          id: reply.id,
          content: reply.content,
          likeCount: reply.likeCount,
          isLiked,
          author: {
            id: reply.author.id,
            nickname: reply.author.nickname,
            avatar: reply.author.avatar,
          },
          replyToUser: reply.replyToUser
            ? {
                id: reply.replyToUser.id,
                nickname: reply.replyToUser.nickname,
              }
            : null,
          createdAt: reply.createdAt,
        };
      })
    );

    res.json({
      list: replyList,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取回复列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const likeComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const comment = await commentRepository.findOne({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    const existingLike = await commentLikeRepository.findOne({
      where: { userId: req.user.id, commentId: id },
    });

    if (existingLike) {
      await commentLikeRepository.remove(existingLike);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      await commentRepository.save(comment);
      res.json({ message: '取消点赞成功', liked: false, likeCount: comment.likeCount });
    } else {
      const like = commentLikeRepository.create({
        userId: req.user.id,
        commentId: id,
      });
      await commentLikeRepository.save(like);
      comment.likeCount += 1;
      await commentRepository.save(comment);
      res.json({ message: '点赞成功', liked: true, likeCount: comment.likeCount });
    }
  } catch (error) {
    console.error('点赞评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const comment = await commentRepository.findOne({
      where: { id },
      relations: ['note'],
    });

    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: '无权删除此评论' });
      return;
    }

    comment.isDeleted = true;
    comment.deleteReason = '用户删除';
    await commentRepository.save(comment);

    const note = await noteRepository.findOne({ where: { id: comment.noteId } });
    if (note) {
      note.commentCount = Math.max(0, note.commentCount - 1);
      await noteRepository.save(note);
    }

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const pinComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const comment = await commentRepository.findOne({
      where: { id },
      relations: ['note'],
    });

    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    if (comment.note.author.id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: '只有作者或管理员可以置顶评论' });
      return;
    }

    if (comment.isPinned) {
      comment.isPinned = false;
      res.json({ message: '取消置顶成功', isPinned: false });
    } else {
      await commentRepository.update({ noteId: comment.noteId, isPinned: true }, { isPinned: false });
      comment.isPinned = true;
      res.json({ message: '置顶成功', isPinned: true });
    }

    await commentRepository.save(comment);
  } catch (error) {
    console.error('置顶评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
