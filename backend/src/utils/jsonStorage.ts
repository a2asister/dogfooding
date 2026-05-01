import fs from 'fs';
import path from 'path';
import { User, Document } from '../types';

export class JsonStorage {
  private dataDir: string;
  private usersFile: string;
  private documentsFile: string;

  constructor(storagePath: string) {
    this.dataDir = path.resolve(process.cwd(), storagePath);
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.documentsFile = path.join(this.dataDir, 'documents.json');
    this.ensureDataDirectory();
    this.initializeFiles();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private initializeFiles(): void {
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.documentsFile)) {
      fs.writeFileSync(this.documentsFile, JSON.stringify([], null, 2));
    }
  }

  public getUsers(): User[] {
    const data = fs.readFileSync(this.usersFile, 'utf-8');
    return JSON.parse(data);
  }

  public saveUsers(users: User[]): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
  }

  public getDocuments(): Document[] {
    const data = fs.readFileSync(this.documentsFile, 'utf-8');
    return JSON.parse(data);
  }

  public saveDocuments(documents: Document[]): void {
    fs.writeFileSync(this.documentsFile, JSON.stringify(documents, null, 2));
  }

  public getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.username === username);
  }

  public getDocumentById(id: string): Document | undefined {
    const documents = this.getDocuments();
    return documents.find(d => d.id === id);
  }
}
