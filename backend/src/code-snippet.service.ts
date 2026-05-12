import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CodeSnippet } from './entity/code-snippet.entity';

@Injectable()
export class CodeSnippetService implements OnModuleInit {
  constructor(
    @InjectRepository(CodeSnippet)
    private codeSnippetRepository: Repository<CodeSnippet>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    const count = await this.codeSnippetRepository.count();
    if (count > 0) return;

    const snippets = [
      {
        title: 'Hello World',
        code: `function greet(name) {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet('World');`,
        language: 'javascript',
        description: 'Basic hello world function',
        tags: ['beginner', 'functions'],
      },
      {
        title: 'React Component',
        code: `import React from 'react';\n\nconst Button = ({ children, onClick }) => {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n};\n\nexport default Button;`,
        language: 'jsx',
        description: 'Simple React button component',
        tags: ['react', 'components'],
      },
      {
        title: 'TypeScript Interface',
        code: `interface User {\n  id: number;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\nconst user: User = {\n  id: 1,\n  name: 'John',\n  email: 'john@example.com',\n  createdAt: new Date(),\n};`,
        language: 'typescript',
        description: 'TypeScript interface example',
        tags: ['typescript', 'interfaces'],
      },
      {
        title: 'Python Loop',
        code: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nfor num in fibonacci(10):\n    print(num)`,
        language: 'python',
        description: 'Fibonacci generator in Python',
        tags: ['python', 'generators'],
      },
      {
        title: 'CSS Flexbox',
        code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  gap: 1rem;\n}\n\n.item {\n  flex: 1;\n  padding: 2rem;\n  background: #f0f0f0;\n}`,
        language: 'css',
        description: 'CSS flexbox centering example',
        tags: ['css', 'layout'],
      },
      {
        title: 'SQL Query',
        code: `SELECT \n    users.name,\n    users.email,\n    COUNT(orders.id) as order_count\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nWHERE users.created_at >= '2024-01-01'\nGROUP BY users.id\nHAVING order_count > 5\nORDER BY order_count DESC;`,
        language: 'sql',
        description: 'Complex SQL query with joins',
        tags: ['sql', 'database'],
      },
    ];

    for (const snippet of snippets) {
      await this.codeSnippetRepository.save(snippet);
    }
  }

  async findAll(): Promise<CodeSnippet[]> {
    return this.codeSnippetRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CodeSnippet> {
    return this.codeSnippetRepository.findOneBy({ id });
  }

  async search(keyword: string): Promise<CodeSnippet[]> {
    return this.codeSnippetRepository.find({
      where: [
        { title: Like(`%${keyword}%`) },
        { code: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) },
        { tags: Like(`%${keyword}%`) },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async create(snippet: Partial<CodeSnippet>): Promise<CodeSnippet> {
    return this.codeSnippetRepository.save(snippet);
  }
}
