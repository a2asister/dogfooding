import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { User } from '../entities/User';
import { Topic } from '../entities/Topic';
import { SearchHistory } from '../entities/SearchHistory';
import { HotSearch } from '../entities/HotSearch';
import { Like } from 'typeorm';

const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);
const topicRepository = AppDataSource.getRepository(Topic);
const searchHistoryRepository = AppDataSource.getRepository(SearchHistory);
const hotSearchRepository = AppDataSource.getRepository(HotSearch);

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, type = 'all', page = 1, pageSize = 20 } = req.query;

    if (!keyword) {
      res.status(400).json({ message: '请输入搜索关键词' });
      return;
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const searchKeyword = `%${keyword}%`;

    if (req.user) {
      const existingHistory = await searchHistoryRepository.findOne({
        where: { userId: req.user.id, keyword: keyword as string },
      });
      if (existingHistory) {
        existingHistory.searchCount += 1;
        existingHistory.updatedAt = new Date();
        await searchHistoryRepository.save(existingHistory);
      } else {
        const history = searchHistoryRepository.create({
          keyword: keyword as string,
          userId: req.user.id,
          updatedAt: new Date(),
        });
        await searchHistoryRepository.save(history);
      }
    }

    const existingHotSearch = await hotSearchRepository.findOne({
      where: { keyword: keyword as string },
    });
    if (existingHotSearch) {
      existingHotSearch.searchCount += 1;
      existingHotSearch.updatedAt = new Date();
      await hotSearchRepository.save(existingHotSearch);
    } else {
      const hotSearch = hotSearchRepository.create({
        keyword: keyword as string,
        searchCount: 1,
        updatedAt: new Date(),
      });
      await hotSearchRepository.save(hotSearch);
    }

    const result: any = {};

    if (type === 'all' || type === 'note') {
      const [notes, noteTotal] = await noteRepository.findAndCount({
        where: [
          { title: Like(searchKeyword), status: NoteStatus.PUBLISHED, isDeleted: false },
          { content: Like(searchKeyword), status: NoteStatus.PUBLISHED, isDeleted: false },
        ],
        relations: ['author', 'topics'],
        order: { createdAt: 'DESC' },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 5 : Number(pageSize),
      });
      result.notes = {
        list: notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content.substring(0, 100),
          images: note.images,
          likeCount: note.likeCount,
          commentCount: note.commentCount,
          author: {
            id: note.author.id,
            nickname: note.author.nickname,
            avatar: note.author.avatar,
          },
          topics: note.topics.map(t => t.name),
          createdAt: note.createdAt,
        })),
        total: noteTotal,
      };
    }

    if (type === 'all' || type === 'user') {
      const [users, userTotal] = await userRepository.findAndCount({
        where: [
          { nickname: Like(searchKeyword), isActive: true },
          { username: Like(searchKeyword), isActive: true },
        ],
        order: { followerCount: 'DESC' },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 5 : Number(pageSize),
      });
      result.users = {
        list: users.map(user => ({
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio,
          followerCount: user.followerCount,
          noteCount: user.noteCount,
        })),
        total: userTotal,
      };
    }

    if (type === 'all' || type === 'topic') {
      const [topics, topicTotal] = await topicRepository.findAndCount({
        where: { name: Like(searchKeyword) },
        order: { noteCount: 'DESC' },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 5 : Number(pageSize),
      });
      result.topics = {
        list: topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
          cover: topic.cover,
          noteCount: topic.noteCount,
          followCount: topic.followCount,
        })),
        total: topicTotal,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      res.json({ suggestions: [] });
      return;
    }

    const searchKeyword = `%${keyword}%`;

    const [notes, users, topics, hotSearches] = await Promise.all([
      noteRepository.find({
        where: { title: Like(searchKeyword), status: NoteStatus.PUBLISHED, isDeleted: false },
        take: 5,
        select: ['title'],
      }),
      userRepository.find({
        where: { nickname: Like(searchKeyword), isActive: true },
        take: 5,
        select: ['nickname'],
      }),
      topicRepository.find({
        where: { name: Like(searchKeyword) },
        take: 5,
        select: ['name'],
      }),
      hotSearchRepository.find({
        where: { keyword: Like(searchKeyword) },
        take: 5,
        order: { searchCount: 'DESC' },
        select: ['keyword'],
      }),
    ]);

    const suggestions = [
      ...notes.map(n => n.title),
      ...users.map(u => u.nickname),
      ...topics.map(t => t.name),
      ...hotSearches.map(h => h.keyword),
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);

    res.json({ suggestions });
  } catch (error) {
    console.error('获取搜索建议错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSearchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const histories = await searchHistoryRepository.find({
      where: { userId: req.user.id },
      order: { updatedAt: 'DESC' },
      take: 20,
    });

    res.json({
      list: histories.map(h => ({
        id: h.id,
        keyword: h.keyword,
        searchCount: h.searchCount,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error('获取搜索历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const clearSearchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    await searchHistoryRepository.delete({ userId: req.user.id });

    res.json({ message: '搜索历史已清空' });
  } catch (error) {
    console.error('清空搜索历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteSearchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    await searchHistoryRepository.delete({ id, userId: req.user.id });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除搜索历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getHotSearches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hotSearches = await hotSearchRepository.find({
      order: { searchCount: 'DESC' },
      take: 20,
    });

    res.json({
      list: hotSearches.map((h, index) => ({
        id: h.id,
        keyword: h.keyword,
        searchCount: h.searchCount,
        rank: index + 1,
        isHot: h.isHot,
      })),
    });
  } catch (error) {
    console.error('获取热门搜索错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
