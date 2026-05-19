import { Request, Response } from 'express';
import * as messageService from '../services/message.service';
import { MessageType } from '../entities/Message';

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content, type, metadata } = req.body;

    if (!senderId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const message = await messageService.sendMessage(
      senderId,
      receiverId,
      content,
      type as MessageType,
      metadata
    );

    res.status(201).json({ message: '发送成功', data: message });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await messageService.getUserConversations(
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取会话列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getConversationMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await messageService.getConversationMessages(
      conversationId,
      userId,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取会话消息错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    await messageService.markMessagesAsRead(conversationId, userId);
    res.json({ message: '已标记为已读' });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await messageService.deleteMessage(messageId, userId);
    if (success) {
      res.json({ message: '消息已删除' });
    } else {
      res.status(404).json({ message: '消息不存在' });
    }
  } catch (error) {
    console.error('删除消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const recallMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await messageService.recallMessage(messageId, userId);
    if (success) {
      res.json({ message: '消息已撤回' });
    } else {
      res.status(404).json({ message: '消息不存在' });
    }
  } catch (error) {
    console.error('撤回消息错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await messageService.deleteConversation(conversationId, userId);
    if (success) {
      res.json({ message: '会话已删除' });
    } else {
      res.status(404).json({ message: '会话不存在' });
    }
  } catch (error) {
    console.error('删除会话错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const blockConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await messageService.blockConversation(conversationId, userId);
    if (success) {
      res.json({ message: '已屏蔽会话' });
    } else {
      res.status(404).json({ message: '会话不存在' });
    }
  } catch (error) {
    console.error('屏蔽会话错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const unblockConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const success = await messageService.unblockConversation(conversationId, userId);
    if (success) {
      res.json({ message: '已取消屏蔽' });
    } else {
      res.status(404).json({ message: '会话不存在' });
    }
  } catch (error) {
    console.error('取消屏蔽错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const count = await messageService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('获取未读数错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
