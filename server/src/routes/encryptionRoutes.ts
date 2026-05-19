import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

router.post('/generate-key', (_req: Request, res: Response): void => {
  try {
    const key = crypto.randomBytes(32).toString('base64');
    const iv = crypto.randomBytes(12).toString('base64');
    res.json({ key, iv });
  } catch (error) {
    console.error('Generate key error:', error);
    res.status(500).json({ error: 'Failed to generate key' });
  }
});

router.post('/encrypt-chunk', (req: Request, res: Response): void => {
  try {
    const { chunk, key, iv, isLast } = req.body as {
      chunk: string;
      key: string;
      iv: string;
      isLast: boolean;
    };

    const keyBuffer = Buffer.from(key, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const chunkBuffer = Buffer.from(chunk, 'base64');

    if (isLast) {
      const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
      const encrypted = Buffer.concat([cipher.update(chunkBuffer), cipher.final()]);
      const tag = cipher.getAuthTag();
      res.json({
        encrypted: encrypted.toString('base64'),
        tag: tag.toString('base64')
      });
    } else {
      const cipher = crypto.createCipheriv('aes-256-ctr', keyBuffer, ivBuffer);
      const encrypted = cipher.update(chunkBuffer);
      res.json({
        encrypted: encrypted.toString('base64')
      });
    }
  } catch (error) {
    console.error('Encrypt chunk error:', error);
    res.status(500).json({ error: 'Failed to encrypt chunk' });
  }
});

router.post('/decrypt-chunk', (req: Request, res: Response): void => {
  try {
    const { chunk, key, iv, tag } = req.body as {
      chunk: string;
      key: string;
      iv: string;
      tag?: string;
    };

    const keyBuffer = Buffer.from(key, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const chunkBuffer = Buffer.from(chunk, 'base64');

    if (tag) {
      const tagBuffer = Buffer.from(tag, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
      decipher.setAuthTag(tagBuffer);
      const decrypted = Buffer.concat([decipher.update(chunkBuffer), decipher.final()]);
      res.json({
        decrypted: decrypted.toString('base64')
      });
    } else {
      const decipher = crypto.createDecipheriv('aes-256-ctr', keyBuffer, ivBuffer);
      const decrypted = decipher.update(chunkBuffer);
      res.json({
        decrypted: decrypted.toString('base64')
      });
    }
  } catch (error) {
    console.error('Decrypt chunk error:', error);
    res.status(500).json({ error: 'Failed to decrypt chunk' });
  }
});

export { router as encryptionRouter };
