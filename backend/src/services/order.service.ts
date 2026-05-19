import { AppDataSource } from '../config/database';
import { Order, OrderType, OrderStatus, PaymentMethod } from '../entities/Order';
import { OrderItem, ItemType } from '../entities/OrderItem';
import { User } from '../entities/User';
import { Note } from '../entities/Note';
import { Product } from '../entities/Product';
import { MembershipPlan } from '../entities/MembershipPlan';
import { Promotion, PromotionPlanType, PromotionStatus } from '../entities/Promotion';
import { Earning, EarningType, EarningStatus } from '../entities/Earning';
import { v4 as uuidv4 } from 'uuid';

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const userRepository = AppDataSource.getRepository(User);
const noteRepository = AppDataSource.getRepository(Note);
const productRepository = AppDataSource.getRepository(Product);
const membershipPlanRepository = AppDataSource.getRepository(MembershipPlan);
const promotionRepository = AppDataSource.getRepository(Promotion);
const earningRepository = AppDataSource.getRepository(Earning);

export const generateOrderNo = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
};

export const createOrder = async (
  userId: string,
  orderType: OrderType,
  items: Array<{
    itemType: ItemType;
    itemId?: string;
    itemName: string;
    itemDescription?: string;
    itemImage?: string;
    unitPrice: number;
    quantity?: number;
    commissionRate?: number;
    sellerId?: string;
    noteId?: string;
    productId?: string;
  }>,
  options: {
    discountAmount?: number;
    paymentMethod?: PaymentMethod;
    remark?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<{ order: Order; orderItems: OrderItem[] }> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.unitPrice * (item.quantity || 1));
  }, 0);

  const discountAmount = options.discountAmount || 0;
  const actualAmount = Math.max(0, totalAmount - discountAmount);

  const orderNo = generateOrderNo();

  const order = orderRepository.create({
    orderNo,
    user,
    userId,
    type: orderType,
    status: OrderStatus.PENDING,
    totalAmount,
    discountAmount,
    actualAmount,
    paymentMethod: options.paymentMethod,
    remark: options.remark,
    metadata: options.metadata,
    expiredAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  const savedOrder = await orderRepository.save(order);

  const orderItems: OrderItem[] = [];
  for (const item of items) {
    const subtotal = item.unitPrice * (item.quantity || 1);
    const commissionAmount = item.commissionRate
      ? subtotal * (item.commissionRate / 100)
      : 0;

    const orderItem = orderItemRepository.create({
      order: savedOrder,
      orderId: savedOrder.id,
      itemType: item.itemType,
      itemId: item.itemId,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      itemImage: item.itemImage,
      unitPrice: item.unitPrice,
      quantity: item.quantity || 1,
      subtotal,
      commissionRate: item.commissionRate || 0,
      commissionAmount,
      sellerId: item.sellerId,
      noteId: item.noteId,
      productId: item.productId,
    });

    orderItems.push(await orderItemRepository.save(orderItem));
  }

  return { order: savedOrder, orderItems };
};

export const createMembershipOrder = async (
  userId: string,
  planId: string,
  paymentMethod: PaymentMethod
): Promise<{ order: Order; orderItems: OrderItem[] }> => {
  const plan = await membershipPlanRepository.findOne({ where: { id: planId } });
  if (!plan) {
    throw new Error('会员套餐不存在');
  }

  const items = [{
    itemType: ItemType.MEMBERSHIP_PLAN,
    itemId: planId,
    itemName: plan.name,
    itemDescription: plan.description,
    unitPrice: plan.discountPrice || plan.price,
    quantity: 1,
  }];

  return await createOrder(userId, OrderType.MEMBERSHIP, items, {
    paymentMethod,
    metadata: { planId, planType: plan.planType, durationDays: plan.durationDays },
  });
};

export const createPromotionOrder = async (
  userId: string,
  noteId: string,
  planType: PromotionPlanType,
  budget: number,
  durationHours: number,
  paymentMethod: PaymentMethod
): Promise<{ order: Order; orderItems: OrderItem[] }> => {
  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const planNames: Record<PromotionPlanType, string> = {
    [PromotionPlanType.VIEWS_BOOST]: '浏览量加热',
    [PromotionPlanType.LIKES_BOOST]: '点赞量加热',
    [PromotionPlanType.FOLLOWERS_BOOST]: '粉丝增长',
    [PromotionPlanType.HOT_RANK_BOOST]: '热榜推广',
    [PromotionPlanType.HOMEPAGE_FEATURE]: '首页推荐',
    [PromotionPlanType.TOPIC_PIN]: '话题置顶',
  };

  const items = [{
    itemType: ItemType.PROMOTION_PLAN,
    itemId: noteId,
    itemName: planNames[planType],
    itemDescription: `为笔记"${note.title}"进行推广`,
    itemImage: note.images?.[0],
    unitPrice: budget,
    quantity: 1,
  }];

  return await createOrder(userId, OrderType.PROMOTION, items, {
    paymentMethod,
    metadata: { noteId, planType, durationHours, budget },
  });
};

export const createPrivateNoteOrder = async (
  userId: string,
  noteId: string,
  price: number,
  paymentMethod: PaymentMethod
): Promise<{ order: Order; orderItems: OrderItem[] }> => {
  const note = await noteRepository.findOne({ where: { id: noteId }, relations: ['author'] });
  if (!note) {
    throw new Error('笔记不存在');
  }

  const items = [{
    itemType: ItemType.PRIVATE_NOTE,
    itemId: noteId,
    itemName: note.title,
    itemDescription: '付费私密笔记',
    itemImage: note.images?.[0],
    unitPrice: price,
    quantity: 1,
    commissionRate: 30,
    sellerId: note.authorId,
    noteId,
  }];

  return await createOrder(userId, OrderType.PRIVATE_NOTE, items, {
    paymentMethod,
    metadata: { noteId, authorId: note.authorId },
  });
};

export const createProductOrder = async (
  userId: string,
  productItems: Array<{
    productId: string;
    quantity: number;
    noteId?: string;
  }>,
  paymentMethod: PaymentMethod
): Promise<{ order: Order; orderItems: OrderItem[] }> => {
  const items: any[] = [];

  for (const pi of productItems) {
    const product = await productRepository.findOne({ where: { id: pi.productId } });
    if (!product) {
      throw new Error(`商品不存在: ${pi.productId}`);
    }

    items.push({
      itemType: ItemType.PRODUCT,
      itemId: pi.productId,
      itemName: product.title,
      itemDescription: product.description,
      itemImage: product.images?.[0],
      unitPrice: product.price,
      quantity: pi.quantity,
      commissionRate: product.commissionRate,
      noteId: pi.noteId,
      productId: pi.productId,
    });
  }

  return await createOrder(userId, OrderType.PRODUCT, items, {
    paymentMethod,
  });
};

export const processOrderPayment = async (
  orderId: string,
  transactionId: string,
  paymentMethod: PaymentMethod
): Promise<Order> => {
  const order = await orderRepository.findOne({
    where: { id: orderId },
    relations: ['items'],
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('订单状态不正确');
  }

  order.status = OrderStatus.PAID;
  order.paymentMethod = paymentMethod;
  order.transactionId = transactionId;
  order.paidAt = new Date();

  const savedOrder = await orderRepository.save(order);

  await processOrderFulfillment(savedOrder);

  return savedOrder;
};

export const processOrderFulfillment = async (order: Order): Promise<void> => {
  if (!order.items || order.items.length === 0) {
    return;
  }

  for (const item of order.items) {
    await processOrderItemFulfillment(order, item);
  }
};

export const processOrderItemFulfillment = async (order: Order, item: OrderItem): Promise<void> => {
  switch (item.itemType) {
    case ItemType.MEMBERSHIP_PLAN:
      await fulfillMembership(order.userId, item);
      break;
    case ItemType.PROMOTION_PLAN:
      await fulfillPromotion(order.userId, item, order.metadata);
      break;
    case ItemType.PRIVATE_NOTE:
      await fulfillPrivateNote(order.userId, item);
      break;
    case ItemType.PRODUCT:
      await fulfillProduct(order.userId, item);
      break;
  }

  if (item.sellerId && item.commissionAmount > 0) {
    await createCommissionEarning(order, item);
  }
};

export const fulfillMembership = async (userId: string, item: OrderItem): Promise<void> => {
  const plan = await membershipPlanRepository.findOne({ where: { id: item.itemId } });
  if (!plan) return;

  const userMembershipRepository = AppDataSource.getRepository('UserMembership');
  const existingMembership = await userMembershipRepository.findOne({
    where: { userId, status: 'active' },
  });

  const startDate = new Date();
  let endDate: Date;

  if (existingMembership && existingMembership.expiresAt > new Date()) {
    endDate = new Date(existingMembership.expiresAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    existingMembership.expiresAt = endDate;
    existingMembership.planId = plan.id;
    await userMembershipRepository.save(existingMembership);
  } else {
    endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const newMembership = userMembershipRepository.create({
      userId,
      planId: plan.id,
      startDate,
      expiresAt: endDate,
      status: 'active',
      features: plan.features,
    });
    await userMembershipRepository.save(newMembership);
  }
};

export const fulfillPromotion = async (
  userId: string,
  item: OrderItem,
  metadata?: Record<string, any>
): Promise<void> => {
  const noteId = metadata?.noteId || item.itemId;
  const planType = metadata?.planType as PromotionPlanType;
  const durationHours = metadata?.durationHours || 24;
  const budget = item.unitPrice;

  const note = await noteRepository.findOne({ where: { id: noteId } });
  if (!note) return;

  const targetViews = Math.floor(budget * 100);

  const promotion = promotionRepository.create({
    userId,
    noteId,
    note,
    planType,
    budget,
    targetViews,
    durationHours,
    boostMultiplier: 2.0,
    startTime: new Date(),
    endTime: new Date(Date.now() + durationHours * 60 * 60 * 1000),
    status: planType === PromotionPlanType.VIEWS_BOOST ? PromotionStatus.ACTIVE : PromotionStatus.PENDING,
  });

  await promotionRepository.save(promotion);
};

export const fulfillPrivateNote = async (userId: string, item: OrderItem): Promise<void> => {
};

export const fulfillProduct = async (userId: string, item: OrderItem): Promise<void> => {
  const noteProductRepository = AppDataSource.getRepository('NoteProduct');
  if (item.noteId && item.productId) {
    await noteProductRepository.increment(
      { noteId: item.noteId, productId: item.productId },
      'conversionCount',
      item.quantity
    );
  }
};

export const createCommissionEarning = async (order: Order, item: OrderItem): Promise<void> => {
  const platformFee = item.commissionAmount * 0.1;
  const netAmount = item.commissionAmount - platformFee;

  const earning = earningRepository.create({
    userId: item.sellerId!,
    type: EarningType.COMMISSION,
    status: EarningStatus.PENDING,
    amount: netAmount,
    description: `订单${order.orderNo}佣金`,
    orderId: order.id,
    sourceId: item.productId || item.noteId,
    sourceType: item.itemType,
    platformFee,
    taxAmount: 0,
    settlementDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await earningRepository.save(earning);
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  return await orderRepository.findOne({
    where: { id: orderId },
    relations: ['items', 'user'],
  });
};

export const getOrderByNo = async (orderNo: string): Promise<Order | null> => {
  return await orderRepository.findOne({
    where: { orderNo },
    relations: ['items', 'user'],
  });
};

export const getUserOrders = async (
  userId: string,
  status?: OrderStatus,
  page: number = 1,
  pageSize: number = 20
): Promise<{ orders: Order[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const whereCondition: any = { userId };
  if (status) {
    whereCondition.status = status;
  }

  const [orders, total] = await orderRepository.findAndCount({
    where: whereCondition,
    relations: ['items'],
    order: { createdAt: 'DESC' },
    skip,
    take: pageSize,
  });

  return { orders, total };
};

export const cancelOrder = async (orderId: string, userId: string): Promise<Order> => {
  const order = await orderRepository.findOne({ where: { id: orderId, userId } });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('只有待支付订单可以取消');
  }

  order.status = OrderStatus.CANCELLED;
  return await orderRepository.save(order);
};

export const expireOrder = async (orderId: string): Promise<Order> => {
  const order = await orderRepository.findOne({ where: { id: orderId } });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('订单状态不正确');
  }

  order.status = OrderStatus.EXPIRED;
  return await orderRepository.save(order);
};

export const refundOrder = async (orderId: string, reason?: string): Promise<Order> => {
  const order = await orderRepository.findOne({ where: { id: orderId } });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== OrderStatus.PAID) {
    throw new Error('只有已支付订单可以退款');
  }

  order.status = OrderStatus.REFUNDED;
  order.remark = reason || '';
  return await orderRepository.save(order);
};
