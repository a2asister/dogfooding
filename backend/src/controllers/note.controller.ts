import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Note, NoteStatus, NotePermission } from '../entities/Note';
import { Topic } from '../entities/Topic';
import { Like } from '../entities/Like';
import { Favorite } from '../entities/Favorite';
import { User } from '../entities/User';
import { In } from 'typeorm';

const noteRepository = AppDataSource.getRepository(Note);
const topicRepository = AppDataSource.getRepository(Topic);
const likeRepository = AppDataSource.getRepository(Like);
const favoriteRepository = AppDataSource.getRepository(Favorite);
const userRepository = AppDataSource.getRepository(User);

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { title, content, images, location, topics, permission, publish } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: '标题和内容不能为空' });
      return;
    }

    let topicEntities: Topic[] = [];
    if (topics && topics.length > 0) {
      topicEntities = await Promise.all(
        topics.map(async (topicName: string) => {
          let topic = await topicRepository.findOne({ where: { name: topicName } });
          if (!topic) {
            topic = topicRepository.create({ name: topicName });
            await topicRepository.save(topic);
          }
          return topic;
        })
      );
    }

    const note = noteRepository.create({
      title,
      content,
      images: images || [],
      location,
      topics: topicEntities,
      permission: permission || NotePermission.PUBLIC,
      status: publish ? NoteStatus.PENDING : NoteStatus.DRAFT,
      author: req.user,
    });

    await noteRepository.save(note);

    if (publish) {
      await userRepository.increment({ id: req.user.id }, 'noteCount', 1);
    }

    res.status(201).json({
      message: publish ? '笔记已提交审核' : '草稿已保存',
      note,
    });
  } catch (error) {
    console.error('创建笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNoteList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, type = 'recommend', topic } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = { status: NoteStatus.PUBLISHED };

    if (topic) {
      const topicEntity = await topicRepository.findOne({ where: { name: topic as string } });
      if (topicEntity) {
        whereCondition.topics = { id: topicEntity.id };
      }
    }

    if (type === 'following' && req.user) {
      const follows = await AppDataSource.getRepository('Follow').find({
        where: { followerId: req.user.id },
        select: ['followingId'],
      });
      const followingIds = follows.map((f: any) => f.followingId);
      if (followingIds.length > 0) {
        whereCondition.author = { id: In(followingIds) };
      } else {
        whereCondition.author = { id: null };
      }
    }

    const [notes, total] = await noteRepository.findAndCount({
      where: whereCondition,
      relations: ['author', 'topics'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    const noteList = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 100),
      images: note.images,
      location: note.location,
      likeCount: note.likeCount,
      favoriteCount: note.favoriteCount,
      shareCount: note.shareCount,
      viewCount: note.viewCount,
      topics: note.topics.map((t) => t.name),
      author: {
        id: note.author.id,
        nickname: note.author.nickname,
        avatar: note.author.avatar,
      },
      createdAt: note.createdAt,
    }));

    res.json({
      list: noteList,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取笔记列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNoteDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await noteRepository.findOne({
      where: { id },
      relations: ['author', 'topics'],
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.status !== NoteStatus.PUBLISHED && (!req.user || req.user.id !== note.author.id)) {
      res.status(403).json({ message: '无权查看此笔记' });
      return;
    }

    note.viewCount += 1;
    await noteRepository.save(note);

    let isLiked = false;
    let isFavorited = false;
    let isFollowing = false;

    if (req.user) {
      isLiked = !!(await likeRepository.findOne({
        where: { userId: req.user.id, noteId: note.id },
      }));
      isFavorited = !!(await favoriteRepository.findOne({
        where: { userId: req.user.id, noteId: note.id },
      }));
      isFollowing = !!(await AppDataSource.getRepository('Follow').findOne({
        where: { followerId: req.user.id, followingId: note.author.id },
      }));
    }

    res.json({
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        images: note.images,
        location: note.location,
        likeCount: note.likeCount,
        favoriteCount: note.favoriteCount,
        shareCount: note.shareCount,
        viewCount: note.viewCount,
        status: note.status,
        topics: note.topics.map((t) => t.name),
        author: {
          id: note.author.id,
          nickname: note.author.nickname,
          avatar: note.author.avatar,
          bio: note.author.bio,
          followerCount: note.author.followerCount,
          followingCount: note.author.followingCount,
          noteCount: note.author.noteCount,
          isFollowing,
        },
        isLiked,
        isFavorited,
        createdAt: note.createdAt,
      },
    });
  } catch (error) {
    console.error('获取笔记详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const likeNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({ where: { id } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const existingLike = await likeRepository.findOne({
      where: { userId: req.user.id, noteId: note.id },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      note.likeCount = Math.max(0, note.likeCount - 1);
      await noteRepository.save(note);
      res.json({ message: '取消点赞成功', liked: false, likeCount: note.likeCount });
    } else {
      const like = likeRepository.create({
        userId: req.user.id,
        noteId: note.id,
      });
      await likeRepository.save(like);
      note.likeCount += 1;
      await noteRepository.save(note);
      res.json({ message: '点赞成功', liked: true, likeCount: note.likeCount });
    }
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const favoriteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({ where: { id } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const existingFavorite = await favoriteRepository.findOne({
      where: { userId: req.user.id, noteId: note.id },
    });

    if (existingFavorite) {
      await favoriteRepository.remove(existingFavorite);
      note.favoriteCount = Math.max(0, note.favoriteCount - 1);
      await noteRepository.save(note);
      res.json({ message: '取消收藏成功', favorited: false, favoriteCount: note.favoriteCount });
    } else {
      const favorite = favoriteRepository.create({
        userId: req.user.id,
        noteId: note.id,
      });
      await favoriteRepository.save(favorite);
      note.favoriteCount += 1;
      await noteRepository.save(note);
      res.json({ message: '收藏成功', favorited: true, favoriteCount: note.favoriteCount });
    }
  } catch (error) {
    console.error('收藏错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const shareNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await noteRepository.findOne({ where: { id } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    note.shareCount += 1;
    await noteRepository.save(note);

    res.json({ message: '分享成功', shareCount: note.shareCount });
  } catch (error) {
    console.error('分享错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getDrafts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [drafts, total] = await noteRepository.findAndCount({
      where: {
        author: { id: req.user.id },
        status: NoteStatus.DRAFT,
      },
      order: { updatedAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: drafts,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取草稿错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const draft = await noteRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!draft) {
      res.status(404).json({ message: '草稿不存在' });
      return;
    }

    if (draft.author.id !== req.user.id) {
      res.status(403).json({ message: '无权删除此草稿' });
      return;
    }

    await noteRepository.remove(draft);

    res.json({ message: '草稿删除成功' });
  } catch (error) {
    console.error('删除草稿错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const publishDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const draft = await noteRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!draft) {
      res.status(404).json({ message: '草稿不存在' });
      return;
    }

    if (draft.author.id !== req.user.id) {
      res.status(403).json({ message: '无权发布此草稿' });
      return;
    }

    draft.status = NoteStatus.PENDING;
    await noteRepository.save(draft);

    const userRepository = AppDataSource.getRepository('User');
    await userRepository.increment({ id: req.user.id }, 'noteCount', 1);

    res.json({ message: '笔记已提交审核' });
  } catch (error) {
    console.error('发布草稿错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
