import { v4 as uuidv4 } from 'uuid';
import { Document, VectorSearchResult } from '../types';
import { JsonStorage } from '../utils/jsonStorage';
import { VectorService } from '../utils/vectorService';
import { DocumentParser } from '../utils/documentParser';

export class DocumentService {
  private storage: JsonStorage;
  private vectorService: VectorService;
  private documentParser: DocumentParser;

  constructor(storage: JsonStorage) {
    this.storage = storage;
    this.vectorService = new VectorService();
    this.documentParser = new DocumentParser();
  }

  public async createDocument(
    title: string,
    content: string,
    type: Document['type'],
    ownerId: string
  ): Promise<Document> {
    const now = new Date().toISOString();
    const vector = this.vectorService.generateVector(content);
    const tags = this.documentParser.extractTags(content, type);

    const document: Document = {
      id: uuidv4(),
      title,
      type,
      content,
      vector,
      tags,
      ownerId,
      readPermissions: [ownerId],
      writePermissions: [ownerId],
      lifecycle: {
        status: 'draft',
        version: 1,
        createdAt: now,
        updatedAt: now
      },
      relatedDocs: []
    };

    const documents = this.storage.getDocuments();
    documents.push(document);
    this.storage.saveDocuments(documents);

    await this.updateRelatedDocs(document.id);

    return this.storage.getDocumentById(document.id)!;
  }

  public async createDocumentFromFile(
    title: string,
    buffer: Buffer,
    filename: string,
    ownerId: string
  ): Promise<Document> {
    const { content, type } = await this.documentParser.parseFile(buffer, filename);
    const finalTitle = title || filename;
    return this.createDocument(finalTitle, content, type, ownerId);
  }

  public getDocument(id: string): Document | undefined {
    return this.storage.getDocumentById(id);
  }

  public getDocumentsByOwner(ownerId: string): Document[] {
    return this.storage.getDocuments().filter(d => d.ownerId === ownerId);
  }

  public getAllDocuments(): Document[] {
    return this.storage.getDocuments();
  }

  public searchDocuments(
    query: string,
    userId: string,
    canReadDoc: (userId: string, doc: Document) => boolean,
    topK: number = 10
  ): VectorSearchResult[] {
    const allDocuments = this.storage.getDocuments();
    const accessibleDocs = allDocuments.filter(doc => canReadDoc(userId, doc));
    
    return this.vectorService.search(query, accessibleDocs, topK);
  }

  public async updateDocument(
    id: string,
    updates: Partial<Omit<Document, 'id' | 'ownerId' | 'lifecycle'>>
  ): Promise<Document> {
    const documents = this.storage.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('文档不存在');
    }

    const oldDoc = documents[index];
    let newVector = oldDoc.vector;
    let newTags = oldDoc.tags;

    if (updates.content) {
      newVector = this.vectorService.generateVector(updates.content);
      newTags = this.documentParser.extractTags(updates.content, oldDoc.type);
    }

    const updatedDoc: Document = {
      ...oldDoc,
      ...updates,
      vector: newVector,
      tags: newTags,
      lifecycle: {
        ...oldDoc.lifecycle,
        version: oldDoc.lifecycle.version + 1,
        updatedAt: new Date().toISOString()
      }
    };

    documents[index] = updatedDoc;
    this.storage.saveDocuments(documents);

    await this.updateRelatedDocs(id);

    return updatedDoc;
  }

  public async updateLifecycleStatus(
    id: string,
    status: Document['lifecycle']['status']
  ): Promise<Document> {
    const documents = this.storage.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('文档不存在');
    }

    const doc = documents[index];
    const now = new Date().toISOString();

    doc.lifecycle.status = status;
    doc.lifecycle.version += 1;
    doc.lifecycle.updatedAt = now;

    if (status === 'published') {
      doc.lifecycle.publishedAt = now;
    } else if (status === 'archived') {
      doc.lifecycle.archivedAt = now;
    }

    this.storage.saveDocuments(documents);
    return doc;
  }

  public updatePermissions(
    id: string,
    readPermissions: string[],
    writePermissions: string[]
  ): Document {
    const documents = this.storage.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('文档不存在');
    }

    const doc = documents[index];
    doc.readPermissions = readPermissions;
    doc.writePermissions = writePermissions;
    doc.lifecycle.updatedAt = new Date().toISOString();

    this.storage.saveDocuments(documents);
    return doc;
  }

  public deleteDocument(id: string): void {
    const documents = this.storage.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('文档不存在');
    }

    documents.splice(index, 1);
    this.storage.saveDocuments(documents);

    this.removeFromRelatedDocs(id);
  }

  private async updateRelatedDocs(docId: string): Promise<void> {
    const documents = this.storage.getDocuments();
    const targetDoc = documents.find(d => d.id === docId);
    
    if (!targetDoc) return;

    const relatedIds = this.vectorService.findRelatedDocuments(targetDoc, documents, 5);
    const index = documents.findIndex(d => d.id === docId);
    
    if (index !== -1) {
      documents[index].relatedDocs = relatedIds;
      this.storage.saveDocuments(documents);
    }
  }

  private removeFromRelatedDocs(docId: string): void {
    const documents = this.storage.getDocuments();
    
    for (const doc of documents) {
      doc.relatedDocs = doc.relatedDocs.filter(id => id !== docId);
    }

    this.storage.saveDocuments(documents);
  }

  public getRelatedDocuments(
    docId: string,
    userId: string,
    canReadDoc: (userId: string, doc: Document) => boolean
  ): Document[] {
    const doc = this.storage.getDocumentById(docId);
    if (!doc) return [];

    const documents = this.storage.getDocuments();
    return doc.relatedDocs
      .map(id => documents.find(d => d.id === id))
      .filter((d): d is Document => d !== undefined && canReadDoc(userId, d));
  }
}
