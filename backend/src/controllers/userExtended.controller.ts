import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Blacklist } from '../entities/Blacklist';

const userRepository = AppDataSource.getRepository(User);
const blacklistRepository = AppDataSource.getRepository(Blacklist);

export const updateProfileExtended = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { nickname, bio, avatar, background, location, gender, birthday, website } = req.body;

    if (nickname !== undefined) req.user.nickname = nickname;
    if (bio !== undefined) req.user.bio = bio;
    if (avatar !== undefined) req.user.avatar = avatar;
    if (background !== undefined) req.user.background = background;
    if (location !== undefined) req.user.location = location;
    if (gender !== undefined) req.user.gender = gender;
    if (birthday !== undefined) req.user.birthday = birthday;
    if (website !== undefined) req.user.website = website;

    await userRepository.save(req.user);

    res.json({
      message: '更新成功',
      user: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        background: req.user.background,
        bio: req.user.bio,
        location: req.user.location,
        gender: req.user.gender,
        birthday: req.user.birthday,
        website: req.user.website,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getPrivacySettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const defaultSettings = {
      showFollowers: true,
      showFollowing: true,
      showFavorites: true,
      allowComment: true,
      allowPrivateMessage: true,
    };

    res.json({
      settings: req.user.privacySettings || defaultSettings,
    });
  } catch (error) {
    console.error('获取隐私设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updatePrivacySettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { showFollowers, showFollowing, showFavorites, allowComment, allowPrivateMessage } = req.body;

    const currentSettings = req.user.privacySettings || {
      showFollowers: true,
      showFollowing: true,
      showFavorites: true,
      allowComment: true,
      allowPrivateMessage: true,
    };

    if (showFollowers !== undefined) currentSettings.showFollowers = showFollowers;
    if (showFollowing !== undefined) currentSettings.showFollowing = showFollowing;
    if (showFavorites !== undefined) currentSettings.showFavorites = showFavorites;
    if (allowComment !== undefined) currentSettings.allowComment = allowComment;
    if (allowPrivateMessage !== undefined) currentSettings.allowPrivateMessage = allowPrivateMessage;

    req.user.privacySettings = currentSettings;
    await userRepository.save(req.user);

    res.json({
      message: '更新成功',
      settings: currentSettings,
    });
  } catch (error) {
    console.error('更新隐私设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const defaultSettings = {
      like: true,
      comment: true,
      reply: true,
      follow: true,
      favorite: true,
      system: true,
    };

    res.json({
      settings: req.user.notificationSettings || defaultSettings,
    });
  } catch (error) {
    console.error('获取通知设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { like, comment, reply, follow, favorite, system } = req.body;

    const currentSettings = req.user.notificationSettings || {
      like: true,
      comment: true,
      reply: true,
      follow: true,
      favorite: true,
      system: true,
    };

    if (like !== undefined) currentSettings.like = like;
    if (comment !== undefined) currentSettings.comment = comment;
    if (reply !== undefined) currentSettings.reply = reply;
    if (follow !== undefined) currentSettings.follow = follow;
    if (favorite !== undefined) currentSettings.favorite = favorite;
    if (system !== undefined) currentSettings.system = system;

    req.user.notificationSettings = currentSettings;
    await userRepository.save(req.user);

    res.json({
      message: '更新成功',
      settings: currentSettings,
    });
  } catch (error) {
    console.error('更新通知设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const addToBlacklist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { blockedUserId } = req.body;

    if (blockedUserId === req.user.id) {
      res.status(400).json({ message: '不能将自己加入黑名单' });
      return;
    }

    const blockedUser = await userRepository.findOne({ where: { id: blockedUserId } });
    if (!blockedUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const existingBlacklist = await blacklistRepository.findOne({
      where: { userId: req.user.id, blockedUserId },
    });

    if (existingBlacklist) {
      res.status(400).json({ message: '该用户已在黑名单中' });
      return;
    }

    const blacklist = blacklistRepository.create({
      userId: req.user.id,
      blockedUserId,
    });

    await blacklistRepository.save(blacklist);

    res.json({ message: '已加入黑名单' });
  } catch (error) {
    console.error('添加黑名单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const removeFromBlacklist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { blockedUserId } = req.body;

    const blacklist = await blacklistRepository.findOne({
      where: { userId: req.user.id, blockedUserId },
    });

    if (!blacklist) {
      res.status(404).json({ message: '该用户不在黑名单中' });
      return;
    }

    await blacklistRepository.remove(blacklist);

    res.json({ message: '已移出黑名单' });
  } catch (error) {
    console.error('移出黑名单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getBlacklist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const blacklist = await blacklistRepository.find({
      where: { userId: req.user.id },
      relations: ['blockedUser'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      list: blacklist.map(b => ({
        id: b.id,
        blockedUser: {
          id: b.blockedUser.id,
          nickname: b.blockedUser.nickname,
          avatar: b.blockedUser.avatar,
          bio: b.blockedUser.bio,
        },
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error('获取黑名单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
