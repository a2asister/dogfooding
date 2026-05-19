import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { OrderType, OrderStatus, PaymentMethod } from '../entities/Order';
import { PromotionPlanType } from '../entities/Promotion';

export const createMembershipOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { planId, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { order, orderItems } = await orderService.createMembershipOrder(
      userId,
      planId,
      paymentMethod as PaymentMethod
    );

    res.status(201).json({ message: '订单创建成功', order, orderItems });
  } catch (error) {
    console.error('创建会员订单错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const createPromotionOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId, planType, budget, durationHours, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { order, orderItems } = await orderService.createPromotionOrder(
      userId,
      noteId,
      planType as PromotionPlanType,
      budget,
      durationHours,
      paymentMethod as PaymentMethod
    );

    res.status(201).json({ message: '推广订单创建成功', order, orderItems });
  } catch (error) {
    console.error('创建推广订单错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const createPrivateNoteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId, price, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { order, orderItems } = await orderService.createPrivateNoteOrder(
      userId,
      noteId,
      price,
      paymentMethod as PaymentMethod
    );

    res.status(201).json({ message: '付费笔记订单创建成功', order, orderItems });
  } catch (error) {
    console.error('创建付费笔记订单错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const createProductOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { products, paymentMethod } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const { order, orderItems } = await orderService.createProductOrder(
      userId,
      products,
      paymentMethod as PaymentMethod
    );

    res.status(201).json({ message: '商品订单创建成功', order, orderItems });
  } catch (error) {
    console.error('创建商品订单错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, transactionId, paymentMethod } = req.body;

    const order = await orderService.processOrderPayment(
      orderId,
      transactionId,
      paymentMethod as PaymentMethod
    );

    res.json({ message: '支付成功', order });
  } catch (error) {
    console.error('处理支付错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrder(id);
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    res.json({ order });
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const result = await orderService.getUserOrders(
      userId,
      status as OrderStatus,
      Number(page),
      Number(pageSize)
    );

    res.json(result);
  } catch (error) {
    console.error('获取用户订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const order = await orderService.cancelOrder(id, userId);
    res.json({ message: '订单已取消', order });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({ message: (error as Error).message || '服务器错误' });
  }
};

export const getOrderByNo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNo } = req.params;
    const order = await orderService.getOrderByNo(orderNo);
    if (!order) {
      res.status(404).json({ message: '订单不存在' });
      return;
    }
    res.json({ order });
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
