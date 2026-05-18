import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { createFollowNotification } from '../utils/notification';

const userRepository = AppDataSource.getRepository(User);
const followRepository = AppDataSource.getRepository(Follow);

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    let isFollowing = false;
    if (req.user && req.user.id !== id) {
      isFollowing = !!(await followRepository.findOne({
        where: { followerId: req.user.id, followingId: id },
      }));
    }

    res.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        noteCount: user.noteCount,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { id } = req.params;

    if (req.user.id === id) {
      res.status(400).json({ message: '不能关注自己' });
      return;
    }

    const targetUser = await userRepository.findOne({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const existingFollow = await followRepository.findOne({
      where: { followerId: req.user.id, followingId: id },
    });

    if (existingFollow) {
      await followRepository.remove(existingFollow);
      await userRepository.decrement({ id }, 'followerCount', 1);
      await userRepository.decrement({ id: req.user.id }, 'followingCount', 1);
      res.json({ message: '取消关注成功', following: false });
    } else {
      const follow = followRepository.create({
        followerId: req.user.id,
        followingId: id,
      });
      await followRepository.save(follow);
      await userRepository.increment({ id }, 'followerCount', 1);
      await userRepository.increment({ id: req.user.id }, 'followingCount', 1);

      await createFollowNotification(id, req.user.id, req.user.nickname);

      res.json({ message: '关注成功', following: true });
    }
  } catch (error) {
    console.error('关注错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { nickname, bio, avatar } = req.body;

    if (nickname) {
      req.user.nickname = nickname;
    }
    if (bio !== undefined) {
      req.user.bio = bio;
    }
    if (avatar) {
      req.user.avatar = avatar;
    }

    await userRepository.save(req.user);

    res.json({
      message: '更新成功',
      user: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        bio: req.user.bio,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
