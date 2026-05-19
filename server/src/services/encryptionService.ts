import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const CHUNK_SIZE = 1024 * 1024;

export interface EncryptionResult {
  iv: string;
  tag: string;
  key: string;
  encryptedPath: string;
  chunkCount: number;
}

export interface DecryptionResult {
  data: Buffer;
  mimeType: string;
}

function generateKey(): Buffer {
  return crypto.randomBytes(32);
}

function generateIV(): Buffer {
  return crypto.randomBytes(12);
}

export async function encryptFileStream(
  inputPath: string,
  outputDir: string,
  fileId: string
): Promise<EncryptionResult> {
  const key = generateKey();
  const iv = generateIV();
  const encryptedPath = path.join(outputDir, `${fileId}.enc`);

  const fileSize = fs.statSync(inputPath).size;
  const chunkCount = Math.ceil(fileSize / CHUNK_SIZE);

  const input = fs.readFileSync(inputPath);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encryptedChunks: Buffer[] = [];
  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const chunk = input.slice(start, end);

    const encryptedChunk = i === chunkCount - 1
      ? cipher.update(chunk)
      : cipher.update(chunk);

    encryptedChunks.push(encryptedChunk);
  }

  const finalChunk = cipher.final();
  if (finalChunk.length > 0) {
    encryptedChunks.push(finalChunk);
  }

  const tag = cipher.getAuthTag();
  const encryptedData = Buffer.concat(encryptedChunks);
  fs.writeFileSync(encryptedPath, encryptedData);

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    key: key.toString('base64'),
    encryptedPath,
    chunkCount
  };
}

export async function decryptFileStream(
  encryptedPath: string,
  keyBase64: string,
  ivBase64: string,
  tagBase64: string
): Promise<Buffer> {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');

  const encryptedData = fs.readFileSync(encryptedPath);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted;
}

export async function encryptChunk(
  chunk: Buffer,
  keyBase64: string,
  ivBase64: string,
  isLast: boolean
): Promise<{ encrypted: Buffer; tag?: string }> {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  if (isLast) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { encrypted, tag: tag.toString('base64') };
  }

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const encrypted = cipher.update(chunk);
  return { encrypted };
}

export async function decryptChunk(
  chunk: Buffer,
  keyBase64: string,
  ivBase64: string,
  tagBase64?: string
): Promise<Buffer> {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  if (tagBase64) {
    const tag = Buffer.from(tagBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(chunk), decipher.final()]);
  }

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
  return decipher.update(chunk);
}
