import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Topic } from '../entities/Topic';
import { TopicFollow } from '../entities/TopicFollow';
import { Note, NoteStatus } from '../entities/Note';
import { In } from 'typeorm';

const topicRepository = AppDataSource.getRepository(Topic);
const topicFollowRepository = AppDataSource.getRepository(TopicFollow);
const noteRepository = AppDataSource.getRepository(Note);

export const getTopicSquare = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hotTopics = await topicRepository.find({
      where: { isHot: true },
      order: { sort: 'ASC', noteCount: 'DESC' },
      take: 10,
    });

    const allTopics = await topicRepository.find({
      order: { noteCount: 'DESC' },
      take: 50,
    });

    const categories = await topicRepository
      .createQueryBuilder('topic')
      .select('topic.category', 'category')
      .where('topic.category IS NOT NULL')
      .distinct(true)
      .getRawMany();

    res.json({
      hotTopics: hotTopics.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        cover: t.cover,
        noteCount: t.noteCount,
        followCount: t.followCount,
        category: t.category,
      })),
      topics: allTopics.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        cover: t.cover,
        noteCount: t.noteCount,
        followCount: t.followCount,
        category: t.category,
      })),
      categories: categories.map(c => c.category),
    });
  } catch (error) {
    console.error('获取话题广场错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getTopicDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const topic = await topicRepository.findOne({ where: { id } });
    if (!topic) {
      res.status(404).json({ message: '话题不存在' });
      return;
    }

    let isFollowing = false;
    if (req.user) {
      isFollowing = !!(await topicFollowRepository.findOne({
        where: { userId: req.user.id, topicId: id },
      }));
    }

    res.json({
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        cover: topic.cover,
        noteCount: topic.noteCount,
        followCount: topic.followCount,
        category: topic.category,
        isFollowing,
        createdAt: topic.createdAt,
      },
    });
  } catch (error) {
    console.error('获取话题详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getTopicNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20, sort = 'latest' } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const topic = await topicRepository.findOne({ where: { id } });
    if (!topic) {
      res.status(404).json({ message: '话题不存在' });
      return;
    }

    let order: any = { createdAt: 'DESC' };
    if (sort === 'hot') {
      order = { likeCount: 'DESC', createdAt: 'DESC' };
    }

    const noteIds = await AppDataSource
      .createQueryBuilder()
      .select('nt.note_id', 'noteId')
      .from('note_topics', 'nt')
      .where('nt.topic_id = :topicId', { topicId: id })
      .getRawMany();

    const ids = noteIds.map(n => n.noteId);

    if (ids.length === 0) {
      res.json({ list: [], total: 0, page: Number(page), pageSize: Number(pageSize) });
      return;
    }

    const [notes, total] = await noteRepository.findAndCount({
      where: {
        id: In(ids),
        status: NoteStatus.PUBLISHED,
        isDeleted: false,
      },
      relations: ['author', 'topics'],
      order,
      skip,
      take: Number(pageSize),
    });

    const noteList = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 100),
      images: note.images,
      likeCount: note.likeCount,
      commentCount: note.commentCount,
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
    console.error('获取话题笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const followTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const topic = await topicRepository.findOne({ where: { id } });
    if (!topic) {
      res.status(404).json({ message: '话题不存在' });
      return;
    }

    const existingFollow = await topicFollowRepository.findOne({
      where: { userId: req.user.id, topicId: id },
    });

    if (existingFollow) {
      await topicFollowRepository.remove(existingFollow);
      topic.followCount = Math.max(0, topic.followCount - 1);
      await topicRepository.save(topic);
      res.json({ message: '取消关注成功', following: false, followCount: topic.followCount });
    } else {
      const follow = topicFollowRepository.create({
        userId: req.user.id,
        topicId: id,
      });
      await topicFollowRepository.save(follow);
      topic.followCount += 1;
      await topicRepository.save(topic);
      res.json({ message: '关注成功', following: true, followCount: topic.followCount });
    }
  } catch (error) {
    console.error('关注话题错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getFollowedTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const follows = await topicFollowRepository.find({
      where: { userId: req.user.id },
      relations: ['topic'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      list: follows.map(f => ({
        id: f.topic.id,
        name: f.topic.name,
        description: f.topic.description,
        cover: f.topic.cover,
        noteCount: f.topic.noteCount,
        followCount: f.topic.followCount,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('获取关注话题错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
