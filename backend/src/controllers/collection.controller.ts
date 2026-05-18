import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Collection } from '../entities/Collection';
import { CollectionItem } from '../entities/CollectionItem';
import { Note } from '../entities/Note';
import { In } from 'typeorm';

const collectionRepository = AppDataSource.getRepository(Collection);
const collectionItemRepository = AppDataSource.getRepository(CollectionItem);
const noteRepository = AppDataSource.getRepository(Note);

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { name, description, cover, isPublic } = req.body;

    if (!name) {
      res.status(400).json({ message: '合集名称不能为空' });
      return;
    }

    const collection = collectionRepository.create({
      name,
      description: description || '',
      cover: cover || '',
      isPublic: isPublic || false,
      userId: req.user.id,
    });

    await collectionRepository.save(collection);

    res.status(201).json({
      message: '合集创建成功',
      collection,
    });
  } catch (error) {
    console.error('创建合集错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCollectionList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(400).json({ message: '缺少用户ID' });
      return;
    }

    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = { userId: userId as string };

    if (!req.user || req.user.id !== userId) {
      whereCondition.isPublic = true;
    }

    const [collections, total] = await collectionRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: collections.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        cover: c.cover,
        itemCount: c.itemCount,
        isPublic: c.isPublic,
        createdAt: c.createdAt,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取合集列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCollectionDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const collection = await collectionRepository.findOne({ where: { id } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (!collection.isPublic && (!req.user || req.user.id !== collection.userId)) {
      res.status(403).json({ message: '无权查看此合集' });
      return;
    }

    res.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        cover: collection.cover,
        itemCount: collection.itemCount,
        isPublic: collection.isPublic,
        userId: collection.userId,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
    });
  } catch (error) {
    console.error('获取合集详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getCollectionItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const collection = await collectionRepository.findOne({ where: { id } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (!collection.isPublic && (!req.user || req.user.id !== collection.userId)) {
      res.status(403).json({ message: '无权查看此合集' });
      return;
    }

    const [items, total] = await collectionItemRepository.findAndCount({
      where: { collectionId: id },
      relations: ['note', 'note.author', 'note.topics'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: items.map(item => ({
        id: item.id,
        noteId: item.noteId,
        note: {
          id: item.note.id,
          title: item.note.title,
          content: item.note.content.substring(0, 100),
          images: item.note.images,
          likeCount: item.note.likeCount,
          commentCount: item.note.commentCount,
          topics: item.note.topics?.map(t => t.name) || [],
          author: {
            id: item.note.author?.id,
            nickname: item.note.author?.nickname,
            avatar: item.note.author?.avatar,
          },
          createdAt: item.note.createdAt,
        },
        addedAt: item.createdAt,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取合集内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const addNoteToCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { collectionId, noteId } = req.body;

    const collection = await collectionRepository.findOne({ where: { id: collectionId } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (collection.userId !== req.user.id) {
      res.status(403).json({ message: '无权操作此合集' });
      return;
    }

    const note = await noteRepository.findOne({ where: { id: noteId } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const existingItem = await collectionItemRepository.findOne({
      where: { collectionId, noteId },
    });

    if (existingItem) {
      res.status(400).json({ message: '该笔记已在合集中' });
      return;
    }

    const item = collectionItemRepository.create({
      collectionId,
      noteId,
    });

    await collectionItemRepository.save(item);

    collection.itemCount += 1;
    await collectionRepository.save(collection);

    res.json({ message: '添加成功' });
  } catch (error) {
    console.error('添加笔记到合集错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const removeNoteFromCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { collectionId, noteId } = req.body;

    const collection = await collectionRepository.findOne({ where: { id: collectionId } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (collection.userId !== req.user.id) {
      res.status(403).json({ message: '无权操作此合集' });
      return;
    }

    const item = await collectionItemRepository.findOne({
      where: { collectionId, noteId },
    });

    if (!item) {
      res.status(404).json({ message: '该笔记不在合集中' });
      return;
    }

    await collectionItemRepository.remove(item);

    collection.itemCount = Math.max(0, collection.itemCount - 1);
    await collectionRepository.save(collection);

    res.json({ message: '移除成功' });
  } catch (error) {
    console.error('从合集移除笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;
    const { name, description, cover, isPublic } = req.body;

    const collection = await collectionRepository.findOne({ where: { id } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (collection.userId !== req.user.id) {
      res.status(403).json({ message: '无权修改此合集' });
      return;
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (cover !== undefined) collection.cover = cover;
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await collectionRepository.save(collection);

    res.json({
      message: '更新成功',
      collection,
    });
  } catch (error) {
    console.error('更新合集错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    const collection = await collectionRepository.findOne({ where: { id } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (collection.userId !== req.user.id) {
      res.status(403).json({ message: '无权删除此合集' });
      return;
    }

    await collectionItemRepository.delete({ collectionId: id });
    await collectionRepository.remove(collection);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除合集错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const batchAddToCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { collectionId, noteIds } = req.body;

    const collection = await collectionRepository.findOne({ where: { id: collectionId } });
    if (!collection) {
      res.status(404).json({ message: '合集不存在' });
      return;
    }

    if (collection.userId !== req.user.id) {
      res.status(403).json({ message: '无权操作此合集' });
      return;
    }

    const existingItems = await collectionItemRepository.find({
      where: { collectionId, noteId: In(noteIds) },
    });
    const existingNoteIds = existingItems.map(item => item.noteId);
    const newNoteIds = noteIds.filter((id: string) => !existingNoteIds.includes(id));

    const items = newNoteIds.map((noteId: string) =>
      collectionItemRepository.create({ collectionId, noteId })
    );

    await collectionItemRepository.save(items);

    collection.itemCount += newNoteIds.length;
    await collectionRepository.save(collection);

    res.json({ message: '批量添加成功', addedCount: newNoteIds.length });
  } catch (error) {
    console.error('批量添加笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
