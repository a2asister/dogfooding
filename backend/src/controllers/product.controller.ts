import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product, ProductStatus } from '../entities/Product';
import { NoteProduct } from '../entities/NoteProduct';
import { Note, NoteStatus } from '../entities/Note';

const productRepository = AppDataSource.getRepository(Product);
const noteProductRepository = AppDataSource.getRepository(NoteProduct);
const noteRepository = AppDataSource.getRepository(Note);

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, description, images, price, originalPrice, stock, category, brand, specs, externalUrl, commissionRate } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const product = productRepository.create({
      title,
      description,
      images,
      price,
      originalPrice,
      stock,
      category,
      brand,
      specs,
      externalUrl,
      commissionRate: commissionRate || 10,
      creatorId: userId,
      status: ProductStatus.APPROVED,
    });

    const savedProduct = await productRepository.save(product);

    res.status(201).json({ message: '商品创建成功', product: savedProduct });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, page = 1, pageSize = 20, keyword, creatorId } = req.query;

    const whereCondition: any = {};
    if (creatorId) {
      whereCondition.creatorId = creatorId;
    } else if (userId) {
      whereCondition.creatorId = userId;
    } else {
      whereCondition.status = ProductStatus.APPROVED;
    }

    if (category) {
      whereCondition.category = category;
    }

    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .where(whereCondition);

    if (keyword) {
      queryBuilder.andWhere('product.title LIKE :keyword OR product.description LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getManyAndCount();

    res.json({ list: products, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }
    res.json({ product });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const addProductToNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteId, productId, recommendation, sort } = req.body;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const note = await noteRepository.findOne({ where: { id: noteId, authorId: userId } });
    if (!note) {
      res.status(404).json({ message: '笔记不存在' });
      return;
    }

    const product = await productRepository.findOne({ where: { id: productId, status: ProductStatus.APPROVED } });
    if (!product) {
      res.status(404).json({ message: '商品不存在或未审核通过' });
      return;
    }

    const existing = await noteProductRepository.findOne({
      where: { noteId, productId, creatorId: userId },
    });

    if (existing) {
      res.status(400).json({ message: '该商品已添加到此笔记' });
      return;
    }

    const noteProduct = noteProductRepository.create({
      noteId,
      productId,
      creatorId: userId,
      recommendation,
      sort: sort || 0,
    });

    await noteProductRepository.save(noteProduct);

    res.status(201).json({ message: '商品已添加到笔记', noteProduct });
  } catch (error) {
    console.error('添加商品到笔记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getNoteProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    const noteProducts = await noteProductRepository.find({
      where: { noteId, isActive: true },
      relations: ['product'],
      order: { sort: 'ASC' },
    });

    res.json({ products: noteProducts });
  } catch (error) {
    console.error('获取笔记商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const removeProductFromNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { noteProductId } = req.params;

    if (!userId) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const noteProduct = await noteProductRepository.findOne({
      where: { id: noteProductId, creatorId: userId },
    });

    if (!noteProduct) {
      res.status(404).json({ message: '关联不存在' });
      return;
    }

    noteProduct.isActive = false;
    await noteProductRepository.save(noteProduct);

    res.json({ message: '已从笔记中移除商品' });
  } catch (error) {
    console.error('从笔记移除商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const recordProductClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteProductId } = req.params;

    await noteProductRepository.increment({ id: noteProductId }, 'clickCount', 1);

    res.json({ message: '点击已记录' });
  } catch (error) {
    console.error('记录商品点击错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    Object.assign(product, req.body);
    await productRepository.save(product);

    res.json({ message: '商品已更新', product });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const updateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    product.status = status;
    await productRepository.save(product);

    res.json({ message: '商品状态已更新', product });
  } catch (error) {
    console.error('更新商品状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getProductLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteProductId } = req.params;

    const noteProduct = await noteProductRepository.findOne({
      where: { id: noteProductId },
      relations: ['product'],
    });

    if (!noteProduct || !noteProduct.product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    await noteProductRepository.increment({ id: noteProductId }, 'clickCount', 1);

    res.json({
      externalUrl: noteProduct.product.externalUrl,
      product: noteProduct.product,
    });
  } catch (error) {
    console.error('获取商品链接错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
