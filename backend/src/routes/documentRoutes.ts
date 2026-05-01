import { Router, Request, Response } from 'express';
import multer from 'multer';
import { DocumentService } from '../services/documentService';
import { AuthService } from '../services/authService';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { Document } from '../types';

const upload = multer({ storage: multer.memoryStorage() });

export function createDocumentRouter(
  documentService: DocumentService,
  authService: AuthService
): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(authService);

  const canReadDoc = (userId: string, doc: Document): boolean => {
    return authService.canReadDocument(userId, doc);
  };

  const canWriteDoc = (userId: string, doc: Document): boolean => {
    return authService.canWriteDocument(userId, doc);
  };

  const sanitizeDocument = (doc: Document): Omit<Document, 'vector'> => {
    const { vector, ...docWithoutVector } = doc;
    return docWithoutVector;
  };

  router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { title, content, type } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: '标题和内容不能为空' });
      }

      const docType: Document['type'] = ['pdf', 'excel', 'code', 'text'].includes(type) 
        ? type 
        : 'text';

      const document = await documentService.createDocument(
        title,
        content,
        docType,
        req.user.userId
      );

      res.status(201).json(sanitizeDocument(document));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      if (!req.file) {
        return res.status(400).json({ error: '请上传文件' });
      }

      const { title } = req.body;
      const document = await documentService.createDocumentFromFile(
        title || req.file.originalname,
        req.file.buffer,
        req.file.originalname,
        req.user.userId
      );

      res.status(201).json(sanitizeDocument(document));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      let documents: Document[];
      
      if (req.user.role === 'admin') {
        documents = documentService.getAllDocuments();
      } else {
        documents = documentService.getAllDocuments().filter(doc => 
          canReadDoc(req.user!.userId, doc)
        );
      }

      const sanitized = documents.map(sanitizeDocument);
      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/search', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: '请提供搜索关键词' });
      }

      const results = documentService.searchDocuments(
        q,
        req.user.userId,
        canReadDoc
      );

      const sanitized = results.map(r => ({
        document: sanitizeDocument(r.document),
        similarity: r.similarity
      }));

      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/:id', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const document = documentService.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canReadDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      res.json(sanitizeDocument(document));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/:id/related', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const document = documentService.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canReadDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      const relatedDocs = documentService.getRelatedDocuments(
        id,
        req.user.userId,
        canReadDoc
      );

      const sanitized = relatedDocs.map(sanitizeDocument);
      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const document = documentService.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canWriteDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      const { title, content, tags, readPermissions, writePermissions } = req.body;
      const updates: Partial<Omit<Document, 'id' | 'ownerId' | 'lifecycle'>> = {};

      if (title) updates.title = title;
      if (content) updates.content = content;
      if (tags && Array.isArray(tags)) updates.tags = tags;
      if (readPermissions && Array.isArray(readPermissions)) updates.readPermissions = readPermissions;
      if (writePermissions && Array.isArray(writePermissions)) updates.writePermissions = writePermissions;

      const updatedDoc = await documentService.updateDocument(id, updates);
      res.json(sanitizeDocument(updatedDoc));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/:id/lifecycle', authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses: Document['lifecycle']['status'][] = ['draft', 'review', 'published', 'archived'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: '无效的生命周期状态' });
      }

      const document = documentService.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canWriteDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      const updatedDoc = await documentService.updateLifecycleStatus(id, status);
      res.json(sanitizeDocument(updatedDoc));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/:id/permissions', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const { readPermissions, writePermissions } = req.body;

      const document = documentService.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canWriteDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      const updatedDoc = documentService.updatePermissions(
        id,
        Array.isArray(readPermissions) ? readPermissions : [document.ownerId],
        Array.isArray(writePermissions) ? writePermissions : [document.ownerId]
      );

      res.json(sanitizeDocument(updatedDoc));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未授权' });
      }

      const { id } = req.params;
      const document = documentService.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: '文档不存在' });
      }

      if (!canWriteDoc(req.user.userId, document)) {
        return res.status(403).json({ error: '权限不足' });
      }

      documentService.deleteDocument(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
