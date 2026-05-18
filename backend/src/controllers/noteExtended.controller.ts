import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { checkSensitiveWords } from '../utils/sensitiveWords';
import { calculateHotScore } from '../utils/hotScore';

const noteRepository = AppDataSource.getRepository(Note);

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;
    const { title, content, images, location, topics, permission, locationInfo } = req.body;

    const note = await noteRepository.findOne({
      where: { id },
      relations: ['author', 'topics'],
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.author.id !== req.user.id) {
      res.status(403).json({ message: '无权修改此笔记' });
      return;
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (images !== undefined) note.images = images;
    if (location !== undefined) note.location = location;
    if (locationInfo !== undefined) note.locationInfo = locationInfo;
    if (permission !== undefined) note.permission = permission;

    if (topics && topics.length > 0) {
      const topicRepository = AppDataSource.getRepository('Topic');
      const topicEntities = await Promise.all(
        topics.map(async (topicName: string) => {
          let topic = await topicRepository.findOne({ where: { name: topicName } });
          if (!topic) {
            topic = topicRepository.create({ name: topicName });
            await topicRepository.save(topic);
          }
          return topic;
        })
      );
      note.topics = topicEntities;
    }

    if (note.status === NoteStatus.PUBLISHED) {
      note.status = NoteStatus.PENDING;
    }

    await noteRepository.save(note);

    res.json({
      message: note.status === NoteStatus.PENDING ? '笔记已更新，正在重新审核' : '笔记已更新',
      note,
    });
  } catch (error) {
    console.error('更新笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteNoteToTrash = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.author.id !== req.user.id) {
      res.status(403).json({ message: '无权删除此笔记' });
      return;
    }

    note.isDeleted = true;
    note.deletedAt = new Date();
    await noteRepository.save(note);

    res.json({ message: '笔记已移入回收站，30天后将自动删除' });
  } catch (error) {
    console.error('删除笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const restoreNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({
      where: { id, isDeleted: true },
      relations: ['author'],
      withDeleted: true,
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在或未在回收站中' });
      return;
    }

    if (note.author.id !== req.user.id) {
      res.status(403).json({ message: '无权恢复此笔记' });
      return;
    }

    note.isDeleted = false;
    note.deletedAt = null as any;
    await noteRepository.save(note);

    res.json({ message: '笔记已恢复' });
  } catch (error) {
    console.error('恢复笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getTrashNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [notes, total] = await noteRepository.findAndCount({
      where: {
        author: { id: req.user.id },
        isDeleted: true,
      },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content.substring(0, 100),
        images: note.images,
        deletedAt: note.deletedAt,
        createdAt: note.createdAt,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取回收站笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const permanentlyDeleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({
      where: { id, isDeleted: true },
      relations: ['author'],
      withDeleted: true,
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.author.id !== req.user.id) {
      res.status(403).json({ message: '无权永久删除此笔记' });
      return;
    }

    await noteRepository.remove(note);

    res.json({ message: '笔记已永久删除' });
  } catch (error) {
    console.error('永久删除笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNoteStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const note = await noteRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    if (note.author.id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: '无权查看此笔记数据' });
      return;
    }

    const hotScore = calculateHotScore(note);

    res.json({
      stats: {
        viewCount: note.viewCount,
        likeCount: note.likeCount,
        favoriteCount: note.favoriteCount,
        commentCount: note.commentCount,
        shareCount: note.shareCount,
        hotScore,
      },
    });
  } catch (error) {
    console.error('获取笔记统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserNotesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const notes = await noteRepository.find({
      where: {
        author: { id: req.user.id },
        isDeleted: false,
      },
      select: ['viewCount', 'likeCount', 'favoriteCount', 'commentCount', 'shareCount'],
    });

    const totalStats = notes.reduce(
      (acc, note) => ({
        viewCount: acc.viewCount + note.viewCount,
        likeCount: acc.likeCount + note.likeCount,
        favoriteCount: acc.favoriteCount + note.favoriteCount,
        commentCount: acc.commentCount + note.commentCount,
        shareCount: acc.shareCount + note.shareCount,
      }),
      { viewCount: 0, likeCount: 0, favoriteCount: 0, commentCount: 0, shareCount: 0 }
    );

    res.json({
      stats: {
        totalNotes: notes.length,
        ...totalStats,
      },
    });
  } catch (error) {
    console.error('获取用户笔记统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const checkNoteSensitiveWords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      res.status(400).json({ message: '请输入要检查的内容' });
      return;
    }

    const titleResult = title ? checkSensitiveWords(title) : { hasSensitive: false, foundWords: [] };
    const contentResult = content ? checkSensitiveWords(content) : { hasSensitive: false, foundWords: [] };

    const allFoundWords = [...new Set([...titleResult.foundWords, ...contentResult.foundWords])];

    res.json({
      hasSensitive: titleResult.hasSensitive || contentResult.hasSensitive,
      foundWords: allFoundWords,
      titleFiltered: titleResult.hasSensitive,
      contentFiltered: contentResult.hasSensitive,
      message: allFoundWords.length > 0
        ? `检测到敏感词：${allFoundWords.join('、')}，请修改后发布`
        : '内容检测通过',
    });
  } catch (error) {
    console.error('敏感词检测错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
