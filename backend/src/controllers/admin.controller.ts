import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Note, NoteStatus } from '../entities/Note';
import { User, UserRole } from '../entities/User';
import { SystemConfig } from '../entities/SystemConfig';

const noteRepository = AppDataSource.getRepository(Note);
const userRepository = AppDataSource.getRepository(User);
const configRepository = AppDataSource.getRepository(SystemConfig);

export const getPendingNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [notes, total] = await noteRepository.findAndCount({
      where: { status: NoteStatus.PENDING },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: notes,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取待审核笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const approveNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await noteRepository.findOne({ where: { id } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    note.status = NoteStatus.PUBLISHED;
    await noteRepository.save(note);

    res.json({ message: '审核通过' });
  } catch (error) {
    console.error('审核笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const rejectNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const note = await noteRepository.findOne({ where: { id }, relations: ['author'] });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    note.status = NoteStatus.REJECTED;
    note.rejectReason = reason || '内容不符合规范';
    await noteRepository.save(note);

    await userRepository.decrement({ id: note.author.id }, 'noteCount', 1);

    res.json({ message: '已驳回' });
  } catch (error) {
    console.error('驳回笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const takeDownNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const note = await noteRepository.findOne({ where: { id }, relations: ['author'] });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    note.status = NoteStatus.TAKEN_DOWN;
    note.rejectReason = reason || '内容不符合规范';
    await noteRepository.save(note);

    await userRepository.decrement({ id: note.author.id }, 'noteCount', 1);

    res.json({ message: '已下架' });
  } catch (error) {
    console.error('下架笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    let whereCondition: any = {};
    if (keyword) {
      whereCondition = [
        { nickname: Like(`%${keyword}%`) },
        { phone: Like(`%${keyword}%`) },
        { username: Like(`%${keyword}%`) },
      ];
    }

    const [users, total] = await userRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: Number(pageSize),
    });

    res.json({
      list: users,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ message: '不能禁用管理员账号' });
      return;
    }

    user.isActive = !user.isActive;
    await userRepository.save(user);

    res.json({
      message: user.isActive ? '用户已启用' : '用户已禁用',
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('切换用户状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getSystemConfigs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const configs = await configRepository.find();
    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      configMap[config.key] = config.value;
    });

    res.json({ configs: configMap });
  } catch (error) {
    console.error('获取系统配置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, description } = req.body;

    let config = await configRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
      if (description !== undefined) {
        config.description = description;
      }
    } else {
      config = configRepository.create({ key, value, description });
    }

    await configRepository.save(config);

    res.json({ message: '配置更新成功' });
  } catch (error) {
    console.error('更新系统配置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
