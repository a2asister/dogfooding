import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { Dislike } from '../entities/Dislike';
import { Block, BlockType } from '../entities/Block';
import { calculateHotScore } from '../utils/hotScore';
import { In, Not } from 'typeorm';

const noteRepository = AppDataSource.getRepository(Note);
const dislikeRepository = AppDataSource.getRepository(Dislike);
const blockRepository = AppDataSource.getRepository(Block);

export const getHotFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let blockedUserIds: string[] = [];
    let blockedTopicIds: string[] = [];
    let dislikedNoteIds: string[] = [];

    if (req.user) {
      const userBlocks = await blockRepository.find({
        where: { userId: req.user.id },
        select: ['blockType', 'blockId'],
      });
      blockedUserIds = userBlocks.filter(b => b.blockType === BlockType.USER).map(b => b.blockId);
      blockedTopicIds = userBlocks.filter(b => b.blockType === BlockType.TOPIC).map(b => b.blockId);

      const userDislikes = await dislikeRepository.find({
        where: { userId: req.user.id },
        select: ['noteId'],
      });
      dislikedNoteIds = userDislikes.map(d => d.noteId);
    }

    let whereCondition: any = {
      status: NoteStatus.PUBLISHED,
      isDeleted: false,
    };

    if (blockedUserIds.length > 0) {
      whereCondition.author = { id: Not(In(blockedUserIds)) };
    }

    if (dislikedNoteIds.length > 0) {
      whereCondition.id = Not(In(dislikedNoteIds));
    }

    const [notes, total] = await noteRepository.findAndCount({
      where: whereCondition,
      relations: ['author', 'topics'],
      skip,
      take: Number(pageSize),
    });

    const notesWithScore = notes.map(note => ({
      ...note,
      hotScore: calculateHotScore(note),
    }));

    notesWithScore.sort((a, b) => b.hotScore - a.hotScore);

    const noteList = notesWithScore.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 100),
      images: note.images,
      location: note.location,
      likeCount: note.likeCount,
      favoriteCount: note.favoriteCount,
      shareCount: note.shareCount,
      viewCount: note.viewCount,
      commentCount: note.commentCount,
      hotScore: note.hotScore,
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
    console.error('获取热门信息流错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNearbyFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, city, lat, lng, radius = 5000 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = {
      status: NoteStatus.PUBLISHED,
      isDeleted: false,
    };

    if (city) {
      whereCondition.locationInfo = { city: city as string };
    }

    const [notes, total] = await noteRepository.findAndCount({
      where: whereCondition,
      relations: ['author', 'topics'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    let noteList = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content.substring(0, 100),
      images: note.images,
      location: note.location,
      locationInfo: note.locationInfo,
      likeCount: note.likeCount,
      favoriteCount: note.favoriteCount,
      commentCount: note.commentCount,
      topics: note.topics.map((t) => t.name),
      author: {
        id: note.author.id,
        nickname: note.author.nickname,
        avatar: note.author.avatar,
      },
      distance: 0,
      createdAt: note.createdAt,
    }));

    if (lat && lng) {
      noteList = noteList.map((note) => {
        if (note.locationInfo?.lat && note.locationInfo?.lng) {
          note.distance = calculateDistance(
            Number(lat),
            Number(lng),
            note.locationInfo.lat,
            note.locationInfo.lng
          );
        }
        return note;
      });
      noteList.sort((a, b) => a.distance - b.distance);
    }

    res.json({
      list: noteList,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取同城信息流错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const dislikeNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    const note = await noteRepository.findOne({ where: { id } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const existingDislike = await dislikeRepository.findOne({
      where: { userId: req.user.id, noteId: id },
    });

    if (existingDislike) {
      await dislikeRepository.remove(existingDislike);
      res.json({ message: '取消不感兴趣成功', disliked: false });
    } else {
      const dislike = dislikeRepository.create({
        userId: req.user.id,
        noteId: id,
        reason,
      });
      await dislikeRepository.save(dislike);
      res.json({ message: '操作成功，将减少此类内容推荐', disliked: true });
    }
  } catch (error) {
    console.error('不感兴趣操作错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { userId } = req.body;

    if (userId === req.user.id) {
      res.status(400).json({ message: '不能屏蔽自己' });
      return;
    }

    const existingBlock = await blockRepository.findOne({
      where: { userId: req.user.id, blockType: BlockType.USER, blockId: userId },
    });

    if (existingBlock) {
      await blockRepository.remove(existingBlock);
      res.json({ message: '取消屏蔽成功', blocked: false });
    } else {
      const block = blockRepository.create({
        userId: req.user.id,
        blockType: BlockType.USER,
        blockId: userId,
      });
      await blockRepository.save(block);
      res.json({ message: '屏蔽成功', blocked: true });
    }
  } catch (error) {
    console.error('屏蔽用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const blockTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { topicId } = req.body;

    const existingBlock = await blockRepository.findOne({
      where: { userId: req.user.id, blockType: BlockType.TOPIC, blockId: topicId },
    });

    if (existingBlock) {
      await blockRepository.remove(existingBlock);
      res.json({ message: '取消屏蔽成功', blocked: false });
    } else {
      const block = blockRepository.create({
        userId: req.user.id,
        blockType: BlockType.TOPIC,
        blockId: topicId,
      });
      await blockRepository.save(block);
      res.json({ message: '屏蔽成功', blocked: true });
    }
  } catch (error) {
    console.error('屏蔽话题错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getBlockList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { type } = req.query;

    let whereCondition: any = { userId: req.user.id };
    if (type) {
      whereCondition.blockType = type;
    }

    const blocks = await blockRepository.find({
      where: whereCondition,
      relations: ['blockedUser', 'blockedTopic'],
    });

    const blockedUsers = blocks
      .filter(b => b.blockType === BlockType.USER)
      .map(b => ({
        id: b.id,
        type: 'user',
        user: b.blockedUser ? {
          id: b.blockedUser.id,
          nickname: b.blockedUser.nickname,
          avatar: b.blockedUser.avatar,
        } : null,
        createdAt: b.createdAt,
      }));

    const blockedTopics = blocks
      .filter(b => b.blockType === BlockType.TOPIC)
      .map(b => ({
        id: b.id,
        type: 'topic',
        topic: b.blockedTopic ? {
          id: b.blockedTopic.id,
          name: b.blockedTopic.name,
          cover: b.blockedTopic.cover,
        } : null,
        createdAt: b.createdAt,
      }));

    res.json({
      users: blockedUsers,
      topics: blockedTopics,
    });
  } catch (error) {
    console.error('获取屏蔽列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};


